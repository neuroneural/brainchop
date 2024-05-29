import * as tf from '@tensorflow/tfjs'
import { inferenceModelsList } from './brainchop-parameters.js'
import {
  addZeroPaddingTo3dTensor,
  applyMriThreshold,
  binarizeVolumeDataTensor,
  convByOutputChannelAndInputSlicing,
  draw3dObjBoundingVolume,
  firstLastNonZero3D,
  generateBrainMask,
  generateOutputSlicesV2,
  getAllSlicesDataAsTF3D,
  getModelNumLayers,
  getModelNumParameters,
  isModelChnlLast,
  load_model,
  minMaxNormalizeVolumeData,
  quantileNormalizeVolumeData,
  removeZeroPaddingFrom3dTensor,
  resizeWithZeroPadding,
  SequentialConvLayer
} from './tensor-utils.js'

function callbackUI(message = '', progressFrac = -1, modalMessage = '', statData = []) {
  let statStr = []
  if (Object.keys(statData).length > 0) {
    function arrayToStr() {
      const list = {}
      for (const key in statData) {
        list[key] = statData[key]
      }
      return JSON.stringify(list)
    }
    statStr = arrayToStr(statData)
  }
  self.postMessage({
    cmd: 'ui',
    message,
    progressFrac,
    modalMessage,
    statData: statStr
  })
}

function callbackImg(img, opts, modelEntry) {
  self.postMessage({ cmd: 'img', img, opts, modelEntry })
}

