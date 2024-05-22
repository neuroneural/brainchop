import { Niivue } from '@niivue/niivue'
import { runInference } from './brainchop-mainthread.js'
import { inferenceModelsList, brainChopOpts } from './brainchop-parameters.js'
import { isChrome, localSystemDetails } from './brainchop-diagnostics.js'
import MyWorker from './brainchop-webworker.js?worker'

async function main() {
  dragMode.onchange = async function () {
    nv1.opts.dragMode = this.selectedIndex
  }
  drawDrop.onchange = async function () {
    if (nv1.volumes.length < 2) {
      window.alert('No segmentation open (use the Segmentation pull down)')
      drawDrop.selectedIndex = -1
      return
    }
    if (!nv1.drawBitmap) {
      window.alert('No drawing (hint: use the Draw pull down to select a pen)')
      drawDrop.selectedIndex = -1
      return
    }
    const mode = parseInt(this.value)
    if (mode === 0) {
      nv1.drawUndo()
      drawDrop.selectedIndex = -1
      return
    }
    let img = nv1.volumes[1].img
    let draw = await nv1.saveImage({ filename: "", isSaveDrawing: true })
    const niiHdrBytes = 352
    const nvox = draw.length
    if (mode === 1) {//append
      for (let i = 0; i < nvox; i++)
        if (draw[niiHdrBytes+i] > 0)
          img[i] = 1
    }
    if (mode === 2) {//delete
      for (let i = 0; i < nvox; i++)
        if (draw[niiHdrBytes+i] > 0)
          img[i] = 0
    }
    nv1.closeDrawing()
    nv1.updateGLVolume()
    nv1.setDrawingEnabled(false)
    penDrop.selectedIndex = -1
    drawDrop.selectedIndex = -1
  }
  penDrop.onchange = async function () {
    const mode = parseInt(this.value)
    nv1.setDrawingEnabled(mode >= 0)
    if (mode >= 0) nv1.setPenValue(mode & 7, mode > 7)
  }
  aboutBtn.onclick = function () {
    window.alert('Drag and drop NIfTI images. Use pulldown menu to choose brainchop model')
  }
  diagnosticsBtn.onclick = function () {
    if (diagnosticsString.length < 1) {
      window.alert('No diagnostic string generated: run a model to create diagnostics')
      return
    }
    navigator.clipboard.writeText(diagnosticsString)
    window.alert('Diagnostics copied to clipboard\n' + diagnosticsString)
  }
  opacitySlider0.oninput = function () {
    nv1.setOpacity(0, opacitySlider0.value / 255)
    nv1.updateGLVolume()
  }
  opacitySlider1.oninput = function () {
    nv1.setOpacity(1, opacitySlider1.value / 255)
  }
  async function ensureConformed() {
    const nii = nv1.volumes[0]
    let isConformed = nii.dims[1] === 256 && nii.dims[2] === 256 && nii.dims[3] === 256
    if (nii.permRAS[0] !== -1 || nii.permRAS[1] !== 3 || nii.permRAS[2] !== -2) {
      isConformed = false
    }
    if (isConformed) {
      return
    }
    const nii2 = await nv1.conform(nii, false)
    await nv1.removeVolume(nv1.volumes[0])
    await nv1.addVolume(nii2)
  }
  async function closeAllOverlays() {
    while (nv1.volumes.length > 1) {
      await nv1.removeVolume(nv1.volumes[1])
    }
  }
  modelSelect.onchange = async function () {
    if (this.selectedIndex < 0) {
      modelSelect.selectedIndex = 11
    }
    await closeAllOverlays()
    await ensureConformed()
    const model = inferenceModelsList[this.selectedIndex]
    const opts = brainChopOpts
    // opts.rootURL should be the url without the query string
    const urlParams = new URL(window.location.href)
    // remove the query string
    opts.rootURL = urlParams.origin + urlParams.pathname
    const isLocalhost = Boolean(
      window.location.hostname === 'localhost' ||
        // [::1] is the IPv6 localhost address.
        window.location.hostname === '[::1]' ||
        // 127.0.0.1/8 is considered localhost for IPv4.
        window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
    )
    if (isLocalhost) {
      opts.rootURL = location.protocol + '//' + location.host
    }
    if (workerCheck.checked) {
      if (typeof chopWorker !== 'undefined') {
        console.log('Unable to start new segmentation: previous call has not completed')
        return
      }
      chopWorker = await new MyWorker({ type: 'module' })
      const hdr = { datatypeCode: nv1.volumes[0].hdr.datatypeCode, dims: nv1.volumes[0].hdr.dims }
      const msg = { opts, modelEntry: model, niftiHeader: hdr, niftiImage: nv1.volumes[0].img }
      chopWorker.postMessage(msg)
      chopWorker.onmessage = function (event) {
        const cmd = event.data.cmd
        if (cmd === 'ui') {
          if (event.data.modalMessage !== '') {
            chopWorker.terminate()
            chopWorker = undefined
          }
          callbackUI(event.data.message, event.data.progressFrac, event.data.modalMessage, event.data.statData)
        }
        if (cmd === 'img') {
          chopWorker.terminate()
          chopWorker = undefined
          callbackImg(event.data.img, event.data.opts, event.data.modelEntry)
        }
      }
    } else {
      runInference(opts, model, nv1.volumes[0].hdr, nv1.volumes[0].img, callbackImg, callbackUI)
    }
  }
  saveImgBtn.onclick = function () {
    nv1.volumes[1].saveToDisk('Custom.nii')
  }
  saveSceneBtn.onclick = function () {
    nv1.saveDocument("brainchop.nvd");
  }
  workerCheck.onchange = function () {
    modelSelect.onchange()
  }
  clipCheck.onchange = function () {
    if (clipCheck.checked) {
      nv1.setClipPlane([0, 0, 90])
    } else {
      nv1.setClipPlane([2, 0, 90])
    }
  }
  function doLoadImage() {
    opacitySlider0.oninput()
  }
  async function fetchJSON(fnm) {
    const response = await fetch(fnm)
    const js = await response.json()
    return js
  }
  async function callbackImg(img, opts, modelEntry) {
    closeAllOverlays()
    const overlayVolume = await nv1.volumes[0].clone()
    overlayVolume.zeroImage()
    overlayVolume.hdr.scl_inter = 0
    overlayVolume.hdr.scl_slope = 1
    overlayVolume.img = new Uint8Array(img)
    if (modelEntry.colormapPath) {
      const cmap = await fetchJSON(modelEntry.colormapPath)
      overlayVolume.setColormapLabel(cmap)
      // n.b. most models create indexed labels, but those without colormap mask scalar input
      overlayVolume.hdr.intent_code = 1002 // NIFTI_INTENT_LABEL
    } else {
      let colormap = opts.atlasSelectedColorTable.toLowerCase()
      const cmaps = nv1.colormaps()
      if (!cmaps.includes(colormap)) {
        colormap = 'actc'
      }
      overlayVolume.colormap = colormap
    }
    overlayVolume.opacity = opacitySlider1.value / 255
    await nv1.addVolume(overlayVolume)
  }
  async function reportTelemetry(statData) {
    if (typeof statData === 'string' || statData instanceof String) {
      function strToArray(str) {
        const list = JSON.parse(str)
        const array = []
        for (const key in list) {
          array[key] = list[key]
        }
        return array
      }
      statData = strToArray(statData)
    }
    statData = await localSystemDetails(statData, nv1.gl)
    diagnosticsString = ':: Diagnostics can help resolve issues https://github.com/neuroneural/brainchop/issues ::\n'
    for (const key in statData) {
      diagnosticsString += key + ': ' + statData[key] + '\n'
    }
  }
  function callbackUI(message = '', progressFrac = -1, modalMessage = '', statData = []) {
    if (message !== '') {
      console.log(message)
      document.getElementById('location').innerHTML = message
    }
    if (isNaN(progressFrac)) {
      // memory issue
      memstatus.style.color = 'red'
      memstatus.innerHTML = 'Memory Issue'
    } else if (progressFrac >= 0) {
      modelProgress.value = progressFrac * modelProgress.max
    }
    if (modalMessage !== '') {
      window.alert(modalMessage)
    }
    if (Object.keys(statData).length > 0) {
      reportTelemetry(statData)
    }
  }
  function handleLocationChange(data) {
    document.getElementById('location').innerHTML = '&nbsp;&nbsp;' + data.string
  }
  const defaults = {
    backColor: [0.4, 0.4, 0.4, 1],
    show3Dcrosshair: true,
    onLocationChange: handleLocationChange
  }
  let diagnosticsString = ''
  let chopWorker
  const nv1 = new Niivue(defaults)
  nv1.attachToCanvas(gl1)
  nv1.opts.dragMode = nv1.dragModes.pan
  nv1.opts.multiplanarForceRender = true
  nv1.opts.yoke3Dto2DZoom = true
  nv1.opts.crosshairGap = 11
  nv1.setInterpolation(true)
  await nv1.loadVolumes([{ url: './t1_crop.nii.gz' }])
  for (let i = 0; i < inferenceModelsList.length; i++) {
    const option = document.createElement('option')
    option.text = inferenceModelsList[i].modelName
    option.value = inferenceModelsList[i].id.toString()
    modelSelect.appendChild(option)
  }
  nv1.onImageLoaded = doLoadImage
  modelSelect.selectedIndex = -1
  drawDrop.selectedIndex = -1
  workerCheck.checked = await isChrome() // TODO: Safari does not yet support WebGL TFJS webworkers, test FireFox
  // uncomment next two lines to automatically run segmentation when web page is loaded
  // modelSelect.selectedIndex = 11
  // modelSelect.onchange()
  
  // get the query string parameter model.
  // if set, select the model from the dropdown list and call the modelSelect.onchange() function
  const urlParams = new URLSearchParams(window.location.search)
  const modelParam = urlParams.get('model')
  if (modelParam) {
    // make sure the model index is a number
    modelSelect.selectedIndex = Number(modelParam)
    modelSelect.onchange()
  }
}

main()
