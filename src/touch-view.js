// Touch & view controls: keep pinch gestures outside the canvas from scaling
// the document, and provide one-tap Reset View back to defaults.

const DEFAULT_AZIMUTH = 110
const DEFAULT_ELEVATION = 10

export function resetView(nv) {
  if (nv) {
    nv.pan2Dxyzmm = Float32Array.from([0, 0, 0, 1])
    nv.renderPan = [0, 0]
    nv.azimuth = DEFAULT_AZIMUTH
    nv.elevation = DEFAULT_ELEVATION
    nv.scaleMultiplier = 1

    const base = nv.volumes?.[0]
    if (
      base &&
      Number.isFinite(base.robustMin) &&
      Number.isFinite(base.robustMax) &&
      base.robustMax > base.robustMin &&
      (base.calMin !== base.robustMin || base.calMax !== base.robustMax)
    ) {
      base.calMin = base.robustMin
      base.calMax = base.robustMax
      nv.updateGLVolume()
    }
  }
  unzoomDocument()
}

function unzoomDocument() {
  const meta = document.querySelector('meta[name="viewport"]')
  if (!meta) return
  const original = meta.getAttribute('content') || 'width=device-width, initial-scale=1.0'
  if (/maximum-scale/.test(original)) return
  meta.setAttribute('content', `${original}, maximum-scale=1, user-scalable=no`)
  requestAnimationFrame(() =>
    requestAnimationFrame(() => meta.setAttribute('content', original)),
  )
}

function blockDocumentPinchZoom(canvas) {
  const stop = (e) => e.preventDefault()
  for (const type of ['gesturestart', 'gesturechange', 'gestureend']) {
    document.addEventListener(type, stop, { passive: false })
  }
  document.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length > 1 && e.target !== canvas) e.preventDefault()
    },
    { passive: false },
  )
}

export function installTouchViewControls(nv) {
  blockDocumentPinchZoom(nv?.canvas || null)
  return { resetView: () => resetView(nv) }
}
