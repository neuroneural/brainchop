import * as tf from '@tensorflow/tfjs'
import { inferenceModelsList } from './brainchop-parameters.js'
import { runFullVolumeInference } from './inference-logic.js'

import {
    generateBrainMask,
    getAllSlicesDataAsTF3D,
    getModelNumLayers,
    getModelNumParameters,
    isModelChnlLast,
    load_model,
    minMaxNormalizeVolumeData,
    quantileNormalizeVolumeData,
} from './tensor-utils.js';


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
  callbackImg,
  callbackUI,
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
      preModel_slices_3d = await preModel_slices_3d.transpose()
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

      const isPreModelChannelLast = isModelChnlLast(preModelObject)
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
      statData.Channel_Last = isPreModelChannelLast
      statData.Model_Param = await getModelNumParameters(preModelObject)
      statData.Model_Layers = await getModelNumLayers(preModelObject)

      // maxLabelPredicted in whole volume of the brain
      let maxLabelPredicted = 0
      const delay = inferenceModelsList[modelEntry.preModelId - 1].inferenceDelay

      let i = 1
      const layersLength = res.layers.length

      const curTensor = []
      // -- reshape MRI to model input shape
      curTensor[0] = preModel_slices_3d.reshape(preModel_input_shape)

      // Dispose the volume
      tf.dispose(preModel_slices_3d)

      const timer = window.setInterval(async function () {
        try {
          curTensor[i] = await res.layers[i].apply(curTensor[i - 1])
        } catch (err) {
          const errTxt = 'Your graphics card (e.g. Intel) may not be compatible with WebGL. ' + err.message
          callbackUI(errTxt, -1, errTxt)

          window.clearInterval(timer)
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
          window.clearInterval(timer)

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
                window.alert('tensor2LightBuffer() is not dead code?')
                window.alert('argMaxLarge() is not dead code?')
                console.log(
                  'argMaxLarge for fullVolume takes : ',
                  ((performance.now() - argMaxLargeTime) / 1000).toFixed(4)
                )
              } catch (err2) {
                const errTxt = "argMax buffer couldn't be created due to limited memory resources."
                callbackUI(errTxt, -1, errTxt)

                prediction_argmax.dispose()

                window.clearInterval(timer)
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

              window.clearInterval(timer)
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
              callbackUI,
              callbackImg,
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
                runFullVolumeInference(
                    opts,
                    modelEntry,
                    model,
                    slices_3d,
                    slices_3d_mask,
                    statData,
                    callbackImg,
                    callbackUI,
                    niftiImage
                );
            } else {
              // -- In version 3.0.0 this function not used
              window.alert('inferenceSubVolumes() is not dead code?')
            }
          }
        }
        i++
      }, delay)
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
        runFullVolumeInference(
            opts,
            modelEntry,
            model,
            slices_3d,
            null,
            statData,
            callbackImg,
            callbackUI,
            niftiImage
        );
    } else {
      // -- In version 3.0.0 this function not used
      window.alert('inferenceSubVolumes() is not dead code?')
    }
  }
}

async function enableProductionMode(textureF16Flag = true) {
  // -- tf.setBackend('cpu')
  // -- tf.removeBackend('cpu')
  // -- Calling enableProdMode() method
  await tf.enableProdMode()
  // -- Setting debug mode of the  environment
  tf.env().set('DEBUG', false)
  tf.env().set('WEBGL_FORCE_F16_TEXTURES', textureF16Flag)
  // -- set this flag so that textures are deleted when tensors are disposed.
  tf.env().set('WEBGL_DELETE_TEXTURE_THRESHOLD', -1)
  // -- tf.env().set('WEBGL_PACK', false)
  // -- Put ready after sets above
  await tf.ready()
  // -- Printing output
  console.log('tf env() flags :', tf.env().flags)
  console.log('tf env() features :', tf.env().features)
  console.log('tf env total features: ', Object.keys(tf.env().features).length)
  console.log(tf.getBackend())
}

export async function runInference(opts, modelEntry, niftiHeader, niftiImage, callbackImg, callbackUI) {
  const statData = []
  statData.startTime = Date.now() // for common webworker/mainthread do not use performance.now()
  callbackUI('Segmentation started', 0)
  const startTime = performance.now()
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
  await enableProductionMode(true)
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
  //  //-- Atlas version check
  // if ( (batch_D > 30) && (batch_H == 256) && (batch_W == 256) ) {
  //    const errTxt = "The subvolume dimension in z-axis shouldn't exceed 30 number of slices for browser limitation"
  //    callbackUI(errTxt, -1, errTxt)
  //    return 0
  // }
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
        callbackImg,
        callbackUI,
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
        console.log('Seq Convoluton Enabled')
        window.alert('inferenceFullVolumeSeqCovLayer() is not dead code?')
      } else {
        console.log('Seq Convoluton Disabled')
        window.alert('inferenceFullVolume() is not dead code?')
      }
    }
  }
}
