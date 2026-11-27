import test from 'node:test'
import assert from 'node:assert/strict'
import { nii2volume, writeVolume } from '@niivue/niivue'
import { MODELS } from '@brainchop/core'
import { MODEL_MENU, findModelEntry, parseUrlOptions } from '../../src/models.js'
import { CITATIONS, allBibtex } from '../../src/cite.js'
import {
  resolveFreeSurferLabelId,
  buildFreeSurferLut,
  remapLabelsToFreeSurfer,
} from '../../src/freesurfer-labels.js'
import {
  rasToNativeIndex,
  computeLabelStats,
  buildStatsCsv,
  fmtCm3,
  getLabelHistogramU8,
} from '../../src/stats.js'
import {
  decodeTissueVolumeToFloat32,
  buildCatLiteRgbaComposite,
  buildRasHdrOverrides,
  updateCatLiteRgbaOpacity,
  computeCatLiteStats,
  buildCatLiteStatsCsv,
} from '../../src/pve-overlay.js'
import {
  parseUncompressedNifti1,
  stripNiftiExt,
  isAppleWebKitBrowser,
  supportsDirectoryPicker,
  getOpenInputAccept,
  filterIgnorableFiles,
} from '../../src/io.js'
import { computeStageTimings, parseV4PlanFromLog } from '../../src/diagnostics.js'

test('MODEL_MENU matches brainchop-test layout & icons (excluding DK-50 and lesion scan)', () => {
  assert.deepEqual(
    MODEL_MENU.map((m) => [m.id, m.label]),
    [
      ['mindgrab', '\u{1FA93}\u{1F9E0} Omnimodal Skull Stripping'],
      ['mindmap', '\u{1FA93} Subcortical + Tissue'],
      ['pve', '\u2154\u{1F9E0} Tissue fraction maps (GM/WM/CSF)'],
      ['mindsnap', '\u{1FA93}\u{1F52A} Desikan-Killiany Atlas'],
      ['divider', '-----------------'],
      ['mindmap-fast', '\u26A1\u{1FA93} Subcortical + Tissue (fast)'],
    ],
  )
  assert.equal(findModelEntry('16chan18cls')?.id, 'mindmap-fast')
  assert.equal(findModelEntry('cat-lite')?.id, 'pve')
  assert.equal(findModelEntry('0')?.id, 'mindgrab')
  assert.equal(findModelEntry('divider'), null)
  assert.equal(findModelEntry('4'), null)
})

test('parseUrlOptions handles power-user URL flags safely', () => {
  const opts = parseUrlOptions('?model=mindgrab&backend=cpu&webgpuMode=low-memory&viewer=webgpu&ct=1&comply=true&border=2.5&legacyCleanup=1')
  assert.deepEqual(opts, {
    model: 'mindgrab',
    backend: 'cpu',
    webgpuMode: 'low-memory',
    viewer: 'webgpu',
    ct: true,
    comply: true,
    borderMm: 2.5,
    legacyCleanup: true,
  })
  const fallback = parseUrlOptions('?backend=bogus&webgpuMode=nope&border=-3')
  assert.equal(fallback.backend, 'auto')
  assert.equal(fallback.webgpuMode, 'auto')
  assert.equal(fallback.borderMm, undefined)
})

test('CITATIONS lists Aperture Neuro 2024 primary, MindGrab 2026, and JOSS 2023', () => {
  assert.equal(CITATIONS.length, 3)
  assert.equal(CITATIONS[0].id, 'ecosystem')
  assert.match(CITATIONS[0].formatted, /Aperture Neuro/)
  assert.match(CITATIONS[0].bibtex, /10\.52294\/001c\.123059/)

  assert.equal(CITATIONS[1].id, 'mindgrab')
  assert.match(CITATIONS[1].formatted, /NeuroImage, 338:122074, 2026/)
  assert.match(CITATIONS[1].bibtex, /42331200/)

  assert.equal(CITATIONS[2].id, 'joss')
  assert.match(CITATIONS[2].bibtex, /10\.21105\/joss\.05098/)

  const combined = allBibtex()
  assert.ok(combined.includes('@article{plis2024brainchop'))
  assert.ok(combined.includes('@article{fani2026mindgrab'))
  assert.ok(combined.includes('@article{masoud2023brainchop'))
})

