// Single-RGBA32 display compositor and partial-volume statistics for continuous PVE
// continuous tissue fraction maps ([GM, WM, CSF]) produced by @brainchop/core's
// `segmentTissues()`.
//
// Replacing 3 separate overlays with a single DT_RGBA32 overlay cuts VRAM by 3x
// and lets NiiVue reuse one RGBA8 3D texture in place while keeping the 3
// pristine Float32 fraction maps in JS for Save, Stats, and Alt-click isolation.

const DEFAULT_TISSUES = [
  { name: 'gm', displayName: 'Gray Matter', tint: [255, 64, 64] },
  { name: 'wm', displayName: 'White Matter', tint: [255, 255, 255] },
  { name: 'csf', displayName: 'CSF', tint: [64, 128, 255] },
]

const DISPLAY_NAMES = {
  gm: 'Gray Matter',
  wm: 'White Matter',
  csf: 'CSF',
}

export function resolveCatLiteTissues(modelEntry) {
  const src =
    Array.isArray(modelEntry?.probabilityTissues) && modelEntry.probabilityTissues.length === 3
      ? modelEntry.probabilityTissues
      : DEFAULT_TISSUES
  return src.map((t, idx) => {
    const key = String(t?.name || DEFAULT_TISSUES[idx].name).toLowerCase()
    return {
      index: idx,
      name: key,
      displayName: t?.displayName || DISPLAY_NAMES[key] || key.toUpperCase(),
      tint: Array.isArray(t?.tint) && t.tint.length >= 3 ? t.tint : DEFAULT_TISSUES[idx].tint,
    }
  })
}

/**
 * Decode a @brainchop/core tissue volume (uint8 with scl_slope=1/255 or float32)
 * into a Float32Array of fractions in [0, 1].
 */
export function decodeTissueVolumeToFloat32(vol) {
  const src = vol.img
  const slope = Number.isFinite(vol.hdr?.scl_slope) && vol.hdr.scl_slope !== 0 ? vol.hdr.scl_slope : 1
  const inter = Number.isFinite(vol.hdr?.scl_inter) ? vol.hdr.scl_inter : 0
  const out = new Float32Array(src.length)
  if (slope === 1 && inter === 0 && src instanceof Float32Array) {
    out.set(src)
    return out
  }
  for (let i = 0; i < src.length; i++) {
    let v = src[i] * slope + inter
    if (!(v > 0)) v = 0
    else if (v > 1) v = 1
    out[i] = v
  }
  return out
}

/**
 * Composite [GM, WM, CSF] Float32 probability maps into a single DT_RGBA32
 * Uint8Array. When `rasLayout` is supplied, writes directly in NiiVue's RAS
 * texture layout so NiiVue passes the buffer straight to texSubImage3D.
 */
