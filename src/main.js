import { NiiVue, DRAG_MODE, SHOW_RENDER, nii2volume, makeLabelLut } from '@niivue/niivue'
import { shiny } from '@niivue/niivue/assets/matcaps'
import {
  segment,
  segmentTissues,
  checkSupport,
  checkWebgl2Support,
  checkCpuSupport,
  MODELS,
} from '@brainchop/core'
import { MODEL_MENU, findModelEntry, parseUrlOptions } from './models.js'
import { buildCiteModalContent } from './cite.js'
import { buildFreeSurferLut, remapLabelsToFreeSurfer } from './freesurfer-labels.js'
import {
  rasToNativeIndex,
  computeLabelStats,
  fmtCm3,
  fmtStatVal,
  buildStatsCsv,
  getLabelHistogramU8,
} from './stats.js'
import {
  decodeTissueVolumeToFloat32,
  buildCatLiteRgbaComposite,
  buildRasHdrOverrides,
  updateCatLiteRgbaOpacity,
  computeCatLiteStats,
  buildCatLiteStatsCsv,
} from './pve-overlay.js'
import {
  NIFTI_RE,
  downloadBlob,
  downloadVolume,
  serializeVolumeToBytes,
  parseUncompressedNifti1,
  describeSeries,
  readDropItems,
  convertDicomFiles,
  withNiimath,
  stripNiftiExt,
  supportsDirectoryPicker,
  getOpenInputAccept,
  filterIgnorableFiles,
} from './io.js'
import { installResponsiveLayout } from './responsive-layout.js'
import { installTouchViewControls, resetView } from './touch-view.js'
import {
  computeStageTimings,
  parseV4PlanFromLog,
  formatDiagnosticsReport,
} from './diagnostics.js'

const $ = (id) => document.getElementById(id)

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  )
}

