import * as tf from '@tensorflow/tfjs'

import {
    applyMriThreshold,
    convByOutputChannelAndInputSlicing,
    gn_convByOutputChannelAndInputSlicing,
    LayerNormInPlace,
    firstLastNonZero3D,
    isModelChnlLast,
    minMaxNormalizeVolumeData,
    quantileNormalizeVolumeData,
    processSegmentationVolume,
    SequentialConvLayer
} from './tensor-utils.js';


async function cropAndGetCorner(tensor3d, mask_3d, userPadding) {
  // Find bounding box
  const [row_min, row_max, col_min, col_max, depth_min, depth_max] = await firstLastNonZero3D(mask_3d);

  // Calculate dimensions
  const height = row_max - row_min + 1;
  const width = col_max - col_min + 1;
  const depth = depth_max - depth_min + 1;

  // Adjust starting corner based on padding, ensuring we don't exceed 256 or go negative
  const adjustCorner = (min, max, size, pad) => {
    const startPad = Math.min(min, pad); // how much we can pad towards start
    const endPad = Math.min(255 - max, pad); // how much we can pad towards end
    const newStart = Math.max(0, min - startPad);
    const newEnd = Math.min(255, max + endPad);
    return [newStart, newEnd];
  };

  const [safeRowStart, safeRowEnd] = adjustCorner(row_min, row_max, height, userPadding);
  const [safeColStart, safeColEnd] = adjustCorner(col_min, col_max, width, userPadding);
  const [safeDepthStart, safeDepthEnd] = adjustCorner(depth_min, depth_max, depth, userPadding);

  // Extract cropped brain with safe bounds
  const cropped = tensor3d.slice(
    [safeRowStart, safeColStart, safeDepthStart],
    [safeRowEnd - safeRowStart + 1, safeColEnd - safeColStart + 1, safeDepthEnd - safeDepthStart + 1]
  );

  return { cropped, corner: [safeRowStart, safeColStart, safeDepthStart] };
}


async function restoreTo256Cube(tensor3d, corner) {
  const [row_min, col_min, depth_min] = corner;
  const [height, width, depth] = tensor3d.shape;

  const paddings = [
    [row_min, Math.max(0, 256 - height - row_min)],
    [col_min, Math.max(0, 256 - width - col_min)],
    [depth_min, Math.max(0, 256 - depth - depth_min)]
  ];

  return tensor3d.pad(paddings);
}

