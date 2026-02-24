/**
 * Shared diagnostic statistics module for unified data collection
 * across WebGL and WebGPU inference paths.
 */

export {
    createStatData,
    addModelInfo,
    addLabelStats,
    markSuccess,
    markFailure
};

/**
 * Execution modes for diagnostics
 */
export const ExecutionModes = {
    WEBGPU: 'webgpu',
    WEBGL_WEBWORKER: 'webgl-webworker',
    WEBGL_MAIN: 'webgl-main',
    WEBGL_SEQUENTIAL: 'webgl-sequential'
};

/**
 * Creates an initialized stat data object with common fields.
 * @param {Object} modelEntry - The model configuration object
 * @param {string} executionMode - One of ExecutionModes values
 * @returns {Object} Initialized stat data object
 */
function createStatData(modelEntry, executionMode) {
    return {
        startTime: Date.now(),
        Model_Name: modelEntry?.modelName || 'Unknown',
        Execution_Mode: executionMode,
        TF_Backend: executionMode === ExecutionModes.WEBGPU ? 'webgpu' : 'webgl',
        isModelFullVol: null,
        No_SubVolumes: 1,
        Brainchop_Ver: 'FullVolume',
        // Model info - populated by addModelInfo
        Input_Shape: null,
        Output_Shape: null,
        Channel_Last: null,
        Model_Param: null,
        Model_Layers: null,
        // Label stats - populated by addLabelStats
        Actual_Labels: null,
        Expect_Labels: null,
        NumLabels_Match: null,
        Missing_Labels: null,
        // Timing - populated by markSuccess
        Inference_t: null,
        Postprocess_t: null,
        // Status - populated by markSuccess/markFailure
        Status: null,
        Error_Type: null,
        Extra_Err_Info: null
    };
}

/**
 * Adds model architecture information to stat data.
 * @param {Object} statData - The stat data object to update
 * @param {Object} model - The TensorFlow.js model object
 * @param {Array} inputShape - The input shape array
 * @param {boolean} isChannelLast - Whether model uses channel-last format
 * @param {Function} getModelNumParameters - Function to get parameter count
 * @param {Function} getModelNumLayers - Function to get layer count
 */
async function addModelInfo(statData, model, inputShape, isChannelLast, getModelNumParameters, getModelNumLayers) {
    if (!model) return;

    try {
        statData.Input_Shape = JSON.stringify(inputShape);
        statData.Output_Shape = JSON.stringify(model.output?.shape || model.outputs?.[0]?.shape);
        statData.Channel_Last = isChannelLast;

        if (getModelNumParameters) {
            statData.Model_Param = await getModelNumParameters(model);
        }
        if (getModelNumLayers) {
            statData.Model_Layers = await getModelNumLayers(model);
        }
    } catch (e) {
        console.warn('Failed to add model info to diagnostics:', e);
    }
}

/**
 * Adds label statistics to stat data.
 * @param {Object} statData - The stat data object to update
 * @param {number} expectedLabels - Number of expected labels from model output channels
 * @param {number} actualLabels - Number of unique labels actually predicted
 * @param {Array<string>} missingLabelNames - Optional array of label names that were not predicted
 */
function addLabelStats(statData, expectedLabels, actualLabels, missingLabelNames = null) {
    statData.Expect_Labels = expectedLabels;
    statData.Actual_Labels = actualLabels;
    statData.NumLabels_Match = expectedLabels === actualLabels;

    if (missingLabelNames && missingLabelNames.length > 0) {
        statData.Missing_Labels = missingLabelNames.join(', ');
    }
}

/**
 * Marks the stat data as successful with timing information.
 * @param {Object} statData - The stat data object to update
 * @param {string|number} inferenceTime - Inference time in seconds
 * @param {string|number} postprocessTime - Post-processing time in seconds
 */
function markSuccess(statData, inferenceTime, postprocessTime) {
    statData.Inference_t = inferenceTime;
    statData.Postprocess_t = postprocessTime;
    statData.Status = 'OK';
}

/**
 * Marks the stat data as failed with error information.
 * @param {Object} statData - The stat data object to update
 * @param {Error|string} error - The error that occurred
 * @param {string} extraInfo - Additional context about where the error occurred
 */
function markFailure(statData, error, extraInfo = null) {
    statData.Inference_t = Infinity;
    statData.Postprocess_t = Infinity;
    statData.Status = 'Fail';
    statData.Error_Type = error?.message || String(error);
    if (extraInfo) {
        statData.Extra_Err_Info = extraInfo;
    }
}
