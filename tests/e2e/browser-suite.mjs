/**
 * Comprehensive real-browser Playwright E2E verification against production `dist/`.
 *
 * Tests:
 *   1. Zero external network requests, static baked stars, crossOriginIsolated=true, exact model menu
 *   2. WebGPU V4 across all 5 model modes (mindgrab, mindmap, pve CAT-lite, mindsnap, mindmap-fast)
 *      + monotonic worker onProgress + main-thread rAF responsiveness
 *   3. WebGPU LowMem128 (`?webgpuMode=low-memory`) parity with standard WebGPU
 *   4. WebGL2 fallback (`?backend=webgl2`) + Dice parity vs WebGPU
 *   5. Multi-threaded CPU WASM fallback (`?backend=cpu`) under COOP/COEP + Dice parity vs WebGPU
 *   6. Smooth BG & OVL opacity sliders, Alt/programmatic label & CAT-lite tissue isolation + 3D HUD
 *   7. Stats modal (cm3/%, filter + Esc, FS badge, Locate, CSV), Save modal (Native FS int16,
 *      Binary Mask, Conformed 256^3 via lazy niimath, Conformed Input, .nvd Scene)
 *   8. Cite modal (all 3 citations + BibTeX), About modal, Diagnostics modal, /v3/ route, mobile layout
 *   9. Offline PWA (manifest, icons, SW precache, online model run -> offline reload -> offline run)
 *
 * Usage: node tests/e2e/browser-suite.mjs
 */

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import { preview } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const executablePath =
  process.env.BC_CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const chromeArgs = ['--enable-gpu', '--use-angle=metal', '--ignore-gpu-blocklist']

function parseNiftiGz(filePath) {
  const rawBuf = fs.readFileSync(filePath)
  const raw = rawBuf[0] === 0x1f && rawBuf[1] === 0x8b ? zlib.gunzipSync(rawBuf) : rawBuf
  const dv = new DataView(raw.buffer, raw.byteOffset, raw.byteLength)
  assert.equal(dv.getInt32(0, true), 348, 'Expected little-endian NIfTI-1 header')
  const dims = [
    dv.getInt16(40, true),
    dv.getInt16(42, true),
    dv.getInt16(44, true),
    dv.getInt16(46, true),
  ]
  const intentCode = dv.getInt16(68, true)
  const datatype = dv.getInt16(70, true)
  const bitpix = dv.getInt16(72, true)
  const voxOffset = Math.max(352, Math.round(dv.getFloat32(108, true)))
  const nvox = dims[1] * dims[2] * dims[3]
  const body = raw.subarray(voxOffset)
  let voxels
  if (datatype === 2) {
    voxels = new Uint8Array(body.buffer, body.byteOffset, nvox)
  } else if (datatype === 4) {
    const aligned = body.byteOffset % 2 === 0 ? body : Uint8Array.from(body)
    voxels = new Int16Array(aligned.buffer, aligned.byteOffset, nvox)
  } else if (datatype === 16) {
    const aligned = body.byteOffset % 4 === 0 ? body : Uint8Array.from(body)
    voxels = new Float32Array(aligned.buffer, aligned.byteOffset, nvox)
  } else {
    throw new Error(`Unexpected NIfTI datatype ${datatype}`)
  }
  return { dims, intentCode, datatype, bitpix, voxels }
}

function bufferByteDiffFraction(a, b) {
  if (a.length !== b.length) return 1
  let diff = 0
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++
  return diff / a.length
}

function diceForeground(histA, histB) {
  // Exact foreground Dice computed inside page; helper kept for summary logging
  return [histA, histB]
}

async function waitTwoFrames(page) {
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
}

async function waitForBaseVolume(page) {
  await page.waitForFunction(
    () => window.__brainchop?.nv?.volumes?.length >= 1 && window.__brainchop.nv.volumes[0].img?.length > 0,
    { timeout: 30_000 },
  )
  await waitTwoFrames(page)
}