export function buildCatLiteRgbaComposite(
  maps,
  modelEntry,
  isolatedIndex = null,
  opacity = 1,
  rasLayout = null,
) {
  const [gm, wm, csf] = maps
  const n = gm.length
  const minProb = modelEntry?.probabilityDisplayMin ?? 0.03
  const invSpan = 1 / Math.max(1e-6, 1 - minProb)
  const floorFrac = (modelEntry?.probabilityOverlayFloor ?? 128) / 255
  const hiFrac = 1 - floorFrac
  const tissues = resolveCatLiteTissues(modelEntry)

  const [r0, g0, b0] = tissues[0].tint
  const [r1, g1, b1] = tissues[1].tint
  const [r2, g2, b2] = tissues[2].tint

  const use0 = isolatedIndex === null || isolatedIndex === 0
  const use1 = isolatedIndex === null || isolatedIndex === 1
  const use2 = isolatedIndex === null || isolatedIndex === 2

  const op = Math.max(0, Math.min(1, Number(opacity) || 0))
  const opScale = Math.round(op * 256)

  const hasRasReorient = Boolean(
    rasLayout &&
      rasLayout.dimsRAS &&
      rasLayout.img2RASstart &&
      rasLayout.img2RASstep &&
      rasLayout.dimsRAS[1] * rasLayout.dimsRAS[2] * rasLayout.dimsRAS[3] === n,
  )

  const rgba = new Uint8Array(n * 4)
  let activeCount = 0
  for (let i = 0; i < n; i++) {
    const p0 = use0 ? gm[i] : 0
    const p1 = use1 ? wm[i] : 0
    const p2 = use2 ? csf[i] : 0
    if (p0 >= minProb || p1 >= minProb || p2 >= minProb) {
      activeCount++
    }
  }

  const activeAlphaOffsets = new Uint32Array(activeCount)
  const activeBaseAlpha = new Uint8Array(activeCount)
  let k = 0
  const MIN_TXL = 2 / 256

  const writeVoxel = (srcIdx, dstIdx) => {
    const p0 = use0 ? gm[srcIdx] : 0
    const p1 = use1 ? wm[srcIdx] : 0
    const p2 = use2 ? csf[srcIdx] : 0
    if (p0 < minProb && p1 < minProb && p2 < minProb) return

    let accR = 0
    let accG = 0
    let accB = 0
    let maxW = 0

    if (p0 >= minProb) {
      const p = p0 > 1 ? 1 : p0
      const w = (p - minProb) * invSpan
      const txl = p > MIN_TXL ? p : MIN_TXL
      const ramp = (floorFrac + hiFrac * txl) * w
      accR += r0 * ramp
      accG += g0 * ramp
      accB += b0 * ramp
      if (w > maxW) maxW = w
    }
    if (p1 >= minProb) {
      const p = p1 > 1 ? 1 : p1
      const w = (p - minProb) * invSpan
      const txl = p > MIN_TXL ? p : MIN_TXL
      const ramp = (floorFrac + hiFrac * txl) * w
      accR += r1 * ramp
      accG += g1 * ramp
      accB += b1 * ramp
      if (w > maxW) maxW = w
    }
    if (p2 >= minProb) {
      const p = p2 > 1 ? 1 : p2
      const w = (p - minProb) * invSpan
      const txl = p > MIN_TXL ? p : MIN_TXL
      const ramp = (floorFrac + hiFrac * txl) * w
      accR += r2 * ramp
      accG += g2 * ramp
      accB += b2 * ramp
      if (w > maxW) maxW = w
    }

    if (maxW <= 0) return
    const invNorm = 1 / maxW
    const r = accR * invNorm
    const g = accG * invNorm
    const b = accB * invNorm
    const baseA = Math.min(255, Math.round(maxW * 255))

    const off = dstIdx * 4
    rgba[off] = r >= 255 ? 255 : Math.round(r)
    rgba[off + 1] = g >= 255 ? 255 : Math.round(g)
    rgba[off + 2] = b >= 255 ? 255 : Math.round(b)
    rgba[off + 3] = (baseA * opScale + 128) >> 8

    activeAlphaOffsets[k] = off + 3
    activeBaseAlpha[k] = baseA
    k++
  }

  if (hasRasReorient) {
    const [, nxR, nyR, nzR] = rasLayout.dimsRAS
    const [sx, sy, sz] = rasLayout.img2RASstart
    const [stx, sty, stz] = rasLayout.img2RASstep
    const baseStart = sx + sy + sz
    let dstIdx = 0
    for (let rz = 0; rz < nzR; rz++) {
      const zOff = baseStart + rz * stz
      for (let ry = 0; ry < nyR; ry++) {
        let srcIdx = zOff + ry * sty
        for (let rx = 0; rx < nxR; rx++, dstIdx++, srcIdx += stx) {
          writeVoxel(srcIdx, dstIdx)
        }
      }
    }
  } else {
    for (let i = 0; i < n; i++) {
      writeVoxel(i, i)
    }
  }

  return {
    rgba,
    activeAlphaOffsets: k === activeCount ? activeAlphaOffsets : activeAlphaOffsets.subarray(0, k),
    activeBaseAlpha: k === activeCount ? activeBaseAlpha : activeBaseAlpha.subarray(0, k),
    tissues,
    isRasOrdered: hasRasReorient,
  }
}

