/**
 * Lazy I/O helpers:
 *   - Uncompressed NIfTI-1 decoder for @brainchop/core ArrayBuffer results
 *   - NIfTI header shape sniffer for DICOM multi-series picker
 *   - Lazy @niivue/nv-ext-dcm2niix DICOM conversion (loaded only on DICOM drop)
 *   - Lazy @niivue/niimath conformed export (loaded only when Save -> Conformed is clicked)
 *   - Browser file download + NiiVue writeVolume wrapper
 */

import { writeVolume } from '@niivue/niivue'

export const NIFTI_RE = /\.nii(\.gz)?$/i

export function downloadBlob(data, filename, mime = 'application/octet-stream') {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function serializeVolumeToBytes(hdr, img, filename = 'output.nii.gz') {
  const buf =
    img.buffer.byteLength === img.byteLength
      ? img.buffer
      : img.buffer.slice(img.byteOffset, img.byteOffset + img.byteLength)
  return writeVolume(filename, hdr, buf)
}

export async function downloadVolume(hdr, img, filename) {
  const bytes = await serializeVolumeToBytes(hdr, img, filename)
  downloadBlob(bytes, filename)
}

/**
 * Parse an uncompressed little-endian NIfTI-1 ArrayBuffer (as emitted by
 * @brainchop/core when `gzipOutput: false`) into typed voxels + header fields.
 */
export function parseUncompressedNifti1(arrayBuffer) {
  const bytes = arrayBuffer instanceof Uint8Array ? arrayBuffer : new Uint8Array(arrayBuffer)
  if (bytes.byteLength < 352) {
    throw new Error(`Invalid NIfTI-1 buffer (too short: ${bytes.byteLength} bytes)`)
  }
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const sizeofHdr = dv.getInt32(0, true)
  if (sizeofHdr !== 348) {
    throw new Error(`Expected little-endian NIfTI-1 header (sizeof_hdr=348), got ${sizeofHdr}`)
  }
  const dims = [
    dv.getInt16(40, true),
    dv.getInt16(42, true),
    dv.getInt16(44, true),
    dv.getInt16(46, true),
  ]
  const datatype = dv.getInt16(70, true)
  const bitpix = dv.getInt16(72, true)
  const pixDims = [
    dv.getFloat32(76, true),
    dv.getFloat32(80, true),
    dv.getFloat32(84, true),
    dv.getFloat32(88, true),
  ]
  const voxOffset = Math.max(352, Math.round(dv.getFloat32(108, true)))
  const rawSlope = dv.getFloat32(112, true)
  const rawInter = dv.getFloat32(116, true)
  const scl_slope = Number.isFinite(rawSlope) && rawSlope !== 0 ? rawSlope : 1
  const scl_inter = Number.isFinite(rawInter) ? rawInter : 0
  const nvox = dims[1] * dims[2] * dims[3]

  const body = bytes.subarray(voxOffset)
  let img
  if (datatype === 2) {
    img = new Uint8Array(body.buffer, body.byteOffset, nvox)
  } else if (datatype === 4) {
    const aligned = body.byteOffset % 2 === 0 ? body : Uint8Array.from(body)
    img = new Int16Array(aligned.buffer, aligned.byteOffset, nvox)
  } else if (datatype === 512) {
    const aligned = body.byteOffset % 2 === 0 ? body : Uint8Array.from(body)
    img = new Uint16Array(aligned.buffer, aligned.byteOffset, nvox)
  } else if (datatype === 8) {
    const aligned = body.byteOffset % 4 === 0 ? body : Uint8Array.from(body)
    img = new Int32Array(aligned.buffer, aligned.byteOffset, nvox)
  } else if (datatype === 16) {
    const aligned = body.byteOffset % 4 === 0 ? body : Uint8Array.from(body)
    img = new Float32Array(aligned.buffer, aligned.byteOffset, nvox)
  } else if (datatype === 64) {
    const aligned = body.byteOffset % 8 === 0 ? body : Uint8Array.from(body)
    img = new Float64Array(aligned.buffer, aligned.byteOffset, nvox)
  } else {
    throw new Error(`Unsupported NIfTI-1 datatype code: ${datatype}`)
  }

  return {
    hdr: { dims, pixDims, datatypeCode: datatype, numBitsPerVoxel: bitpix, scl_slope, scl_inter },
    img,
  }
}

/**
 * Sniff NIfTI-1 dimensions and voxel size from the first stream chunk of a File
 * (works on both `.nii` and `.nii.gz`) for the DICOM multi-series picker.
 */
export async function niftiShape(file) {
  try {
    let stream = file.stream()
    if (/\.gz$/i.test(file.name)) stream = stream.pipeThrough(new DecompressionStream('gzip'))
    const reader = stream.getReader()
    const chunks = []
    let total = 0
    while (total < 348) {
      const { value, done } = await reader.read()
      if (done || !value) break
      chunks.push(value)
      total += value.byteLength
    }
    void reader.cancel()
    if (total < 348) return { dims: [] }
    const buf = new Uint8Array(total)
    let off = 0
    for (const c of chunks) {
      buf.set(c, off)
      off += c.byteLength
    }
    const header = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
    if (header.getInt32(0, true) !== 348) return { dims: [] }
    const ndim = Math.min(7, Math.max(0, header.getInt16(40, true)))
    const dims = Array.from({ length: ndim }, (_, i) => header.getInt16(42 + 2 * i, true))
    return { dims, mm: header.getFloat32(80, true) }
  } catch {
    return { dims: [] }
  }
}

/**
 * Label converted DICOM / dropped NIfTI images using optional BIDS JSON sidecars
 * and NIfTI header geometry, sorted by SeriesNumber.
 */
export async function describeSeries(images, sidecars) {
  const entries = await Promise.all(
    images.map(async (file) => {
      const base = file.name.replace(NIFTI_RE, '')
      const sidecar = sidecars.find((f) => f.name === `${base}.json`)
      const meta = sidecar ? await sidecar.text().then(JSON.parse).catch(() => ({})) : {}
      const suffix = base.match(/_(e\d+(_ph)?|ph)$/)?.[1]
      const { dims, mm } = NIFTI_RE.test(file.name) ? await niftiShape(file) : { dims: [] }
      const volumes = dims[3] > 1 ? dims[3] : 1
      const voxels = volumes === 1 && dims.length >= 3 ? dims[0] * dims[1] * dims[2] : 0
      const label = [meta.SeriesNumber, meta.SeriesDescription ?? base, suffix]
        .filter((x) => x !== undefined && x !== '')
        .join(' \u00b7 ')
      const detail = dims.length >= 3
        ? `${dims.slice(0, 3).join('\u00d7')} \u00b7 ${Number.isFinite(mm) ? mm.toFixed(1) : '?'} mm${volumes > 1 ? ` \u00b7 ${volumes} volumes` : ''}`
        : ''
      return {
        file,
        number: Number.isFinite(meta.SeriesNumber) ? meta.SeriesNumber : 0,
        voxels,
        label,
        detail,
      }
    }),
  )
  return entries.sort((a, b) => a.number - b.number)
}

/**
 * Synchronously kick off DataTransfer folder traversal via lazy-loaded
 * @niivue/nv-ext-dcm2niix (or plain FileList fallback).
 */
export function readDropItems(dataTransfer) {
  const items = dataTransfer?.items ? Array.from(dataTransfer.items) : []
  const fallbackFiles = dataTransfer?.files ? Array.from(dataTransfer.files) : []
  // Capture FileSystemEntry handles synchronously before the drop event ends.
  const entries = items
    .map((item) => (typeof item.webkitGetAsEntry === 'function' ? item.webkitGetAsEntry() : null))
    .filter(Boolean)

  if (!entries.length) {
    return Promise.resolve(fallbackFiles)
  }

  const walkEntry = (entry) =>
    new Promise((resolve) => {
      if (entry.isFile) {
        entry.file(
          (file) => resolve([file]),
          () => resolve([]),
        )
        return
      }
      if (entry.isDirectory) {
        const reader = entry.createReader()
        const out = []
        const readBatch = () => {
          reader.readEntries(
            async (batch) => {
              if (!batch.length) {
                resolve(out)
                return
              }
              for (const child of batch) {
                out.push(...(await walkEntry(child)))
              }
              readBatch()
            },
            () => resolve(out),
          )
        }
        readBatch()
        return
      }
      resolve([])
    })

  return Promise.all(entries.map(walkEntry)).then((lists) => lists.flat())
}

/**
 * Lazily load @niivue/nv-ext-dcm2niix only when non-NIfTI/DICOM files are dropped.
 */
export async function convertDicomFiles(files) {
  const { runDcm2niix } = await import('@niivue/nv-ext-dcm2niix')
  return runDcm2niix(files, { niftiOnly: false })
}

/**
 * Lazily load @niivue/niimath only when Save -> Conformed space / Conformed input
 * is invoked, disposing the WASM worker immediately afterwards to free heap.
 */
export async function withNiimath(task) {
  const { Niimath } = await import('@niivue/niimath')
  const niimath = new Niimath()
  try {
    await niimath.init()
    return await task(niimath)
  } finally {
    niimath.dispose()
  }
}

export function stripNiftiExt(name = 'volume') {
  const base = String(name).split(/[\\/]/).pop() || 'volume'
  const stripped = base.replace(NIFTI_RE, '').replace(/^_+/, '')
  return stripped || 'volume'
}