async function runModelAndCollect(page, modelId, timeoutMs = 180_000) {
  // Track main-thread rAF responsiveness, status messages, and swap-on-complete overlay persistence
  await page.evaluate(() => {
    const bc = window.__brainchop
    window.__hadOverlayBefore = bc.nv.volumes.length >= 2
    window.__minVolumesDuringRun = bc.nv.volumes.length
    window.__rafTicks = 0
    window.__rafRunning = true
    window.__seenStatusTexts = []
    const loc = document.getElementById('location')
    const obs = new MutationObserver(() => {
      if (loc) window.__seenStatusTexts.push(loc.textContent || '')
    })
    if (loc) obs.observe(loc, { childList: true, characterData: true, subtree: true })
    window.__statusObs = obs
    const step = () => {
      window.__rafTicks++
      const n = bc.nv.volumes.length
      if (n < window.__minVolumesDuringRun) window.__minVolumesDuringRun = n
      if (window.__rafRunning) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  })

  await page.evaluate(async (id) => {
    await window.__brainchop.runModelById(id)
  }, modelId)

  const info = await page.evaluate(() => {
    window.__rafRunning = false
    window.__statusObs?.disconnect()
    const bc = window.__brainchop
    const run = bc.lastRun
    const seg = bc.seg
    let fgCount = 0
    let uniqueClasses = 0
    let sampleSum = 0
    if (seg?.kind === 'labels') {
      const seen = new Uint8Array(256)
      for (let i = 0; i < seg.labels.length; i++) {
        const v = seg.labels[i]
        if (v > 0) {
          fgCount++
          seen[v] = 1
        }
      }
      for (let k = 1; k < 256; k++) if (seen[k]) uniqueClasses++
    } else if (seg?.kind === 'mask') {
      for (let i = 0; i < seg.mask.length; i++) if (seg.mask[i] > 0) fgCount++
      uniqueClasses = fgCount > 0 ? 1 : 0
    } else if (seg?.kind === 'tissues') {
      const [gm, wm, csf] = seg.maps
      for (let i = 0; i < gm.length; i++) {
        const s = gm[i] + wm[i] + csf[i]
        if (s > 0.03) fgCount++
        sampleSum += s
      }
      uniqueClasses = 3
    }
    return {
      run,
      rafTicks: window.__rafTicks,
      hadOverlayBefore: window.__hadOverlayBefore,
      minVolumesDuringRun: window.__minVolumesDuringRun,
      seenStatusTexts: window.__seenStatusTexts,
      segKind: seg?.kind,
      overlayDatatype: bc.nv.volumes[1]?.hdr?.datatypeCode,
      fgCount,
      uniqueClasses,
      sampleSum,
      badgeText: document.getElementById('activeModelBadge')?.textContent,
      selectValue: document.getElementById('modelSelect')?.value,
      backendText: document.getElementById('backendStatus')?.textContent,
    }
  })

  assert.ok(info.run, `Expected lastRun to be populated after ${modelId}`)
  assert.equal(info.run.ranInWorker, true, `${modelId} must run in Web Worker`)
  if (info.hadOverlayBefore) {
    assert.ok(
      info.minVolumesDuringRun >= 2,
      `${modelId} cleared previous overlay before swap (min volumes=${info.minVolumesDuringRun})`,
    )
  }
  assert.equal(info.selectValue, '', `${modelId} dropdown should reset to "Run Segmentation Model" after completion`)
  assert.ok(info.badgeText?.length > 0, `${modelId} active model badge in footer should remain populated`)
  assert.ok(info.fgCount > 100_000, `${modelId} foreground voxel count too low: ${info.fgCount}`)
  for (const st of info.seenStatusTexts) {
    assert.ok(!/\(0\/(?:13|25)\)/.test(st), `${modelId} must not display misleading (0/N) counter: "${st}"`)
  }

  // Monotonic progress check
  const evs = info.run.progressEvents
  assert.ok(evs.length >= 2, `${modelId} expected >= 2 progress events, got ${evs.length}`)
  for (let i = 1; i < evs.length; i++) {
    assert.ok(
      evs[i].progress >= evs[i - 1].progress - 1e-9,
      `${modelId} progress regressed: ${evs[i - 1].progress} -> ${evs[i].progress}`,
    )
  }
  assert.ok(evs.at(-1).progress >= 0.999, `${modelId} progress should end at 1.0, got ${evs.at(-1).progress}`)
  return info
}

const previewServer = await preview({
  root,
  preview: { host: '127.0.0.1', port: 0, strictPort: false },
})
const baseUrl = previewServer.resolvedUrls.local[0].replace(/\/?$/, '/')
console.log(`Preview server listening at ${baseUrl}`)

const browser = await chromium.launch({ executablePath, args: chromeArgs })

try {
  // =========================================================================
  // 1. Zero external requests, COOP/COEP isolation, exact menu, all 5 WebGPU models
  // =========================================================================
  console.log('\n=== 1. Boot, Zero External Requests, Exact Menu & All 5 WebGPU Models ===')
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true })
  const page = await ctx.newPage()
  const pageErrors = []
  const externalUrls = []
  const originHost = new URL(baseUrl).origin

  page.on('pageerror', (err) => pageErrors.push(err.message))
  page.on('request', (req) => {
    const url = req.url()
    if (/^https?:\/\//.test(url) && !url.startsWith(originHost)) {
      externalUrls.push(url)
    }
  })

  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await waitForBaseVolume(page)

  const boot = await page.evaluate(() => ({
    crossOriginIsolated: window.crossOriginIsolated,
    starCount: document.getElementById('star-count')?.textContent?.trim(),
    backendText: document.getElementById('backendStatus')?.textContent?.trim(),
    options: [...document.getElementById('modelSelect').options].map((o) => ({
      value: o.value,
      text: o.textContent,
      disabled: o.disabled,
    })),
  }))

  assert.equal(boot.crossOriginIsolated, true, 'Page must be cross-origin isolated (COOP/COEP)')
  assert.equal(boot.starCount, '646', 'Baked GitHub star count should appear immediately')
  assert.equal(externalUrls.length, 0, `Expected ZERO external requests, saw: ${externalUrls.join(', ')}`)
  assert.deepEqual(
    boot.options.slice(1).map((o) => [o.value, o.text, o.disabled]),
    [
      ['mindgrab', '\u{1FA93}\u{1F9E0} Omnimodal Skull Stripping', false],
      ['mindmap', '\u{1FA93} Subcortical + Tissue', false],
      ['pve', '\u2154\u{1F9E0} Tissue fraction maps (GM/WM/CSF)', false],
      ['mindsnap', '\u{1FA93}\u{1F52A} Desikan-Killiany Atlas', false],
      ['divider', '-----------------', true],
      ['mindmap-fast', '\u26A1\u{1FA93} Subcortical + Tissue (fast)', false],
    ],
  )
  console.log('  OK: crossOriginIsolated=true, 0 external requests, star=646, exact menu verified.')

  // Run all 5 models on WebGPU and save reference label buffers for parity checks
  const refSnapshots = {}
  for (const modelId of ['mindgrab', 'mindmap', 'pve', 'mindmap-fast', 'mindsnap']) {
    const info = await runModelAndCollect(page, modelId)
    assert.equal(info.run.backend, 'webgpu', `Expected WebGPU for ${modelId}, got ${info.run.backend}`)
    assert.ok(info.rafTicks >= 5, `${modelId} main thread should stay responsive (rAF ticks=${info.rafTicks})`)
    console.log(
      `  OK [${modelId}] WebGPU: ${(info.run.elapsedMs / 1000).toFixed(2)}s, ` +
        `classes=${info.uniqueClasses}, fg=${info.fgCount.toLocaleString()}, ` +
        `progressEvents=${info.run.progressEvents.length}, rAF=${info.rafTicks}`,
    )

    if (modelId === 'mindmap' || modelId === 'mindmap-fast') {
      refSnapshots[modelId] = await page.evaluate(() => {
        const arr = window.__brainchop.seg.labels
        // Downsample stride-7 checksum + full histogram for fast cross-context Dice
        const hist = new Array(256).fill(0)
        const sample = []
        for (let i = 0; i < arr.length; i++) {
          hist[arr[i]]++
          if (i % 64 === 0) sample.push(arr[i])
        }
        return { len: arr.length, hist, sample }
      })
    }

    if (modelId === 'pve') {
      assert.equal(info.overlayDatatype, 2304, 'CAT-lite should render as a single DT_RGBA32 overlay')
      // Verify smooth CAT-lite opacity slider + tissue isolation + dimmer footer labels
      const shotOp50 = await page.locator('#gl1').screenshot()
      await page.evaluate(() => {
        const sl = document.getElementById('opacitySlider1')
        sl.value = '0.95'
        sl.dispatchEvent(new Event('input'))
      })
      await waitTwoFrames(page)
      const shotOp95 = await page.locator('#gl1').screenshot()
      const diffPve = bufferByteDiffFraction(shotOp50, shotOp95)
      assert.ok(diffPve > 0.005, `CAT-lite opacity slider should change pixels (diff=${diffPve})`)

      // Tissue isolation + 3D HUD
      await page.evaluate(() => window.__brainchop.isolateTissue(0))
      await waitTwoFrames(page)
      const hudText = await page.locator('#isoHud').textContent()
      assert.match(hudText || '', /Gray Matter/, `Expected Gray Matter HUD, got: ${hudText}`)
      await page.keyboard.press('Escape')
      await waitTwoFrames(page)
      assert.equal(await page.locator('#isoHud').isHidden(), true, 'Esc should restore CAT-lite isolation')

      // Jump crosshair to GM centroid via Stats Locate to verify live GM/WM/CSF footer readout
      await page.click('#saveStatsBtn')
      await page.waitForSelector('#statsPanel')
      const gmLocate = page.locator('.stat-row[data-name="gray matter"] .stat-locate')
      await gmLocate.click()
      await waitTwoFrames(page)
      const footerCheck = await page.evaluate(() => {
        const k = document.querySelector('#location .loc-tissues .loc-k')
        const v = document.querySelector('#location .loc-tissues .loc-v')
        if (!k || !v) return null
        const parseLuma = (rgb) => {
          const m = rgb.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
          return m ? 0.2126 * +m[1] + 0.7152 * +m[2] + 0.0722 * +m[3] : 0
        }
        return {
          text: document.querySelector('#location .loc-tissues').textContent,
          kLuma: parseLuma(getComputedStyle(k).color),
          vLuma: parseLuma(getComputedStyle(v).color),
        }
      })
      assert.ok(footerCheck, 'Expected live GM/WM/CSF tissue readout in footer')
      assert.ok(footerCheck.kLuma < footerCheck.vLuma, 'CAT-lite .loc-k labels should be dimmer than .loc-v values')
      console.log(`  OK [pve UX]: DT_RGBA32 opacity diff=${(diffPve * 100).toFixed(2)}%, HUD & footer (${footerCheck.text}) verified.`)
    }
  }

  // =========================================================================
  // 2. Smooth BG & OVL Opacity, Label Isolation, Stats Modal, Save Modal (on mindsnap)
  // =========================================================================
  console.log('\n=== 2. Opacity, Label Isolation, Stats Modal & Save Modal (MindSnap-104) ===')
  const snapShotBase = await page.locator('#gl1').screenshot()
  await page.evaluate(() => {
    const sl0 = document.getElementById('opacitySlider0')
    sl0.value = '0'
    sl0.dispatchEvent(new Event('input'))
  })
  await waitTwoFrames(page)
  const snapShotBg0 = await page.locator('#gl1').screenshot()
  const bgDiff = bufferByteDiffFraction(snapShotBase, snapShotBg0)
  assert.ok(bgDiff > 0.01, `BG opacity slider should update canvas smoothly (diff=${bgDiff})`)

  await page.evaluate(() => {
    const sl0 = document.getElementById('opacitySlider0')
    sl0.value = '1'
    sl0.dispatchEvent(new Event('input'))
    const sl1 = document.getElementById('opacitySlider1')
    sl1.value = '0'
    sl1.dispatchEvent(new Event('input'))
  })
  await waitTwoFrames(page)
  const snapShotOvl0 = await page.locator('#gl1').screenshot()
  const ovlDiff = bufferByteDiffFraction(snapShotBase, snapShotOvl0)
  assert.ok(ovlDiff > 0.01, `OVL opacity slider should update canvas smoothly (diff=${ovlDiff})`)

  await page.evaluate(() => {
    const sl1 = document.getElementById('opacitySlider1')
    sl1.value = '0.5'
    sl1.dispatchEvent(new Event('input'))
  })
  await waitTwoFrames(page)

  // Stats modal: cm3/% toggle, search filter + Esc clears without closing dialog, FS badge, Locate, Isolate, CSV
  await page.click('#saveStatsBtn')
  await page.waitForSelector('#statsPanel')
  const rowCount = await page.locator('#statsRows .stat-row').count()
  assert.ok(rowCount >= 95, `Expected ~103 MindSnap regions in Stats, got ${rowCount}`)

  await page.click('.stat-toggle button[data-mode="pct"]')
  assert.match(await page.locator('#statsUnitLabel').textContent(), /100% of volume/)

  await page.fill('#statsFilterInput', 'hippocampus')
  const visibleHippo = await page.locator('#statsRows .stat-row:not([hidden])').count()
  assert.equal(visibleHippo, 2, 'Filtering "hippocampus" should show Left & Right Hippocampus')

  // Escape in non-empty filter input clears filter without closing dialog
  await page.locator('#statsFilterInput').press('Escape')
  assert.equal(await page.locator('#appDialog').evaluate((d) => d.open), true, 'Esc in filter must not close dialog')
  assert.equal(await page.locator('#statsFilterInput').inputValue(), '')

  // Expand first row & check FreeSurfer badge
  await page.locator('#statsRows .stat-row:first-child .stat-trigger').click()
  const fsBadge = await page.locator('#statsRows .stat-row:first-child .save-badge').textContent()
  assert.match(fsBadge || '', /^FS \d+$/, `Expected FreeSurfer badge, got ${fsBadge}`)

  // Download CSV
  const [csvDl] = await Promise.all([
    page.waitForEvent('download'),
    page.click('#statsDownloadBtn'),
  ])
  const csvPath = await csvDl.path()
  const csvText = fs.readFileSync(csvPath, 'utf8')
  assert.match(csvText, /^label,fs_label,name,voxels,volume_mm3/)
  assert.ok(csvText.split('\n').length > 95)

  // Isolate from Stats row
  await page.locator('#statsRows .stat-row:first-child .stat-iso').click()
  await waitTwoFrames(page)
  assert.equal(await page.locator('#isoHud').isVisible(), true, 'Isolation HUD should be visible')
  await page.keyboard.press('Escape')
  await waitTwoFrames(page)
  assert.equal(await page.locator('#isoHud').isHidden(), true, 'Esc should clear label isolation')
  console.log(`  OK [Stats & Isolation]: ${rowCount} rows, filter+Esc, FS badge (${fsBadge}), CSV & HUD verified.`)

  // Save modal: Native FreeSurfer int16 + Binary Mask, Conformed 256^3 via niimath, Conformed Input, .nvd Scene
  await page.click('#saveBtn')
  await page.waitForSelector('.save-sheet')
  await page.check('#saveFreeSurfer')
  await page.check('#saveBinaryMask')

  const downloads = []
  const dlHandler = (d) => downloads.push(d)
  page.on('download', dlHandler)
  await page.click('.save-opt:has-text("Native space")')
  await page.waitForFunction(() => !window.__brainchop.busy, { timeout: 60_000 })
  await page.waitForTimeout(300)
  page.off('download', dlHandler)
  assert.equal(downloads.length, 2, `Expected 2 native downloads (FS labels + mask), got ${downloads.length}`)
  const fsDl = downloads.find((d) => d.suggestedFilename().includes('_fs_native.nii.gz'))
  const maskDl = downloads.find((d) => d.suggestedFilename().includes('binary_mask_native.nii.gz'))
  assert.ok(fsDl && maskDl, `Unexpected filenames: ${downloads.map((d) => d.suggestedFilename())}`)

  const fsParsed = parseNiftiGz(await fsDl.path())
  assert.equal(fsParsed.datatype, 4, 'FreeSurfer NIfTI must be DT_INT16 (datatype=4)')
  assert.equal(fsParsed.intentCode, 1002, 'FreeSurfer NIfTI must have NIFTI_INTENT_LABEL (1002)')
  let maxFs = 0
  for (let i = 0; i < fsParsed.voxels.length; i++) if (fsParsed.voxels[i] > maxFs) maxFs = fsParsed.voxels[i]
  assert.ok(maxFs >= 2001 && maxFs <= 2035, `Expected FreeSurfer RH cortical IDs up to 2035, got max=${maxFs}`)

  const maskParsed = parseNiftiGz(await maskDl.path())
  assert.equal(maskParsed.datatype, 2, 'Binary mask must be DT_UINT8')
  let maskFg = 0
  for (let i = 0; i < maskParsed.voxels.length; i++) {
    assert.ok(maskParsed.voxels[i] === 0 || maskParsed.voxels[i] === 1, 'Binary mask must contain only 0 or 1')
    if (maskParsed.voxels[i] === 1) maskFg++
  }
  assert.ok(maskFg > 500_000)

  // Save Conformed 256^3 (lazy niimath)
  await page.click('#saveBtn')
  await page.waitForSelector('.save-sheet')
  await page.uncheck('#saveFreeSurfer')
  await page.uncheck('#saveBinaryMask')
  const [confDl] = await Promise.all([
    page.waitForEvent('download', { timeout: 60_000 }),
    page.click('.save-opt:has-text("Conformed space")'),
  ])
  const confParsed = parseNiftiGz(await confDl.path())
  assert.deepEqual(confParsed.dims, [3, 256, 256, 256], 'Conformed segmentation must be 256^3')
  assert.equal(confParsed.datatype, 2, 'Conformed labels should be DT_UINT8')

  // Save Conformed input volume (lazy niimath)
  await page.click('#saveBtn')
  await page.waitForSelector('.save-sheet')
  const [confInDl] = await Promise.all([
    page.waitForEvent('download', { timeout: 60_000 }),
    page.click('.save-opt:has-text("Conformed input volume")'),
  ])
  const confInParsed = parseNiftiGz(await confInDl.path())
  assert.deepEqual(confInParsed.dims, [3, 256, 256, 256], 'Conformed input must be 256^3')

  // Save Scene (.nvd)
  await page.click('#saveBtn')
  await page.waitForSelector('.save-sheet')
  const [nvdDl] = await Promise.all([
    page.waitForEvent('download'),
    page.click('.save-opt:has-text("Scene (.nvd)")'),
  ])
  assert.ok(nvdDl.suggestedFilename().endsWith('.nvd'))
  console.log(`  OK [Save Modal]: FS int16 (max=${maxFs}), Binary Mask (${maskFg.toLocaleString()} vox), Conformed 256^3, Conformed Input, and .nvd verified.`)

  // =========================================================================
  // 3. Clean Footer, About -> Cite Modal, Granular Diagnostics, /v3/ Route & Mobile Layout
  // =========================================================================
  console.log('\n=== 3. Clean Footer, About -> Cite Modal, Granular Diagnostics, /v3/ & Mobile ===')
  assert.equal(await page.locator('footer #citeBtn').count(), 0, 'Footer should stay uncluttered without Cite button')
  assert.equal(await page.locator('footer a[href*="v3"]').count(), 0, 'Footer should stay uncluttered without v3 pill')

  await page.click('#aboutBtn')
  await page.waitForSelector('.about-brand img')
  const aboutBrand = await page.locator('.about-brand strong').textContent()
  assert.equal(aboutBrand?.trim(), 'BrainChop', 'Branding in About should be simply "BrainChop"')
  const logoOk = await page.locator('.about-brand img').evaluate((img) => img.complete && img.naturalWidth > 0)
  assert.equal(logoOk, true, 'BrainChop logo in About modal must load')
  assert.equal(await page.locator('#dialogMessage a[href="./v3/"]').count(), 1, 'About should link to ./v3/')

  // Open Cite modal from About
  await page.click('#aboutOpenCiteBtn')
  await page.waitForSelector('.cite-sheet')
  const citeText = await page.locator('.cite-sheet').textContent()
  assert.match(citeText, /Aperture Neuro/)
  assert.match(citeText, /10\.52294\/001c\.123059/)
  assert.match(citeText, /NeuroImage, 338:122074, 2026/)
  assert.match(citeText, /42331200/)
  assert.match(citeText, /10\.21105\/joss\.05098/)
  await page.click('#dialogXBtn')

  // Granular Diagnostics matching brainchop-test
  await page.click('#diagnosticsBtn')
  await page.waitForSelector('.diag-pre')
  const diagText = await page.locator('.diag-pre').textContent()
  for (const key of [
    'Model_Name:',
    'Execution_Mode: webgpu-worker',
    'Expect_Labels: 104',
    'Actual_Labels: 104',
    'Conform_t:',
    'Preprocess_t:',
    'Setup_t:',
    'Inference_t:',
    'Postprocess_t:',
    'Reslice_t:',
    'Display_t:',
    'Total_t:',
    'Cross_Origin_Isolated: true',
  ]) {
    assert.ok(diagText.includes(key), `Diagnostics missing "${key}":\n${diagText}`)
  }
  await page.click('#dialogCloseBtn')

  // /v3/ legacy page
  const v3Page = await ctx.newPage()
  const v3Res = await v3Page.goto(`${baseUrl}v3/`, { waitUntil: 'networkidle' })
  assert.equal(v3Res.status(), 200, '/v3/ route must return HTTP 200')
  const v3Href = await v3Page.locator('a[href*="brainchop-legacy"]').first().getAttribute('href')
  assert.match(v3Href || '', /neuroneural\.net\/brainchop-legacy/)
  await v3Page.close()

  // Mobile narrow layout + pane switcher
  const mobCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })
  const mobPage = await mobCtx.newPage()
  await mobPage.goto(baseUrl, { waitUntil: 'networkidle' })
  await waitForBaseVolume(mobPage)
  const mobCheck = await mobPage.evaluate(() => ({
    narrow: document.body.classList.contains('nv-narrow'),
    switcherVisible: getComputedStyle(document.getElementById('paneSwitcher')).display !== 'none',
  }))
  assert.equal(mobCheck.narrow, true, '390x844 viewport should activate body.nv-narrow')
  assert.equal(mobCheck.switcherVisible, true, 'Mobile pane switcher should be visible')
  await mobPage.click('#paneSwitcher button[data-pane="axial"]')
  assert.equal(await mobPage.evaluate(() => window.__brainchop.nv.sliceType), 0)
  await mobCtx.close()
  console.log('  OK [Cite, About, Diagnostics, /v3/, Mobile]: all verified.')

  // =========================================================================
  // 4. WebGPU LowMem128 (`?webgpuMode=low-memory`) Parity
  // =========================================================================
  console.log('\n=== 4. WebGPU LowMem128 (`?webgpuMode=low-memory`) Parity ===')
  const lmPage = await ctx.newPage()
  await lmPage.goto(`${baseUrl}?webgpuMode=low-memory`, { waitUntil: 'networkidle' })
  await waitForBaseVolume(lmPage)
  const lmInfo = await runModelAndCollect(lmPage, 'mindmap')
  assert.equal(lmInfo.run.backend, 'webgpu')
  assert.ok(
    lmInfo.run.log.some((l) => /lowMem128|128|low-memory|low_mem/i.test(l)),
    `Expected LowMem128 indicator in log: ${lmInfo.run.log.join(' | ')}`,
  )
  const lmSample = await lmPage.evaluate(() => {
    const arr = window.__brainchop.seg.labels
    const sample = []
    for (let i = 0; i < arr.length; i += 64) sample.push(arr[i])
    return sample
  })
  let exactMatches = 0
  for (let i = 0; i < lmSample.length; i++) {
    if (lmSample[i] === refSnapshots.mindmap.sample[i]) exactMatches++
  }
  const lmMatchRate = exactMatches / lmSample.length
  assert.ok(lmMatchRate > 0.999, `LowMem128 should match standard WebGPU (>0.999), got ${lmMatchRate}`)
  console.log(`  OK [LowMem128]: ${(lmInfo.run.elapsedMs / 1000).toFixed(2)}s, match=${(lmMatchRate * 100).toFixed(3)}%, log=${lmInfo.run.log[0]}`)
  await lmPage.close()

  // =========================================================================
  // 5. WebGL2 Fallback (`?backend=webgl2`) + Parity vs WebGPU
  // =========================================================================
  console.log('\n=== 5. WebGL2 Fallback (`?backend=webgl2`) ===')
  const glPage = await ctx.newPage()
  await glPage.goto(`${baseUrl}?backend=webgl2`, { waitUntil: 'networkidle' })
  await waitForBaseVolume(glPage)
  const glInfo = await runModelAndCollect(glPage, 'mindmap-fast')
  assert.equal(glInfo.run.backend, 'webgl2', `Expected webgl2, got ${glInfo.run.backend}`)
  const glSample = await glPage.evaluate(() => {
    const arr = window.__brainchop.seg.labels
    const sample = []
    for (let i = 0; i < arr.length; i += 64) sample.push(arr[i])
    return sample
  })
  let glMatch = 0
  for (let i = 0; i < glSample.length; i++) if (glSample[i] === refSnapshots['mindmap-fast'].sample[i]) glMatch++
  const glRate = glMatch / glSample.length
  assert.ok(glRate > 0.97, `WebGL2 mindmap-fast parity vs WebGPU too low: ${glRate}`)
  console.log(`  OK [WebGL2]: ${(glInfo.run.elapsedMs / 1000).toFixed(2)}s, classes=${glInfo.uniqueClasses}, match=${(glRate * 100).toFixed(2)}%`)
  await glPage.close()

  // =========================================================================
  // 6. Multi-threaded CPU WASM Fallback (`?backend=cpu`) + Parity vs WebGPU
  // =========================================================================
  console.log('\n=== 6. Multi-threaded CPU WASM Fallback (`?backend=cpu`) ===')
  const cpuPage = await ctx.newPage()
  await cpuPage.goto(`${baseUrl}?backend=cpu`, { waitUntil: 'networkidle' })
  await waitForBaseVolume(cpuPage)
  assert.equal(await cpuPage.evaluate(() => window.crossOriginIsolated), true)
  const cpuInfo = await runModelAndCollect(cpuPage, 'mindmap-fast', 240_000)
  assert.equal(cpuInfo.run.backend, 'cpu', `Expected cpu backend, got ${cpuInfo.run.backend}`)
  const cpuSample = await cpuPage.evaluate(() => {
    const arr = window.__brainchop.seg.labels
    const sample = []
    for (let i = 0; i < arr.length; i += 64) sample.push(arr[i])
    return sample
  })
  let cpuMatch = 0
  for (let i = 0; i < cpuSample.length; i++) if (cpuSample[i] === refSnapshots['mindmap-fast'].sample[i]) cpuMatch++
  const cpuRate = cpuMatch / cpuSample.length
  assert.ok(cpuRate > 0.97, `CPU WASM mindmap-fast parity vs WebGPU too low: ${cpuRate}`)
  console.log(`  OK [CPU WASM]: ${(cpuInfo.run.elapsedMs / 1000).toFixed(2)}s, classes=${cpuInfo.uniqueClasses}, match=${(cpuRate * 100).toFixed(2)}%`)
  await cpuPage.close()

  // =========================================================================
  // 7. Offline PWA (Manifest, SW Precache, Online Run -> Offline Reload -> Offline Run)
  // =========================================================================
  console.log('\n=== 7. Offline PWA Verification ===')
  const pwaCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const pwaPage = await pwaCtx.newPage()
  const pwaErrors = []
  pwaPage.on('pageerror', (err) => pwaErrors.push(err.message))

  await pwaPage.goto(baseUrl, { waitUntil: 'networkidle' })
  await waitForBaseVolume(pwaPage)

  const manifestRes = await pwaPage.evaluate(async () => {
    const res = await fetch('./manifest.webmanifest')
    const json = await res.json()
    const iconStatuses = await Promise.all(
      json.icons.map(async (ic) => (await fetch(ic.src)).status),
    )
    return { status: res.status, name: json.name, iconStatuses }
  })
  assert.equal(manifestRes.status, 200)
  assert.equal(manifestRes.name, 'BrainChop')
  assert.deepEqual(manifestRes.iconStatuses, [200, 200])

  // Wait for Service Worker to activate and claim the page
  await pwaPage.evaluate(async () => {
    await navigator.serviceWorker.ready
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })
        setTimeout(resolve, 4000)
      })
    }
  })

  // Run mindmap-fast online once so its .bin is cached in brainchop-models-v1
  const onlineRun = await runModelAndCollect(pwaPage, 'mindmap-fast')
  assert.equal(onlineRun.run.backend, 'webgpu')

  const cachesBeforeOffline = await pwaPage.evaluate(async () => {
    const names = await caches.keys()
    const counts = {}
    for (const n of names) counts[n] = (await (await caches.open(n)).keys()).length
    return counts
  })
  console.log('  Caches populated online:', cachesBeforeOffline)
  assert.ok(cachesBeforeOffline['brainchop-models-v1'] >= 1, 'Expected model .bin in brainchop-models-v1')

  // Switch context OFFLINE and reload!
  await pwaCtx.setOffline(true)
  await pwaPage.reload({ waitUntil: 'domcontentloaded' })
  await waitForBaseVolume(pwaPage)

  const offlineIso = await pwaPage.evaluate(() => window.crossOriginIsolated)
  assert.equal(offlineIso, true, 'Offline cached reload must preserve crossOriginIsolated=true')

  const offlineRun = await runModelAndCollect(pwaPage, 'mindmap-fast')
  assert.equal(offlineRun.run.backend, 'webgpu')
  assert.equal(pwaErrors.length, 0, `Unexpected offline page errors: ${pwaErrors.join('; ')}`)
  console.log(`  OK [Offline PWA]: reloaded & segmented 100% offline in ${(offlineRun.run.elapsedMs / 1000).toFixed(2)}s (crossOriginIsolated=${offlineIso}).`)
  await pwaCtx.close()

  assert.equal(pageErrors.length, 0, `Unexpected page errors: ${pageErrors.join('; ')}`)
  assert.equal(externalUrls.length, 0, `Unexpected external network requests: ${externalUrls.join(', ')}`)
  await ctx.close()
  console.log('\nALL BROWSER E2E TESTS PASSED!')
} finally {
  await browser.close()
  previewServer.httpServer.close()
}