/**
 * Build NIfTI header overrides for an overlay buffer already reoriented into
 * NiiVue's RAS voxel order. NiiVue stores `matRAS` in row-major order (matching
 * `hdr.affine.flat()`), so rows are sliced as `[0..3]..[12..15]` rather than
 * transposed, `pixDims` is updated to `pixDimsRAS` (with right-handed `qfac=1`),
 * the native `qform` is cleared, and `sform_code` is ensured positive so both
 * `.nii` exports and `.nvd` scenes carry a consistent RAS transform.
 */
export function buildRasHdrOverrides(base, rasLayout) {
  if (!rasLayout?.dimsRAS) return {}
  const overrides = {
    dims: [3, rasLayout.dimsRAS[1], rasLayout.dimsRAS[2], rasLayout.dimsRAS[3], 1, 1, 1, 1],
  }
  if (base?.pixDimsRAS && base.pixDimsRAS.length >= 4) {
    const pixDims = base.hdr?.pixDims ? [...base.hdr.pixDims] : [1, 1, 1, 1, 0, 0, 0, 0]
    pixDims[0] = 1
    pixDims[1] = base.pixDimsRAS[1]
    pixDims[2] = base.pixDimsRAS[2]
    pixDims[3] = base.pixDimsRAS[3]
    overrides.pixDims = pixDims
  }
  const m = base?.matRAS
  if (m && m.length >= 16) {
    overrides.affine = [
      [m[0], m[1], m[2], m[3]],
      [m[4], m[5], m[6], m[7]],
      [m[8], m[9], m[10], m[11]],
      [m[12], m[13], m[14], m[15]],
    ]
    const sformCode = base.hdr?.sform_code > 0 ? base.hdr.sform_code : 0
    const qformCode = base.hdr?.qform_code > 0 ? base.hdr.qform_code : 0
    overrides.sform_code = Math.max(sformCode, qformCode, 1)
    overrides.qform_code = 0
    overrides.quatern_b = 0
    overrides.quatern_c = 0
    overrides.quatern_d = 0
    overrides.qoffset_x = 0
    overrides.qoffset_y = 0
    overrides.qoffset_z = 0
  }
  return overrides
}

/**
 * Fast (~1.5 ms) in-place alpha update when the overlay opacity slider drags.
 */
export function updateCatLiteRgbaOpacity(rgba, activeAlphaOffsets, activeBaseAlpha, opacity) {
  const op = Math.max(0, Math.min(1, Number(opacity) || 0))
  const opScale = Math.round(op * 256)
  const len = activeAlphaOffsets.length
  for (let k = 0; k < len; k++) {
    rgba[activeAlphaOffsets[k]] = (activeBaseAlpha[k] * opScale + 128) >> 8
  }
}

/**
 * Compute continuous partial-volume statistics for [GM, WM, CSF]:
 *   - volume_mm3 = (Sum p_t) * voxelVolMm3
 *   - % of ICV = volume_mm3 / (GM + WM + CSF)
 *   - probability-weighted calibrated intensity mean & SD
 *   - min/max over dominant tissue voxels (p_t >= 0.5, fallback p_t > minProb)
 *   - probability-weighted 3D storage-voxel centroid for Click-to-Jump Locate
 */