test('FreeSurfer ColorLUT remaps @brainchop/core mindmap, mindmap-fast, and mindsnap labels', () => {
  assert.equal(buildFreeSurferLut(MODELS.mindgrab.colormap.labels), null)

  for (const modelKey of ['mindmap', 'mindmap-fast', 'mindsnap']) {
    const lut = buildFreeSurferLut(MODELS[modelKey].colormap.labels)
    assert.ok(lut instanceof Int16Array, `Expected valid FreeSurfer LUT for ${modelKey}`)
    assert.equal(lut[0], 0)
    for (let i = 1; i < lut.length; i++) {
      assert.ok(lut[i] > 0, `${modelKey} label ${i} (${MODELS[modelKey].colormap.labels[i]}) should map > 0`)
    }
  }

  assert.equal(resolveFreeSurferLabelId('ctx-lh-bankssts'), 1001)
  assert.equal(resolveFreeSurferLabelId('ctx-rh-insula'), 2035)
  assert.equal(resolveFreeSurferLabelId('CC_Anterior'), 255)

  const snapLut = buildFreeSurferLut(MODELS.mindsnap.colormap.labels)
  const { img, maxLabel } = remapLabelsToFreeSurfer(new Uint8Array([0, 1, 68, 103]), snapLut)
  assert.deepEqual(Array.from(img), [0, 1001, 2035, 255])
  assert.equal(maxLabel, 2035)
})

test('computeLabelStats supports scaled native Int16 inputs with exact quantiles and centroids', () => {
  const dims = [2, 2, 2]
  const labels = new Uint8Array([0, 1, 1, 1, 2, 2, 0, 1])
  const rawImg = new Int16Array([0, 10, 20, 30, 100, 200, 0, 40])
  const rows = computeLabelStats(rawImg, labels, {
    voxelVolMm3: 2.5,
    dims,
    slope: 0.5,
    inter: 10,
    labelNames: ['BG', 'Cortex', 'WM'],
  })
  assert.equal(rows.length, 2)
  const r1 = rows[0]
  assert.equal(r1.label, 1)
  assert.equal(r1.name, 'Cortex')
  assert.equal(r1.voxels, 4)
  assert.equal(r1.volume_mm3, 10)
  // scaled values for label 1: [15, 20, 25, 30]
  assert.equal(r1.min, 15)
  assert.equal(r1.q1, 15)
  assert.equal(r1.median, 20)
  assert.equal(r1.q3, 25)
  assert.equal(r1.max, 30)
  assert.equal(r1.mean, 22.5)
  assert.deepEqual(r1.centroidVox, [0.75, 0.75, 0.25])

  const csv = buildStatsCsv(rows, new Int16Array([0, 3, 2]))
  assert.match(csv, /^label,fs_label,name,voxels,volume_mm3/)
  assert.match(csv, /1,3,Cortex,4,10/)
  assert.equal(fmtCm3(12345), '12')
  assert.equal(fmtCm3(2345), '2.3')
  assert.deepEqual(Array.from(getLabelHistogramU8(labels).subarray(0, 3)), [2, 4, 2])
})

test('rasToNativeIndex resolves custom img2RAS strides', () => {
  const vol = {
    dimsRAS: [3, 4, 4, 4],
    img2RASstart: [3, 0, 0],
    img2RASstep: [-1, 4, 16],
    img: new Uint8Array(64),
  }
  assert.equal(rasToNativeIndex(vol, [0, 0, 0]), 3)
  assert.equal(rasToNativeIndex(vol, [3, 1, 2]), 0 + 4 + 32)
  assert.equal(rasToNativeIndex(vol, [-1, 0, 0]), null)
})

