// FreeSurfer ColorLUT (FreeSurferColorLUT.txt) label-ID remapping for NIfTI export.
//
// BrainChop models predict contiguous class indices 0..N-1 for compact storage,
// whereas FreeSurfer's Freeview (`:colormap=lut`) expects standard aparc+aseg /
// FreeSurferColorLUT integer IDs (up to 2035, stored as DT_INT16).

const DK_CORTICAL_OFFSETS = {
  bankssts: 1,
  caudalanteriorcingulate: 2,
  caudalmiddlefrontal: 3,
  cuneus: 5,
  entorhinal: 6,
  fusiform: 7,
  inferiorparietal: 8,
  inferiortemporal: 9,
  isthmuscingulate: 10,
  lateraloccipital: 11,
  lateralorbitofrontal: 12,
  lingual: 13,
  medialorbitofrontal: 14,
  middletemporal: 15,
  parahippocampal: 16,
  paracentral: 17,
  parsopercularis: 18,
  parsorbitalis: 19,
  parstriangularis: 20,
  pericalcarine: 21,
  postcentral: 22,
  posteriorcingulate: 23,
  precentral: 24,
  precuneus: 25,
  rostralanteriorcingulate: 26,
  rostralmiddlefrontal: 27,
  superiorfrontal: 28,
  superiorparietal: 29,
  superiortemporal: 30,
  supramarginal: 31,
  frontalpole: 32,
  temporalpole: 33,
  transversetemporal: 34,
  insula: 35,
}

const BACKGROUND_NAMES = new Set(['BG', 'Unknown', 'background', 'Background'])

const SUBCORTICAL_FS_IDS = {
  // Lateralized (104-class aparc+aseg)
  'Left-Cerebral-White-Matter': 2,
  'Right-Cerebral-White-Matter': 41,
  'Left-Cerebral-Cortex': 3,
  'Right-Cerebral-Cortex': 42,
  'Left-Lateral-Ventricle': 4,
  'Right-Lateral-Ventricle': 43,
  'Left-Inf-Lat-Vent': 5,
  'Right-Inf-Lat-Vent': 44,
  'Left-Cerebellum-White-Matter': 7,
  'Right-Cerebellum-White-Matter': 46,
  'Left-Cerebellum-Cortex': 8,
  'Right-Cerebellum-Cortex': 47,
  'Left-Thalamus': 10,
  'Left-Thalamus-Proper': 10,
  'Left-Thalamus-Proper*': 10,
  'Right-Thalamus': 49,
  'Right-Thalamus-Proper': 49,
  'Right-Thalamus-Proper*': 49,
  'Left-Caudate': 11,
  'Right-Caudate': 50,
  'Left-Putamen': 12,
  'Right-Putamen': 51,
  'Left-Pallidum': 13,
  'Right-Pallidum': 52,
  'Left-Hippocampus': 17,
  'Right-Hippocampus': 53,
  'Left-Amygdala': 18,
  'Right-Amygdala': 54,
  'Left-Accumbens': 26,
  'Left-Accumbens-area': 26,
  'Right-Accumbens': 58,
  'Right-Accumbens-area': 58,
  'Left-VentralDC': 28,
  'Right-VentralDC': 60,

  // Midline
  '3rd-Ventricle': 14,
  '4th-Ventricle': 15,
  'Brain-Stem': 16,
  CSF: 24,
  CC_Posterior: 251,
  CC_Mid_Posterior: 252,
  CC_Central: 253,
  CC_Mid_Anterior: 254,
  CC_Anterior: 255,

  // Bilateral / merged models (18-class MindMap / MindMap-Fast)
  'Cerebral-White-Matter': 2,
  'White Matter': 2,
  'Cerebral-Cortex': 3,
  'Grey Matter': 3,
  'Gray Matter': 3,
  'Lateral-Ventricle': 4,
  Ventricle: 4,
  'Inferior-Lateral-Ventricle': 5,
  'Cerebellum-White-Matter': 7,
  'Cerebellum-Cortex': 8,
  Cerebellum: 8,
  Thalamus: 10,
  'Thalamus-Proper': 10,
  'Thalamus-Proper*': 10,
  Caudate: 11,
  Putamen: 12,
  Pallidum: 13,
  Hippocampus: 17,
  Amygdala: 18,
  'Accumbens-area': 26,
  Accumbens: 26,
  VentralDC: 28,
  'Corpus callosum': 253,
  Corpus_Callosum: 253,
}

export function resolveFreeSurferLabelId(rawName) {
  if (typeof rawName !== 'string') return null
  const name = rawName.trim()
  if (BACKGROUND_NAMES.has(name)) return 0
  if (Object.hasOwn(SUBCORTICAL_FS_IDS, name)) return SUBCORTICAL_FS_IDS[name]
  if (name.startsWith('ctx-lh-')) {
    const off = DK_CORTICAL_OFFSETS[name.slice(7)]
    return off ? 1000 + off : null
  }
  if (name.startsWith('ctx-rh-')) {
    const off = DK_CORTICAL_OFFSETS[name.slice(7)]
    return off ? 2000 + off : null
  }
  if (name.startsWith('ctx-')) {
    const off = DK_CORTICAL_OFFSETS[name.slice(4)]
    return off ? 1000 + off : null
  }
  return null
}

/**
 * Build a contiguous-index -> FreeSurferColorLUT Int16Array lookup table for a
 * parcellation model's colormap `labels` array.
 * Returns `null` for binary masks (< 3 classes) or unrecognized label sets.
 */
export function buildFreeSurferLut(labelNames) {
  if (!Array.isArray(labelNames) || labelNames.length < 3) return null
  const lut = new Int16Array(labelNames.length)
  for (let i = 0; i < labelNames.length; i++) {
    const fsId = resolveFreeSurferLabelId(labelNames[i])
    if (fsId === null || (i === 0 ? fsId !== 0 : fsId <= 0)) return null
    lut[i] = fsId
  }
  return lut
}

/**
 * Remap a contiguous label buffer into a fresh `Int16Array` using `fsLut`,
 * tracking the maximum label value for `cal_max`.
 */
export function remapLabelsToFreeSurfer(srcImg, fsLut) {
  const n = srcImg.length
  const out = new Int16Array(n)
  const lutLen = fsLut.length
  let maxLabel = 0
  for (let i = 0; i < n; i++) {
    const raw = srcImg[i]
    const mapped = raw >= 0 && raw < lutLen ? fsLut[raw] : raw
    out[i] = mapped
    if (mapped > maxLabel) maxLabel = mapped
  }
  return { img: out, maxLabel }
}
