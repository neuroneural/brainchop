export { isChrome, localSystemDetails }

async function detectBrowser() {
  if (navigator.userAgent.indexOf('OPR/') > -1) {
    return 'Opera'
  } else if (navigator.userAgent.indexOf('Edg/') > -1) {
    return 'Edge'
  } else if (navigator.userAgent.indexOf('Falkon/') > -1) {
    return 'Falkon'
  } else if (navigator.userAgent.indexOf('Chrome/') > -1) {
    return 'Chrome'
  } else if (navigator.userAgent.indexOf('Firefox/') > -1) {
    return 'Firefox'
  } else if (navigator.userAgent.indexOf('Safari/') > -1) {
    return 'Safari'
  } else if (navigator.userAgent.indexOf('MSIE/') > -1 || navigator.userAgent.indexOf('rv:') > -1) {
    return 'IExplorer'
  } else {
    return 'Unknown'
  }
}

async function detectBrowserVersion() {
  if (navigator.userAgent.indexOf('OPR/') > -1) {
    return parseInt(navigator.userAgent.split('OPR/')[1])
  } else if (navigator.userAgent.indexOf('Edg/') > -1) {
    return parseInt(navigator.userAgent.split('Edg/')[1])
  } else if (navigator.userAgent.indexOf('Falkon/') > -1) {
    return parseInt(navigator.userAgent.split('Falkon/')[1])
  } else if (navigator.userAgent.indexOf('Chrome/') > -1) {
    return parseInt(navigator.userAgent.split('Chrome/')[1])
  } else if (navigator.userAgent.indexOf('Firefox/') > -1) {
    return parseInt(navigator.userAgent.split('Firefox/')[1])
  } else if (navigator.userAgent.indexOf('Safari/') > -1) {
    return parseInt(navigator.userAgent.split('Safari/')[1])
  } else if (navigator.userAgent.indexOf('MSIE/') > -1 || navigator.userAgent.indexOf('rv:') > -1) {
    return parseInt(navigator.userAgent.split('MSIE/')[1])
  } else {
    return Infinity
  }
}

async function detectOperatingSys() {
  if (navigator.userAgent.indexOf('Win') > -1) {
    return 'Windows'
  } else if (navigator.userAgent.indexOf('Mac') > -1) {
    return 'MacOS'
  } else if (navigator.userAgent.indexOf('Linux') > -1) {
    return 'Linux'
  } else if (navigator.userAgent.indexOf('UNIX') > -1) {
    return 'UNIX'
  } else {
    return 'Unknown'
  }
}

async function checkWebGl2(gl) {
  // const gl = document.createElement('canvas').getContext('webgl2')
  if (!gl) {
    if (typeof WebGL2RenderingContext !== 'undefined') {
      console.log('WebGL2 may be disabled. Please try updating video card drivers')
    } else {
      console.log('WebGL2 is not supported')
    }
    return false
  } else {
    console.log('WebGl2 is enabled')
    return true
  }
}

async function detectGPUVendor(gl) {
  // const gl = document.createElement('canvas').getContext('webgl')
  let debugInfo
  if (gl) {
    debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (debugInfo) {
      const result = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      // --e.g. : NVIDIA Corporation
      if (result.indexOf('(') > -1 && result.indexOf(')') > -1) {
        return result.substring(result.indexOf('(') + 1, result.indexOf(')'))
      }
      return result
    }
  }
  return null
}

async function detectGPUVendor_v0(gl) {
  // const gl = document.createElement('canvas').getContext('webgl')
  if (gl) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    return debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : null
  } else {
    return null
  }
}

async function detectGPUCardType_v0(gl) {
  if (gl) {
    if (detectBrowser() === 'Firefox') {
      // -- return e.g: "GeForce GTX 980/PCIe/SSE2"
      return gl.getParameter(gl.RENDERER)
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : null
  } else {
    return null
  }
}

async function detectGPUCardType(gl) {
  let debugInfo

  if (gl) {
    if (detectBrowser() === 'Firefox') {
      // -- return e.g: "GeForce GTX 980/PCIe/SSE2"
      return gl.getParameter(gl.RENDERER)
    }

    debugInfo = gl.getExtension('WEBGL_debug_renderer_info')

    if (debugInfo) {
      let result = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      // --e.g. : ANGLE (NVIDIA Corporation, GeForce GTX 1050 Ti/PCIe/SSE2, OpenGL 4.5.0 NVIDIA 390.144) as with Chrome
      // Or:  GeForce GTX 1050 Ti/PCIe/SSE2    as with fireFox

      if (result.indexOf('(') > -1 && result.indexOf(')') > -1 && result.indexOf('(R)') === -1) {
        result = result.substring(result.indexOf('(') + 1, result.indexOf(')'))

        if (result.split(',').length === 3) {
          return result.split(',')[1].trim()
        }
      }

      return result
    }
  }
  return null
}

async function getCPUNumCores() {
  return navigator.hardwareConcurrency
}

async function isChrome() {
  return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
}

async function localSystemDetails(statData, gl = null) {
  // -- Timing data to collect
  const today = new Date()
  if (statData.isModelFullVol) {
    statData.Brainchop_Ver = 'FullVolume'
  } else {
    statData.Brainchop_Ver = 'SubVolumes'
  }

  /* let geoData = getBrowserLocationInfo()
    if(geoData) {
          statData["Country"] = geoData["Country"]
          statData["State"] = geoData["Region"]
          statData["City"] = geoData["City"]
    } else {
          statData["Country"] = ""
          statData["State"] = ""
          statData["City"] = ""
    } */
  statData.Total_t = (Date.now() - statData.startTime) / 1000.0
  delete statData.startTime
  statData.Date = parseInt(today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear()
  statData.Browser = await detectBrowser()
  statData.Browser_Ver = await detectBrowserVersion()
  statData.OS = await detectOperatingSys()
  statData.WebGL2 = await checkWebGl2(gl)
  statData.GPU_Vendor = await detectGPUVendor(gl)
  statData.GPU_Card = await detectGPUCardType(gl)
  statData.GPU_Vendor_Full = await detectGPUVendor_v0(gl)
  statData.GPU_Card_Full = await detectGPUCardType_v0(gl)
  statData.CPU_Cores = await getCPUNumCores()
  statData.Which_Brainchop = 'latest'
  if (await isChrome()) {
    statData.Heap_Size_MB = window.performance.memory.totalJSHeapSize / (1024 * 1024).toFixed(2)
    statData.Used_Heap_MB = window.performance.memory.usedJSHeapSize / (1024 * 1024).toFixed(2)
    statData.Heap_Limit_MB = window.performance.memory.jsHeapSizeLimit / (1024 * 1024).toFixed(2)
  }
  if (gl) {
    console.log('MAX_TEXTURE_SIZE :', gl.getParameter(gl.MAX_TEXTURE_SIZE))
    console.log('MAX_RENDERBUFFER_SIZE :', gl.getParameter(gl.MAX_RENDERBUFFER_SIZE))
    // -- check to see   if  machine has two graphics card: one is the builtin e.g. Intel Iris Pro, the other is NVIDIA GeForce GT 750M.
    // -- check browser use which one, if debugInfo is null then installed  GPU is not used
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    console.log('VENDOR WEBGL:', gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL))
    statData.Texture_Size = gl.getParameter(gl.MAX_TEXTURE_SIZE) // --returns the maximum dimension the GPU can address
  } else {
    statData.Texture_Size = null
  }
  return statData
}