test('PVE tissue fraction decode, DT_RGBA32 composite, fast opacity update, and stats', () => {
  const gm = decodeTissueVolumeToFloat32({
    hdr: { scl_slope: 1 / 255, scl_inter: 0 },
    img: new Uint8Array([0, 255, 128, 0]),
  })
  const wm = decodeTissueVolumeToFloat32({
    hdr: { scl_slope: 1 / 255, scl_inter: 0 },
    img: new Uint8Array([0, 0, 127, 0]),
  })
  const csf = decodeTissueVolumeToFloat32({
    hdr: { scl_slope: 1 / 255, scl_inter: 0 },
    img: new Uint8Array([0, 0, 0, 255]),
  })
  assert.ok(Math.abs(gm[1] - 1) < 1e-6)
  assert.ok(Math.abs(gm[2] - 128 / 255) < 1e-6)

  const comp = buildCatLiteRgbaComposite([gm, wm, csf], null, null, 0.5)
  assert.equal(comp.rgba.length, 16)
  assert.equal(comp.rgba[3], 0) // voxel 0 background
  assert.ok(comp.rgba[4] > 200 && comp.rgba[7] > 100) // voxel 1 GM red
  assert.ok(comp.rgba[14] > 200 && comp.rgba[15] > 100) // voxel 3 CSF blue

  updateCatLiteRgbaOpacity(comp.rgba, comp.activeAlphaOffsets, comp.activeBaseAlpha, 1.0)
  assert.equal(comp.rgba[7], 255)
  updateCatLiteRgbaOpacity(comp.rgba, comp.activeAlphaOffsets, comp.activeBaseAlpha, 0.0)
  assert.equal(comp.rgba[7], 0)

  const { rows, icvMm3 } = computeCatLiteStats(
    new Uint8Array([0, 100, 150, 40]),
    [gm, wm, csf],
    1.0,
    [2, 2, 1],
    null,
    { slope: 1, inter: 0 },
  )
  assert.equal(rows.length, 3)
  assert.ok(Math.abs(icvMm3 - 3.0) < 0.01)
  const csv = buildCatLiteStatsCsv(rows, icvMm3)
  assert.match(csv, /^tissue,name,volume_mm3,volume_cm3,pct_icv/)
})

test('parseUncompressedNifti1 parses little-endian NIfTI-1 headers and scaled voxels', () => {
  const buf = new ArrayBuffer(352 + 8)
  const dv = new DataView(buf)
  dv.setInt32(0, 348, true)
  dv.setInt16(40, 3, true)
  dv.setInt16(42, 2, true)
  dv.setInt16(44, 2, true)
  dv.setInt16(46, 2, true)
  dv.setInt16(70, 2, true) // UINT8
  dv.setInt16(72, 8, true)
  dv.setFloat32(80, 1.0, true)
  dv.setFloat32(84, 1.0, true)
  dv.setFloat32(88, 1.0, true)
  dv.setFloat32(108, 352, true)
  dv.setFloat32(112, 1 / 255, true)
  dv.setFloat32(116, 0, true)
  new Uint8Array(buf, 352).set([0, 10, 20, 30, 40, 50, 60, 255])

  const parsed = parseUncompressedNifti1(buf)
  assert.deepEqual(parsed.hdr.dims, [3, 2, 2, 2])
  assert.equal(parsed.hdr.datatypeCode, 2)
  assert.ok(Math.abs(parsed.hdr.scl_slope - 1 / 255) < 1e-6)
  assert.equal(parsed.img[7], 255)
  assert.equal(stripNiftiExt('subject01_T1w.nii.gz'), 'subject01_T1w')
  assert.equal(stripNiftiExt('./t1_crop.nii.gz'), 't1_crop')
  assert.equal(stripNiftiExt('dir/sub/scan.nii'), 'scan')
})