async function inferenceFullVolumeSeqCovLayerPhase2(
  opts,
  modelEntry,
  model,
  slices_3d,
  num_of_slices,
  slice_height,
  slice_width,
  pipeline1_out,
  statData,
  niftiImage
) {
  // --Phase-2, After remove the skull try to allocate brain volume and make inferece

  console.log(' ---- Start FullVolume Inference with Sequential Conv Layer for phase-II ---- ')
  const quantileNorm = modelEntry.enableQuantileNorm
  if (quantileNorm) {
    // Quantile normalize function needs specific models to be used
    console.log('preModel Quantile normalization enabled')
    slices_3d = await quantileNormalizeVolumeData(slices_3d)
  } else {
    // Min Max Nomalize MRI data to be from 0 to 1
    console.log('preModel Min Max normalization enabled')
    slices_3d = await minMaxNormalizeVolumeData(slices_3d)
  }

  let mask_3d

  if (pipeline1_out == null) {
    // preModel is null

    // Check if thresholding the MRI to remove noisy voxels for better cropping is needed.
    const autoThresholdValue = modelEntry.autoThreshold

    if (autoThresholdValue > 0 && autoThresholdValue <= 1) {
      // Filtered MRI from noisy voxel below  autoThresholdValue
      mask_3d = await applyMriThreshold(slices_3d, autoThresholdValue)
    } else {
      console.log('No valid crop threshold value')
      // binarize original image
      mask_3d = await slices_3d.greater([0]).asType('bool')
    }
  } else {
    mask_3d = await pipeline1_out.greater([0]).asType('bool')
    // -- pipeline1_out.dispose()
  }

  console.log(' mask_3d shape :  ', mask_3d.shape)
  const [row_min, row_max, col_min, col_max, depth_min, depth_max] = await firstLastNonZero3D(mask_3d)
  mask_3d.dispose()
  // -- Reference voxel that cropped volume started slice with it
  const refVoxel = [row_min, col_min, depth_min]
  // -- Starting form refVoxel, size of bounding volume
  const boundVolSizeArr = [row_max - row_min + 1, col_max - col_min + 1, depth_max - depth_min + 1]

  // -- Extract 3d object (e.g. brain)
  const cropped_slices_3d = await slices_3d.slice(
    [row_min, col_min, depth_min],
    [row_max - row_min + 1, col_max - col_min + 1, depth_max - depth_min + 1]
  )
  slices_3d.dispose()

  // -- Padding size add to cropped brain
  const pad = modelEntry.cropPadding

  // Create margin around the bounding volume
  let cropped_slices_3d_w_pad = await addZeroPaddingTo3dTensor(cropped_slices_3d, [pad, pad], [pad, pad], [pad, pad])
  console.log(' cropped slices_3d with padding shape:  ', cropped_slices_3d_w_pad.shape)

  cropped_slices_3d.dispose()

  if (opts.drawBoundingVolume) {
    let testVol = await removeZeroPaddingFrom3dTensor(cropped_slices_3d_w_pad, pad, pad, pad)
    console.log(' outLabelVolume without padding shape :  ', testVol.shape)

    testVol = await resizeWithZeroPadding(testVol, num_of_slices, slice_height, slice_width, refVoxel, boundVolSizeArr)
    console.log(' outLabelVolume final shape after resizing :  ', testVol.shape)
    draw3dObjBoundingVolume(tf.unstack(testVol), opts, modelEntry, callbackImg)
    testVol.dispose()

    return 0
  }

  statData.Brainchop_Ver = 'FullVolume'
  const res = await model
  try {
    let startTime = performance.now()
    const inferenceStartTime = performance.now()
    // maxLabelPredicted in whole volume of the brain
    let maxLabelPredicted = 0
    const transpose = modelEntry.enableTranspose

    if (transpose) {
      cropped_slices_3d_w_pad = await cropped_slices_3d_w_pad.transpose()
      console.log('Input transposed for pre-model')
    } else {
      console.log('Transpose not enabled for pre-model')
    }

    let i = 1
    const layersLength = res.layers.length
    console.log('res.layers.length ', layersLength)

    const isChannelLast = isModelChnlLast(res)
    const batchSize = opts.batchSize
    const numOfChan = opts.numOfChan
    let adjusted_input_shape
    // -- Adjust model input shape
    if (isChannelLast) {
      res.layers[0].batchInputShape[1] = cropped_slices_3d_w_pad.shape[0]
      res.layers[0].batchInputShape[2] = cropped_slices_3d_w_pad.shape[1]
      res.layers[0].batchInputShape[3] = cropped_slices_3d_w_pad.shape[2]

      adjusted_input_shape = [
        batchSize,
        res.layers[0].batchInputShape[1],
        res.layers[0].batchInputShape[2],
        res.layers[0].batchInputShape[3],
        numOfChan
      ]
    } else {
      res.layers[0].batchInputShape[2] = cropped_slices_3d_w_pad.shape[0]
      res.layers[0].batchInputShape[3] = cropped_slices_3d_w_pad.shape[1]
      res.layers[0].batchInputShape[4] = cropped_slices_3d_w_pad.shape[2]

      adjusted_input_shape = [
        batchSize,
        numOfChan,
        res.layers[0].batchInputShape[2],
        res.layers[0].batchInputShape[3],
        res.layers[0].batchInputShape[4]
      ]
    }

    console.log(' Model batch input shape : ', res.layers[0].batchInputShape)
    // -- batchInputShape {Array} input_shape - e.g. [?, D, H, W, Ch] or [?, Ch, D, H, W]

    statData.Input_Shape = JSON.stringify(res.layers[0].batchInputShape)
    statData.Output_Shape = JSON.stringify(res.output.shape)
    statData.Channel_Last = await isChannelLast
    statData.Model_Param = await getModelNumParameters(res)
    statData.Model_Layers = await getModelNumLayers(res)
    statData.Model = modelEntry.modelName
    statData.Seq_Conv = modelEntry.enableSeqConv
    // statData.Extra_Info = null

    // Determine the number of output channels in the last layer of the model
    //  e.g. 3, 50, 104
    const outputLayer = res.layers[res.layers.length - 1]
    console.log('Output Layer : ', outputLayer)

    const expected_Num_labels = isChannelLast
      ? outputLayer.outputShape[outputLayer.outputShape.length - 1]
      : outputLayer.outputShape[1]
    console.log('Num of output channels x: ', expected_Num_labels)

    const curTensor = []
    curTensor[0] = await cropped_slices_3d_w_pad.reshape(adjusted_input_shape)
    while (true) {
      try {
        if (res.layers[i].activation.getClassName() !== 'linear') {
          curTensor[i] = await res.layers[i].apply(curTensor[i - 1], opts.deleteTextureThreshold)
        } else {
          curTensor[i] = await convByOutputChannelAndInputSlicing(
            curTensor[i - 1],
            res.layers[i].getWeights()[0],
            res.layers[i].getWeights()[1],
            res.layers[i].strides,
            res.layers[i].padding,
            res.layers[i].dilationRate,
            3
          ) // important for memory use
        }

        tf.dispose(curTensor[i - 1])
      } catch (err) {
        const errTxt = 'Your graphics card (e.g. Intel) may not be compatible with WebGL. ' + err.message
        callbackUI(errTxt, -1, errTxt)

        tf.engine().endScope()
        tf.engine().disposeVariables()

        statData.Inference_t = Infinity
        statData.Postprocess_t = Infinity
        statData.Status = 'Fail'
        statData.Error_Type = err.message
        statData.Extra_Err_Info = 'Failed while model layer ' + i + ' apply'

        callbackUI('', -1, '', statData)

        return 0
      }

      console.log('layer output Tensor shape : ', curTensor[i].shape)
      console.log('layer count params ', res.layers[i].countParams())

      res.layers[i].dispose()
      curTensor[i - 1].dispose()

      callbackUI('Layer ' + i.toString(), (i + 1) / layersLength)
      if (tf.memory().unreliable) {
        const unreliableReasons = 'unreliable reasons :' + tf.memory().reasons
        callbackUI(unreliableReasons, NaN, unreliableReasons)
      }
      if (i === layersLength - 2) {
        // Stop before the last layer or classification layer.

        // // Create an instance of SequentialConvLayer
        // The second parameter is important for memory,
        // the larger it is, the more memory it uses
        // it was 8, but I set it to 3, got a different error
        // let seqConvLayer = new SequentialConvLayer(res, 10, isChannelLast)
        const seqConvLayer = await new SequentialConvLayer(res, 10, isChannelLast, callbackUI)

        // Apply the last output tensor to the seq. instance
        let outputTensor = null
        const profileInfo = await tf.profile(async () => {
          // Your tensor operations here
          outputTensor = await seqConvLayer.apply(curTensor[i], opts.deleteTextureThreshold)
        })
        console.log('profileInfo : ', profileInfo)

        // -- document.getElementById("progressBarChild").style.width = 0 + "%";

        // Dispose the previous layer input tensor
        tf.dispose(curTensor[i])
        // delete the used class
        // ? delete seqConvLayer

        // You can now use 'outputTensor' as needed
        console.log(' Output tensor', outputTensor)
        console.log(' Output tensor shape : ', outputTensor.shape)
        // Array(3) [ 256, 256, 256 ]

        if (outputTensor.shape.length !== 3) {
          const msg = 'Output tensor shape should be 3 dims but it is ' + outputTensor.shape.length
          callbackUI(msg, -1, msg)
        }

        const Inference_t = ((performance.now() - startTime) / 1000).toFixed(4)

        console.log(' find array max ')
        const curBatchMaxLabel = await outputTensor.max().dataSync()[0]
        if (maxLabelPredicted < curBatchMaxLabel) {
          maxLabelPredicted = curBatchMaxLabel
        }

        const numSegClasses = maxLabelPredicted + 1
        console.log('Predicted num of segmentation classes', numSegClasses)
        statData.Actual_Labels = numSegClasses
        statData.Expect_Labels = expected_Num_labels
        statData.NumLabels_Match = numSegClasses === expected_Num_labels
        if (numSegClasses !== expected_Num_labels) {
          const msg = 'expected ' + expected_Num_labels + ' labels, but the predicted are ' + numSegClasses
          callbackUI(msg, -1, msg)
        }

        // -- Transpose back to original unpadded size
        let outLabelVolume = outputTensor.reshape([
          cropped_slices_3d_w_pad.shape[0],
          cropped_slices_3d_w_pad.shape[1],
          cropped_slices_3d_w_pad.shape[2]
        ])
        tf.dispose(outputTensor)

        // Transpose MRI data to be match pytorch/keras input output
        if (transpose) {
          console.log('outLabelVolume transposed')
          outLabelVolume = outLabelVolume.transpose()
        }

        outLabelVolume = await removeZeroPaddingFrom3dTensor(outLabelVolume, pad, pad, pad)
        console.log(' outLabelVolume without padding shape :  ', outLabelVolume.shape)
        outLabelVolume = await resizeWithZeroPadding(
          outLabelVolume,
          num_of_slices,
          slice_height,
          slice_width,
          refVoxel,
          boundVolSizeArr
        )
        console.log(' outLabelVolume final shape after resizing :  ', outLabelVolume.shape)

        // let filterOutWithPreMask =  inferenceModelsList[$$("selectModel").getValue() - 1]["filterOutWithPreMask"]
        const filterOutWithPreMask = modelEntry.filterOutWithPreMask
        // To clean the skull area wrongly segmented inphase-2.
        if (pipeline1_out != null && opts.isBrainCropMaskBased && filterOutWithPreMask) {
          const bin = await binarizeVolumeDataTensor(pipeline1_out)
          outLabelVolume = await outLabelVolume.mul(bin)
        }

        startTime = performance.now()
        // Generate output volume or slices
        console.log('Generating correct output')
        let outimg
        try {
          const img = await new Uint32Array(outLabelVolume.dataSync())
          const Vshape = outLabelVolume.shape
          const Vtype = outLabelVolume.dtype
          outimg = await generateOutputSlicesV2(
            img,
            Vshape,
            Vtype,
            num_of_slices,
            numSegClasses,
            slice_height,
            slice_width,
            modelEntry,
            opts,
            niftiImage
          )
          console.log(' Phase-2 num of tensors after generateOutputSlicesV2: ', tf.memory().numTensors)

          tf.dispose(outLabelVolume)
          tf.engine().endScope()
          tf.engine().disposeVariables()
        } catch (error) {
          // -- Timing data to collect
          tf.engine().endScope()
          tf.engine().disposeVariables()
          console.log('Error while generating output: ', error)
          const msg = 'Failed while generating output due to limited browser memory available'
          callbackUI(msg, -1, msg)

          statData.Inference_t = Inference_t
          statData.Postprocess_t = Infinity
          statData.Status = 'Fail'
          statData.Error_Type = error.message
          statData.Extra_Err_Info = 'Failed while generating output'

          callbackUI('', -1, '', statData)

          return 0
        }
        const Postprocess_t = ((performance.now() - startTime) / 1000).toFixed(4)

        console.log(
          'Processing the whole brain volume in tfjs for multi-class output mask took : ',
          ((performance.now() - inferenceStartTime) / 1000).toFixed(4) + '  Seconds'
        )

        // -- Timing data to collect
        statData.Inference_t = Inference_t
        statData.Postprocess_t = Postprocess_t
        statData.Status = 'OK'

        callbackUI('', -1, '', statData)
        callbackUI('Segmentation finished', 0)
        callbackImg(outimg, opts, modelEntry)
        return 0
      } else {
        i++
      }
    }
  } catch (err) {
    callbackUI(err.message, -1, err.message)
    console.log(
      'If webgl context is lost, try to restore webgl context by visit the link ' +
        '<a href="https://support.biodigital.com/hc/en-us/articles/218322977-How-to-turn-on-WebGL-in-my-browser">here</a>'
    )
    if (tf.memory().unreliable) {
      const unreliableReasons = 'unreliable reasons :' + tf.memory().reasons
      callbackUI(unreliableReasons, NaN, unreliableReasons)
    }
  }
}

