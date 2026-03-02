import { Niivue } from "@niivue/niivue";
import { runInference as runInferenceTfjsMain } from "./brainchop-mainthread.js";
import { runInferenceWebGpu } from "./inference-webgpu.js";
import { inferenceModelsList, brainChopOpts } from "./brainchop-parameters.js";
import { localSystemDetails } from "./brainchop-diagnostics.js";
import MyWorker from "./brainchop-webworker.js?worker";

// --- Backend State ---
// --- Backend State ---
let gpuDevice = null;
let isWebGpuAvailable = false;

/**
 * Detects WebGPU support and initializes the device.
 * Provides detailed diagnostics for troubleshooting.
 */
async function initializeBackend() {
  const diagnostics = {
    secureContext: window.isSecureContext,
    navigatorGpuExists: 'gpu' in navigator,
    adapterObtained: false,
    deviceObtained: false,
    f16Support: false,
    error: null
  };

  // Check secure context first
  if (!window.isSecureContext) {
    console.warn('WebGPU requires a secure context (HTTPS or localhost).');
    console.warn('Current origin:', window.location.origin);
  }

  if ('gpu' in navigator) {
    try {
      console.log('Requesting WebGPU adapter...');
      const adapter = await navigator.gpu.requestAdapter();

      if (adapter) {
        diagnostics.adapterObtained = true;
        console.log('WebGPU adapter obtained:', adapter);

        // Log adapter info if available
        if (adapter.info) {
          console.log('Adapter info:', adapter.info);
        }

        // Log adapter limits
        console.log('Adapter limits:', {
          maxBufferSize: adapter.limits.maxBufferSize,
          maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize,
          maxComputeWorkgroupsPerDimension: adapter.limits.maxComputeWorkgroupsPerDimension
        });

        const requiredLimits = {
          maxBufferSize: adapter.limits.maxBufferSize,
          maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize
        };
        const hasF16 = adapter.features.has("shader-f16");
        diagnostics.f16Support = hasF16;
        const requiredFeatures = hasF16 ? ["shader-f16"] : [];

        gpuDevice = await adapter.requestDevice({ requiredLimits, requiredFeatures });
        diagnostics.deviceObtained = true;

        isWebGpuAvailable = true;
        const f16Status = hasF16 ? "enabled" : "not available";
        console.log(`✓ WebGPU initialized successfully. F16: ${f16Status}`);
      } else {
        console.warn('WebGPU adapter request returned null.');
        console.warn('This typically means:');
        console.warn('  - Safari: WebGPU feature flags not enabled in Settings > Feature Flags');
        console.warn('  - Unsupported GPU hardware');
        console.warn('  - GPU drivers need updating');
        diagnostics.error = 'Adapter returned null';
      }
    } catch (e) {
      diagnostics.error = e.message;
      console.error('WebGPU initialization error:', e);

      // Provide Safari-specific guidance
      if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
        console.warn('Safari detected. To enable WebGPU:');
        console.warn('  1. Open Safari Settings/Preferences');
        console.warn('  2. Go to Advanced tab, enable "Show features for web developers"');
        console.warn('  3. Go to Feature Flags tab');
        console.warn('  4. Enable: WebGPU, GPU Process: DOM Rendering, GPU Process: Canvas Rendering');
        console.warn('  5. Restart Safari');
      }
    }
  } else {
    console.warn('navigator.gpu not found. WebGPU API is not available in this browser.');
    diagnostics.error = 'navigator.gpu not found';

    // Provide Firefox-specific guidance
    if (navigator.userAgent.includes('Firefox')) {
      console.warn('Firefox detected. To enable WebGPU in about:config:');
      console.warn('  1. Set dom.webgpu.enabled = true');
      console.warn('  2. Set gfx.webgpu.ignore-blocklist = true');
      console.warn('  3. Restart Firefox');
    }
  }

  // Update UI with backend status
  updateBackendStatusUI(isWebGpuAvailable, diagnostics);

  if (!isWebGpuAvailable) {
    console.log('Falling back to WebGL backend.');
  }

  // Store diagnostics for later access
  window.webgpuDiagnostics = diagnostics;
  return diagnostics;
}

/**
 * Updates the UI to display the current backend status.
 */
