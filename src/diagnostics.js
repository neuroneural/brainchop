/**
 * Granular diagnostics & system-info collector matching brainchop-test's
 * structured key-value report (stage timings, label checks, WebGPU V4 plan,
 * GPU/WebGL2/browser/heap details, and cross-origin isolation status).
 */

function detectBrowser(ua) {
  if (ua.includes('OPR/')) return ['Opera', parseInt(ua.split('OPR/')[1], 10)]
  if (ua.includes('Edg/')) return ['Edge', parseInt(ua.split('Edg/')[1], 10)]
  if (ua.includes('Chrome/')) return ['Chrome', parseInt(ua.split('Chrome/')[1], 10)]
  if (ua.includes('Firefox/')) return ['Firefox', parseInt(ua.split('Firefox/')[1], 10)]
  if (ua.includes('Safari/')) return ['Safari', parseInt(ua.split('Version/')[1] || ua.split('Safari/')[1], 10)]
  return ['Unknown', null]
}

function detectOS(ua) {
  if (ua.includes('Win')) return 'Windows'
  if (ua.includes('Mac')) return 'MacOS'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('CrOS')) return 'ChromeOS'
  return 'Unknown'
}

function inspectWebGL2(gl) {
  if (!gl) return { WebGL2: false }
  const debug = gl.getExtension('WEBGL_debug_renderer_info')
  const vendor = debug ? gl.getParameter(debug.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR)
  const renderer = debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)
  return {
    WebGL2: true,
    GPU_Vendor: vendor ?? null,
    GPU_Card: renderer ?? null,
    Texture_Size: gl.getParameter(gl.MAX_TEXTURE_SIZE) ?? null,
  }
}

/**
 * Derive granular per-stage timings (seconds, 4 decimals) from timestamped
 * @brainchop/core `onProgress` events plus main-thread serialize & display timers.
 */
export function computeStageTimings({
  tStart,
  tSerializeEnd,
  tWorkerEnd,
  tDisplayEnd,
  progressTimeline = [],
}) {
  const sec = (ms) => (Number.isFinite(ms) && ms >= 0 ? (ms / 1000).toFixed(4) : null)
  const findFirst = (pred) => progressTimeline.find(pred)
  const findLast = (pred) => {
    for (let i = progressTimeline.length - 1; i >= 0; i--) {
      if (pred(progressTimeline[i])) return progressTimeline[i]
    }
    return undefined
  }

  const evConformStart = findFirst((e) => e.stage === 'conform')
  const evConformEnd = findLast((e) => e.stage === 'conform')
  const evPreStart = findFirst((e) => e.stage === 'preprocess')
  const evPreEnd = findLast((e) => e.stage === 'preprocess')
  const evSetupStart = findFirst(
    (e) => e.stage === 'load' && /setting up|setup/i.test(e.message || ''),
  )
  const evInferStart = findFirst((e) => e.stage === 'inference')
  const evInferEnd = findLast((e) => e.stage === 'inference')
  const evPostStart = findFirst((e) => e.stage === 'postprocess')
  const evResliceStart = findFirst((e) => e.stage === 'reslice')
  const evComplete = findLast((e) => e.stage === 'complete')

  const conformMs =
    evConformStart && (evPreStart || evConformEnd)
      ? (evPreStart?.t ?? evConformEnd.t) - evConformStart.t
      : null
  const preprocessMs =
    evPreStart && (evSetupStart || evPreEnd)
      ? Math.max(0, (evPreEnd?.t ?? evSetupStart.t) - evPreStart.t)
      : null
  const setupMs =
    evInferStart && (evSetupStart || evPreEnd)
      ? Math.max(0, evInferStart.t - (evSetupStart?.t ?? evPreEnd.t))
      : null
  const inferenceMs =
    evInferStart && (evPostStart || evInferEnd)
      ? Math.max(0, (evInferEnd?.t ?? evPostStart.t) - evInferStart.t)
      : null
  const postprocessMs =
    evPostStart && (evResliceStart || evComplete)
      ? Math.max(0, (evResliceStart?.t ?? evComplete.t) - evPostStart.t)
      : null
  const resliceMs =
    evResliceStart && (evComplete || tWorkerEnd)
      ? Math.max(0, (evComplete?.t ?? tWorkerEnd) - evResliceStart.t)
      : null

  return {
    Serialize_t: sec(tSerializeEnd - tStart),
    Conform_t: sec(conformMs),
    Preprocess_t: sec(preprocessMs),
    Setup_t: sec(setupMs),
    Inference_t: sec(inferenceMs),
    Postprocess_t: sec(postprocessMs),
    Reslice_t: sec(resliceMs),
    Display_t: sec(tDisplayEnd - tWorkerEnd),
    Worker_t: sec(tWorkerEnd - tSerializeEnd),
    Total_t: sec(tDisplayEnd - tStart),
  }
}