async function inferenceFullVolumePhase2(
  model,
  slices_3d,
  num_of_slices,
  slice_height,
  slice_width,
  pipeline1_out,
  modelEntry,
  statData,
  opts,
  niftiImage
) {
  let outimg = []
  // --Phase-2, After remove the skull try to allocate brain volume and make inferece
  console.log(' ---- Start FullVolume inference phase-II ---- ')
  const quantileNorm = modelEntry.enableQuantileNorm
  if (quantileNorm) {
    // Quantile normalize function needs specific models to be used
    console.log('preModel Quantile normalization enabled')
    slices_3d = await quantileNormalizeVolumeData(slices_3d)
  } else {
    // Min Max Nomalize MRI data to be from 0 to 1
    console.log('preModel Min Max normalization enabled')
    slices_3d = await minMaxNormalizeVolumeData(slices_3d)
  }
  let mask_3d
  if (pipeline1_out == null) {
    // preModel is null

    // Check if thresholding the MRI to remove noisy voxels for better cropping is needed.
    const autoThresholdValue = modelEntry.autoThreshold

    if (autoThresholdValue > 0 && autoThresholdValue <= 1) {
      // Filtered MRI from noisy voxel below  autoThresholdValue
      mask_3d = await applyMriThreshold(slices_3d, autoThresholdValue)
    } else {
      console.log('No valid crop threshold value')
      // binarize original image
      mask_3d = await slices_3d.greater([0]).asType('bool')
    }
  } else {
    mask_3d = await pipeline1_out.greater([0]).asType('bool')
    // -- pipeline1_out.dispose()
  }
  console.log(' mask_3d shape :  ', mask_3d.shape)
  const [row_min, row_max, col_min, col_max, depth_min, depth_max] = await firstLastNonZero3D(mask_3d)
  mask_3d.dispose()
  // -- Reference voxel that cropped volume started slice with it
  const refVoxel = [row_min, col_min, depth_min]
  console.log('refVoxel :', refVoxel)

  // -- Starting form refVoxel, size of bounding volume
  const boundVolSizeArr = [row_max - row_min + 1, col_max - col_min + 1, depth_max - depth_min + 1]

  console.log('boundVolSizeArr :', boundVolSizeArr)
  // -- Extract 3d object (e.g. brain)
  const cropped_slices_3d = slices_3d.slice(
    [row_min, col_min, depth_min],
    [row_max - row_min + 1, col_max - col_min + 1, depth_max - depth_min + 1]
  )

  slices_3d.dispose()

  // -- Padding size add to cropped brain
  const pad = modelEntry.cropPadding

  // Create margin around the bounding volume
  let cropped_slices_3d_w_pad = await addZeroPaddingTo3dTensor(cropped_slices_3d, [pad, pad], [pad, pad], [pad, pad])
  console.log(' cropped slices_3d with padding shape:  ', cropped_slices_3d_w_pad.shape)

  cropped_slices_3d.dispose()

  // -- Test dim after padding ..
  // for (let i = 0; i < cropped_slices_3d_w_pad.rank; i++) {
  //     if(cropped_slices_3d_w_pad.shape[i] > 256) {
  //          console.log(" cropped_slices_3d_w_pad > 256 ")
  //     }

  // }

  if (opts.drawBoundingVolume) {
    let testVol = await removeZeroPaddingFrom3dTensor(cropped_slices_3d_w_pad, pad, pad, pad)
    console.log(' outLabelVolume without padding shape :  ', testVol.shape)

    testVol = await resizeWithZeroPadding(testVol, num_of_slices, slice_height, slice_width, refVoxel, boundVolSizeArr)
    console.log(' outLabelVolume final shape after resizing :  ', testVol.shape)
    draw3dObjBoundingVolume(tf.unstack(testVol), opts, modelEntry, callbackImg)
    testVol.dispose()

    return 0
  }

  statData.Brainchop_Ver = 'FullVolume'
  let startTime = performance.now()
  let adjusted_input_shape = []
  const res = await model
  try {
    startTime = performance.now()
    const inferenceStartTime = performance.now()
    // maxLabelPredicted in whole volume of the brain
    let maxLabelPredicted = 0
    const transpose = modelEntry.enableTranspose

    if (transpose) {
      cropped_slices_3d_w_pad = cropped_slices_3d_w_pad.transpose()
      console.log('Input transposed for pre-model')
    } else {
      console.log('Transpose not enabled for pre-model')
    }

    let i = 1
    const layersLength = res.layers.length
    console.log('res.layers.length ', layersLength)

    const isChannelLast = isModelChnlLast(res)
    const batchSize = opts.batchSize
    const numOfChan = opts.numOfChan

    // -- Adjust model input shape
    if (isChannelLast) {
      res.layers[0].batchInputShape[1] = cropped_slices_3d_w_pad.shape[0]
      res.layers[0].batchInputShape[2] = cropped_slices_3d_w_pad.shape[1]
      res.layers[0].batchInputShape[3] = cropped_slices_3d_w_pad.shape[2]

      adjusted_input_shape = [
        batchSize,
        res.layers[0].batchInputShape[1],
        res.layers[0].batchInputShape[2],
        res.layers[0].batchInputShape[3],
        numOfChan
      ]
    } else {
      res.layers[0].batchInputShape[2] = cropped_slices_3d_w_pad.shape[0]
      res.layers[0].batchInputShape[3] = cropped_slices_3d_w_pad.shape[1]
      res.layers[0].batchInputShape[4] = cropped_slices_3d_w_pad.shape[2]

      adjusted_input_shape = [
        batchSize,
        numOfChan,
        res.layers[0].batchInputShape[2],
        res.layers[0].batchInputShape[3],
        res.layers[0].batchInputShape[4]
      ]
    }

    console.log(' Model batch input shape : ', res.layers[0].batchInputShape)
    // -- batchInputShape {Array} input_shape - e.g. [?, D, H, W, Ch] or [?, Ch, D, H, W]

    statData.Input_Shape = JSON.stringify(res.layers[0].batchInputShape)
    statData.Output_Shape = JSON.stringify(res.output.shape)
    statData.Channel_Last = await isChannelLast
    statData.Model_Param = await getModelNumParameters(res)
    statData.Model_Layers = await getModelNumLayers(res)
    statData.Model = modelEntry.modelName
    // statData.Extra_Info = null

    const curTensor = []
    curTensor[0] = cropped_slices_3d_w_pad.reshape(adjusted_input_shape)
    // console.log("curTensor[0] :", curTensor[0].dataSync())

    while (true) {
      try {
        // -- curTensor[i] = res.layers[i].apply( curTensor[i-1])
        curTensor[i] = res.layers[i].apply(curTensor[i - 1], opts.deleteTextureThreshold)
      } catch (err) {
        callbackUI(err.message, -1, err.message)
        tf.engine().endScope()
        tf.engine().disposeVariables()

        statData.Inference_t = Infinity
        statData.Postprocess_t = Infinity
        statData.Status = 'Fail'
        statData.Error_Type = err.message
        statData.Extra_Err_Info = 'Failed while model layer ' + i + ' apply'

        callbackUI('', -1, '', statData)

        return 0
      }
      callbackUI('Layer ' + i.toString(), (i + 1) / layersLength)
      console.log('layer output Tensor shape : ', curTensor[i].shape)
      console.log('layer count params ', res.layers[i].countParams())
      res.layers[i].dispose()
      curTensor[i - 1].dispose()
      if (tf.memory().unreliable) {
        const unreliableReasons = 'unreliable reasons :' + tf.memory().reasons
        callbackUI(unreliableReasons, NaN, unreliableReasons)
      }

      if (i === layersLength - 1) {
        // prediction = res.layers[res.layers.length-1].apply(curTensor[i])
        // curTensor[i].print()
        // outputDataBeforArgmx = Array.from(curTensor[i].dataSync())

        const axis = isChannelLast ? -1 : 1
        console.log(' find argmax ')
        console.log('last Tensor shape : ', curTensor[i].shape)
        // -- curTensor[i].shape  e.g. [ 1, 256, 256, 256, 3 ]
        const expected_Num_labels = isChannelLast ? curTensor[i].shape[4] : curTensor[i].shape[1]
        let prediction_argmax

        // Try for argMax with model output tensor.

        try {
          const argMaxTime = performance.now()
          console.log(' Try tf.argMax for fullVolume ..')
          prediction_argmax = tf.argMax(curTensor[i], axis)
          console.log('tf.argMax for fullVolume takes : ', ((performance.now() - argMaxTime) / 1000).toFixed(4))
        } catch (err1) {
          // if channel last
          if (axis === -1) {
            try {
              const argMaxLargeTime = performance.now()
              console.log(' tf.argMax failed .. try argMaxLarge ..')
              callbackUI('', -1, 'tensor2LightBuffer() is not dead code?')
              callbackUI('', -1, 'argMaxLarge() is not dead code?')
              console.log(
                'argMaxLarge for fullVolume takes : ',
                ((performance.now() - argMaxLargeTime) / 1000).toFixed(4)
              )
            } catch (err2) {
              const errTxt = "argMax buffer couldn't be created due to limited memory resources."
              callbackUI(errTxt, -1, errTxt)

              tf.engine().endScope()
              tf.engine().disposeVariables()

              statData.Inference_t = Infinity
              statData.Postprocess_t = Infinity
              statData.Status = 'Fail'
              statData.Error_Type = err2.message
              statData.Extra_Err_Info = 'prediction_argmax from argMaxLarge failed'

              callbackUI('', -1, '', statData)
              return 0
            }
          } else {
            // if channel first ..
            const errTxt = "argMax buffer couldn't be created due to limited memory resources."
            callbackUI(errTxt, -1, errTxt)

            prediction_argmax.dispose()

            tf.engine().endScope()
            tf.engine().disposeVariables()

            statData.Inference_t = Infinity
            statData.Postprocess_t = Infinity
            statData.Status = 'Fail'
            statData.Error_Type = err1.message
            statData.Extra_Err_Info = 'prediction_argmax from argMaxLarge not support yet channel first'

            callbackUI('', -1, '', statData)

            return 0
          }
        }

        console.log(' prediction_argmax shape : ', prediction_argmax.shape)
        // -- prediction_argmax.shape  : [ 1, 256, 256, 256]

        const Inference_t = ((performance.now() - startTime) / 1000).toFixed(4)

        // outputDataBeforArgmx = Array.from(prediction_argmax.dataSync())
        tf.dispose(curTensor[i])
        console.log(' find array max ')
        const curBatchMaxLabel = await prediction_argmax.max().dataSync()[0]

        if (maxLabelPredicted < curBatchMaxLabel) {
          maxLabelPredicted = curBatchMaxLabel
        }

        const numSegClasses = maxLabelPredicted + 1
        console.log('numSegClasses', numSegClasses)
        statData.Actual_Labels = numSegClasses
        statData.Expect_Labels = expected_Num_labels
        statData.NumLabels_Match = numSegClasses === expected_Num_labels

        if (numSegClasses !== expected_Num_labels) {
          // errTxt = "expected " + expected_Num_labels + " labels, but the predicted are " + numSegClasses + ". For possible solutions please refer to <a href='https://github.com/neuroneural/brainchop/wiki/FAQ#Q3' target='_blank'><b> FAQ </b></a>.", "alert-error"
          const errTxt = 'expected ' + expected_Num_labels + ' labels, but the predicted are ' + numSegClasses
          callbackUI(errTxt, -1, errTxt)
        }

        // -- Transpose back to original unpadded size
        let outLabelVolume = prediction_argmax.reshape([
          cropped_slices_3d_w_pad.shape[0],
          cropped_slices_3d_w_pad.shape[1],
          cropped_slices_3d_w_pad.shape[2]
        ])
        tf.dispose(prediction_argmax)

        // Transpose MRI data to be match pytorch/keras input output
        if (transpose) {
          console.log('outLabelVolume transposed')
          outLabelVolume = outLabelVolume.transpose()
        }
        outLabelVolume = await removeZeroPaddingFrom3dTensor(outLabelVolume, pad, pad, pad)
        console.log(' outLabelVolume without padding shape :  ', outLabelVolume.shape)
        outLabelVolume = await resizeWithZeroPadding(
          outLabelVolume,
          num_of_slices,
          slice_height,
          slice_width,
          refVoxel,
          boundVolSizeArr
        )
        console.log(' outLabelVolume final shape after resizing :  ', outLabelVolume.shape)

        const filterOutWithPreMask = modelEntry.filterOutWithPreMask
        // To clean the skull area wrongly segmented in phase-2.
        if (pipeline1_out != null && opts.isBrainCropMaskBased && filterOutWithPreMask) {
          const bin = binarizeVolumeDataTensor(pipeline1_out)
          outLabelVolume = outLabelVolume.mul(bin)
        }

        startTime = performance.now()
        // Generate output volume or slices
        console.log('Generating correct output')

        try {
          const img = new Uint32Array(outLabelVolume.dataSync())
          const Vshape = outLabelVolume.shape
          const Vtype = outLabelVolume.dtype
          tf.dispose(outLabelVolume)
          tf.engine().endScope()
          tf.engine().disposeVariables()
          outimg = await generateOutputSlicesV2(
            img,
            Vshape,
            Vtype,
            num_of_slices,
            numSegClasses,
            slice_height,
            slice_width,
            modelEntry,
            opts,
            niftiImage
          )
          console.log(' Phase-2 num of tensors after generateOutputSlicesV2: ', tf.memory().numTensors)
        } catch (error) {
          // -- Timing data to collect
          tf.engine().endScope()
          tf.engine().disposeVariables()

          const errTxt = 'Failed while generating output due to limited browser memory available'
          callbackUI(errTxt, -1, errTxt)
          statData.Inference_t = Inference_t
          statData.Postprocess_t = Infinity
          statData.Status = 'Fail'
          statData.Error_Type = error.message
          statData.Extra_Err_Info = 'Failed while generating output'

          callbackUI('', -1, '', statData)

          return 0
        }

        const Postprocess_t = ((performance.now() - startTime) / 1000).toFixed(4)

        tf.engine().disposeVariables()

        console.log(
          'Processing the whole brain volume in tfjs for multi-class output mask took : ',
          ((performance.now() - inferenceStartTime) / 1000).toFixed(4) + '  Seconds'
        )

        // -- Timing data to collect
        statData.Inference_t = Inference_t
        statData.Postprocess_t = Postprocess_t
        statData.Status = 'OK'
        callbackUI('Segmentation finished', 0)
        callbackUI('', -1, '', statData)
        callbackImg(outimg, opts, modelEntry)

        return 0
      }
      i++
    }
  } catch (err) {
    callbackUI(err.message, -1, err.message)
    console.log(
      'If webgl context is lost, try to restore webgl context by visit the link ' +
        '<a href="https://support.biodigital.com/hc/en-us/articles/218322977-How-to-turn-on-WebGL-in-my-browser">here</a>'
    )
  }
}