test('computeStageTimings & parseV4PlanFromLog extract granular stage timings and V4 plan', () => {
  const timings = computeStageTimings({
    tStart: 1000,
    tSerializeEnd: 1050,
    tWorkerEnd: 4050,
    tDisplayEnd: 4200,
    progressTimeline: [
      { stage: 'load', progress: 0, message: 'Loading mindsnap weights', t: 1060 },
      { stage: 'conform', progress: 0.15, t: 1100 },
      { stage: 'conform', progress: 0.25, t: 1300 },
      { stage: 'preprocess', progress: 0.25, t: 1300 },
      { stage: 'preprocess', progress: 0.3, t: 1380 },
      { stage: 'load', progress: 0.3, message: 'Setting up WebGPU V4 for mindsnap', t: 1390 },
      { stage: 'inference', progress: 0.3, layer: 0, totalLayers: 13, t: 1690 },
      { stage: 'inference', progress: 0.85, layer: 13, totalLayers: 13, t: 3190 },
      { stage: 'postprocess', progress: 0.85, t: 3200 },
      { stage: 'reslice', progress: 0.93, t: 3700 },
      { stage: 'complete', progress: 1.0, t: 4040 },
    ],
  })
  assert.equal(timings.Serialize_t, '0.0500')
  assert.equal(timings.Conform_t, '0.2000')
  assert.equal(timings.Preprocess_t, '0.0800')
  assert.equal(timings.Setup_t, '0.3000')
  assert.equal(timings.Inference_t, '1.5000')
  assert.equal(timings.Postprocess_t, '0.5000')
  assert.equal(timings.Reslice_t, '0.3400')
  assert.equal(timings.Display_t, '0.1500')
  assert.equal(timings.Total_t, '3.2000')

  const plan = parseV4PlanFromLog([
    '[WebGPU-V4] layout=LowMem128 exec=paced reason=override probe=12.4ms',
  ])
  assert.deepEqual(plan, {
    WebGPU_V4_Layout: 'LowMem128',
    WebGPU_V4_Exec: 'paced',
    WebGPU_V4_Reason: 'override',
    WebGPU_V4_Probe: '12.4ms',
  })
})

test('local Open helpers omit accept on Safari/iOS, hide directory picker on mobile, and filter OS junk', () => {
  const macSafari = {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
    platform: 'MacIntel',
    maxTouchPoints: 0,
  }
  const iosSafari = {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    maxTouchPoints: 5,
  }
  const iosChrome = {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.0.0 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    maxTouchPoints: 5,
  }
  const ipadDesktopMode = {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
    platform: 'MacIntel',
    maxTouchPoints: 5,
  }
  const macChrome = {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    platform: 'MacIntel',
    maxTouchPoints: 0,
  }
  const androidChrome = {
    userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    maxTouchPoints: 5,
  }
  const linuxFirefox = {
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:134.0) Gecko/20100101 Firefox/134.0',
    platform: 'Linux x86_64',
    maxTouchPoints: 0,
  }

  assert.equal(isAppleWebKitBrowser(macSafari), true)
  assert.equal(isAppleWebKitBrowser(iosSafari), true)
  assert.equal(isAppleWebKitBrowser(iosChrome), true)
  assert.equal(isAppleWebKitBrowser(ipadDesktopMode), true)
  assert.equal(isAppleWebKitBrowser(macChrome), false)
  assert.equal(isAppleWebKitBrowser(androidChrome), false)
  assert.equal(isAppleWebKitBrowser(linuxFirefox), false)

  // Directory picker: true only on desktop browsers that actually expose webkitdirectory
  assert.equal(supportsDirectoryPicker(macChrome, true), true)
  assert.equal(supportsDirectoryPicker(macSafari, true), true)
  assert.equal(supportsDirectoryPicker(linuxFirefox, true), true)
  assert.equal(supportsDirectoryPicker(macChrome, false), false)
  assert.equal(supportsDirectoryPicker(iosSafari, true), false)
  assert.equal(supportsDirectoryPicker(ipadDesktopMode, true), false)
  assert.equal(supportsDirectoryPicker(androidChrome, true), false)

  // accept attribute strategy
  assert.equal(getOpenInputAccept('volume', macSafari), '')
  assert.equal(getOpenInputAccept('volume', iosSafari), '')
  assert.equal(getOpenInputAccept('scene', iosChrome), '')
  assert.match(getOpenInputAccept('volume', macChrome), /\.nii,\.nii\.gz,\.gz/)
  assert.match(getOpenInputAccept('scene', linuxFirefox), /\.nvd/)
  assert.equal(getOpenInputAccept('dicom', macChrome), '')
  assert.equal(getOpenInputAccept('dicom', linuxFirefox), '')

  // Ignore OS metadata files while keeping extensionless DICOMs
  const filtered = filterIgnorableFiles([
    { name: '.DS_Store' },
    { name: '._T1w.nii.gz' },
    { name: 'Thumbs.db' },
    { name: 'IM0001' },
    { name: 'sub-01_T1w.nii.gz' },
    { name: 'study/1.2.840.113619' },
  ])
  assert.deepEqual(
    filtered.map((f) => f.name),
    ['IM0001', 'sub-01_T1w.nii.gz', 'study/1.2.840.113619'],
  )
})

