/**
 * Model menu definitions mapped onto @brainchop/core's four canonical models
 * (mindgrab, mindmap, mindsnap, mindmap-fast) plus continuous tissue fractions (PVE).
 *
 * Icon notation (matching BrainChop conventions):
 *   🪓  robust models
 *   ⚡  fast lightweight model
 *   🔪  sharp high-detail cortical parcellation models
 */

export const MODEL_MENU = [
  {
    id: 'mindgrab',
    coreModel: 'mindgrab',
    kind: 'mask',
    label: '\u{1FA93}\u{1F9E0} Omnimodal Skull Stripping',
    shortLabel: 'mindgrab',
    description:
      'Omnimodal skull stripping (mindgrab) delivering brain extraction across T1, T2, FLAIR, DWI, EPI, MRA, PDw, qT1, CT, and PET.',
    underlayOpacity: 0,
  },
  {
    id: 'mindmap',
    coreModel: 'mindmap',
    kind: 'labels',
    label: '\u{1FA93} Subcortical + Tissue',
    shortLabel: 'mindmap',
    description:
      'Primary T1w cortical and subcortical brain parcellation (18 classes, mindmap).',
  },
  {
    id: 'pve',
    coreModel: 'mindmap',
    kind: 'tissues',
    label: '\u2154\u{1F9E0} Tissue fraction maps (GM/WM/CSF)',
    shortLabel: 'Tissue PVE',
    description:
      'Continuous GM, WM, and CSF partial-volume tissue fraction maps (experimental).',
    underlayOpacity: 0.1,
    probabilityDisplayMin: 0.03,
    probabilityOverlayFloor: 128,
    probabilityOverlayAlpha: 48,
    probabilityTissues: [
      { name: 'gm', displayName: 'Gray Matter', tint: [255, 64, 64] },
      { name: 'wm', displayName: 'White Matter', tint: [255, 255, 255] },
      { name: 'csf', displayName: 'CSF', tint: [64, 128, 255] },
    ],
  },
  {
    id: 'mindsnap',
    coreModel: 'mindsnap',
    kind: 'labels',
    label: '\u{1FA93}\u{1F52A} Desikan-Killiany Atlas',
    shortLabel: 'mindsnap',
    description:
      'Desikan-Killiany cortical, subcortical, and 5-part corpus callosum parcellation (104 classes, mindsnap).',
  },
  {
    id: 'divider',
    kind: 'divider',
    label: '-----------------',
  },
  {
    id: 'mindmap-fast',
    coreModel: 'mindmap-fast',
    kind: 'labels',
    label: '\u26A1\u{1FA93} Subcortical + Tissue (fast)',
    shortLabel: 'mindmap-fast',
    description:
      'Fast lightweight cortical and subcortical brain parcellation (18 classes, mindmap-fast).',
  },
]

const VALID_BACKENDS = new Set(['auto', 'webgpu', 'webgl2', 'cpu'])
const VALID_WEBGPU_MODES = new Set(['auto', 'standard', 'low-memory', 'recalibrate'])
const VALID_VIEWERS = new Set(['webgl2', 'webgpu'])

const MODEL_ALIASES = {
  '16chan18cls': 'mindmap-fast',
  'mindmap-18': 'mindmap',
  'mindsnap-104': 'mindsnap',
  'cat-lite': 'pve',
  tissues: 'pve',
}

export function findModelEntry(idOrAlias) {
  if (!idOrAlias) return null
  const raw = String(idOrAlias).trim()
  const key = MODEL_ALIASES[raw.toLowerCase()] || raw.toLowerCase()
  const byId = MODEL_MENU.find((m) => m.kind !== 'divider' && m.id === key)
  if (byId) return byId
  // Support numeric index (?model=0..5) for quick deep-linking
  if (/^\d+$/.test(raw)) {
    const entry = MODEL_MENU[Number(raw)]
    if (entry && entry.kind !== 'divider') return entry
  }
  return null
}

/**
 * Parse power-user URL query overrides without cluttering the toolbar UI.
 *
 * Supported flags:
 *   ?model=mindgrab|mindmap|pve|mindsnap|mindmap-fast
 *   ?backend=auto|webgpu|webgl2|cpu   (alias: ?inference=...)
 *   ?webgpuMode=auto|standard|low-memory|recalibrate
 *   ?viewer=webgl2|webgpu
 *   ?ct=1
 *   ?comply=1
 *   ?border=<mm>         (MindGrab mask dilation in mm)
 *   ?legacyCleanup=1     (label models only)
 */
export function parseUrlOptions(search = '') {
  const params = new URLSearchParams(search)
  const flag = (name) => {
    const v = params.get(name)
    return v === '1' || v === 'true' || v === 'yes'
  }

  const rawBackend = (params.get('backend') || params.get('inference') || 'auto').toLowerCase()
  const backend = VALID_BACKENDS.has(rawBackend) ? rawBackend : 'auto'

  const rawMode = (params.get('webgpuMode') || params.get('webgpu') || 'auto').toLowerCase()
  const webgpuMode = VALID_WEBGPU_MODES.has(rawMode) ? rawMode : 'auto'

  const rawViewer = (params.get('viewer') || 'webgl2').toLowerCase()
  const viewer = VALID_VIEWERS.has(rawViewer) ? rawViewer : 'webgl2'

  const borderRaw = params.get('border') ?? params.get('borderMm')
  let borderMm
  if (borderRaw !== null && borderRaw !== '') {
    const parsed = Number(borderRaw)
    if (Number.isFinite(parsed) && parsed >= 0) borderMm = parsed
  }

  return {
    model: params.get('model') || null,
    backend,
    webgpuMode,
    viewer,
    ct: flag('ct'),
    comply: flag('comply'),
    borderMm,
    legacyCleanup: flag('legacyCleanup'),
  }
}