async function inferenceFullVolumePhase1(
  model,
  slices_3d,
  num_of_slices,
  slice_height,
  slice_width,
  isModelFullVol,
  modelEntry,
  statData,
  opts,
  niftiHeader,
  niftiImage
) {
  statData.No_SubVolumes = 1
  // load pre-model for inference first, can be null if no pre-model such as GWM models
  if (modelEntry.preModelId) {
    const preModel = await load_model(opts.rootURL + inferenceModelsList[modelEntry.preModelId - 1].path)
    const transpose = inferenceModelsList[modelEntry.preModelId - 1].enableTranspose
    const quantileNorm = inferenceModelsList[modelEntry.preModelId - 1].enableQuantileNorm
    let preModel_slices_3d = null

    // -- If pre-model is not null then slices_3d mask will be generated..
    // -- The mask is needed to remove the skull and set noise in background to 0, and get the brain bounding volume properly
    const slices_3d_mask = null

    if (quantileNorm) {
      // Quantile normalize function needs specific models to be used
      console.log('preModel Quantile normalization enabled')
      preModel_slices_3d = await quantileNormalizeVolumeData(slices_3d)
    } else {
      // Min Max Nomalize MRI data to be from 0 to 1
      console.log('preModel Min Max normalization enabled')
      preModel_slices_3d = await minMaxNormalizeVolumeData(slices_3d)
    }

    // -- Transpose MRI data to be match pytorch/keras input output
    // -- Check if pre-model needs transpose..
    if (transpose) {
      preModel_slices_3d = preModel_slices_3d.transpose()
      console.log('Input transposed for pre-model')
    } else {
      console.log('Transpose not enabled for pre-model')
    }

    statData.Brainchop_Ver = 'PreModel_FV' // e.g. "PreModel_FV"

    // preModel.then(function (res) {
    const res = await preModel

    try {
      const inferenceStartTime = performance.now()
      const preModelObject = res

      // read input shape from model.json object
      const preModelBatchInputShape = preModelObject.layers[0].batchInputShape
      console.log(' Pre-Model batch input shape : ', preModelBatchInputShape)

      // -- Verify input shape
      if (preModelBatchInputShape.length !== 5) {
        const errTxt = 'The pre-model input shape must be 5D '
        callbackUI(errTxt, -1, errTxt)
        return 0
      }

      const isPreModelChannelLast = await isModelChnlLast(preModelObject)
      const batchSize = opts.batchSize
      const numOfChan = opts.numOfChan
      let batch_D, batch_H, batch_W
      let preModel_input_shape
      if (isPreModelChannelLast) {
        console.log('Pre-Model Channel Last')
        if (isNaN(preModelBatchInputShape[4]) || preModelBatchInputShape[4] !== 1) {
          const errTxt = 'The number of channels for pre-model input shape must be 1'
          callbackUI(errTxt, -1, errTxt)
          return 0
        }

        batch_D = preModelBatchInputShape[1]
        batch_H = preModelBatchInputShape[2]
        batch_W = preModelBatchInputShape[3]

        preModel_input_shape = [batchSize, batch_D, batch_H, batch_W, numOfChan]
      } else {
        console.log('Pre-Model Channel First')
        if (isNaN(preModelBatchInputShape[1]) || preModelBatchInputShape[1] !== 1) {
          const errTxt = 'The number of channels for pre-model input shape must be 1'
          callbackUI(errTxt, -1, errTxt)
          return 0
        }

        batch_D = preModelBatchInputShape[2]
        batch_H = preModelBatchInputShape[3]
        batch_W = preModelBatchInputShape[4]

        preModel_input_shape = [batchSize, numOfChan, batch_D, batch_H, batch_W]
      }

      statData.Input_Shape = JSON.stringify(preModel_input_shape)
      statData.Output_Shape = JSON.stringify(preModelObject.output.shape)
      statData.Channel_Last = await isPreModelChannelLast
      statData.Model_Param = await getModelNumParameters(preModelObject)
      statData.Model_Layers = await getModelNumLayers(preModelObject)

      // maxLabelPredicted in whole volume of the brain
      let maxLabelPredicted = 0

      let i = 1
      const layersLength = res.layers.length

      const curTensor = []
      // -- reshape MRI to model input shape
      curTensor[0] = preModel_slices_3d.reshape(preModel_input_shape)

      // Dispose the volume
      tf.dispose(preModel_slices_3d)
      while (true) {
        try {
          curTensor[i] = res.layers[i].apply(curTensor[i - 1], opts.deleteTextureThreshold)
        } catch (err) {
          const errTxt = 'Your graphics card (e.g. Intel) may not be compatible with WebGL. ' + err.message
          callbackUI(errTxt, -1, errTxt)

          tf.engine().endScope()
          tf.engine().disposeVariables()

          statData.Inference_t = Infinity
          statData.Postprocess_t = Infinity
          statData.Status = 'Fail'
          statData.Error_Type = err.message
          statData.Extra_Err_Info = 'PreModel Failed while model layer ' + i + ' apply'

          callbackUI('', -1, '', statData)

          return 0
        }

        res.layers[i].dispose()
        curTensor[i - 1].dispose()

        callbackUI('Layer ' + i.toString(), (i + 1) / layersLength)
        if (tf.memory().unreliable) {
          const unreliableReasons = 'unreliable reasons :' + tf.memory().reasons
          callbackUI(unreliableReasons, NaN, unreliableReasons)
        }

        if (i === layersLength - 1) {
          // -- prediction = res.layers[res.layers.length-1].apply(curTensor[i])
          // -- curTensor[i].print()
          // -- outputDataBeforArgmx = Array.from(curTensor[i].dataSync())

          const axis = isPreModelChannelLast ? -1 : 1
          console.log(' find argmax ')
          console.log('last Tensor shape : ', curTensor[i].shape)
          // -- curTensor[i].shape  : [ 1, 256, 256, 256, 3 ]
          const expected_Num_labels = isPreModelChannelLast ? curTensor[i].shape[4] : curTensor[i].shape[1]
          let prediction_argmax

          // Try for argMax with model output tensor.

          try {
            console.log(' Try tf.argMax for fullVolume ..')
            prediction_argmax = await tf.argMax(curTensor[i], axis)
          } catch (err1) {
            // if channel last
            if (axis === -1) {
              try {
                const argMaxLargeTime = performance.now()
                console.log(' tf.argMax failed .. try argMaxLarge ..')
                callbackUI('', -1, 'tensor2LightBuffer() is not dead code?')
                callbackUI('', -1, 'argMaxLarge() is not dead code?')
                console.log(
                  'argMaxLarge for fullVolume takes : ',
                  ((performance.now() - argMaxLargeTime) / 1000).toFixed(4)
                )
              } catch (err2) {
                const errTxt = "argMax buffer couldn't be created due to limited memory resources."
                callbackUI(errTxt, -1, errTxt)

                prediction_argmax.dispose()

                tf.engine().endScope()
                tf.engine().disposeVariables()

                statData.Inference_t = Infinity
                statData.Postprocess_t = Infinity
                statData.Status = 'Fail'
                statData.Error_Type = err2.message
                statData.Extra_Err_Info = 'preModel prediction_argmax from argMaxLarge failed'

                callbackUI('', -1, '', statData)

                return 0
              }
            } else {
              // if channel first ..
              const errTxt = "argMax buffer couldn't be created due to limited memory resources."
              callbackUI(errTxt, -1, errTxt)

              prediction_argmax.dispose()

              tf.engine().endScope()
              tf.engine().disposeVariables()

              statData.Inference_t = Infinity
              statData.Postprocess_t = Infinity
              statData.Status = 'Fail'
              statData.Error_Type = err1.message
              statData.Extra_Err_Info = 'preModel prediction_argmax from argMaxLarge not support yet channel first'

              callbackUI('', -1, '', statData)

              return 0
            }
          }

          console.log(' Pre-model prediction_argmax shape : ', prediction_argmax.shape)
          // -- prediction_argmax.shape  : [ 1, 256, 256, 256]

          const Inference_t = ((performance.now() - inferenceStartTime) / 1000).toFixed(4)

          tf.dispose(curTensor[i])

          console.log(' Pre-model find array max ')
          const curBatchMaxLabel = await prediction_argmax.max().dataSync()[0]

          if (maxLabelPredicted < curBatchMaxLabel) {
            maxLabelPredicted = curBatchMaxLabel
          }

          const numSegClasses = maxLabelPredicted + 1
          console.log('Pre-model numSegClasses', numSegClasses)

          statData.Actual_Labels = numSegClasses
          statData.Expect_Labels = expected_Num_labels
          statData.NumLabels_Match = numSegClasses === expected_Num_labels

          // -- Transpose back to original unpadded size
          let outLabelVolume = await prediction_argmax.reshape([num_of_slices, slice_height, slice_width])
          tf.dispose(prediction_argmax)
          // Transpose MRI data to be match pytorch/keras input output
          if (transpose) {
            console.log('Pre-model outLabelVolume transposed')
            outLabelVolume = outLabelVolume.transpose()
          }
          const startTime = performance.now()
          // Generate output volume or slices
          console.log('Generating pre-model output')
          let slices_3d_mask
          try {
            const unstackOutVolumeTensor = await tf.unstack(outLabelVolume)
            slices_3d_mask = await generateBrainMask(
              unstackOutVolumeTensor,
              num_of_slices,
              slice_height,
              slice_width,
              modelEntry,
              opts,
              niftiHeader,
              niftiImage,
              false
            )
            await tf.dispose(outLabelVolume)
            console.log(' Phase-1 num of tensors after generateBrainMask: ', tf.memory().numTensors)
          } catch (error) {
            // -- Timing data to collect
            tf.engine().endScope()
            tf.engine().disposeVariables()

            const errTxt = 'Failed while generating pre-model output due to limited browser memory available'
            callbackUI(errTxt, -1, errTxt)

            statData.Inference_t = Inference_t
            statData.Postprocess_t = Infinity
            statData.Status = 'Fail'
            statData.Error_Type = error.message
            statData.Extra_Err_Info = 'Pre-model failed while generating output'

            callbackUI('', -1, '', statData)

            return 0
          }
          const Postprocess_t = ((performance.now() - startTime) / 1000).toFixed(4)
          console.log(
            'Pre-model processing the whole brain volume in tfjs tooks for multi-class output mask : ',
            ((performance.now() - inferenceStartTime) / 1000).toFixed(4) + '  Seconds'
          )

          // -- Timing data to collect
          statData.Inference_t = Inference_t
          statData.Postprocess_t = Postprocess_t
          statData.Status = 'OK'

          callbackUI('', -1, '', statData)

          if (slices_3d_mask == null) {
            const msg = 'slice_3d_mask failed ...'
            callbackUI(msg, -1, msg)
            return 0
          } else {
            // --Phase-2, After remove the skull try to allocate brain volume and make inferece
            console.log('--- pre-model done ---')
            // --mask_3d = slices_3d_mask.greater([0]).asType('bool')
            // --slices_3d_mask.dispose()

            if (isModelFullVol) {
              if (modelEntry.enableSeqConv) {
                // Mask cropping & seq conv
                // Non-Atlas model (e.g. GWM) needs sequential convolution layer.
                // Sequential convolution layer to be used after cropping - slow but reliable on most machines
                console.log('------ Mask Cropping & Seq Convoluton ------')
                await inferenceFullVolumeSeqCovLayerPhase2(
                  opts,
                  modelEntry,
                  model,
                  slices_3d,
                  num_of_slices,
                  slice_height,
                  slice_width,
                  slices_3d_mask,
                  statData,
                  niftiImage
                )
                return 0
                // inferenceFullVolumeSeqCovLayerPhase2(model, slices_3d.transpose(), num_of_slices, slice_height, slice_width, slices_3d_mask)
              } else {
                // Mask cropping BUT no seq conv
                console.log('------ Mask Cropping  -  NO Seq Convoluton ------')
                await inferenceFullVolumePhase2(
                  model,
                  slices_3d,
                  num_of_slices,
                  slice_height,
                  slice_width,
                  slices_3d_mask,
                  modelEntry,
                  statData,
                  opts,
                  niftiImage
                )
                // inferenceFullVolumePhase2(model, slices_3d.transpose(), num_of_slices, slice_height, slice_width, slices_3d_mask)
              }
            } else {
              // -- In version 3.0.0 this function not used
              callbackUI('', -1, 'inferenceSubVolumes() is not dead code?')
            }
          }
        }
        i++
      }
    } catch (err) {
      callbackUI(err.message, -1, err.message)
      console.log(
        'If webgl context is lost, try to restore webgl context by visit the link ' +
          '<a href="https://support.biodigital.com/hc/en-us/articles/218322977-How-to-turn-on-WebGL-in-my-browser">here</a>'
      )

      // document.getElementById("webGl2Status").style.backgroundColor =  isWebGL2ContextLost() ? "Red" : "Green"
      // document.getElementById("memoryStatus").style.backgroundColor =  tf.memory().unreliable ? "Red" : "Green"
    }
    // })

    // -- if(...)  end
  } else {
    // No preModel

    // --Phase-2, After remove the skull try to allocate brain volume and make inferece
    console.log('--- No pre-model is selected ---')
    console.log('------ Run voxel cropping ------')
    // -- mask_3d = slices_3d.greater([0]).asType('bool')

    if (isModelFullVol) {
      if (modelEntry.enableSeqConv) {
        // Voxel cropping & seq conv
        // Non-Atlas model (e.g. GWM) needs sequential convolution layer.
        // Sequential convolution layer to be used after cropping - slow but reliable on most machines
        console.log('------ Seq Convoluton ------')
        await inferenceFullVolumeSeqCovLayerPhase2(
          opts,
          modelEntry,
          model,
          slices_3d,
          num_of_slices,
          slice_height,
          slice_width,
          null,
          statData,
          niftiImage
        )
      } else {
        // Voxel cropping BUT no seq conv
        // todo: we do not use result const outimg = await
        inferenceFullVolumePhase2(
          model,
          slices_3d,
          num_of_slices,
          slice_height,
          slice_width,
          null,
          modelEntry,
          statData,
          opts,
          niftiImage
        )
      }
    } else {
      // -- In version 3.0.0 this function not used
      callbackUI('', -1, 'inferenceSubVolumes() is not dead code?')
    }
  }
}