function createVolumeId() {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
    if (typeof crypto.getRandomValues === 'function') {
      const b = new Uint8Array(16)
      crypto.getRandomValues(b)
      b[6] = (b[6] & 0x0f) | 0x40
      b[8] = (b[8] & 0x3f) | 0x80
      const hex = Array.from(b, (v) => v.toString(16).padStart(2, '0')).join('')
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
    }
  }
  return `vol-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

const cloneArr = (v) => (v && typeof v.slice === 'function' ? v.slice() : v)

/**
 * Fast overlay volume clone matching `src` (`nv.volumes[0]`) geometry without
 * re-running NiiVue's min/max and quantile scans on a 16.77M-voxel buffer.
 */
function cloneOverlayVolume(src, img, name, hdrOverrides = {}, volOverrides = {}) {
  const hdr = Object.assign(Object.create(Object.getPrototypeOf(src.hdr)), src.hdr, {
    dims: [...src.hdr.dims],
    pixDims: [...src.hdr.pixDims],
    affine: src.hdr.affine.map((row) => [...row]),
    ...hdrOverrides,
  })
  const dims = volOverrides.dims
    ? [...volOverrides.dims]
    : src.dims
      ? src.dims.slice(0, 4)
      : hdr.dims.slice(0, 4)
  const nVox3D = dims[1] * dims[2] * dims[3]
  return {
    img,
    hdr,
    originalAffine: hdr.affine.map((row) => [...row]),
    dims,
    nVox3D,
    extentsMin: cloneArr(src.extentsMin),
    extentsMax: cloneArr(src.extentsMax),
    mm000: cloneArr(src.mm000),
    mm100: cloneArr(src.mm100),
    mm010: cloneArr(src.mm010),
    mm001: cloneArr(src.mm001),
    dimsRAS: src.dimsRAS ? [...src.dimsRAS] : undefined,
    pixDimsRAS: src.pixDimsRAS ? [...src.pixDimsRAS] : undefined,
    permRAS: src.permRAS ? [...src.permRAS] : undefined,
    toRAS: cloneArr(src.toRAS),
    toRASvox: cloneArr(src.toRASvox),
    matRAS: cloneArr(src.matRAS),
    obliqueRAS: cloneArr(src.obliqueRAS),
    oblique_angle: src.oblique_angle,
    img2RASstart: src.img2RASstart ? [...src.img2RASstart] : undefined,
    img2RASstep: src.img2RASstep ? [...src.img2RASstep] : undefined,
    frac2mm: cloneArr(src.frac2mm),
    frac2mmOrtho: cloneArr(src.frac2mmOrtho),
    name,
    id: createVolumeId(),
    url: '',
    colorMap: 'gray',
    colormap: 'gray',
    opacity: 1,
    calMin: 0,
    calMax: 255,
    calMinNeg: NaN,
    calMaxNeg: NaN,
    robustMin: 0,
    robustMax: 255,
    globalMin: 0,
    globalMax: 255,
    colorbarVisible: true,
    colormapInvert: false,
    colormapType: 0,
    alphaThreshold: false,
    frame4D: 0,
    nFrame4D: 1,
    nTotalFrame4D: 1,
    trustCalMinMax: true,
    modulateAlpha: 0,
    modulationImage: null,
    ...volOverrides,
  }
}

const SAVE_ICONS = {
  cube: '<svg viewBox="0 0 24 24" class="save-opt-ico" aria-hidden="true"><path d="M12 2.75l8.25 4.75v9L12 21.25 3.75 16.5v-9z"/><path d="M12 12v9.25M3.75 7.5L12 12l8.25-4.5"/></svg>',
  grid: '<svg viewBox="0 0 24 24" class="save-opt-ico" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M3.5 9.5h17M3.5 14.5h17M9.5 3.5v17M14.5 3.5v17"/></svg>',
  volume: '<svg viewBox="0 0 24 24" class="save-opt-ico" aria-hidden="true"><path d="M12 3.5l8.5 4.5-8.5 4.5L3.5 8z"/><path d="M3.5 12l8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5"/></svg>',
  scene: '<svg viewBox="0 0 24 24" class="save-opt-ico" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17M9.5 9.5v10"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" class="save-opt-arrow" aria-hidden="true"><path d="M12 4.5v11"/><path d="M7.5 11.5L12 16l4.5-4.5"/><path d="M5 19.5h14"/></svg>',
  dicomFiles: '<svg viewBox="0 0 24 24" class="save-opt-ico" aria-hidden="true"><rect x="4" y="4" width="12" height="14" rx="2"/><path d="M8 20h10a2 2 0 0 0 2-2V8"/><path d="M7.5 9h5M7.5 12.5h5"/></svg>',
  folder: '<svg viewBox="0 0 24 24" class="save-opt-ico" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4.2a2 2 0 0 1 1.5.7L12 7h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" class="save-opt-arrow open-opt-chevron" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  lock: '<svg viewBox="0 0 24 24" class="open-privacy-ico" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
}

const STAT_LOCATE_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true">' +
  '<circle cx="12" cy="12" r="5.5"/>' +
  '<path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4"/>' +
  '</svg>'

// --- Dialog helpers (follows modern-web-guidance `dialog` & `light-dismiss-a-dialog`) ---

function installDialogFallback(dialog) {
  if (!dialog) return
  dialog.addEventListener('close', () => {
    dialog.returnValue = ''
  })
  if ('closedBy' in HTMLDialogElement.prototype) return
  const isOutside = (e) => {
    const r = dialog.getBoundingClientRect()
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom
  }
  let pressedOutside = false
  dialog.addEventListener('pointerdown', (e) => {
    pressedOutside = isOutside(e)
  })
  dialog.addEventListener('pointerup', (e) => {
    if (pressedOutside && isOutside(e)) dialog.close()
    pressedOutside = false
  })
}

function showModal(title, content, opts = {}) {
  const dialog = $('appDialog')
  const titleEl = $('dialogTitle')
  const msgEl = $('dialogMessage')
  const footerEl = $('dialogFooter')
  const closeBtn = $('dialogCloseBtn')
  if (!dialog) return

  titleEl.textContent = title
  if (typeof content === 'string') {
    msgEl.innerHTML = content
  } else if (content instanceof Node) {
    msgEl.replaceChildren(content)
  } else {
    msgEl.replaceChildren()
  }

  footerEl.hidden = Boolean(opts.hideClose)
  closeBtn.onclick = () => dialog.close()
  $('dialogXBtn').onclick = () => dialog.close()

  dialog.classList.toggle('dialog-save', Boolean(opts.saveMode))
  dialog.classList.toggle('dialog-stats', Boolean(opts.statsMode))
  dialog.classList.toggle('dialog-cite', Boolean(opts.citeMode))

  if (!dialog.open) dialog.showModal()
}

function showErrorModal(title, error) {
  const wrapper = document.createElement('div')
  const p = document.createElement('p')
  p.textContent = error instanceof Error ? error.message : String(error ?? 'Unknown error')
  wrapper.appendChild(p)
  if (error?.log?.length) {
    const pre = document.createElement('pre')
    pre.className = 'diag-pre'
    pre.textContent = error.log.slice(-20).join('\n')
    wrapper.appendChild(pre)
  }
  showModal(title, wrapper)
}

async function main() {
  const urlOpts = parseUrlOptions(window.location.search)

  const opacitySlider0 = $('opacitySlider0')
  const opacitySlider1 = $('opacitySlider1')
  const modelSelect = $('modelSelect')
  const seriesSelect = $('seriesSelect')
  const modelProgress = $('modelProgress')
  const locationEl = $('location')
  const activeModelItem = $('activeModelItem')
  const activeModelBadge = $('activeModelBadge')
  const backendStatusEl = $('backendStatus')
  const isoHudEl = $('isoHud')

  installDialogFallback($('appDialog'))

  // --- Viewer initialization ---
  const nv = new NiiVue({
    backend: urlOpts.viewer,
    matcaps: { Shiny: shiny },
    backgroundColor: [0, 0, 0, 1],
    is3DCrosshairVisible: true,
    clipPlaneColor: [0.7, 0, 0.7, 0.5],
    isLegendVisible: false,
    isDragDropEnabled: false, // page handles drops so DICOM goes through dcm2niix
    primaryDragMode: DRAG_MODE.crosshair,
    secondaryDragMode: DRAG_MODE.slicer3D,
    showRender: SHOW_RENDER.ALWAYS,
    isYoked3DTo2DZoom: false,
    crosshairGap: 11,
  })
  await nv.attachTo('gl1')
  nv.gamma = 1
  nv.volumeIsNearestInterpolation = true

  // --- App state ---
  let busy = false
  let seg = null
  // seg shapes:
  //   { kind: 'labels', entry, rawImage, labels (Uint8Array), colormap, fullLut, stats: null }
  //   { kind: 'mask', entry, rawImage, rawMask, mask (Uint8Array), stats: null }
  //   { kind: 'tissues', entry, maps: [gm, wm, csf], rawTissues, tissues, rgba,
  //     activeAlphaOffsets, activeBaseAlpha, rasLayout, overlay, stats: null }
  let isolatedLabel = null
  let isolatedTissueIndex = null
  let isolationHudData = null
  let savedBgOpacity = null
  let prevOverlayOpacity = Number(opacitySlider1.value)
  let overlayOpacityRaf = 0
  let hudRafPending = false
  let crosshairVox = null
  let series = []
  let saveUseFreeSurfer = false
  let saveIncludeBinaryMask = false
  let capabilityReport = null
  let lastRun = null
  let progressEvents = []

  // --- Status & progress helpers ---
  function setStatusText(text) {
    if (locationEl.textContent !== text) locationEl.textContent = text
  }

  function setStatusSegments(parts) {
    const nodes = []
    parts.forEach((part, idx) => {
      if (idx > 0) {
        const sep = document.createElement('span')
        sep.className = 'loc-sep'
        sep.textContent = '\u00b7'
        nodes.push(sep)
      }
      const span = document.createElement('span')
      span.className = 'loc-seg'
      span.textContent = part
      nodes.push(span)
    })
    locationEl.replaceChildren(...nodes)
  }

  function setProgress(frac, { indeterminate = false } = {}) {
    if (indeterminate) {
      modelProgress.removeAttribute('value')
      modelProgress.classList.add('is-busy')
      return
    }
    const clamped = Math.max(0, Math.min(1, Number(frac) || 0))
    modelProgress.value = clamped * modelProgress.max
    modelProgress.classList.toggle('is-busy', clamped > 0 && clamped < 1)
  }

  function setBusy(on) {
    busy = on
    for (const id of [
      'modelSelect',
      'seriesSelect',
      'openBtn',
      'mobileOpenBtn',
      'locationOpenBtn',
      'saveBtn',
      'saveStatsBtn',
    ]) {
      const el = $(id)
      if (el) el.disabled = on
    }
    if (!on) {
      modelProgress.classList.remove('is-busy')
    }
  }

  function updateActiveModelBadge(entry) {
    if (!entry) {
      activeModelItem.hidden = true
      activeModelBadge.textContent = ''
      activeModelBadge.removeAttribute('title')
      return
    }
    activeModelBadge.textContent = entry.label
    activeModelBadge.title = `Active model: ${entry.label}`
    activeModelItem.hidden = false
  }

  function syncModelTooltip() {
    const entry = findModelEntry(modelSelect.value)
    modelSelect.title = entry?.description || 'Choose a segmentation model to run'
  }

  // --- Backend capability probe & footer pill ---
  async function probeCapabilities(ranBackend = null) {
    if (!capabilityReport) {
      const gpu = await checkSupport('mindmap')
      const gl = checkWebgl2Support('mindmap')
      const cpu = checkCpuSupport()
      capabilityReport = { gpu, gl, cpu }
    }
    const { gpu, gl, cpu } = capabilityReport
    const effective =
      ranBackend ||
      (urlOpts.backend !== 'auto'
        ? urlOpts.backend
        : gpu.supported && !gpu.software
          ? 'webgpu'
          : gl.supported && gl.software === false
            ? 'webgl2'
            : cpu.supported
              ? 'cpu'
              : gl.supported && !gl.software
                ? 'webgl2'
                : 'none')

    if (effective === 'webgpu') {
      const tag = gpu.hasShaderF16 ? ' (F16)' : ''
      const mem = gpu.lowMemoryRequired ? ' · LowMem' : ''
      backendStatusEl.textContent = `WebGPU${tag}`
      backendStatusEl.style.color = '#4CAF50'
      backendStatusEl.title = `Pure-JS WebGPU V4${tag}${mem} — fastest`
    } else if (effective === 'webgl2') {
      backendStatusEl.textContent = 'WebGL2'
      backendStatusEl.style.color = '#FF9800'
      backendStatusEl.title = `WebGL2 WASM fallback${gpu.reasons?.length ? `\nWebGPU: ${gpu.reasons.join('; ')}` : ''}`
    } else if (effective === 'cpu') {
      backendStatusEl.textContent = 'CPU'
      backendStatusEl.style.color = '#60a5fa'
      backendStatusEl.title = 'Multi-threaded WebAssembly CPU fallback (cross-origin isolated)'
    } else {
      backendStatusEl.textContent = 'Unavailable'
      backendStatusEl.style.color = '#ef4444'
      backendStatusEl.title = [
        `WebGPU: ${gpu.reasons?.join('; ') || (gpu.software ? 'software adapter' : 'unavailable')}`,
        `WebGL2: ${gl.reasons?.join('; ') || (gl.software ? 'software rasteriser' : 'unavailable')}`,
        `CPU: ${cpu.reasons?.join('; ') || 'unavailable'}`,
      ].join('\n')
    }
  }

  // --- Overlay / opacity fast paths ---
  function setBgOpacity(value, redraw = true) {
    opacitySlider0.value = String(value)
    if (nv.volumes[0]) nv.volumes[0].opacity = Number(value)
    if (redraw) nv.drawScene()
  }

  function applyUnderlayForModel(entry) {
    if (entry?.underlayOpacity !== undefined) {
      if (savedBgOpacity === null) savedBgOpacity = opacitySlider0.value
      setBgOpacity(entry.underlayOpacity, false)
    } else if (savedBgOpacity !== null) {
      setBgOpacity(savedBgOpacity, false)
      savedBgOpacity = null
    }
  }

  function restoreBgOpacity(redraw = true) {
    if (savedBgOpacity !== null) {
      setBgOpacity(savedBgOpacity, redraw)
      savedBgOpacity = null
    }
  }

  function refreshOverlayOnly({ dataChanged = false, allowAffineFastPath = true } = {}) {
    if (nv.volumes.length < 2) return nv.updateGLVolume()
    const ov = nv.volumes[1]
    const opacity = ov.opacity ?? 1
    const toggledVisibility = (prevOverlayOpacity === 0) !== (opacity === 0)
    prevOverlayOpacity = opacity

    if (
      allowAffineFastPath &&
      !dataChanged &&
      !toggledVisibility &&
      opacity > 0 &&
      nv.volumes.length === 2 &&
      typeof nv.updateVolumeAffineOnly === 'function'
    ) {
      return nv.updateVolumeAffineOnly()
    }
    if (nv.volumes.length === 2 && typeof nv.updateVolumeData === 'function') {
      return nv.updateVolumeData(1)
    }
    return nv.updateGLVolume()
  }

  // Background opacity is a live shader uniform in NiiVue 1.0 -> instant drawScene().
  opacitySlider0.oninput = () => {
    if (!nv.volumes[0]) return
    nv.volumes[0].opacity = Number(opacitySlider0.value)
    nv.drawScene()
  }

  function applyOverlayOpacity() {
    const opacity = Number(opacitySlider1.value)
    if (seg?.kind === 'tissues' && nv.volumes[1] === seg.overlay) {
      if (opacity > 0) {
        updateCatLiteRgbaOpacity(seg.rgba, seg.activeAlphaOffsets, seg.activeBaseAlpha, opacity)
      }
      seg.overlay.opacity = opacity
      refreshOverlayOnly({ dataChanged: true, allowAffineFastPath: false })
      return
    }
    for (const overlay of nv.volumes.slice(1)) {
      overlay.opacity = opacity
    }
    refreshOverlayOnly({ dataChanged: false, allowAffineFastPath: true })
  }

  opacitySlider1.oninput = () => {
    if (overlayOpacityRaf) return
    overlayOpacityRaf = requestAnimationFrame(() => {
      overlayOpacityRaf = 0
      applyOverlayOpacity()
    })
  }

  function removeOverlaysNoRender() {
    resetIsolationState()
    while (nv.model.volumes.length > 1) {
      nv.model.removeVolume(nv.model.volumes.length - 1)
    }
  }

  async function removeOverlays() {
    removeOverlaysNoRender()
    await nv.updateGLVolume()
  }

  // --- Region / Tissue Isolation & 3D Tile HUD ---
  function resetIsolationState() {
    isolatedLabel = null
    isolatedTissueIndex = null
    isolationHudData = null
    isoHudEl.hidden = true
  }

  function buildIsolatedLabelLut(fullLut, labelVal) {
    const lut = new Uint8ClampedArray(fullLut.lut.length)
    const idx = labelVal - (fullLut.min ?? 0)
    if (idx >= 0 && idx * 4 + 3 < fullLut.lut.length) {
      const off = idx * 4
      lut[off] = fullLut.lut[off]
      lut[off + 1] = fullLut.lut[off + 1]
      lut[off + 2] = fullLut.lut[off + 2]
      lut[off + 3] = fullLut.lut[off + 3]
    }
    return {
      lut,
      min: fullLut.min,
      max: fullLut.max,
      ...(fullLut.labels ? { labels: fullLut.labels } : {}),
    }
  }

  function getComputedStats() {
    if (!seg || !nv.volumes[0]) return null
    if (seg.stats) return seg.stats
    const base = nv.volumes[0]
    const pd = base.hdr.pixDims || []
    const voxelVolMm3 = pd[1] && pd[2] && pd[3] ? pd[1] * pd[2] * pd[3] : 1
    const dims = base.hdr.dims.slice(1, 4)
    const slope = base.hdr.scl_slope || 1
    const inter = base.hdr.scl_inter || 0

    if (seg.kind === 'tissues') {
      const computed = computeCatLiteStats(base.img, seg.maps, voxelVolMm3, dims, seg.entry, {
        slope,
        inter,
      })
      seg.stats = {
        rows: computed.rows.slice().sort((a, b) => b.volume_mm3 - a.volume_mm3),
        totalMm3: computed.icvMm3,
      }
      return seg.stats
    }

    const labelArr = seg.kind === 'mask' ? seg.mask : seg.labels
    const labelNames =
      seg.kind === 'mask' ? ['Background', 'Brain Mask'] : seg.colormap?.labels ?? null
    const rows = computeLabelStats(base.img, labelArr, {
      voxelVolMm3,
      dims,
      slope,
      inter,
      labelNames,
    }).sort((a, b) => b.volume_mm3 - a.volume_mm3)
    const totalMm3 = rows.reduce((s, r) => s + r.volume_mm3, 0)
    seg.stats = { rows, totalMm3 }
    return seg.stats
  }

  function drawIsolationHUD() {
    const isActive =
      (isolatedLabel !== null && seg?.kind === 'labels' && nv.volumes.length > 1) ||
      (isolatedTissueIndex !== null && seg?.kind === 'tissues' && nv.volumes.length > 1)
    const tile = nv.view?.screenSlices?.find((s) => s.axCorSag === 4)
    if (!isActive || !isolationHudData || !tile) {
      isoHudEl.hidden = true
      return
    }
    const dpr = window.devicePixelRatio || 1
    const [L, T] = tile.leftTopWidthHeight
    isoHudEl.style.left = `${L / dpr + 8}px`
    isoHudEl.style.top = `${T / dpr + 8}px`
    const { lines, rgb } = isolationHudData
    const titleSpan = document.createElement('span')
    titleSpan.style.color = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
    titleSpan.style.fontWeight = '600'
    titleSpan.textContent = lines[0]
    isoHudEl.replaceChildren(titleSpan, document.createTextNode('\n' + lines.slice(1).join('\n')))
    isoHudEl.hidden = false
  }

  function scheduleHudSync() {
    if (hudRafPending || (isolatedLabel === null && isolatedTissueIndex === null)) return
    hudRafPending = true
    requestAnimationFrame(() => {
      hudRafPending = false
      drawIsolationHUD()
    })
  }

  const brightenRgb = (r, g, b) => [
    Math.min(255, Math.round(r * 0.55 + 130)),
    Math.min(255, Math.round(g * 0.55 + 130)),
    Math.min(255, Math.round(b * 0.55 + 130)),
  ]

  function applyLabelIsolation() {
    const ov = nv.volumes[1]
    if (!ov || seg?.kind !== 'labels') return
    if (isolatedLabel === null) {
      ov.colormapLabel = seg.fullLut
      isolationHudData = null
    } else {
      ov.colormapLabel = buildIsolatedLabelLut(seg.fullLut, isolatedLabel)
      const { rows, totalMm3 } = getComputedStats()
      const r = rows.find((x) => x.label === isolatedLabel)
      if (r) {
        const pct = totalMm3 > 0 ? (r.volume_mm3 / totalMm3) * 100 : 0
        const cm = seg.colormap
        const rgb =
          cm?.R?.[isolatedLabel] != null
            ? brightenRgb(cm.R[isolatedLabel], cm.G[isolatedLabel], cm.B[isolatedLabel])
            : [255, 255, 255]
        isolationHudData = {
          lines: [
            r.name,
            `${fmtCm3(r.volume_mm3)} cm\u00b3   (${pct.toFixed(1)}% of brain)`,
            `${r.voxels.toLocaleString()} voxels`,
            `intensity  ${fmtStatVal(r.mean)} \u00b1 ${fmtStatVal(r.stdev)}`,
          ],
          rgb,
        }
      }
    }
    refreshOverlayOnly({ dataChanged: false, allowAffineFastPath: true })
    drawIsolationHUD()
  }

  function isolateLabel(labelVal) {
    if (seg?.kind !== 'labels') return
    isolatedLabel = labelVal === 0 || labelVal === null || labelVal === isolatedLabel ? null : labelVal
    applyLabelIsolation()
  }

  function applyTissueIsolation() {
    if (seg?.kind !== 'tissues') return
    const opacity = Number(opacitySlider1.value)
    const rebuilt = buildCatLiteRgbaComposite(
      seg.maps,
      seg.entry,
      isolatedTissueIndex,
      opacity,
      seg.rasLayout,
    )
    seg.rgba = rebuilt.rgba
    seg.activeAlphaOffsets = rebuilt.activeAlphaOffsets
    seg.activeBaseAlpha = rebuilt.activeBaseAlpha
    seg.overlay.img = rebuilt.rgba
    seg.overlay.opacity = opacity

    if (isolatedTissueIndex === null) {
      isolationHudData = null
    } else {
      const { rows, totalMm3 } = getComputedStats()
      const r = rows.find((x) => x.tissueIndex === isolatedTissueIndex)
      if (r) {
        const pct = totalMm3 > 0 ? (r.volume_mm3 / totalMm3) * 100 : 0
        isolationHudData = {
          lines: [
            r.name,
            `${fmtCm3(r.volume_mm3)} cm\u00b3   (${pct.toFixed(1)}% of ICV)`,
            `${Math.round(r.effectiveVoxels).toLocaleString()} equiv. voxels`,
            `intensity  ${fmtStatVal(r.mean)} \u00b1 ${fmtStatVal(r.stdev)}`,
          ],
          rgb: brightenRgb(r.tint[0], r.tint[1], r.tint[2]),
        }
      }
    }
    refreshOverlayOnly({ dataChanged: true, allowAffineFastPath: false })
    drawIsolationHUD()
  }

  function isolateTissue(tissueIndex) {
    if (seg?.kind !== 'tissues') return
    isolatedTissueIndex =
      tissueIndex === null || tissueIndex === isolatedTissueIndex ? null : tissueIndex
    applyTissueIsolation()
  }

  // --- Centroid jump (Locate button in Stats) ---
  function jumpToRegionCentroid(row, { vol, labelArr = null, probMap = null } = {}) {
    if (!row?.centroidVox || !vol?.hdr?.affine) return
    const [nx, ny, nz] = vol.hdr.dims.slice(1, 4)
    let [vx, vy, vz] = row.centroidVox
    const rx = Math.max(0, Math.min(nx - 1, Math.round(vx)))
    const ry = Math.max(0, Math.min(ny - 1, Math.round(vy)))
    const rz = Math.max(0, Math.min(nz - 1, Math.round(vz)))
    const centerIdx = rx + ry * nx + rz * nx * ny

    if (labelArr && labelArr[centerIdx] !== row.label) {
      let bestDist = Infinity
      let bx = rx
      let by = ry
      let bz = rz
      let idx = 0
      for (let z = 0; z < nz; z++) {
        const dz = z - vz
        const dz2 = dz * dz
        for (let y = 0; y < ny; y++) {
          const dy = y - vy
          const dyz2 = dy * dy + dz2
          for (let x = 0; x < nx; x++, idx++) {
            if (labelArr[idx] !== row.label) continue
            const dx = x - vx
            const d2 = dx * dx + dyz2
            if (d2 < bestDist) {
              bestDist = d2
              bx = x
              by = y
              bz = z
            }
          }
        }
      }
      if (Number.isFinite(bestDist)) {
        vx = bx
        vy = by
        vz = bz
      }
    } else if (probMap && !(probMap[centerIdx] >= 0.5)) {
      let bestDist = Infinity
      let bx = rx
      let by = ry
      let bz = rz
      let idx = 0
      for (let z = 0; z < nz; z++) {
        const dz = z - vz
        const dz2 = dz * dz
        for (let y = 0; y < ny; y++) {
          const dy = y - vy
          const dyz2 = dy * dy + dz2
          for (let x = 0; x < nx; x++, idx++) {
            if (!(probMap[idx] >= 0.5)) continue
            const dx = x - vx
            const d2 = dx * dx + dyz2
            if (d2 < bestDist) {
              bestDist = d2
              bx = x
              by = y
              bz = z
            }
          }
        }
      }
      if (Number.isFinite(bestDist)) {
        vx = bx
        vy = by
        vz = bz
      }
    }

    const A = vol.hdr.affine
    const mm = [
      A[0][0] * vx + A[0][1] * vy + A[0][2] * vz + A[0][3],
      A[1][0] * vx + A[1][1] * vy + A[1][2] * vz + A[1][3],
      A[2][0] * vx + A[2][1] * vy + A[2][2] * vz + A[2][3],
    ]
    nv.setCrosshairPos(mm)
  }

  // --- Inference via @brainchop/core (worker: true) ---
  function sanitizeEngineText(text) {
    return String(text ?? '')
      .replace(/\bCAT-lite\s+partial-volume\b/gi, 'partial-volume')
      .replace(/\bCAT-lite\b/gi, 'PVE')
  }

  // Leave granular layer/Z-chunk advancement purely to the smooth progress bar
  // so LowMem128/paced runs never flicker status text in the bottom-left footer.
  function formatProgressStatus(entry, ev) {
    if (ev.stage === 'inference') {
      return entry.kind === 'tissues'
        ? 'Estimating tissue fraction maps\u2026'
        : `Running ${entry.shortLabel}\u2026`
    }
    const rawMsg = ev.message ? sanitizeEngineText(ev.message).trim() : ''
    if (!rawMsg) return null
    if (/^Loading cpu module$/i.test(rawMsg)) return 'Loading CPU module\u2026'
    if (/^Loading webgl2 module$/i.test(rawMsg)) return 'Loading WebGL2 module\u2026'
    return rawMsg
  }

  async function runModel(entry) {
    if (!entry || entry.kind === 'divider' || busy || !nv.volumes.length) return
    setBusy(true)
    progressEvents = []
    const progressTimeline = []
    const tStart = performance.now()
    setProgress(0.02)
    setStatusText(`Running ${entry.shortLabel}\u2026`)

    const log = []
    let clearedPrevious = false
    const swapOverlay = async (overlayVol) => {
      clearedPrevious = true
      removeOverlaysNoRender()
      applyUnderlayForModel(entry)
      await nv.model.addVolume(overlayVol)
    }
    try {
      const inputBytes = await nv.saveVolume({ volumeByIndex: 0, filename: '' })
      const tSerializeEnd = performance.now()
      const baseOptions = {
        model: entry.coreModel,
        worker: true,
        gzipOutput: false,
        backend: urlOpts.backend,
        webgpuMode: urlOpts.webgpuMode,
        ct: urlOpts.ct || undefined,
        comply: urlOpts.comply || undefined,
        onLog: (line) => {
          const cleanLine = sanitizeEngineText(line)
          log.push(cleanLine)
          const backendMatch = /using\s+(cpu|webgl2)\s+backend/i.exec(cleanLine)
          if (backendMatch) {
            const tag = backendMatch[1].toLowerCase() === 'cpu' ? 'CPU' : 'WebGL2'
            setProgress(0, { indeterminate: true })
            setStatusText(
              entry.kind === 'tissues'
                ? `Estimating tissue fraction maps (${tag})\u2026`
                : `Running ${entry.shortLabel} (${tag})\u2026`,
            )
          } else if (/^brainchop\s*::\s*Saved\b/i.test(cleanLine)) {
            setProgress(0.95)
            setStatusText('Finishing\u2026')
          }
        },
        onProgress: (ev) => {
          const stamped = { ...ev, t: performance.now() }
          progressEvents.push(ev)
          progressTimeline.push(stamped)
          if (ev.stage === 'load' && ev.progress === 0 && /webgl2|cpu/i.test(ev.message || '')) {
            setProgress(0, { indeterminate: true })
          } else {
            setProgress(ev.progress)
          }
          const statusText = formatProgressStatus(entry, ev)
          if (statusText) setStatusText(statusText)
        },
      }

      let opacity = Number(opacitySlider1.value)
      const base = nv.volumes[0]
      let result
      let labelSummary = null
      let tWorkerEnd = 0

      if (entry.kind === 'tissues') {
        result = await segmentTissues(inputBytes, baseOptions)
        tWorkerEnd = performance.now()
        opacity = Number(opacitySlider1.value)
        const gmVol = parseUncompressedNifti1(result.tissues.gm)
        const wmVol = parseUncompressedNifti1(result.tissues.wm)
        const csfVol = parseUncompressedNifti1(result.tissues.csf)
        const floatMaps = [
          decodeTissueVolumeToFloat32(gmVol),
          decodeTissueVolumeToFloat32(wmVol),
          decodeTissueVolumeToFloat32(csfVol),
        ]
        const rasLayout =
          base.dimsRAS && base.img2RASstart && base.img2RASstep
            ? {
                dimsRAS: [...base.dimsRAS],
                img2RASstart: [...base.img2RASstart],
                img2RASstep: [...base.img2RASstep],
              }
            : null

        const comp = buildCatLiteRgbaComposite(floatMaps, entry, null, opacity, rasLayout)
        const rasVolOverrides = comp.isRasOrdered
          ? {
              dims: [...rasLayout.dimsRAS],
              permRAS: [1, 2, 3],
              img2RASstart: [0, 0, 0],
              img2RASstep: [1, rasLayout.dimsRAS[1], rasLayout.dimsRAS[1] * rasLayout.dimsRAS[2]],
            }
          : {}
        const rasHdrOverrides = comp.isRasOrdered ? buildRasHdrOverrides(base, rasLayout) : {}

        const overlayVol = cloneOverlayVolume(
          base,
          comp.rgba,
          'cat_lite_tissues',
          {
            ...rasHdrOverrides,
            scl_inter: 0,
            scl_slope: 1,
            datatypeCode: 2304, // DT_RGBA32
            numBitsPerVoxel: 32,
            cal_min: 0,
            cal_max: 255,
            intent_code: 1001,
          },
          {
            ...rasVolOverrides,
            calMin: 0,
            calMax: 255,
            robustMin: 0,
            robustMax: 255,
            globalMin: 0,
            globalMax: 255,
            opacity,
          },
        )
        await swapOverlay(overlayVol)
        const addedOverlay = nv.volumes.at(-1)
        seg = {
          kind: 'tissues',
          entry,
          maps: floatMaps,
          rawTissues: result.tissues,
          tissues: comp.tissues,
          rasLayout: comp.isRasOrdered ? rasLayout : null,
          rgba: comp.rgba,
          activeAlphaOffsets: comp.activeAlphaOffsets,
          activeBaseAlpha: comp.activeBaseAlpha,
          overlay: addedOverlay,
          stats: null,
        }
        labelSummary = { Expect_Labels: 3, Actual_Labels: 3, NumLabels_Match: true }
      } else if (entry.kind === 'mask') {
        const maskOpts = {
          ...baseOptions,
          mask: true,
          ...(urlOpts.borderMm !== undefined ? { borderMm: urlOpts.borderMm } : {}),
        }
        result = await segment(inputBytes, maskOpts)
        tWorkerEnd = performance.now()
        opacity = Number(opacitySlider1.value)
        const parsedMask = parseUncompressedNifti1(result.mask)
        const maskU8 =
          parsedMask.img instanceof Uint8Array
            ? parsedMask.img
            : new Uint8Array(parsedMask.img)
        const overlayVol = await nv.prepareVolume({
          url: new File([result.image], 'brain_stripped.nii'),
          colormap: 'copper2',
          opacity,
        })
        await swapOverlay(overlayVol)
        seg = {
          kind: 'mask',
          entry,
          rawImage: result.image,
          rawMask: result.mask,
          mask: maskU8,
          stats: null,
        }
        let fg = 0
        for (let i = 0; i < maskU8.length; i++) if (maskU8[i] > 0) fg++
        labelSummary = {
          Expect_Labels: 2,
          Actual_Labels: fg > 0 ? 2 : 1,
          NumLabels_Match: fg > 0,
        }
      } else {
        const labelOpts = {
          ...baseOptions,
          ...(urlOpts.legacyCleanup ? { legacyCleanup: true } : {}),
        }
        result = await segment(inputBytes, labelOpts)
        tWorkerEnd = performance.now()
        opacity = Number(opacitySlider1.value)
        const parsed = parseUncompressedNifti1(result.image)
        const u8Labels =
          parsed.img instanceof Uint8Array ? parsed.img : new Uint8Array(parsed.img)

        const cm = MODELS[entry.coreModel].colormap
        const hist = getLabelHistogramU8(u8Labels)
        const pd = base.hdr.pixDims || []
        const voxelVolMm3 = pd[1] && pd[2] && pd[3] ? pd[1] * pd[2] * pd[3] : 1
        const missingNames = []
        let presentLabels = 0
        const annotatedLabels = cm.labels.map((name, idx) => {
          const count = idx < 256 ? hist[idx] : 0
          if (count > 0) presentLabels++
          else missingNames.push(name)
          return `${name}   ${count > 0 ? `${fmtCm3(count * voxelVolMm3)} cm\u00b3` : 'Missing'}`
        })
        labelSummary = {
          Expect_Labels: cm.labels.length,
          Actual_Labels: presentLabels,
          NumLabels_Match: presentLabels === cm.labels.length,
          ...(missingNames.length ? { Missing_Labels: missingNames.join(', ') } : {}),
        }

        const labelColormap = {
          R: cm.R,
          G: cm.G,
          B: cm.B,
          labels: annotatedLabels,
        }
        const cmapName = `brainchop-label-${entry.coreModel}`
        nv.addColormap(cmapName, labelColormap)
        const fullLut = makeLabelLut(labelColormap)
        const maxIdx = Math.max(1, cm.R.length - 1)

        const overlayVol = cloneOverlayVolume(
          base,
          u8Labels,
          `${entry.id}.nii`,
          {
            datatypeCode: 2,
            numBitsPerVoxel: 8,
            scl_inter: 0,
            scl_slope: 1,
            cal_min: 0,
            cal_max: maxIdx,
            intent_code: 1002, // NIFTI_INTENT_LABEL
          },
          {
            calMin: 0,
            calMax: maxIdx,
            robustMin: 0,
            robustMax: maxIdx,
            globalMin: 0,
            globalMax: maxIdx,
            colormap: cmapName,
            colormapLabel: fullLut,
            opacity,
          },
        )
        await swapOverlay(overlayVol)
        const addedSeg = nv.volumes.at(-1)
        if (addedSeg && !addedSeg.colormapLabel) {
          addedSeg.colormapLabel = fullLut
        }
        seg = {
          kind: 'labels',
          entry,
          rawImage: result.image,
          labels: u8Labels,
          colormap: cm,
          fullLut: addedSeg?.colormapLabel ?? fullLut,
          stats: null,
        }
      }

      prevOverlayOpacity = opacity
      await nv.updateGLVolume()
      const tDisplayEnd = performance.now()
      updateActiveModelBadge(entry)

      const { backend, elapsedMs, ranInWorker } = result
      const timings = computeStageTimings({
        tStart,
        tSerializeEnd,
        tWorkerEnd,
        tDisplayEnd,
        progressTimeline,
      })
      const v4Plan = parseV4PlanFromLog(log)
      const status =
        labelSummary && !labelSummary.NumLabels_Match && labelSummary.Missing_Labels
          ? `Failed to Predict Some Labels - ${labelSummary.Missing_Labels}`
          : 'OK'

      lastRun = {
        modelId: entry.id,
        coreModel: entry.coreModel,
        modelLabel: entry.label,
        backend,
        elapsedMs,
        ranInWorker,
        timings,
        v4Plan,
        labelSummary,
        status,
        progressEvents: progressEvents.slice(),
        log,
      }
      await probeCapabilities(backend)
      setProgress(1)
      setStatusSegments([entry.shortLabel, `${(elapsedMs / 1000).toFixed(1)} s`, backend])
    } catch (error) {
      if (!seg || clearedPrevious) {
        seg = null
        updateActiveModelBadge(null)
        restoreBgOpacity(false)
        await removeOverlays()
      }
      setProgress(0)
      setStatusText('Segmentation failed')
      showErrorModal('Segmentation failed', error)
    } finally {
      modelSelect.value = ''
      syncModelTooltip()
      setBusy(false)
    }
  }

  // --- Save modal & exports (Native, Conformed via lazy niimath, FreeSurfer LUT, Binary Mask, Scene) ---
  function buildBinaryMaskU8() {
    if (!seg) return null
    if (seg.kind === 'mask') return seg.mask
    if (seg.kind === 'labels') {
      const out = new Uint8Array(seg.labels.length)
      for (let i = 0; i < seg.labels.length; i++) out[i] = seg.labels[i] > 0 ? 1 : 0
      return out
    }
    if (seg.kind === 'tissues') {
      const [gm, wm] = seg.maps
      const out = new Uint8Array(gm.length)
      for (let i = 0; i < gm.length; i++) out[i] = gm[i] + wm[i] >= 0.5 ? 1 : 0
      return out
    }
    return null
  }

  function makeNativeHeaderCopy(baseHdr, overrides = {}) {
    return Object.assign(Object.create(Object.getPrototypeOf(baseHdr)), baseHdr, {
      dims: [...baseHdr.dims],
      pixDims: [...baseHdr.pixDims],
      affine: baseHdr.affine.map((row) => [...row]),
      ...overrides,
    })
  }

  async function saveNative({ includeMask = false, useFreeSurfer = false } = {}) {
    if (!seg || !nv.volumes[0]) return
    setBusy(true)
    setStatusText('Saving native-space output\u2026')
    try {
      const base = nv.volumes[0]
      const stem = stripNiftiExt(base.name || 'volume')
      if (seg.kind === 'tissues') {
        const keys = ['gm', 'wm', 'csf']
        for (let i = 0; i < keys.length; i++) {
          const hdr = makeNativeHeaderCopy(base.hdr, {
            datatypeCode: 16,
            numBitsPerVoxel: 32,
            scl_slope: 1,
            scl_inter: 0,
            cal_min: 0,
            cal_max: 1,
            intent_code: 1001,
          })
          await downloadVolume(hdr, seg.maps[i], `${stem}_${keys[i]}_native.nii.gz`)
        }
      } else if (seg.kind === 'mask') {
        const parsed = parseUncompressedNifti1(seg.rawImage)
        const hdr = makeNativeHeaderCopy(base.hdr, {
          datatypeCode: parsed.hdr.datatypeCode,
          numBitsPerVoxel: parsed.hdr.numBitsPerVoxel,
          scl_slope: parsed.hdr.scl_slope,
          scl_inter: parsed.hdr.scl_inter,
        })
        await downloadVolume(hdr, parsed.img, `${stem}_brain_native.nii.gz`)
      } else {
        const fsLut = useFreeSurfer ? buildFreeSurferLut(seg.colormap.labels) : null
        if (fsLut) {
          const { img, maxLabel } = remapLabelsToFreeSurfer(seg.labels, fsLut)
          const hdr = makeNativeHeaderCopy(base.hdr, {
            datatypeCode: 4, // DT_INT16
            numBitsPerVoxel: 16,
            scl_slope: 1,
            scl_inter: 0,
            cal_min: 0,
            cal_max: maxLabel,
            intent_code: 1002,
          })
          await downloadVolume(hdr, img, `${stem}_${seg.entry.id}_fs_native.nii.gz`)
        } else {
          const hdr = makeNativeHeaderCopy(base.hdr, {
            datatypeCode: 2,
            numBitsPerVoxel: 8,
            scl_slope: 1,
            scl_inter: 0,
            cal_min: 0,
            cal_max: Math.max(1, seg.colormap.R.length - 1),
            intent_code: 1002,
          })
          await downloadVolume(hdr, seg.labels, `${stem}_${seg.entry.id}_native.nii.gz`)
        }
      }

      if (includeMask) {
        const mask = buildBinaryMaskU8()
        if (mask) {
          const maskHdr = makeNativeHeaderCopy(base.hdr, {
            datatypeCode: 2,
            numBitsPerVoxel: 8,
            scl_slope: 1,
            scl_inter: 0,
            cal_min: 0,
            cal_max: 1,
            intent_code: 1002,
          })
          await downloadVolume(maskHdr, mask, `${stem}_binary_mask_native.nii.gz`)
        }
      }
      setStatusText('Saved native-space output')
    } catch (error) {
      showErrorModal('Save failed', error)
    } finally {
      setBusy(false)
    }
  }

  async function saveConformed({ includeMask = false, useFreeSurfer = false } = {}) {
    if (!seg || !nv.volumes[0]) return
    setBusy(true)
    setStatusText('Resampling to conformed 256\u00b3 grid\u2026')
    try {
      const base = nv.volumes[0]
      const stem = stripNiftiExt(base.name || 'volume')
      const inputBytes = await nv.saveVolume({ volumeByIndex: 0, filename: '' })

      await withNiimath(async (niimath) => {
        niimath.setOutputDataType('char')
        const ref = await niimath.image(inputBytes, 'input.nii').conform().run('conformed_ref.nii.gz')

        if (seg.kind === 'tissues') {
          niimath.setOutputDataType('float')
          const keys = ['gm', 'wm', 'csf']
          for (let i = 0; i < keys.length; i++) {
            const hdr = makeNativeHeaderCopy(base.hdr, {
              datatypeCode: 16,
              numBitsPerVoxel: 32,
              scl_slope: 1,
              scl_inter: 0,
              cal_min: 0,
              cal_max: 1,
              intent_code: 1001,
            })
            const rawNii = await serializeVolumeToBytes(hdr, seg.maps[i], `${keys[i]}.nii`)
            const outFile = await niimath
              .image(rawNii, `${keys[i]}.nii`)
              .resliceNN(ref)
              .run(`${stem}_${keys[i]}_conformed.nii.gz`)
            downloadBlob(outFile, `${stem}_${keys[i]}_conformed.nii.gz`)
          }
        } else if (seg.kind === 'mask') {
          niimath.setOutputDataType('input')
          const outFile = await niimath
            .image(new Uint8Array(seg.rawImage), 'brain.nii')
            .resliceNN(ref)
            .run(`${stem}_brain_conformed.nii.gz`)
          downloadBlob(outFile, `${stem}_brain_conformed.nii.gz`)
        } else {
          const fsLut = useFreeSurfer ? buildFreeSurferLut(seg.colormap.labels) : null
          if (fsLut) {
            const { img, maxLabel } = remapLabelsToFreeSurfer(seg.labels, fsLut)
            const hdr = makeNativeHeaderCopy(base.hdr, {
              datatypeCode: 4,
              numBitsPerVoxel: 16,
              scl_slope: 1,
              scl_inter: 0,
              cal_min: 0,
              cal_max: maxLabel,
              intent_code: 1002,
            })
            const rawNii = await serializeVolumeToBytes(hdr, img, 'labels_fs.nii')
            niimath.setOutputDataType('short')
            const outFile = await niimath
              .image(rawNii, 'labels_fs.nii')
              .resliceNN(ref)
              .run(`${stem}_${seg.entry.id}_fs_conformed.nii.gz`)
            downloadBlob(outFile, `${stem}_${seg.entry.id}_fs_conformed.nii.gz`)
          } else {
            niimath.setOutputDataType('char')
            const outFile = await niimath
              .image(new Uint8Array(seg.rawImage), 'labels.nii')
              .resliceNN(ref)
              .run(`${stem}_${seg.entry.id}_conformed.nii.gz`)
            downloadBlob(outFile, `${stem}_${seg.entry.id}_conformed.nii.gz`)
          }
        }

        if (includeMask) {
          const mask = buildBinaryMaskU8()
          if (mask) {
            const maskHdr = makeNativeHeaderCopy(base.hdr, {
              datatypeCode: 2,
              numBitsPerVoxel: 8,
              scl_slope: 1,
              scl_inter: 0,
              cal_min: 0,
              cal_max: 1,
              intent_code: 1002,
            })
            const maskNii = await serializeVolumeToBytes(maskHdr, mask, 'mask.nii')
            niimath.setOutputDataType('char')
            const outMask = await niimath
              .image(maskNii, 'mask.nii')
              .resliceNN(ref)
              .run(`${stem}_binary_mask_conformed.nii.gz`)
            downloadBlob(outMask, `${stem}_binary_mask_conformed.nii.gz`)
          }
        }
      })
      setStatusText('Saved conformed 256\u00b3 output')
    } catch (error) {
      showErrorModal('Conformed save failed', error)
    } finally {
      setBusy(false)
    }
  }

  async function saveConformedInput() {
    if (!nv.volumes[0]) return
    setBusy(true)
    setStatusText('Conforming input volume to 256\u00b3\u2026')
    try {
      const stem = stripNiftiExt(nv.volumes[0].name || 'input')
      const inputBytes = await nv.saveVolume({ volumeByIndex: 0, filename: '' })
      await withNiimath(async (niimath) => {
        niimath.setOutputDataType('char')
        const outFile = await niimath
          .image(inputBytes, 'input.nii')
          .conform()
          .run(`${stem}_conformed.nii.gz`)
        downloadBlob(outFile, `${stem}_conformed.nii.gz`)
      })
      setStatusText('Saved conformed input volume')
    } catch (error) {
      showErrorModal('Save failed', error)
    } finally {
      setBusy(false)
    }
  }

  function saveScene() {
    if (!nv.volumes.length) return
    nv.saveDocument('brainchop.nvd')
    setStatusText('Saved scene (.nvd)')
  }

  function openSaveModal() {
    const hasImg = nv.volumes.length >= 1
    const hasSeg = Boolean(seg && nv.volumes.length >= 2)
    const hasMask = hasSeg && seg.kind !== 'tissues'
    const hasFreeSurfer =
      hasSeg && seg.kind === 'labels' && Boolean(buildFreeSurferLut(seg.colormap.labels))

    const options = [
      {
        act: saveNative,
        group: 'seg',
        icon: 'grid',
        title: 'Native space',
        sub: 'Exact input voxel grid',
        need: 'seg',
      },
      {
        act: saveConformed,
        group: 'seg',
        icon: 'cube',
        title: 'Conformed space',
        sub: '256\u00b3 \u00b7 1 mm isotropic',
        need: 'seg',
      },
      {
        act: saveConformedInput,
        group: 'vol',
        icon: 'volume',
        title: 'Conformed input volume',
        sub: 'Resampled input \u00b7 256\u00b3 \u00b7 1 mm',
        need: 'img',
      },
      {
        act: saveScene,
        group: 'vol',
        icon: 'scene',
        title: 'Scene (.nvd)',
        sub: 'Full viewer state document',
        need: 'img',
      },
    ]

    const ready = (need) => (need === 'seg' ? hasSeg : hasImg)
    let autofocusAssigned = false
    const renderCards = (group) =>
      options
        .map((o, i) => ({ o, i }))
        .filter(({ o }) => o.group === group)
        .map(({ o, i }) => {
          const enabled = ready(o.need)
          const autoAttr = enabled && !autofocusAssigned ? ((autofocusAssigned = true), ' autofocus') : ''
          return `<button type="button" class="save-opt${enabled ? '' : ' disabled'}" data-i="${i}"${enabled ? '' : ' disabled'}${autoAttr}>
            ${SAVE_ICONS[o.icon]}
            <span class="save-opt-copy">
              <span class="save-opt-title">${o.title}</span>
              <span class="save-opt-sub">${o.sub}</span>
            </span>
            ${SAVE_ICONS.arrow}
          </button>`
        })
        .join('')

    const modifierRows = []
    if (hasFreeSurfer) {
      modifierRows.push(`
        <label class="save-check-row" for="saveFreeSurfer">
          <input type="checkbox" id="saveFreeSurfer" class="save-checkbox"${saveUseFreeSurfer ? ' checked' : ''}>
          <span class="save-check-copy">
            <span class="save-check-title">FreeSurfer label IDs <span class="save-badge">Freeview</span></span>
            <span class="save-check-sub">FreeSurferColorLUT numbering \u00b7 open directly with :colormap=lut</span>
          </span>
        </label>`)
    }
    if (hasMask) {
      modifierRows.push(`
        <label class="save-check-row" for="saveBinaryMask">
          <input type="checkbox" id="saveBinaryMask" class="save-checkbox"${saveIncludeBinaryMask ? ' checked' : ''}>
          <span class="save-check-copy">
            <span class="save-check-title">Also save binary mask</span>
            <span class="save-check-sub">Foreground 1 \u00b7 background 0</span>
          </span>
        </label>`)
    }
    const modifiersHtml = modifierRows.length
      ? `<div class="save-modifiers" role="group" aria-label="Segmentation export options">${modifierRows.join('')}</div>`
      : ''

    const segHint = !hasSeg ? '<span class="save-section-hint">Run a model first</span>' : ''
    const html = `
      <div class="save-sheet">
        <section class="save-section">
          <div class="save-section-head">
            <span class="save-section-label">Segmentation</span>
            ${segHint}
          </div>
          <div class="save-options">${renderCards('seg')}</div>
          ${modifiersHtml}
        </section>
        <section class="save-section save-section-divider">
          <div class="save-section-head">
            <span class="save-section-label">Volume &amp; Scene</span>
          </div>
          <div class="save-options">${renderCards('vol')}</div>
        </section>
      </div>`

    showModal('Save', html, { hideClose: true, saveMode: true })
    const msg = $('dialogMessage')
    const fsInput = msg.querySelector('#saveFreeSurfer')
    if (fsInput) fsInput.onchange = () => { saveUseFreeSurfer = fsInput.checked }
    const maskInput = msg.querySelector('#saveBinaryMask')
    if (maskInput) maskInput.onchange = () => { saveIncludeBinaryMask = maskInput.checked }

    msg.querySelectorAll('.save-opt:not(:disabled)').forEach((btn) => {
      btn.onclick = () => {
        const opt = options[Number(btn.dataset.i)]
        const includeMask = opt.need === 'seg' && Boolean(msg.querySelector('#saveBinaryMask')?.checked)
        const useFreeSurfer =
          opt.need === 'seg' && hasFreeSurfer && Boolean(msg.querySelector('#saveFreeSurfer')?.checked)
        $('appDialog').close()
        if (opt.need === 'seg') {
          void opt.act({ includeMask, useFreeSurfer })
        } else {
          void opt.act()
        }
      }
    })
  }

  // --- Stats modal (discrete labels + mindgrab mask + continuous PVE) ---
  function openStatsModal() {
    if (!seg || nv.volumes.length < 2) {
      showModal('Region volumes', '<p>No segmentation to measure &mdash; run a model first.</p>')
      return
    }

    const { rows, totalMm3 } = getComputedStats()
    if (!rows.length) {
      showModal('Region volumes', '<p>No non-background regions found in this segmentation.</p>')
      return
    }

    const isCatLite = seg.kind === 'tissues'
    const canIsolate = seg.kind === 'labels' || isCatLite
    const fsLut = seg.kind === 'labels' ? buildFreeSurferLut(seg.colormap.labels) : null
    const maxVol = Math.max(...rows.map((r) => r.volume_mm3))
    const colorOf = (r) => {
      if (r.colorCss) return r.colorCss
      if (seg.kind === 'mask') return 'rgb(217,119,33)'
      const cm = seg.colormap
      return cm?.R?.[r.label] != null
        ? `rgb(${cm.R[r.label]},${cm.G[r.label]},${cm.B[r.label]})`
        : '#6b9bd1'
    }

    let body = ''
    for (const r of rows) {
      const pct = totalMm3 > 0 ? (r.volume_mm3 / totalMm3) * 100 : 0
      const wAbs = maxVol > 0 ? (r.volume_mm3 / maxVol) * 100 : 0
      const isIso = isCatLite ? isolatedTissueIndex === r.tissueIndex : isolatedLabel === r.label
      const fsId = !isCatLite && fsLut && r.label < fsLut.length ? fsLut[r.label] : null
      const cell = (k, v) => `<div class="stat-kv"><span class="k">${k}</span><span class="v">${v}</span></div>`
      const detail = isCatLite
        ? cell('% ICV', `${pct.toFixed(1)}%`) +
          cell('cm\u00b3', fmtCm3(r.volume_mm3)) +
          cell('mean', fmtStatVal(r.mean)) +
          cell('SD', fmtStatVal(r.stdev)) +
          cell('min', fmtStatVal(r.min)) +
          cell('max', fmtStatVal(r.max)) +
          cell('equiv. vox', Math.round(r.effectiveVoxels).toLocaleString()) +
          cell('support', r.supportVoxels.toLocaleString())
        : cell('min', fmtStatVal(r.min)) +
          cell('max', fmtStatVal(r.max)) +
          cell('Q1', fmtStatVal(r.q1)) +
          cell('Q3', fmtStatVal(r.q3)) +
          cell('median', fmtStatVal(r.median)) +
          cell('mean', fmtStatVal(r.mean)) +
          cell('SD', fmtStatVal(r.stdev)) +
          cell('voxels', r.voxels.toLocaleString())
      const idChip = isCatLite
        ? `<span class="stat-id-chip">${escapeHtml(r.tissueKey.toUpperCase())}</span>`
        : `<span class="stat-id-chip">ID ${r.label}</span>`
      const isoBtnHtml = canIsolate
        ? `<button type="button" class="stat-iso${isIso ? ' active' : ''}" aria-pressed="${isIso}" aria-label="${isIso ? 'Isolated' : 'Isolate'} ${escapeHtml(r.name)}">${isIso ? 'isolated' : 'isolate'}</button>`
        : ''

      body += `
        <div class="stat-row${isIso ? ' is-isolated' : ''}" data-label="${r.label}" data-name="${escapeHtml(r.name.toLowerCase())}">
          <div class="stat-line">
            <button type="button" class="stat-trigger" aria-expanded="false">
              <span class="stat-chevron" aria-hidden="true"></span>
              <span class="stat-swatch" style="background:${colorOf(r)}" aria-hidden="true"></span>
              <span class="stat-name">${escapeHtml(r.name)}</span>
              <span class="stat-track" aria-hidden="true"><span class="stat-bar" style="width:${wAbs.toFixed(2)}%;background:${colorOf(r)}" data-w-abs="${wAbs.toFixed(2)}" data-w-pct="${pct.toFixed(2)}"></span></span>
              <span class="stat-val" data-cm3="${fmtCm3(r.volume_mm3)}" data-pct="${pct.toFixed(1)}%">${fmtCm3(r.volume_mm3)}</span>
            </button>
            <span class="stat-actions">
              <button type="button" class="stat-locate" aria-label="Locate ${escapeHtml(r.name)}" title="Jump crosshair to ${escapeHtml(r.name)}">${STAT_LOCATE_ICON}</button>
              ${isoBtnHtml}
            </span>
          </div>
          <div class="stat-detail" hidden>
            <div class="stat-detail-meta">
              <span class="stat-detail-fullname">${escapeHtml(r.name)}</span>
              <span class="stat-detail-badges">
                ${idChip}
                ${fsId ? `<span class="save-badge">FS ${fsId}</span>` : ''}
              </span>
            </div>
            <div class="stat-detail-grid">${detail}</div>
          </div>
        </div>`
    }

    const unitNoun = isCatLite
      ? rows.length === 1
        ? 'tissue'
        : 'tissues'
      : rows.length === 1
        ? 'region'
        : 'regions'
    const totalSuffix = isCatLite ? ' cm\u00b3 ICV' : ' cm\u00b3'
    const pctLabel = isCatLite ? '% of ICV' : '% of total'
    const searchHtml =
      rows.length > 8
        ? `<search class="stat-search">
             <input type="search" id="statsFilterInput" class="stat-filter" placeholder="Filter regions\u2026" aria-label="Filter regions" autocorrect="off" autocapitalize="none" spellcheck="false">
           </search>`
        : ''

    const html = `
      <div id="statsPanel">
        <div class="stat-toolbar">
          <div class="stat-toggle" role="group" aria-label="Volume display unit">
            <button type="button" data-mode="cm3" class="active" aria-pressed="true">cm\u00b3</button>
            <button type="button" data-mode="pct" aria-pressed="false">${pctLabel}</button>
          </div>
          <span class="stat-total" id="statsUnitLabel">${rows.length} ${unitNoun} &middot; ${fmtCm3(totalMm3)}${totalSuffix}</span>
          ${searchHtml}
        </div>
        <div id="statsRows">
          ${body}
          <p id="statsEmpty" class="stat-empty" hidden>No matching regions</p>
        </div>
        <div class="stat-footer">
          <span class="stat-footer-hint">Select a row for stats &middot; Crosshair jumps &middot; Isolate solos in 3D</span>
          <button type="button" id="statsDownloadBtn" class="stat-csv-btn">
            ${SAVE_ICONS.arrow}
            <span>Download CSV</span>
          </button>
        </div>
      </div>`

    showModal(isCatLite ? 'Tissue volumes' : 'Region volumes', html, {
      hideClose: true,
      statsMode: true,
    })

    const panel = $('statsPanel')
    if (!panel) return

    const rowByLabel = new Map(rows.map((r) => [r.label, r]))
    let currentMode = 'cm3'
    let visibleCount = rows.length

    const updateUnitSummary = () => {
      const unitEl = $('statsUnitLabel')
      if (!unitEl) return
      const countText =
        visibleCount === rows.length
          ? `${rows.length} ${unitNoun}`
          : `${visibleCount} of ${rows.length} ${unitNoun}`
      const totalText =
        currentMode === 'pct'
          ? isCatLite
            ? '100% of ICV'
            : '100% of volume'
          : `${fmtCm3(totalMm3)}${totalSuffix}`
      unitEl.textContent = `${countText} \u00b7 ${totalText}`
    }

    panel.querySelectorAll('.stat-toggle button').forEach((btn) => {
      btn.onclick = () => {
        currentMode = btn.dataset.mode
        panel.querySelectorAll('.stat-toggle button').forEach((b) => {
          const active = b === btn
          b.classList.toggle('active', active)
          b.setAttribute('aria-pressed', String(active))
        })
        updateUnitSummary()
        panel.querySelectorAll('.stat-row').forEach((rowEl) => {
          const val = rowEl.querySelector('.stat-val')
          const bar = rowEl.querySelector('.stat-bar')
          val.textContent = currentMode === 'pct' ? val.dataset.pct : val.dataset.cm3
          bar.style.width = `${currentMode === 'pct' ? bar.dataset.wPct : bar.dataset.wAbs}%`
        })
      }
    })

    const filterInput = $('statsFilterInput')
    const emptyEl = $('statsEmpty')
    if (filterInput) {
      const applyFilter = () => {
        const q = filterInput.value.trim().toLowerCase()
        visibleCount = 0
        panel.querySelectorAll('.stat-row').forEach((rowEl) => {
          const match = !q || rowEl.dataset.name.includes(q) || rowEl.dataset.label === q
          rowEl.hidden = !match
          if (match) visibleCount++
        })
        if (emptyEl) emptyEl.hidden = visibleCount > 0
        updateUnitSummary()
      }
      filterInput.oninput = applyFilter
      // Per light-dismiss-a-dialog guidance: inner control consumes Esc before dialog closes.
      filterInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && filterInput.value !== '') {
          e.preventDefault()
          e.stopPropagation()
          filterInput.value = ''
          applyFilter()
        }
      })
    }

    panel.querySelectorAll('.stat-trigger').forEach((trigger) => {
      trigger.onclick = () => {
        const rowEl = trigger.closest('.stat-row')
        const detail = rowEl.querySelector('.stat-detail')
        const open = detail.hidden
        detail.hidden = !open
        rowEl.classList.toggle('is-expanded', open)
        trigger.setAttribute('aria-expanded', String(open))
      }
    })

    panel.querySelectorAll('.stat-locate').forEach((btn) => {
      btn.onclick = () => {
        const labelVal = Number(btn.closest('.stat-row').dataset.label)
        const row = rowByLabel.get(labelVal)
        if (row) {
          jumpToRegionCentroid(row, {
            vol: nv.volumes[0],
            labelArr: isCatLite ? null : seg.kind === 'mask' ? seg.mask : seg.labels,
            probMap: isCatLite ? seg.maps[row.tissueIndex] : null,
          })
        }
        $('appDialog').close()
      }
    })

    panel.querySelectorAll('.stat-iso').forEach((btn) => {
      btn.onclick = () => {
        const labelVal = Number(btn.closest('.stat-row').dataset.label)
        if (!Number.isNaN(labelVal)) {
          if (isCatLite) isolateTissue(labelVal)
          else isolateLabel(labelVal)
        }
        $('appDialog').close()
      }
    })

    $('statsDownloadBtn').onclick = () => {
      if (isCatLite) {
        downloadBlob(buildCatLiteStatsCsv(rows, totalMm3), 'tissue_stats.csv', 'text/csv')
      } else {
        downloadBlob(buildStatsCsv(rows, fsLut), 'mask_stats.csv', 'text/csv')
      }
    }
  }

  // --- Diagnostics, About, and Cite modals ---
  async function openDiagnosticsModal() {
    if (!capabilityReport) await probeCapabilities()
    const text = await formatDiagnosticsReport({ lastRun, capabilityReport, nv })
    const copied = await navigator.clipboard?.writeText(text).then(() => true, () => false)

    const issuesUrl = 'https://github.com/neuroneural/brainchop/issues'
    const benchUrl = 'https://github.com/neuroneural/brainchop-core/issues/3'
    const mkLink = (href, label) => {
      const a = document.createElement('a')
      a.href = href
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      a.textContent = label
      return a
    }

    const wrap = document.createElement('div')
    const note = document.createElement('p')
    note.className = 'diag-note'
    note.append(
      document.createTextNode(
        copied
          ? 'Diagnostics copied to clipboard. Share timings in '
          : 'Could not copy automatically \u2014 select and copy below, then paste in ',
      ),
      mkLink(benchUrl, 'Community Benchmarks'),
      document.createTextNode(' or '),
      mkLink(issuesUrl, 'GitHub Issues'),
      document.createTextNode('.'),
    )

    const pre = document.createElement('pre')
    pre.className = 'diag-pre'
    const urlIdx = text.indexOf(issuesUrl)
    if (urlIdx >= 0) {
      pre.append(
        document.createTextNode(text.slice(0, urlIdx)),
        mkLink(issuesUrl, issuesUrl),
        document.createTextNode(text.slice(urlIdx + issuesUrl.length)),
      )
    } else {
      pre.textContent = text
    }

    wrap.append(note, pre)
    showModal('Diagnostics', wrap)
  }

  function openCiteModal() {
    showModal('Cite BrainChop', buildCiteModalContent(), { hideClose: true, citeMode: true })
  }

  function openAboutModal() {
    const html = `
      <div class="about-brand">
        <img src="./icons/brainchop-logo.png" alt="BrainChop logo" width="48" height="43" />
        <div class="about-brand-copy">
          <strong>BrainChop</strong>
          <span>Powered by <code>@brainchop/core</code> &amp; NiiVue</span>
        </div>
      </div>
      <div class="about-body">
        <p><strong>Privacy First.</strong> Everything runs locally in your browser via WebGPU, WebGL2, or multi-threaded WebAssembly CPU. Your imaging data never leaves your device, and zero client-side analytics scripts are loaded.</p>

        <p><strong>Controls</strong></p>
        <ul>
          <li>Click <strong>Open</strong> or <strong>Drag &amp; Drop</strong> any NIfTI (<code>.nii</code>/<code>.nii.gz</code>), NiiVue scene (<code>.nvd</code>), or DICOM file / folder &mdash; everything stays on your device.</li>
          <li>Press <strong>C</strong> to cycle the 3D clip plane and <strong>V</strong> to cycle slice views.</li>
          <li><strong>Option/Alt-click</strong> a label or tissue map (or use <strong>Stats &rarr; isolate</strong>) to show it alone in 2D + 3D. Click it again, click background, or press <strong>Esc</strong> to restore.</li>
          <li>Click <strong>Reset view</strong> (or <strong>&#x27F2;</strong> on mobile) to restore default zoom, pan, 3D angle, and contrast.</li>
        </ul>

        <p><strong>Model Icon Key</strong></p>
        <ul>
          <li><strong>&#x1FA93;</strong> Robust full-capacity models</li>
          <li><strong>&#x26A1;</strong> Fast lightweight model</li>
          <li><strong>&#x1F52A;</strong> Sharp high-detail Desikan-Killiany cortical parcellation</li>
          <li><strong>&#x2154;&#x1F9E0;</strong> Continuous GM/WM/CSF tissue fraction maps (experimental)</li>
        </ul>

        <p><strong>Rodent MRI?</strong> Try our sibling app <a href="https://brainchomp.org/" target="_blank" rel="noopener noreferrer">Brainchomp</a> (<a href="https://github.com/neuroneural/brainchomp" target="_blank" rel="noopener noreferrer">GitHub</a>) for local mouse &amp; rat brain extraction.</p>

        <p class="about-note">Intended for research and educational use; not cleared as a medical device for clinical diagnosis.</p>

        <div class="about-links">
          <button type="button" id="aboutOpenCiteBtn" class="about-inline-btn">Cite BrainChop</button>
          <a href="./v3/">Legacy BrainChop v3</a>
          <a href="https://github.com/neuroneural/brainchop" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://www.npmjs.com/package/@brainchop/core" target="_blank" rel="noopener noreferrer">@brainchop/core</a>
        </div>
      </div>`
    showModal('About BrainChop', html)
    const citeTrigger = $('aboutOpenCiteBtn')
    if (citeTrigger) citeTrigger.onclick = () => openCiteModal()
  }

  // --- Drag & drop (NIfTI, meshes, .nvd scenes, DICOM files/folders + series picker) ---
  const hasExt = (exts, file) => exts.some((ext) => file.name.toUpperCase().endsWith(`.${ext}`))

  async function loadSeries(index) {
    if (!series[index]) return
    setBusy(true)
    try {
      await nv.loadVolumes([{ url: series[index].file }])
      seriesSelect.value = String(index)
      setStatusText(series[index].label)
    } catch (error) {
      showErrorModal('Could not open image', error)
    } finally {
      setBusy(false)
    }
  }

  function openSeriesPicker() {
    const suggested = series.reduce((best, s, i) => (s.voxels > series[best].voxels ? i : best), 0)
    setStatusText(`${series.length} series: choose one`)

    const wrap = document.createElement('div')
    wrap.className = 'save-options series-options'
    series.forEach((s, i) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = i === suggested ? 'save-opt suggested' : 'save-opt'
      if (i === suggested) btn.autofocus = true

      const copy = document.createElement('span')
      copy.className = 'save-opt-copy'
      const title = document.createElement('span')
      title.className = 'save-opt-title'
      title.textContent = s.label
      const sub = document.createElement('span')
      sub.className = 'save-opt-sub'
      sub.textContent = `${s.detail}${i === suggested ? ' \u00b7 suggested' : ''}`
      copy.append(title, sub)
      btn.appendChild(copy)
      btn.onclick = () => {
        $('appDialog').close()
        void loadSeries(i)
      }
      wrap.appendChild(btn)
    })
    showModal(`Choose one of ${series.length} series`, wrap, { hideClose: true, saveMode: true })
  }

  async function openLocalFiles(rawFiles) {
    const files = filterIgnorableFiles(rawFiles)
    if (busy || !files.length) return
    setBusy(true)
    try {
      const scene = files.find((f) => hasExt(['NVD'], f))
      if (scene) {
        seg = null
        savedBgOpacity = null
        resetIsolationState()
        modelSelect.value = ''
        syncModelTooltip()
        updateActiveModelBadge(null)
        seriesSelect.hidden = true
        await nv.loadDocument(scene, { fill: 'current' })
        if (!nv.volumes.length) throw new Error('The scene contains no loadable image')
        opacitySlider0.value = String(nv.volumes[0].opacity ?? 1)
        setStatusText(scene.name)
        return
      }

      const meshes = files.filter((f) => hasExt(nv.meshExtensions, f))
      const volumes = files.filter((f) => hasExt(nv.volumeExtensions, f))
      const jsons = files.filter((f) => f.name.toLowerCase().endsWith('.json'))
      const other = files.filter((f) => !meshes.includes(f) && !volumes.includes(f) && !jsons.includes(f))

      let converted = []
      let dicomError = null
      if (other.length) {
        setStatusText(`Converting ${other.length} file(s) with dcm2niix\u2026`)
        converted = await convertDicomFiles(other).catch((err) => {
          dicomError = err
          return []
        })
      }

      const images = [...volumes, ...converted.filter((f) => NIFTI_RE.test(f.name))]
      if (!meshes.length && !images.length) {
        throw new Error(
          `Open or drop NIfTI images (.nii/.nii.gz), NiiVue scenes (.nvd), meshes, or DICOM files / folders.${dicomError ? ` (dcm2niix: ${dicomError.message})` : ''}`,
        )
      }

      for (const mesh of meshes) {
        await nv.addMesh({ url: mesh })
      }
      if (!images.length) {
        setStatusText(meshes.map((f) => f.name).join(', '))
        return
      }

      series = await describeSeries(images, [
        ...jsons,
        ...converted.filter((f) => f.name.toLowerCase().endsWith('.json')),
      ])
      seriesSelect.replaceChildren(...series.map((s, i) => new Option(s.label, String(i))))
      seriesSelect.hidden = series.length < 2
      seriesSelect.selectedIndex = -1

      if (series.length > 1) {
        setBusy(false)
        openSeriesPicker()
        return
      }
      setBusy(false)
      await loadSeries(0)
    } catch (error) {
      showErrorModal('Could not open file(s)', error)
    } finally {
      setBusy(false)
    }
  }

  function openFileModal() {
    if (busy) return
    const canPickFolder = supportsDirectoryPicker()
    const isNarrow = document.body.classList.contains('nv-narrow')
    const volumeAccept = getOpenInputAccept('volume')
    const sceneAccept = getOpenInputAccept('scene')

    const renderOpenCard = ({ id, icon, title, sub, autofocus = false }) => `
      <button type="button" id="${id}" class="save-opt"${autofocus ? ' autofocus' : ''}>
        ${SAVE_ICONS[icon]}
        <span class="save-opt-copy">
          <span class="save-opt-title">${title}</span>
          <span class="save-opt-sub">${sub}</span>
        </span>
        ${SAVE_ICONS.chevron}
      </button>`

    const dicomCardsHtml =
      renderOpenCard({
        id: 'openDicomFilesBtn',
        icon: 'dicomFiles',
        title: 'DICOM files',
        sub: 'Select slices (.dcm or no ext.)',
      }) +
      (canPickFolder
        ? renderOpenCard({
            id: 'openDicomFolderBtn',
            icon: 'folder',
            title: 'DICOM folder',
            sub: 'Entire study directory',
          })
        : '')

    const dropHint = isNarrow ? '' : ' You can also drop files or folders anywhere.'
    const acceptAttr = (val) => (val ? ` accept="${escapeHtml(val)}"` : '')

    // Hidden file inputs live inside the open <dialog> so they are never inert.
    const html = `
      <div class="save-sheet open-sheet">
        <section class="save-section">
          <div class="save-section-head">
            <span class="save-section-label">Volume &amp; Scene</span>
            <span class="save-section-hint">Processed locally</span>
          </div>
          <div class="save-options">
            ${renderOpenCard({
              id: 'openVolumeBtn',
              icon: 'volume',
              title: 'NIfTI / Volume',
              sub: '.nii, .nii.gz, .mgz, .nrrd, meshes',
              autofocus: true,
            })}
            ${renderOpenCard({
              id: 'openSceneBtn',
              icon: 'scene',
              title: 'Scene (.nvd)',
              sub: 'Saved viewer state document',
            })}
          </div>
        </section>
        <section class="save-section save-section-divider">
          <div class="save-section-head">
            <span class="save-section-label">DICOM</span>
            <span class="save-section-hint">${canPickFolder ? 'Single, series, or folder' : 'Single or multi-slice'}</span>
          </div>
          <div class="save-options">${dicomCardsHtml}</div>
        </section>
        <div class="open-privacy-note">
          ${SAVE_ICONS.lock}
          <p><strong>Stays on this device.</strong> Files are read directly in your browser and never uploaded.${dropHint}</p>
        </div>
        <input id="openInputVolume" type="file" multiple${acceptAttr(volumeAccept)} hidden />
        <input id="openInputScene" type="file"${acceptAttr(sceneAccept)} hidden />
        <input id="openInputDicomFiles" type="file" multiple hidden />
        ${canPickFolder ? '<input id="openInputDicomFolder" type="file" webkitdirectory multiple hidden />' : ''}
      </div>`

    showModal('Open', html, { hideClose: true, saveMode: true })

    const wirePicker = (btnId, inputId) => {
      const btn = $(btnId)
      const input = $(inputId)
      if (!btn || !input) return
      btn.onclick = () => input.click()
      input.onchange = () => {
        const selected = Array.from(input.files || [])
        input.value = ''
        if (!selected.length) return
        const dlg = $('appDialog')
        if (dlg?.open) dlg.close()
        void openLocalFiles(selected)
      }
    }

    wirePicker('openVolumeBtn', 'openInputVolume')
    wirePicker('openSceneBtn', 'openInputScene')
    wirePicker('openDicomFilesBtn', 'openInputDicomFiles')
    if (canPickFolder) wirePicker('openDicomFolderBtn', 'openInputDicomFolder')
  }

  let dragDepth = 0
  const setDropHighlight = (on) => {
    const dlg = $('appDialog')
    if (dlg?.open) {
      dlg.classList.toggle('is-drop-target', on)
      $('canvas-container')?.classList.remove('is-drop-target')
    } else {
      $('canvas-container')?.classList.toggle('is-drop-target', on)
      dlg?.classList.remove('is-drop-target')
    }
  }
  const hasDraggedFiles = (e) => Array.from(e.dataTransfer?.types || []).includes('Files')

  document.addEventListener('dragenter', (e) => {
    if (!hasDraggedFiles(e) || busy) return
    e.preventDefault()
    dragDepth++
    setDropHighlight(true)
  })
  document.addEventListener('dragover', (e) => {
    if (!hasDraggedFiles(e)) return
    e.preventDefault()
  })
  document.addEventListener('dragleave', (e) => {
    if (!hasDraggedFiles(e)) return
    dragDepth = Math.max(0, dragDepth - 1)
    if (dragDepth === 0) setDropHighlight(false)
  })
  document.addEventListener('drop', (e) => {
    e.preventDefault()
    dragDepth = 0
    setDropHighlight(false)
    if (busy) return
    const dlg = $('appDialog')
    if (dlg?.open) dlg.close()
    readDropItems(e.dataTransfer).then(openLocalFiles, (err) =>
      showErrorModal('Could not read dropped files', err),
    )
  })
  seriesSelect.onchange = () => void loadSeries(Number(seriesSelect.value))

  // --- Toolbar & keyboard wiring ---
  const dragSegmented = $('dragSegmented')
  dragSegmented.querySelectorAll('button').forEach((btn) => {
    btn.onclick = () => {
      nv.secondaryDragMode = Number(btn.dataset.drag)
      dragSegmented.querySelectorAll('button').forEach((b) => {
        const active = b === btn
        b.classList.toggle('active', active)
        b.setAttribute('aria-pressed', String(active))
      })
    }
  })

  const shadingBtn = $('shadingBtn')
  shadingBtn.onclick = () => {
    const on = shadingBtn.classList.toggle('active')
    shadingBtn.setAttribute('aria-pressed', String(on))
    nv.volumeIllumination = on ? 0.5 : 0
  }

  $('resetViewBtn').onclick = () => resetView(nv)
  $('openBtn').onclick = openFileModal
  $('mobileOpenBtn').onclick = openFileModal
  const locationOpenBtn = $('locationOpenBtn')
  if (locationOpenBtn) locationOpenBtn.onclick = openFileModal
  $('saveBtn').onclick = openSaveModal
  $('saveStatsBtn').onclick = openStatsModal
  $('diagnosticsBtn').onclick = () => void openDiagnosticsModal()
  $('aboutBtn').onclick = openAboutModal

  // Populate model dropdown in exact brainchop-test order & icon notation
  for (const item of MODEL_MENU) {
    const option = document.createElement('option')
    option.textContent = item.label
    option.value = item.id
    if (item.kind === 'divider') option.disabled = true
    modelSelect.appendChild(option)
  }
  modelSelect.value = ''
  syncModelTooltip()

  modelSelect.onchange = () => {
    syncModelTooltip()
    const entry = findModelEntry(modelSelect.value)
    if (entry) void runModel(entry)
  }

  // Alt/Option-click region or tissue isolation
  $('canvas-container').addEventListener('click', (e) => {
    if (!e.altKey || busy || !seg || !crosshairVox) return
    if (seg.kind === 'labels') {
      const idx = rasToNativeIndex(nv.volumes[1], crosshairVox)
      if (idx === null) return
      const lbl = seg.labels[idx]
      isolateLabel(lbl)
    } else if (seg.kind === 'tissues') {
      const idx = rasToNativeIndex(nv.volumes[0], crosshairVox)
      if (idx === null) return
      let bestIdx = null
      let bestVal = 0
      for (let t = 0; t < 3; t++) {
        const v = seg.maps[t][idx]
        if (Number.isFinite(v) && v > bestVal) {
          bestVal = v
          bestIdx = t
        }
      }
      isolateTissue(bestVal >= (seg.entry.probabilityDisplayMin ?? 0.03) ? bestIdx : null)
    }
  })

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || busy || document.querySelector('dialog[open]')) return
    if (isolatedLabel !== null) {
      isolatedLabel = null
      applyLabelIsolation()
    } else if (isolatedTissueIndex !== null) {
      isolatedTissueIndex = null
      applyTissueIsolation()
    }
  })

  // Keep HUD aligned as NiiVue redraws / resizes
  const origDrawScene = nv.drawScene.bind(nv)
  nv.drawScene = function (...args) {
    const res = origDrawScene(...args)
    drawIsolationHUD()
    return res
  }
  window.addEventListener('resize', scheduleHudSync)

  // Live coordinate + continuous PVE GM/WM/CSF footer readout
  nv.addEventListener('locationChange', (e) => {
    const data = e.detail
    crosshairVox = data.vox
    if (busy) return
    const segments = data.string
      .split('   ')
      .map((s) => s.trim())
      .filter(Boolean)

    let tissueNode = null
    if (seg?.kind === 'tissues' && nv.volumes[0] && crosshairVox) {
      if (segments.length > 1) segments.pop()
      const idx = rasToNativeIndex(nv.volumes[0], crosshairVox)
      if (idx !== null) {
        const gm = seg.maps[0][idx] || 0
        const wm = seg.maps[1][idx] || 0
        const csf = seg.maps[2][idx] || 0
        if (gm + wm + csf >= 0.005) {
          tissueNode = document.createElement('span')
          tissueNode.className = 'loc-seg loc-tissues'
          const entries = [
            ['GM', gm.toFixed(2)],
            ['WM', wm.toFixed(2)],
            ['CSF', csf.toFixed(2)],
          ]
          entries.forEach(([k, v], i) => {
            if (i > 0) tissueNode.appendChild(document.createTextNode(' '))
            const ks = document.createElement('span')
            ks.className = 'loc-k'
            ks.textContent = k
            const vs = document.createElement('span')
            vs.className = 'loc-v'
            vs.textContent = v
            tissueNode.append(ks, document.createTextNode(' '), vs)
          })
        }
      }
    }

    const nodes = []
    segments.forEach((val, idx) => {
      if (idx > 0) {
        const sep = document.createElement('span')
        sep.className = 'loc-sep'
        sep.textContent = '\u00b7'
        nodes.push(sep)
      }
      const sp = document.createElement('span')
      sp.className = 'loc-seg'
      sp.textContent = val
      nodes.push(sp)
    })
    if (tissueNode) {
      if (nodes.length) {
        const sep = document.createElement('span')
        sep.className = 'loc-sep'
        sep.textContent = '\u00b7'
        nodes.push(sep)
      }
      nodes.push(tissueNode)
    }
    locationEl.replaceChildren(...nodes)
  })

  // Replacing base volume clears active segmentation state
  nv.addEventListener('volumeLoaded', () => {
    if (nv.volumes.length > 1) return
    seg = null
    resetIsolationState()
    updateActiveModelBadge(null)
    modelSelect.value = ''
    syncModelTooltip()
    restoreBgOpacity(false)
    if (nv.volumes[0]) {
      nv.volumes[0].opacity = Number(opacitySlider0.value)
      nv.drawScene()
    }
  })

  // Expose read-only state hook for automated verification
  window.__brainchop = {
    get nv() { return nv },
    get seg() { return seg },
    get lastRun() { return lastRun },
    get capabilities() { return capabilityReport },
    get progressEvents() { return progressEvents },
    get busy() { return busy },
    runModelById: (id) => {
      const entry = findModelEntry(id)
      if (!entry) throw new Error(`Unknown model id: ${id}`)
      modelSelect.value = entry.id
      syncModelTooltip()
      return runModel(entry)
    },
    isolateLabel,
    isolateTissue,
    openFileModal,
    openLocalFiles,
    openDroppedFiles: openLocalFiles,
  }

  // Load default bundled T1 volume
  await nv.loadVolumes([{ url: './t1_crop.nii.gz' }])
  installResponsiveLayout(nv)
  installTouchViewControls(nv)
  await probeCapabilities()

  // Optional auto-run via ?model=...
  if (urlOpts.model) {
    const entry = findModelEntry(urlOpts.model)
    if (entry) {
      modelSelect.value = entry.id
      syncModelTooltip()
      void runModel(entry)
    }
  }
}

void main().then(() => {
  if (!import.meta.env.PROD) return
  try {
    if (!('serviceWorker' in navigator)) return
    const registerSw = () => {
      try {
        navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {
          // Storage or Service Workers may be disabled by browser privacy settings.
        })
      } catch {
        // Ignore synchronous SecurityError when site storage is blocked.
      }
    }
    if (document.readyState === 'complete') registerSw()
    else window.addEventListener('load', registerSw, { once: true })
  } catch {
    // Ignore synchronous SecurityError when accessing navigator.serviceWorker.
  }
})