export async function runFullVolumeInference(
  opts,
  modelEntry,
  model,
  slices_3d,
  pipeline1_out,
  statData,
  callbackImg,
  callbackUI,
  niftiImage
) {
  // --- TIMER START (Total Execution) ---
  const totalExecutionStartTime = performance.now();
  // --- 1. UNIFIED SETUP (Identical for both methods) ---
  console.log(`---- Start FullVolume Inference (SeqConv: ${modelEntry.enableSeqConv}) ----`);
  // Normalization
  if (modelEntry.enableQuantileNorm) {
    console.log('preModel Quantile normalization enabled');
    slices_3d = await quantileNormalizeVolumeData(slices_3d);
  } else {
    console.log('preModel Min Max normalization enabled');
    slices_3d = await minMaxNormalizeVolumeData(slices_3d);
  }

  // Masking
  let mask_3d;
  if (pipeline1_out == null) {
    const autoThresholdValue = modelEntry.autoThreshold;
    if (autoThresholdValue > 0 && autoThresholdValue <= 1) {
      mask_3d = await applyMriThreshold(slices_3d, autoThresholdValue);
    } else {
      mask_3d = await slices_3d.greater([0]).asType('bool');
    }
  } else {
    mask_3d = await pipeline1_out.greater([0]).asType('bool');
  }

  // Cropping and Padding
  const pad = modelEntry.cropPadding;
  let { cropped: cropped_slices_3d_w_pad, corner: refVoxel } = await cropAndGetCorner(slices_3d, mask_3d, pad);
  slices_3d.dispose();
  mask_3d.dispose();

  if (modelEntry.enableTranspose) {
    cropped_slices_3d_w_pad = cropped_slices_3d_w_pad.transpose();
    console.log('Input transposed for pre-model');
  }

  // --- 2. UNIFIED MODEL & TENSOR PREPARATION ---
  const res = await model;
  const layersLength = res.layers.length;
  const isChannelLast = isModelChnlLast(res);

  // Adjust model input shape (common logic)
  let adjusted_input_shape;
  if (isChannelLast) {
      res.layers[0].batchInputShape[1] = cropped_slices_3d_w_pad.shape[0];
      res.layers[0].batchInputShape[2] = cropped_slices_3d_w_pad.shape[1];
      res.layers[0].batchInputShape[3] = cropped_slices_3d_w_pad.shape[2];
      adjusted_input_shape = [opts.batchSize, res.layers[0].batchInputShape[1], res.layers[0].batchInputShape[2], res.layers[0].batchInputShape[3], opts.numOfChan];
  } else {
      res.layers[0].batchInputShape[2] = cropped_slices_3d_w_pad.shape[0];
      res.layers[0].batchInputShape[3] = cropped_slices_3d_w_pad.shape[1];
      res.layers[0].batchInputShape[4] = cropped_slices_3d_w_pad.shape[2];
      adjusted_input_shape = [opts.batchSize, opts.numOfChan, res.layers[0].batchInputShape[2], res.layers[0].batchInputShape[3], res.layers[0].batchInputShape[4]];
  }

  let currentOutputTensor = cropped_slices_3d_w_pad.reshape(adjusted_input_shape);

  // --- 3. MAIN INFERENCE LOOP with ROBUST MEMORY MANAGEMENT ---
  let i = 1;
  const startTime = performance.now();

  // GPU Sync Tuning (applies to both strategies)
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    let SYNC_GPU_EVERY_N_LAYERS = (isSafari || isFirefox) ? 10 : 15;
    if (modelEntry.enableSeqConv) {
        SYNC_GPU_EVERY_N_LAYERS = 1;
    }
  console.log(`Syncing GPU every ${SYNC_GPU_EVERY_N_LAYERS} layers.`);

  // The loop termination condition depends on the strategy
  const loopEnd = modelEntry.enableSeqConv ? layersLength - 2 : layersLength - 1;

  while (i <= loopEnd) {
    try {
      // --- STRATEGY SELECTION ---
        let nextTensor;
        if (modelEntry.enableSeqConv && res.layers[i].activation.getClassName() === 'linear') {
            // The fix is to await the async function directly, without a tidy() wrapper.
            const convFunction = res.layers[i].name.endsWith('_gn')
                  ? gn_convByOutputChannelAndInputSlicing
                  : convByOutputChannelAndInputSlicing;

            nextTensor = await convFunction(
                currentOutputTensor,
                res.layers[i].getWeights()[0],
                res.layers[i].getWeights()[1],
                res.layers[i].strides,
                res.layers[i].padding,
                res.layers[i].dilationRate,
                3
            );

      } else {
        // STRATEGY 1: Standard Layer Apply
        nextTensor = tf.tidy(() => {
          let resultTensor = res.layers[i].apply(currentOutputTensor);
          if (res.layers[i].name.endsWith('_gn')) {
            resultTensor = LayerNormInPlace(resultTensor);
          }
          return resultTensor;
        });
      }

      // Universal memory management for the loop
      currentOutputTensor.dispose();
      currentOutputTensor = nextTensor;

    } catch (err) {
      // Universal error handling
        callbackUI(err.message, -1, err.message);
        tf.engine().endScope()
        tf.engine().disposeVariables()

        statData.Inference_t = Infinity
        statData.Postprocess_t = Infinity
        statData.Status = 'Fail'
        statData.Error_Type = err.message
        statData.Extra_Err_Info = 'Failed while model layer ' + i + ' apply'

        callbackUI('', -1, '', statData)
        return 0;
    }

    // Universal GPU Sync and UI Callback
      if (i % SYNC_GPU_EVERY_N_LAYERS === 0) {
          console.log(`Layer ${i}... (Syncing GPU)`);
      callbackUI('Layer ' + i.toString(), (i + 1) / layersLength);
      const firstElement = currentOutputTensor.slice([0, 0, 0, 0, 0], [1, 1, 1, 1, 1]);
      await firstElement.data();
      firstElement.dispose();
    } else {
      callbackUI('Layer ' + i.toString(), (i + 1) / layersLength);
    }

    console.log(`Layer ${i} output shape: `, currentOutputTensor.shape);
    i++;
  }

  // --- 4. FINAL PROCESSING (Conditional based on strategy) ---
  let outLabelVolume;

  if (modelEntry.enableSeqConv) {
    // --- FINAL PROCESSING FOR SEQCONV ---
    console.log('Applying final SequentialConvLayer...');
    const seqConvLayer = new SequentialConvLayer(res, 10, isChannelLast, callbackUI);
    outLabelVolume = await seqConvLayer.apply(currentOutputTensor);
    currentOutputTensor.dispose(); // Dispose the input to the final layer
    console.log('SequentialConvLayer output shape:', outLabelVolume.shape);

  } else {
    // --- FINAL PROCESSING FOR STANDARD METHOD ---
    console.log('Applying final ArgMax...');
    outLabelVolume = tf.tidy(() => {
        const axis = isChannelLast ? -1 : 1;
        const prediction_argmax = tf.argMax(currentOutputTensor, axis);
        return tf.squeeze(prediction_argmax);
    });
    currentOutputTensor.dispose(); // The tidy already disposed the original, but this is safe
    console.log('ArgMax output shape:', outLabelVolume.shape);
  }

  // --- 5. UNIFIED POST-PROCESSING & OUTPUT GENERATION ---
  const Inference_t = ((performance.now() - startTime) / 1000).toFixed(4);
  // --- Log the inference time ---
  console.log(`---- Inference Time: ${Inference_t} seconds ----`);

  // Transpose back if needed
  if (modelEntry.enableTranspose) {
    console.log('outLabelVolume transposed');
    outLabelVolume = outLabelVolume.transpose();
  }

    //Restore to original volume size
  const PaddingStartTime = performance.now();
  console.log('outLabelVolume without padding shape: ', outLabelVolume.shape);
  outLabelVolume = await restoreTo256Cube(outLabelVolume, refVoxel);
  console.log('outLabelVolume final shape after padding to 256: ', outLabelVolume.shape);
  const Padding_t = ((performance.now() - PaddingStartTime) / 1000).toFixed(4);
  console.log(`---- Padding back to 256^3 Time: ${Padding_t} seconds ----`);

  const postProcessStartTime = performance.now();
  const outimg = await processSegmentationVolume(outLabelVolume, niftiImage, modelEntry, opts);
  const Postprocess_t = ((performance.now() - postProcessStartTime) / 1000).toFixed(4);
  console.log(`---- Postprocessing Time: ${Postprocess_t} seconds ----`);


  outLabelVolume.dispose();
  tf.engine().disposeVariables();


  // --- TIMER END (Total Execution) ---
  const totalExecutionTime = ((performance.now() - totalExecutionStartTime) / 1000).toFixed(4);
  // --- Log the total execution time ---
  console.log(`---- Total Execution Time: ${totalExecutionTime} seconds ----`);

  statData.Inference_t = Inference_t;
  statData.Postprocess_t = Postprocess_t;
  statData.Status = 'OK';
  callbackUI('Segmentation finished', 0);
  callbackUI('', -1, '', statData);
  callbackImg(outimg, opts, modelEntry);

  return 0;
}