async function enableProductionMode(textureF16Flag = true, deleteTextureThreshold = 0) {
  // -- tf.setBackend('cpu')
  tf.setBackend('webgl')
  // -- tf.removeBackend('cpu')
  // -- Calling enableProdMode() method
  await tf.enableProdMode()
  // -- Setting debug mode of the  environment
  tf.env().set('DEBUG', false)
  tf.env().set('WEBGL_FORCE_F16_TEXTURES', textureF16Flag)
  // -- set this flag so that textures are deleted when tensors are disposed.
  tf.env().set('WEBGL_DELETE_TEXTURE_THRESHOLD', deleteTextureThreshold)
  // -- tf.env().set('WEBGL_PACK', false)
  // -- Put ready after sets above
  await tf.ready()
  // -- Printing output
  console.log('tf env() flags :', tf.env().flags)
  console.log('tf env() features :', tf.env().features)
  console.log('tf env total features: ', Object.keys(tf.env().features).length)
  console.log('tf backend: ', tf.getBackend())
}

async function runInferenceWW(opts, modelEntry, niftiHeader, niftiImage) {
  const statData = []
  statData.startTime = Date.now() // for common webworker/mainthread do not use performance.now()
  callbackUI('Segmentation started', 0)
  const batchSize = opts.batchSize
  const numOfChan = opts.numOfChan
  if (isNaN(batchSize) || batchSize !== 1) {
    const errTxt = 'The batch Size for input shape must be 1'
    callbackUI(errTxt, -1, errTxt)
    return 0
  }
  if (isNaN(numOfChan) || numOfChan !== 1) {
    const errTxt = 'The number of channels for input shape must be 1'
    callbackUI(errTxt, -1, errTxt)
    return 0
  }
  tf.engine().startScope()
  console.log('Batch size: ', batchSize)
  console.log('Num of Channels: ', numOfChan)
  const model = await load_model(opts.rootURL + modelEntry.path)
  await enableProductionMode(true, opts.deleteTextureThreshold)
  statData.TF_Backend = tf.getBackend()
  const modelObject = model
  let batchInputShape = []
  // free global variable of 16777216 voxel
  // allOutputSlices3DCC1DimArray = []
  // outputSceneRendered = false
  // read input shape from model.json object
  batchInputShape = modelObject.layers[0].batchInputShape
  console.log(' Model batch input shape : ', batchInputShape)
  // -- Verify input shape
  if (batchInputShape.length !== 5) {
    const errTxt = 'The model input shape must be 5D'
    callbackUI(errTxt, -1, errTxt)
    return 0
  }
  let batch_D, batch_H, batch_W
  const slice_width = niftiHeader.dims[1]
  const slice_height = niftiHeader.dims[2]
  const num_of_slices = niftiHeader.dims[3]
  const isChannelLast = await isModelChnlLast(modelObject)
  if (isChannelLast) {
    console.log('Model Channel Last')
    if (isNaN(batchInputShape[4]) || batchInputShape[4] !== 1) {
      const errTxt = 'The number of channels for input shape must be 1'
      callbackUI(errTxt, -1, errTxt)
      return 0
    }
    batch_D = batchInputShape[1]
    batch_H = batchInputShape[2]
    batch_W = batchInputShape[3]
  } else {
    console.log('Model Channel First')
    if (isNaN(batchInputShape[1]) || batchInputShape[1] !== 1) {
      const errTxt = 'The number of channels for input shape must be 1'
      callbackUI(errTxt, -1, errTxt)
      return 0
    }
    batch_D = batchInputShape[2]
    batch_H = batchInputShape[3]
    batch_W = batchInputShape[4]
  }
  // const input_shape = [batchSize, numOfChan, batch_D, batch_H, batch_W]
  // --Check whether the model will make inference at once as FullVolumeModel
  let isModelFullVol
  if (batch_D === 256 && batch_H === 256 && batch_W === 256) {
    isModelFullVol = true
  } else {
    isModelFullVol = false
  }
  statData.isModelFullVol = isModelFullVol
  // Model output number of segmentations
  let slices_3d = await getAllSlicesDataAsTF3D(num_of_slices, niftiHeader, niftiImage)
  const transpose = modelEntry.enableTranspose
  const enableCrop = modelEntry.enableCrop
  if (isModelFullVol) {
    if (enableCrop) {
      // FullVolume with Crop option before inference ..
      // pre-model to mask the volume, can also be null and the cropping will be on the MRI.
      await inferenceFullVolumePhase1(
        model,
        slices_3d,
        num_of_slices,
        slice_height,
        slice_width,
        isModelFullVol,
        modelEntry,
        statData,
        opts,
        niftiHeader,
        niftiImage
      )
    } else {
      // Transpose MRI data to be match pytorch/keras input output
      console.log('Cropping Disabled')

      if (transpose) {
        slices_3d = slices_3d.transpose()
        console.log('Input transposed')
      } else {
        console.log('Transpose NOT Enabled')
      }

      const enableSeqConv = modelEntry.enableSeqConv

      if (enableSeqConv) {
        callbackUI('', -1, 'inferenceFullVolumeSeqCovLayer() is not dead code?')
      } else {
        callbackUI('', -1, 'inferenceFullVolume() is not dead code?')
      }
    }
  }
}

self.addEventListener(
  'message',
  function (event) {
    runInferenceWW(event.data.opts, event.data.modelEntry, event.data.niftiHeader, event.data.niftiImage)
  },
  false
)
