/**
 * Pure volumetric label statistics, RAS indexing, and CSV formatting.
 * Works on any native NIfTI input datatype (uint8, int16, float32, etc.) with
 * header slope/intercept scaling and computes exact quartiles + 3D centroids.
 */

/** Map a NiiVue RAS voxel coordinate `[x, y, z]` to a flat storage index. */
export function rasToNativeIndex(vol, vox) {
  if (!vol || !vox || vox.length < 3) return null
  const x = Math.round(vox[0])
  const y = Math.round(vox[1])
  const z = Math.round(vox[2])
  if (vol.dimsRAS && vol.img2RASstart && vol.img2RASstep) {
    const [, nx, ny, nz] = vol.dimsRAS
    if (x < 0 || x >= nx || y < 0 || y >= ny || z < 0 || z >= nz) return null
    const [sx, sy, sz] = vol.img2RASstart
    const [stx, sty, stz] = vol.img2RASstep
    const idx = sx + x * stx + sy + y * sty + sz + z * stz
    const n = vol.img?.length ?? Infinity
    return idx >= 0 && idx < n ? idx : null
  }
  const dims = vol.hdr?.dims
  if (!dims) return null
  const [, nx, ny, nz] = dims
  if (x < 0 || x >= nx || y < 0 || y >= ny || z < 0 || z >= nz) return null
  return x + y * nx + z * nx * ny
}

/**
 * Compute per-label volume, exact intensity quantiles (min/Q1/median/Q3/max),
 * mean, stdev, and 3D storage-voxel centroid.
 */
export function computeLabelStats(
  imgArr,
  labelArr,
  { voxelVolMm3 = 1, dims = null, slope = 1, inter = 0, labelNames = null } = {},
) {
  const n = labelArr.length
  const sSlope = Number.isFinite(slope) && slope !== 0 ? slope : 1
  const sInter = Number.isFinite(inter) ? inter : 0

  const count = new Uint32Array(256)
  const sumX = new Float64Array(256)
  const sumY = new Float64Array(256)
  const sumZ = new Float64Array(256)

  const hasDims = Boolean(dims && dims[0] * dims[1] * dims[2] === n)
  if (hasDims) {
    const [nx, ny, nz] = dims
    let i = 0
    for (let z = 0; z < nz; z++) {
      for (let y = 0; y < ny; y++) {
        for (let x = 0; x < nx; x++, i++) {
          const lbl = labelArr[i]
          if (lbl === 0 || lbl >= 256) continue
          count[lbl]++
          sumX[lbl] += x
          sumY[lbl] += y
          sumZ[lbl] += z
        }
      }
    }
  } else {
    for (let i = 0; i < n; i++) {
      const lbl = labelArr[i]
      if (lbl === 0 || lbl >= 256) continue
      count[lbl]++
    }
  }

  const start = new Uint32Array(257)
  for (let lbl = 0; lbl < 256; lbl++) {
    start[lbl + 1] = start[lbl] + count[lbl]
  }
  const values = new Float32Array(start[256])
  const next = start.slice(0, 256)
  for (let i = 0; i < n; i++) {
    const lbl = labelArr[i]
    if (lbl === 0 || lbl >= 256) continue
    values[next[lbl]++] = imgArr[i] * sSlope + sInter
  }

  const rows = []
  for (let lbl = 1; lbl < 256; lbl++) {
    const c = count[lbl]
    if (!c) continue
    const slice = values.subarray(start[lbl], start[lbl + 1]).sort()
    let sum = 0
    let sumSq = 0
    for (let k = 0; k < c; k++) {
      const v = slice[k]
      sum += v
      sumSq += v * v
    }
    const mean = sum / c
    const variance = Math.max(0, sumSq / c - mean * mean)
    const q = (p) => slice[Math.max(0, Math.min(c - 1, Math.ceil(p * c) - 1))]
    rows.push({
      label: lbl,
      name: labelNames && labelNames[lbl] != null ? labelNames[lbl] : `label_${lbl}`,
      voxels: c,
      volume_mm3: c * voxelVolMm3,
      min: slice[0],
      max: slice[c - 1],
      q1: q(0.25),
      median: q(0.5),
      q3: q(0.75),
      mean,
      stdev: Math.sqrt(variance),
      centroidVox: hasDims ? [sumX[lbl] / c, sumY[lbl] / c, sumZ[lbl] / c] : null,
    })
  }
  return rows
}

export function fmtCm3(mm3) {
  const v = mm3 / 1000
  return v >= 10 ? Math.round(v).toLocaleString() : v.toFixed(1)
}

export function fmtStatVal(x) {
  if (!Number.isFinite(x)) return '0'
  if (Math.abs(x - Math.round(x)) < 1e-4) return String(Math.round(x))
  return Math.abs(x) >= 100 ? x.toFixed(1) : x.toFixed(2)
}

export function buildStatsCsv(rows, fsLut = null) {
  const header = fsLut
    ? ['label', 'fs_label', 'name', 'voxels', 'volume_mm3', 'min', 'max', 'q1', 'median', 'q3', 'mean', 'stdev']
    : ['label', 'name', 'voxels', 'volume_mm3', 'min', 'max', 'q1', 'median', 'q3', 'mean', 'stdev']
  const fmt = (x) => (Number.isInteger(x) ? String(x) : Number(x.toFixed(6)))
  const esc = (s) => (/[",\n]/.test(String(s)) ? `"${String(s).replace(/"/g, '""')}"` : String(s))
  const lines = [header.join(',')]
  for (const r of rows) {
    const cols = fsLut
      ? [r.label, r.label < fsLut.length ? fsLut[r.label] : r.label, esc(r.name)]
      : [r.label, esc(r.name)]
    cols.push(
      r.voxels,
      fmt(r.volume_mm3),
      fmt(r.min),
      fmt(r.max),
      fmt(r.q1),
      fmt(r.median),
      fmt(r.q3),
      fmt(r.mean),
      fmt(r.stdev),
    )
    lines.push(cols.join(','))
  }
  return lines.join('\n') + '\n'
}

/**
 * Compute per-label voxel counts for label LUT tooltips (0..255).
 */
export function getLabelHistogramU8(arr) {
  const hist = new Uint32Array(256)
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i]
    if (v >= 0 && v < 256) hist[v]++
  }
  return hist
}