/**
 * Parse `[WebGPU-V4] layout=... exec=... reason=...` lines emitted by @brainchop/core.
 */
export function parseV4PlanFromLog(log = []) {
  const line = log.find((l) => /\[WebGPU-V4\]/.test(l) && /layout=/.test(l))
  if (!line) return {}
  const pick = (key) => {
    const m = new RegExp(`${key}=([^\\s,;]+)`).exec(line)
    return m ? m[1] : null
  }
  const out = {}
  const layout = pick('layout')
  const exec = pick('exec')
  const reason = pick('reason')
  const probe = pick('probe')
  if (layout) out.WebGPU_V4_Layout = layout
  if (exec) out.WebGPU_V4_Exec = exec
  if (reason) out.WebGPU_V4_Reason = reason
  if (probe) out.WebGPU_V4_Probe = probe
  return out
}

/**
 * Format a full diagnostic string matching brainchop-test conventions.
 */
export async function formatDiagnosticsReport({
  lastRun,
  capabilityReport,
  nv,
}) {
  const ua = navigator.userAgent || ''
  const [browserName, browserVer] = detectBrowser(ua)
  const today = new Date()
  const dateStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`
  const adapter = await navigator.gpu?.requestAdapter().catch(() => null)
  const glInfo = inspectWebGL2(nv?.view?.gl ?? null)
  const gpu = capabilityReport?.gpu ?? {}
  const gl = capabilityReport?.gl ?? {}
  const cpu = capabilityReport?.cpu ?? {}

  const baseDims = nv?.volumes?.[0]?.hdr?.dims?.slice(1, 4)
  const fields = {
    Model_Name: lastRun?.modelLabel ?? 'none run yet',
    Core_Model: lastRun?.coreModel ?? null,
    Execution_Mode: lastRun
      ? `${lastRun.backend}${lastRun.ranInWorker ? '-worker' : '-main'}`
      : null,
    Backend: lastRun?.backend ?? null,
    Input_Shape: baseDims ? JSON.stringify(baseDims) : null,
    ...(lastRun?.v4Plan ?? {}),
    ...(lastRun?.labelSummary ?? {}),
    ...(lastRun?.timings ?? {}),
    Status: lastRun?.status ?? 'Idle (no model run yet)',
    Date: dateStr,
    Browser: browserName,
    Browser_Ver: Number.isFinite(browserVer) ? browserVer : null,
    OS: detectOS(ua),
    Viewer_Renderer: nv?.backend ?? null,
    ...glInfo,
    WebGPU_Supported: Boolean(gpu.supported),
    WebGPU_F16: Boolean(gpu.hasShaderF16),
    WebGPU_Subgroups: Boolean(gpu.hasSubgroups),
    WebGPU_LowMem: Boolean(gpu.lowMemoryRequired),
    WebGPU_Adapter: adapter
      ? `${adapter.info?.vendor ?? ''} ${adapter.info?.architecture ?? ''} ${adapter.info?.description ?? ''}`.trim() ||
        'available'
      : 'none',
    WebGL2_Supported: Boolean(gl.supported),
    CPU_WASM_Supported: Boolean(cpu.supported),
    Secure_Context: window.isSecureContext,
    Cross_Origin_Isolated: window.crossOriginIsolated,
    CPU_Cores: navigator.hardwareConcurrency ?? null,
  }

  if (window.performance?.memory) {
    const m = window.performance.memory
    fields.Heap_Size_MB = Number((m.totalJSHeapSize / (1024 * 1024)).toFixed(2))
    fields.Used_Heap_MB = Number((m.usedJSHeapSize / (1024 * 1024)).toFixed(2))
    fields.Heap_Limit_MB = Number((m.jsHeapSizeLimit / (1024 * 1024)).toFixed(2))
  }

  const lines = [':: Diagnostics https://github.com/neuroneural/brainchop/issues ::']
  for (const [k, v] of Object.entries(fields)) {
    if (v !== null && v !== undefined && v !== '') {
      lines.push(`${k}: ${v}`)
    }
  }
  lines.push(`User_Agent: ${ua}`)

  if (lastRun?.log?.length) {
    lines.push('--- Engine Log ---')
    lines.push(...lastRun.log)
  }

  return lines.join('\n')
}