export function computeCatLiteStats(
  imgArr,
  maps,
  voxelVolMm3,
  dims,
  modelEntry,
  { slope = 1, inter = 0 } = {},
) {
  const tissues = resolveCatLiteTissues(modelEntry)
  const minProb = modelEntry?.probabilityDisplayMin ?? 0.03
  const sSlope = Number.isFinite(slope) && slope !== 0 ? slope : 1
  const sInter = Number.isFinite(inter) ? inter : 0
  const [nx, ny, nz] = dims
  const [gm, wm, csf] = maps

  const acc = tissues.map(() => ({
    fracSum: 0,
    supportVoxels: 0,
    wSum: 0,
    wSumSq: 0,
    sumX: 0,
    sumY: 0,
    sumZ: 0,
    coreMin: Infinity,
    coreMax: -Infinity,
    anyMin: Infinity,
    anyMax: -Infinity,
  }))

  let i = 0
  for (let z = 0; z < nz; z++) {
    for (let y = 0; y < ny; y++) {
      for (let x = 0; x < nx; x++, i++) {
        const p0 = gm[i]
        const p1 = wm[i]
        const p2 = csf[i]
        if (p0 <= 0 && p1 <= 0 && p2 <= 0) continue
        const v = imgArr[i] * sSlope + sInter
        const probs = [p0, p1, p2]
        for (let t = 0; t < 3; t++) {
          const p = probs[t]
          if (p > 0 && Number.isFinite(p)) {
            const s = acc[t]
            s.fracSum += p
            if (p >= minProb) s.supportVoxels++
            s.wSum += p * v
            s.wSumSq += p * v * v
            s.sumX += p * x
            s.sumY += p * y
            s.sumZ += p * z
            if (v < s.anyMin) s.anyMin = v
            if (v > s.anyMax) s.anyMax = v
            if (p >= 0.5) {
              if (v < s.coreMin) s.coreMin = v
              if (v > s.coreMax) s.coreMax = v
            }
          }
        }
      }
    }
  }

  const rows = []
  for (let t = 0; t < 3; t++) {
    const s = acc[t]
    if (s.fracSum <= 0) continue
    const mean = s.wSum / s.fracSum
    const variance = Math.max(0, s.wSumSq / s.fracSum - mean * mean)
    const min = Number.isFinite(s.coreMin) ? s.coreMin : Number.isFinite(s.anyMin) ? s.anyMin : 0
    const max = Number.isFinite(s.coreMax) ? s.coreMax : Number.isFinite(s.anyMax) ? s.anyMax : 0
    const [r, g, b] = tissues[t].tint
    rows.push({
      label: t,
      tissueIndex: t,
      tissueKey: tissues[t].name,
      name: tissues[t].displayName,
      voxels: Math.round(s.fracSum),
      effectiveVoxels: s.fracSum,
      supportVoxels: s.supportVoxels,
      volume_mm3: s.fracSum * voxelVolMm3,
      mean,
      stdev: Math.sqrt(variance),
      min,
      max,
      centroidVox: [s.sumX / s.fracSum, s.sumY / s.fracSum, s.sumZ / s.fracSum],
      colorCss: `rgb(${r},${g},${b})`,
      tint: tissues[t].tint,
    })
  }

  const icvMm3 = rows.reduce((sum, r) => sum + r.volume_mm3, 0)
  return { rows, icvMm3 }
}

export function buildCatLiteStatsCsv(rows, icvMm3) {
  const header = [
    'tissue',
    'name',
    'volume_mm3',
    'volume_cm3',
    'pct_icv',
    'effective_voxels',
    'support_voxels',
    'weighted_mean',
    'weighted_stdev',
    'min',
    'max',
  ]
  const esc = (s) => (/[",\n]/.test(String(s)) ? `"${String(s).replace(/"/g, '""')}"` : String(s))
  const lines = [header.join(',')]
  for (const r of rows) {
    const pct = icvMm3 > 0 ? (r.volume_mm3 / icvMm3) * 100 : 0
    lines.push(
      [
        esc(r.tissueKey),
        esc(r.name),
        r.volume_mm3.toFixed(3),
        (r.volume_mm3 / 1000).toFixed(3),
        pct.toFixed(3),
        r.effectiveVoxels.toFixed(3),
        r.supportVoxels,
        r.mean.toFixed(4),
        r.stdev.toFixed(4),
        Number(r.min.toFixed(4)),
        Number(r.max.toFixed(4)),
      ].join(','),
    )
  }
  return lines.join('\n') + '\n'
}