function updateBackendStatusUI(webgpuAvailable, diagnostics) {
  const statusEl = document.getElementById('backendStatus');
  if (!statusEl) {
    console.log('Backend status element not found in DOM');
    return;
  }

  if (webgpuAvailable) {
    const f16Text = diagnostics.f16Support ? ' (F16)' : '';
    statusEl.textContent = `WebGPU${f16Text}`;
    statusEl.style.color = '#4CAF50'; // Green
    statusEl.title = 'WebGPU backend active - fastest performance';
  } else {
    statusEl.textContent = 'WebGL';
    statusEl.style.color = '#FF9800'; // Orange

    // Build helpful tooltip
    let tooltip = 'WebGL backend (fallback)';
    if (diagnostics.error) {
      tooltip += `\nReason: ${diagnostics.error}`;
    }
    if (!diagnostics.secureContext) {
      tooltip += '\n⚠ Not a secure context (HTTPS required)';
    }
    if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
      tooltip += '\n\nTo enable WebGPU in Safari:\n1. Settings > Feature Flags\n2. Enable WebGPU flags\n3. Restart Safari';
    }
    if (navigator.userAgent.includes('Firefox')) {
      tooltip += '\n\nTo enable WebGPU in Firefox:\n1. about:config > dom.webgpu.enabled = true\n2. gfx.webgpu.ignore-blocklist = true\n3. Restart Firefox';
    }
    statusEl.title = tooltip;
  }
}