test('buildRasHdrOverrides preserves row-major matRAS affine and RAS pixDims on serialization', async () => {
  const baseHdr = {
    littleEndian: true,
    dim_info: 0,
    dims: [3, 4, 6, 8, 1, 1, 1, 1],
    intent_p1: 0,
    intent_p2: 0,
    intent_p3: 0,
    intent_code: 0,
    datatypeCode: 2,
    numBitsPerVoxel: 8,
    slice_start: 0,
    pixDims: [-1, 1.5, 2.0, 3.0, 0, 0, 0, 0],
    vox_offset: 352,
    scl_slope: 1,
    scl_inter: 0,
    slice_end: 0,
    slice_code: 0,
    xyzt_units: 10,
    cal_max: 255,
    cal_min: 0,
    slice_duration: 0,
    toffset: 0,
    description: '',
    aux_file: '',
    qform_code: 1,
    sform_code: 1,
    quatern_b: 0,
    quatern_c: 0,
    quatern_d: 0,
    qoffset_x: 10,
    qoffset_y: -20,
    qoffset_z: 30,
    affine: [
      [-1.5, 0.1, 0, 10],
      [0, 0, 3.0, -20],
      [0.2, -2.0, 0, 30],
      [0, 0, 0, 1],
    ],
  }
  const base = nii2volume(baseHdr, new Uint8Array(4 * 6 * 8), 'aniso_oblique.nii')
  const rasLayout = {
    dimsRAS: [...base.dimsRAS],
    img2RASstart: [...base.img2RASstart],
    img2RASstep: [...base.img2RASstep],
  }
  const overrides = buildRasHdrOverrides(base, rasLayout)
  assert.deepEqual(overrides.dims, [3, base.dimsRAS[1], base.dimsRAS[2], base.dimsRAS[3], 1, 1, 1, 1])
  assert.deepEqual(overrides.pixDims.slice(0, 4), [
    1,
    base.pixDimsRAS[1],
    base.pixDimsRAS[2],
    base.pixDimsRAS[3],
  ])
  assert.equal(overrides.qform_code, 0)
  assert.equal(overrides.sform_code, 1)
  assert.deepEqual(overrides.affine.flat(), Array.from(base.matRAS))

  const serializedHdr = {
    ...base.hdr,
    ...overrides,
    datatypeCode: 2304,
    numBitsPerVoxel: 32,
    scl_slope: 1,
    scl_inter: 0,
  }
  const rgba = new Uint8Array(4 * 6 * 8 * 4)
  const buf = await writeVolume('pve.nii', serializedHdr, rgba.buffer)
  const dv = new DataView(buf)
  const writtenSform = Array.from({ length: 12 }, (_, i) => dv.getFloat32(280 + 4 * i, true))
  for (let i = 0; i < 12; i++) {
    assert.ok(Math.abs(writtenSform[i] - base.matRAS[i]) < 1e-4, `sform[${i}] mismatch`)
  }
  assert.equal(dv.getInt16(252, true), 0)
  assert.equal(dv.getInt16(254, true), 1)
  assert.equal(dv.getFloat32(76, true), 1)
  const writtenPixDims = [dv.getFloat32(80, true), dv.getFloat32(84, true), dv.getFloat32(88, true)]
  assert.deepEqual(writtenPixDims, [base.pixDimsRAS[1], base.pixDimsRAS[2], base.pixDimsRAS[3]])

  // qform-only input must still produce a valid positive sform_code (e.g. for .nvd scenes)
  const qOnlyBase = nii2volume({ ...baseHdr, qform_code: 2, sform_code: 0 }, new Uint8Array(4 * 6 * 8), 'qonly.nii')
  const qOnlyOverrides = buildRasHdrOverrides(qOnlyBase, rasLayout)
  assert.equal(qOnlyOverrides.qform_code, 0)
  assert.equal(qOnlyOverrides.sform_code, 2)
  assert.deepEqual([qOnlyOverrides.qoffset_x, qOnlyOverrides.qoffset_y, qOnlyOverrides.qoffset_z], [0, 0, 0])
})
