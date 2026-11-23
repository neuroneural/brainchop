// Responsive NiiVue layout: marks `body.nv-narrow` on narrow / touch viewports
// and exposes the floating single-plane switcher (All / A / C / S / 3D / ⟲)
// plus the `V` hotkey to cycle views.

import { SLICE_TYPE } from '@niivue/niivue'
import { resetView } from './touch-view.js'

const NARROW_WIDTH_CSS_PX = 720
const COARSE_SHORT_SIDE_CSS_PX = 860

export function isNarrowViewport() {
  const vv = window.visualViewport
  const w = Math.round(vv?.width ?? window.innerWidth ?? 0)
  const h = Math.round(vv?.height ?? window.innerHeight ?? 0)
  if (w > 0 && w <= NARROW_WIDTH_CSS_PX) return true
  const coarse = window.matchMedia?.('(pointer: coarse)')?.matches
  return !!coarse && Math.min(w, h) <= COARSE_SHORT_SIDE_CSS_PX
}

const PANES = [
  { id: 'multi', label: 'All', title: 'All planes', type: SLICE_TYPE.MULTIPLANAR },
  { id: 'axial', label: 'A', title: 'Axial only', type: SLICE_TYPE.AXIAL },
  { id: 'coronal', label: 'C', title: 'Coronal only', type: SLICE_TYPE.CORONAL },
  { id: 'sagittal', label: 'S', title: 'Sagittal only', type: SLICE_TYPE.SAGITTAL },
  { id: 'render', label: '3D', title: '3D render only', type: SLICE_TYPE.RENDER },
]

function setPane(nv, bar, id) {
  const pane = PANES.find((p) => p.id === id) || PANES[0]
  nv.sliceType = pane.type
  bar.querySelectorAll('button[data-pane]').forEach((b) => {
    const active = b.dataset.pane === pane.id
    b.classList.toggle('active', active)
    b.setAttribute('aria-pressed', String(active))
  })
}

function buildSwitcher(nv, container) {
  const bar = document.createElement('div')
  bar.id = 'paneSwitcher'
  bar.className = 'pane-switcher'
  bar.setAttribute('role', 'group')
  bar.setAttribute('aria-label', 'Visible planes')

  for (const pane of PANES) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.dataset.pane = pane.id
    btn.textContent = pane.label
    btn.title = pane.title
    btn.setAttribute('aria-label', pane.title)
    btn.setAttribute('aria-pressed', pane.id === 'multi' ? 'true' : 'false')
    btn.addEventListener('click', () => setPane(nv, bar, pane.id))
    bar.appendChild(btn)
  }

  const reset = document.createElement('button')
  reset.type = 'button'
  reset.className = 'pane-reset'
  reset.textContent = '\u27F2'
  reset.title = 'Reset zoom and pan'
  reset.setAttribute('aria-label', 'Reset zoom and pan')
  reset.addEventListener('click', () => resetView(nv))
  bar.appendChild(reset)

  container.appendChild(bar)
  return bar
}

export function installResponsiveLayout(nv) {
  const container = document.getElementById('canvas-container') || document.body
  const bar = buildSwitcher(nv, container)
  bar.querySelector('button[data-pane="multi"]').classList.add('active')

  window.addEventListener(
    'keydown',
    (e) => {
      if (e.key !== 'v' && e.key !== 'V') return
      if (e.altKey || e.ctrlKey || e.metaKey || e.repeat) return
      if (document.querySelector('dialog[open]')) return
      const target = e.target
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
      ) {
        return
      }
      e.preventDefault()
      e.stopImmediatePropagation()
      const index = PANES.findIndex((pane) => pane.type === nv.sliceType)
      setPane(nv, bar, PANES[(index + 1) % PANES.length].id)
    },
    true,
  )

  const refresh = () => document.body.classList.toggle('nv-narrow', isNarrowViewport())
  window.addEventListener('resize', refresh)
  window.addEventListener('orientationchange', refresh)
  window.visualViewport?.addEventListener('resize', refresh)
  refresh()
}