async function main() {
  let diagnosticsString = "";
  let missingLabelStatus = "";
  let chopWorker;

  dragMode.onchange = async function () {
    nv1.opts.dragMode = this.selectedIndex;
  };

  drawDrop.onchange = async function () {
    if (nv1.volumes.length < 2) {
      window.alert("No segmentation open (use the Segmentation pull down)");
      drawDrop.selectedIndex = -1;
      return;
    }
    if (!nv1.drawBitmap) {
      window.alert("No drawing (hint: use the Draw pull down to select a pen)");
      drawDrop.selectedIndex = -1;
      return;
    }
    const mode = parseInt(this.value);
    if (mode === 0) {
      nv1.drawUndo();
      drawDrop.selectedIndex = -1;
      return;
    }
    let img = nv1.volumes[1].img;
    let draw = await nv1.saveImage({ filename: "", isSaveDrawing: true });
    const niiHdrBytes = 352;
    const nvox = img.length;
    if (mode === 1) { //append
      for (let i = 0; i < nvox; i++) if (draw[niiHdrBytes + i] > 0) img[i] = 1;
    }
    if (mode === 2) { //delete
      for (let i = 0; i < nvox; i++) if (draw[niiHdrBytes + i] > 0) img[i] = 0;
    }
    nv1.closeDrawing();
    nv1.updateGLVolume();
    nv1.setDrawingEnabled(false);
    penDrop.selectedIndex = -1;
    drawDrop.selectedIndex = -1;
  };

  penDrop.onchange = async function () {
    const mode = parseInt(this.value);
    nv1.setDrawingEnabled(mode >= 0);
    if (mode >= 0) nv1.setPenValue(mode & 7, mode > 7);
  };

  aboutBtn.onclick = function () {
    const aboutContent = `
      <div style="text-align: left; font-size: 0.95em;">
        <p><strong>🔒 Privacy First</strong><br>
        BrainChop runs entirely <strong>locally in your browser</strong>. Your imaging data never leaves your device, and no server-side processing is involved.</p>

        <p><strong>⌨️ Controls</strong><br>
        • <strong>Drag & Drop</strong> any NIfTI file to open.
        • Press <strong>C</strong> to toggle/cycle the clip-plane.
        • Press <strong>V</strong> repeatedly to cycle through views.</p>

        <p><strong>🧠 AI Models</strong><br>
        <strong>⚡ Flash Filet:</strong> Small, lightning fast, resource-friendly. Best for HCP-like structural MRIs ("Tissue GWM (light)").<br>
        <strong>🔪 Thin Slice:</strong> High quality but potentially fragile. Best for standard healthy adult data.<br>
        <strong>🪓 Rough Chop:</strong> New & robust! Works on a wide variety of data qualities (clinical, infant). May be less refined than "Thin slice" on perfect data but tougher on real-world data.</p>
        
        <p><em>Note: Models may run slower on limited devices to ensure memory safety.</em></p>
      </div>
    `;
    showModal("About BrainChop", aboutContent);
  };

  diagnosticsBtn.onclick = function () {
    let msg = diagnosticsString;

    // If no inference run yet, show startup diagnostics
    if (msg.length < 1 && window.webgpuDiagnostics) {
      const d = window.webgpuDiagnostics;
      msg = ":: Startup Diagnostics ::\n";
      msg += `Secure Context: ${d.secureContext}\n`;
      msg += `WebGPU Enabled: ${isWebGpuAvailable}\n`;
      msg += `F16 Support: ${d.f16Support}\n`;
      if (d.error) msg += `Error: ${d.error}\n`;

      // Add browser info
      msg += `User Agent: ${navigator.userAgent}\n`;
    }

    // If no inference run yet, show startup diagnostics
    if (msg.length < 1 && window.webgpuDiagnostics) {
      // ... (existing logic to build msg)
    }

    if (msg.length < 1) {
      showModal("Diagnostics", "No diagnostic string generated: run a model to create diagnostics");
      return;
    }

    // Logic for missing labels
    let statusMsg = msg;
    missingLabelStatus = missingLabelStatus.slice(0, -2);
    if (missingLabelStatus !== "") {
      if (statusMsg.includes('Status: OK')) {
        statusMsg = statusMsg.replace('Status: OK', `Status: ${missingLabelStatus}`);
      }
    }
    missingLabelStatus = "";

    // ^ note: clipboard write is async but often works without await in loose contexts. 
    // Ideally we catch errors.
    navigator.clipboard.writeText(statusMsg).then(() => {
      showModal("Diagnostics", `<p>Diagnostics copied to clipboard</p><pre style="white-space: pre-wrap; font-family: monospace; font-size: 0.9em; overflow-x: auto;">${statusMsg}</pre>`);
    }).catch(err => {
      showModal("Diagnostics", `<p>Failed to copy to clipboard.</p><pre style="white-space: pre-wrap; font-family: monospace; font-size: 0.9em; overflow-x: auto;">${statusMsg}</pre>`);
    });
  };

  opacitySlider0.oninput = function () {
    nv1.setOpacity(0, opacitySlider0.value / 255);
    nv1.updateGLVolume();
  };

  opacitySlider1.oninput = function () {
    nv1.setOpacity(1, opacitySlider1.value / 255);
  };

  async function ensureConformed() {
    const nii = nv1.volumes[0];
    let isConformed =
      nii.dims[1] === 256 && nii.dims[2] === 256 && nii.dims[3] === 256
      && nii.img instanceof Uint8Array && nii.img.length === 256 * 256 * 256;
    if (
      nii.permRAS[0] !== -1 ||
      nii.permRAS[1] !== 3 ||
      nii.permRAS[2] !== -2
    ) {
      isConformed = false;
    }
    if (isConformed) return;
    const nii2 = await nv1.conform(nii, false);
    await nv1.removeVolume(nv1.volumes[0]);
    await nv1.addVolume(nii2);
  }

  async function closeAllOverlays() {
    while (nv1.volumes.length > 1) {
      await nv1.removeVolume(nv1.volumes[1]);
    }
  }

  async function runSelectedInference() {
    const selectedModelIndex = modelSelect.value;
    if (selectedModelIndex === "-1") return;
    if (modelSelect.selectedIndex < 0) return;

    await closeAllOverlays();
    await ensureConformed();

    const modelEntry = inferenceModelsList[selectedModelIndex];

    const opts = { ...brainChopOpts };
    opts.rootURL = window.location.origin + import.meta.env.BASE_URL;

    const niftiImage = nv1.volumes[0].img;

    // 1. Try WebGPU
    if (isWebGpuAvailable && modelEntry.webgpu_safetensor) {
      console.log("Attempting WebGPU backend...");
      try {
        await runInferenceWebGpu(gpuDevice, opts, modelEntry, nv1.volumes[0].hdr, niftiImage, callbackImg, callbackUI);
        return; // Success
      } catch (e) {
        console.error("WebGPU inference failed, falling back to WebGL.", e);
        callbackUI("WebGPU failed — switching to WebGL backend...", 0);
        // Allow GPU to release WebGPU resources before requesting WebGL context
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    // 2. Try WebWorker (WebGL)
    console.log("Attempting WebWorker backend...");
    if (typeof chopWorker !== "undefined") {
      console.log("Worker is busy. Please wait.");
      return;
    }

    const plainNiftiHeader = {
      dims: nv1.volumes[0].hdr.dims,
      datatypeCode: nv1.volumes[0].hdr.datatypeCode,
    };

    const runWorker = (useSeqConv) => {
      return new Promise((resolve, reject) => {
        const currentOpts = { ...opts, enableSeqConv: useSeqConv };
        const currentModelEntry = { ...modelEntry, enableSeqConv: useSeqConv };

        chopWorker = new MyWorker({ type: "module" });
        chopWorker.postMessage({ opts: currentOpts, modelEntry: currentModelEntry, niftiHeader: plainNiftiHeader, niftiImage });

        chopWorker.onmessage = function (event) {
          const { cmd, message, progressFrac, modalMessage, statData, img, opts, modelEntry } = event.data;
          if (cmd === "ui") {
            if (modalMessage) {
              chopWorker.terminate();
              chopWorker = undefined;
              // Check for failure status or error message
              if (statData && statData.Status === 'Fail') {
                reject(new Error(statData.Error_Type || modalMessage));
                return;
              }
              // Some errors might be passed as modalMessage without statData
              if (typeof modalMessage === 'string' && (modalMessage.toLowerCase().includes('fail') || modalMessage.toLowerCase().includes('error') || modalMessage.toLowerCase().includes('compatible') || modalMessage.toLowerCase().includes('texture') || modalMessage.toLowerCase().includes('maximum'))) {
                reject(new Error(modalMessage));
                return;
              }
            }
            callbackUI(message, progressFrac, modalMessage, statData);
          }
          if (cmd === "img") {
            chopWorker.terminate();
            chopWorker = undefined;
            callbackImg(img, opts, modelEntry);
            resolve();
          }
        };
        chopWorker.onerror = function (e) {
          console.error("WebWorker failed", e);
          chopWorker.terminate();
          chopWorker = undefined;
          reject(e);
        };
      });
    };

    try {
      console.log("Attempting WebWorker with enableSeqConv: false");
      await runWorker(false);
      return;
    } catch (e) {
      console.warn("WebWorker (fast) failed, retrying with enableSeqConv: true", e);

      // Explicitly terminate worker if it's still around
      if (typeof chopWorker !== "undefined") {
        chopWorker.terminate();
        chopWorker = undefined;
      }

      // Delay to allow WebGL context cleanup
      console.log("Waiting 1000ms for WebGL context cleanup...");
      await new Promise(r => setTimeout(r, 1000));

      try {
        console.log("Attempting WebWorker with enableSeqConv: true");
        await runWorker(true); // Retry with seqConv
        return;
      } catch (e2) {
        console.error("WebWorker (slow) failed, falling back to Main Thread.", e2);
      }
    }

    // 3. Fallback to Main Thread
    console.log("Attempting Main Thread backend...");

    const runMainThread = (useSeqConv) => {
      return new Promise((resolve, reject) => {
        const currentOpts = { ...opts, enableSeqConv: useSeqConv };
        const currentModelEntry = { ...modelEntry, enableSeqConv: useSeqConv };

        // Proxy callbackUI to intercept errors
        const proxyCallbackUI = (message, progressFrac, modalMessage, statData) => {
          if (statData && statData.Status === 'Fail') {
            reject(new Error(statData.Error_Type || modalMessage || "Inference Failed"));
            // We still call original callback to show error to user? 
            // Actually if we are falling back, we might NOT want to show the error yet?
            // But the existing code shows it. Let's let it show for now, or maybe suppress if we are going to retry.
            // For now, let's just reject.
          } else if (modalMessage && typeof modalMessage === 'string' && (modalMessage.toLowerCase().includes('fail') || modalMessage.toLowerCase().includes('error') || modalMessage.toLowerCase().includes('compatible') || modalMessage.toLowerCase().includes('texture') || modalMessage.toLowerCase().includes('maximum'))) {
            reject(new Error(modalMessage));
          }

          // If we are rejecting, we might want to prevent the UI from showing the error if we are going to retry.
          // But modifying callbackUI logic deeply is risky. 
          // Let's just pass it through. The user might see "Error" then "Retrying..."
          callbackUI(message, progressFrac, modalMessage, statData);
        };

        // Proxy callbackImg to resolve
        const proxyCallbackImg = (img, opts, modelEntry) => {
          callbackImg(img, opts, modelEntry);
          resolve();
        };

        runInferenceTfjsMain(currentOpts, currentModelEntry, nv1.volumes[0].hdr, niftiImage, proxyCallbackImg, proxyCallbackUI)
          .catch(e => reject(e));
      });
    };

    try {
      console.log("Attempting Main Thread with enableSeqConv: false");
      await runMainThread(false);
    } catch (e) {
      console.warn("Main Thread (fast) failed, retrying with enableSeqConv: true", e);
      await new Promise(r => setTimeout(r, 100)); // Small delay
      try {
        console.log("Attempting Main Thread with enableSeqConv: true");
        await runMainThread(true);
      } catch (e2) {
        console.error("Main Thread (slow) failed.", e2);
        window.alert("Inference failed on all backends.");
      }
    }
  }

  modelSelect.onchange = runSelectedInference;
  // backendSelect.onchange = runSelectedInference; // Removed

  saveImgBtn.onclick = function () {
    if (nv1.volumes.length < 2) {
      window.alert("No segmentation to save.");
      return;
    }
    nv1.volumes[1].saveToDisk("segmentation.nii.gz");
  };

  saveSceneBtn.onclick = function () {
    nv1.saveDocument("brainchop.nvd");
  };



  function doLoadImage() {
    opacitySlider0.oninput();
    modelSelect.value = "-1";
  }

  async function fetchJSON(fnm) {
    const response = await fetch(fnm);
    return await response.json();
  }

  async function getUniqueValuesAndCounts(uint8Array) {
    const countsMap = new Map();
    for (const value of uint8Array) {
      countsMap.set(value, (countsMap.get(value) || 0) + 1);
    }
    return Array.from(countsMap, ([value, count]) => ({ value, count }));
  }

  async function createLabeledCounts(uniqueValuesAndCounts, labelStrings) {
    if (!labelStrings || uniqueValuesAndCounts.length !== labelStrings.length) {
      missingLabelStatus = "Failed to Predict Some Labels - ";
    }
    return labelStrings.map((label, index) => {
      const entry = uniqueValuesAndCounts.find(item => item.value === index);
      const countText = entry ? `${entry.count} mm3` : "Missing";
      if (countText === "Missing") missingLabelStatus += `${label}, `;
      return `${label}   ${countText}`;
    });
  }

  async function callbackImg(img, opts, modelEntry) {
    await closeAllOverlays();
    const overlayVolume = await nv1.volumes[0].clone();
    overlayVolume.zeroImage();
    Object.assign(overlayVolume.hdr, { scl_inter: 0, scl_slope: 1 });
    overlayVolume.img = img instanceof Uint8Array ? img : new Uint8Array(img.buffer);

    if (modelEntry.type === 'Brain_Masking') {
      const newLabels = ["Background", "Brain Mask"];
      const newR = [0, 217];
      const newG = [0, 119];
      const newB = [0, 33];
      overlayVolume.setColormapLabel({ R: newR, G: newG, B: newB, labels: newLabels });
      overlayVolume.hdr.intent_code = 1002; // NIFTI_INTENT_LABEL
    } else if (modelEntry.colormapPath) {
      const roiVolumes = await getUniqueValuesAndCounts(overlayVolume.img);
      const cmap = await fetchJSON(modelEntry.colormapPath);
      const newLabels = await createLabeledCounts(roiVolumes, cmap["labels"]);
      overlayVolume.setColormapLabel({ R: cmap["R"], G: cmap["G"], B: cmap["B"], labels: newLabels });
      overlayVolume.hdr.intent_code = 1002; // NIFTI_INTENT_LABEL
    } else {
      let colormap = opts.atlasSelectedColorTable.toLowerCase();

      // Custom: Use copper2 for Brain Extraction models
      if (modelEntry.type === 'Brain_Extraction') {
        colormap = 'copper2';
      }

      if (!nv1.colormaps().includes(colormap)) colormap = "actc";
      overlayVolume.colormap = colormap;
    }
    overlayVolume.opacity = opacitySlider1.value / 255;
    await nv1.addVolume(overlayVolume);
  }

  async function reportTelemetry(statData) {
    if (typeof statData === "string") {
      try {
        statData = JSON.parse(statData);
      } catch (e) {
        console.error("Failed to parse telemetry data", e);
        return;
      }
    }
    statData = await localSystemDetails(statData, nv1.gl);
    diagnosticsString = ":: Diagnostics https://github.com/neuroneural/brainchop/issues ::\n";
    for (const key in statData) {
      if (statData[key] !== null && statData[key] !== undefined) {
        diagnosticsString += `${key}: ${statData[key]}\n`;
      }
    }
  }

  function callbackUI(message = "", progressFrac = -1, modalMessage = "", statData = []) {
    if (message) {
      console.log(message);
      document.getElementById("location").innerHTML = message;
    }
    if (isNaN(progressFrac)) {
      memstatus.style.color = "red";
      memstatus.innerHTML = "Memory Issue";
    } else if (progressFrac >= 0) {
      modelProgress.value = progressFrac * modelProgress.max;
    }
    if (modalMessage) {
      window.alert(modalMessage);
    }
    if (statData && Object.keys(statData).length > 0) {
      reportTelemetry(statData);
    }
  }

  function handleLocationChange(data) {
    document.getElementById("location").innerHTML = data.string
      .split("   ")
      .map((value) => `<p style="font-size: 14px;margin:0px;">${value}</p>`)
      .join("");
  }

  const defaults = {
    backColor: [0.4, 0.4, 0.4, 1],
    show3Dcrosshair: true,
    onLocationChange: handleLocationChange,
  };

  const nv1 = new Niivue(defaults);
  await nv1.attachTo("gl1");
  Object.assign(nv1.opts, {
    dragMode: nv1.dragModes.pan,
    multiplanarForceRender: true,
    yoke3Dto2DZoom: true,
    crosshairGap: 11,
  });
  nv1.setInterpolation(true);
  await nv1.loadVolumes([{ url: "./t1_crop.nii.gz" }]);

  // Clear loading placeholder
  modelSelect.innerHTML = "";

  // Add default placeholder
  const placeholderOption = document.createElement("option");
  placeholderOption.text = "Run Segmentation Model";
  placeholderOption.value = "-1";
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  placeholderOption.hidden = true;
  modelSelect.appendChild(placeholderOption);

  for (let i = 0; i < inferenceModelsList.length; i++) {
    console.log(`Adding model option: ${inferenceModelsList[i].modelName}`);
    const option = document.createElement("option");
    option.text = inferenceModelsList[i].modelName;
    option.value = i;

    if (inferenceModelsList[i].type === 'Divider') {
      option.disabled = true;
    }

    modelSelect.appendChild(option);
  }
  nv1.onImageLoaded = doLoadImage;
  // modelSelect.selectedIndex = -1; // Removed as we want the placeholder to be selected by default (which is index 0 or value "-1")
  // Actually, we set selected=true on placeholder, so browser should pick it up.
  // But let's be explicit.
  modelSelect.value = "-1";
  drawDrop.selectedIndex = -1;

  await initializeBackend();

  // --- FIX IS HERE ---
  // Use URLSearchParams to correctly parse the query string.
  const urlParams = new URLSearchParams(window.location.search);
  const modelParam = urlParams.get("model");
  const modelIdxParam = urlParams.get("model_idx");
  let urlModelIdx = -1;
  if (modelParam) {
    urlModelIdx = inferenceModelsList.findIndex(m => m.shortname === modelParam);
  } else if (modelIdxParam && modelIdxParam < inferenceModelsList.length) {
    urlModelIdx = parseInt(modelIdxParam);
  }
  if (urlModelIdx >= 0) {
    modelSelect.value = urlModelIdx;
    await runSelectedInference();
    modelSelect.value = urlModelIdx;
  }
}

// Helper to show custom modal
function showModal(title, message) {
  const dialog = document.getElementById("appDialog");
  const titleEl = document.getElementById("dialogTitle");
  const msgEl = document.getElementById("dialogMessage");
  const closeBtn = document.getElementById("dialogCloseBtn");

  if (!dialog) return;

  titleEl.textContent = title;
  msgEl.innerHTML = message;

  closeBtn.onclick = () => dialog.close();
  dialog.showModal();
}

async function updateStarCount() {
  try {
    const response = await fetch("https://api.github.com/repos/neuroneural/brainchop");
    const data = await response.json();
    document.getElementById("star-count").textContent = data.stargazers_count;
  } catch (error) {
    console.error("Error fetching star count:", error);
  }
}

(async function () {
  await main();
  await updateStarCount();
})();
