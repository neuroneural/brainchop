import * as tf from '@tensorflow/tfjs'
import { BWLabeler } from './bwlabels.js'

export async function addZeroPaddingTo3dTensor(tensor3d, rowPadArr = [1, 1], colPadArr = [1, 1], depthPadArr = [1, 1]) {
  if (tensor3d.rank !== 3) {
    throw new Error('Tensor must be 3D');
  }

  const [height, width, depth] = tensor3d.shape;

  const adjustPadding = (size, padding) => {
    const totalPad = padding[0] + padding[1];
    if (size + totalPad > 256) {
      const scale = (256 - size) / totalPad;
      return [Math.floor(padding[0] * scale), Math.floor(padding[1] * scale)];
    }
    return padding;
  };

  return tensor3d.pad([
    adjustPadding(height, rowPadArr),
    adjustPadding(width, colPadArr),
    adjustPadding(depth, depthPadArr)
  ]);
}

// export async function addZeroPaddingTo3dTensor(tensor3d, rowPadArr = [1, 1], colPadArr = [1, 1], depthPadArr = [1, 1]) {
//   if (tensor3d.rank !== 3) {
//     throw new Error('Tensor must be 3D')
//   }
//   return tensor3d.pad([rowPadArr, colPadArr, depthPadArr])
// }

export async function applyMriThreshold(tensor, percentage) {
  // Perform asynchronous operations outside of tf.tidy
  const maxTensor = tensor.max()
  const thresholdTensor = maxTensor.mul(percentage)
  const threshold = await thresholdTensor.data() // Extracts the threshold value

  // Dispose tensors not needed anymore
  maxTensor.dispose()
  thresholdTensor.dispose()

  // Use tf.tidy for synchronous operations
  return tf.tidy(() => {
    const dataForProcessing = tensor.clone()

    // Thresholding (assuming background has very low values compared to the head)
    const mask = dataForProcessing.greater(threshold[0])
    // -- const denoisedMriData = dataForProcessing.mul(mask)

    // No need to  manually dispose dataForProcessing and mask, as tf.tidy() will dispose them auto.
    return mask
  })

  // -- return denoisedMriData
}

export async function binarizeVolumeDataTensor(volumeDataTensor) {
  const alpha = 0
  // element-wise: (x > 0 ? 1 : alpha * x );  e.g. Tenosr [0, 0.9, 0.8, -3] => Tensor [0, 1, 1, 0]
  return volumeDataTensor.step(alpha)
}

async function calculateQuantiles(tensor, lowerQuantile = 0.01, upperQuantile = 0.99) {
  // Flatten the tensor
  const flatTensor = tensor.flatten()

  // Convert the flattened tensor to an array to sort it
  const flatArray = await flatTensor.array()
  flatArray.sort((a, b) => a - b) // Sort the array in ascending order

  // Convert the sorted array back to a tensor
  const sortedTensor = tf.tensor1d(flatArray)

  // Calculate the indices for the quantiles
  const numElements = sortedTensor.shape[0]
  const lowIndex = Math.floor(numElements * lowerQuantile)
  const highIndex = Math.ceil(numElements * upperQuantile) - 1 // Subtract 1 because indices are 0-based

  // Slice the sorted tensor to get qmin and qmax
  const qmin = sortedTensor.slice(lowIndex, 1) // Get the value at the low index
  const qmax = sortedTensor.slice(highIndex, 1) // Get the value at the high index

  // Get the actual values from the tensors
  const qminValue = (await qmin.array())[0]
  const qmaxValue = (await qmax.array())[0]

  // Clean up tensors to free memory
  flatTensor.dispose()
  sortedTensor.dispose()
  qmin.dispose()
  qmax.dispose()

  return { qmin: qminValue, qmax: qmaxValue }
}

export async function convByOutputChannelAndInputSlicing(input, filter, biases, stride, pad, dilationRate, sliceSize) {
  const inChannels = input.shape[4]
  const outChannels = filter.shape[4]

  // Create an empty array to hold the output channels
  let outputChannels = null

  // Slice the input tensor and process one output channel at a time
  for (let channel = 0; channel < outChannels; channel++) {
    const numSlices = Math.ceil(inChannels / sliceSize)
    let outputChannel = null

    for (let i = 0; i < numSlices; i++) {
      const startChannel = i * sliceSize
      const endChannel = Math.min((i + 1) * sliceSize, inChannels)

      // Only proceed if there are channels to process
      if (startChannel < inChannels) {
        const resultSlice = tf.tidy(() => {
          const inputSlice = input.slice([0, 0, 0, 0, startChannel], [-1, -1, -1, -1, endChannel - startChannel])
          const filterSlice = filter.slice([0, 0, 0, startChannel, channel], [-1, -1, -1, endChannel - startChannel, 1])
          // Perform the convolution for the current slice and output channel
          return tf.conv3d(inputSlice, filterSlice, stride, pad, 'NDHWC', dilationRate)
        })

        if (outputChannel === null) {
          outputChannel = resultSlice
        } else {
          const updatedOutputChannel = outputChannel.add(resultSlice)
          outputChannel.dispose()
          resultSlice.dispose()
          outputChannel = updatedOutputChannel
        }
      }
    }

    // --- Start of Fix ---
    // This variable will hold the final result for this channel, after bias is (optionally) added.
    let biasedOutputChannel;

    // Check if the biases tensor was actually provided for this layer.
    if (biases) {
      // If biases exist, slice the correct one for this channel and add it.
      const biasesSlice = biases.slice([channel], [1]);
      biasedOutputChannel = outputChannel.add(biasesSlice);
      outputChannel.dispose();
      biasesSlice.dispose();
    } else {
      // If no biases exist, the result is simply the accumulated convolution output.
      biasedOutputChannel = outputChannel;
    }
    // --- End of Fix ---

    // Accumulate the channel to the output array
    if (outputChannels == null) {
      outputChannels = biasedOutputChannel
    } else {
      const updatedOutputChannels = await tf.concat([outputChannels, biasedOutputChannel], 4)
      biasedOutputChannel.dispose()
      outputChannels.dispose()
      outputChannels = updatedOutputChannels
    }
  }

  return outputChannels
}

/**
 * Applies instance normalization to a single-channel 3D tensor.
 * Normalizes the tensor over its depth, height, and width.
 * @param {tf.Tensor} x A 5D tensor of shape [1, D, H, W, 1].
 * @param {number} epsilon A small float added to variance to avoid dividing by zero.
 * @returns {tf.Tensor} The normalized tensor.
 */
function instanceNorm(x, epsilon = 1e-5) {
  return tf.tidy(() => {
    // Axes [1, 2, 3] correspond to Depth, Height, Width.
    const { mean, variance } = tf.moments(x, [1, 2, 3], true);
    const invStd = tf.rsqrt(variance.add(epsilon));
    return x.sub(mean).mul(invStd);
  });
}


export async function gn_convByOutputChannelAndInputSlicing(input, filter, biases, stride, pad, dilationRate, sliceSize) {

//    const finalResult = tf.tidy(() => {
  const inChannels = input.shape[4];
  const outChannels = filter.shape[4];

  let outputChannels = null;

  for (let channel = 0; channel < outChannels; channel++) {
    // This section computes a single channel's convolution.
    const numSlices = Math.ceil(inChannels / sliceSize);
    let outputChannel = null;
    for (let i = 0; i < numSlices; i++) {
      const startChannel = i * sliceSize;
      const endChannel = Math.min((i + 1) * sliceSize, inChannels);
      if (startChannel < inChannels) {
        const resultSlice = tf.tidy(() => {
          const inputSlice = input.slice([0, 0, 0, 0, startChannel], [-1, -1, -1, -1, endChannel - startChannel]);
          const filterSlice = filter.slice([0, 0, 0, startChannel, channel], [-1, -1, -1, endChannel - startChannel, 1]);
          return tf.conv3d(inputSlice, filterSlice, stride, pad, 'NDHWC', dilationRate);
        });
        if (outputChannel === null) {
          outputChannel = resultSlice;
        } else {
          const updatedOutputChannel = outputChannel.add(resultSlice);
          outputChannel.dispose();
          resultSlice.dispose();
          outputChannel = updatedOutputChannel;
        }
      }
    }

    let biasedOutputChannel;
    if (biases) {
      const biasesSlice = biases.slice([channel], [1]);
      biasedOutputChannel = outputChannel.add(biasesSlice);
      outputChannel.dispose();
      biasesSlice.dispose();
    } else {
      biasedOutputChannel = outputChannel;
    }

    // --- KEY CHANGE ---
      // Apply instance normalization to the resulting channel.
    // Apply normalization
    const normalizedChannel = instanceNorm(biasedOutputChannel);
    biasedOutputChannel.dispose();

    // Incremental concatenation
    if (outputChannels === null) {
      outputChannels = normalizedChannel;
    } else {
      const updatedOutputChannels = await tf.concat([outputChannels, normalizedChannel], 4);
      normalizedChannel.dispose();
      outputChannels.dispose();
      outputChannels = updatedOutputChannels;
    }
  }

  return outputChannels;
    }// );
//     return finalResult;
// }

/**
 * Applies instance normalization to a tensor and disposes the input tensor
 * to simulate an in-place operation, minimizing peak memory usage.
 * Assumes input shape [1, D, H, W, C]. Normalization is per-channel.
 *
 * @param {tf.Tensor} x The input tensor to normalize.
 * @param {number} [epsilon=1e-5] A small float added to variance to avoid division by zero.
 * @returns {tf.Tensor} The new, normalized tensor.
 */
export function LayerNormInPlace(x, epsilon = 1e-5) {
  return tf.tidy(() => {
    const { mean, variance } = tf.moments(x, [1, 2, 3], true);
    const invStd = tf.rsqrt(tf.add(variance, epsilon));
    return tf.mul(tf.sub(x, mean), invStd);
  });
}

export async function draw3dObjBoundingVolume(unstackOutVolumeTensor, opts, modelEntry, callbackImg) {
  const allOutputSlices3DCC = []

  // dataSync() using to flatten array. Takes around 1.5 s
  for (let sliceTensorIdx = 0; sliceTensorIdx < unstackOutVolumeTensor.length; sliceTensorIdx++) {
    allOutputSlices3DCC[sliceTensorIdx] = Array.from(unstackOutVolumeTensor[sliceTensorIdx].dataSync())
  }

  // Use this conversion to download output slices as nii file. Takes around 30 ms
  // does not use `push` to avoid stack overflows. In future: consider .set() with typed arrays
  const allOutputSlices3DCC1DimArray = new Array(allOutputSlices3DCC[0].length * allOutputSlices3DCC.length)
  let index = 0
  for (let sliceIdx = 0; sliceIdx < allOutputSlices3DCC.length; sliceIdx++) {
    for (let i = 0; i < allOutputSlices3DCC[sliceIdx].length; i++) {
      allOutputSlices3DCC1DimArray[index++] = allOutputSlices3DCC[sliceIdx][i]
    }
  }
  console.log('Done with allOutputSlices3DCC1DimArray ')
  const brainMaskTensor1d = await binarizeVolumeDataTensor(tf.tensor1d(allOutputSlices3DCC1DimArray))
  const brainOut = Array.from(brainMaskTensor1d.dataSync())
  callbackImg(brainOut, opts, modelEntry)
}
// return first and last non-zero voxel in row (dim = 0), column (1) or slice (2) dimension
async function firstLastNonZero(tensor3D, dim = 0) {
  let mxs = []
  if (dim === 0) {
    mxs = await tensor3D.max(2).max(1).arraySync()
  } else if (dim === 1) {
    mxs = await tensor3D.max(2).max(0).arraySync()
  } else {
    mxs = await tensor3D.max(1).max(0).arraySync()
  }
  let mn = mxs.length
  let mx = 0
  for (let i = 0; i < mxs.length; i++) {
    if (mxs[i] > 0) {
      mn = i
      break
    }
  }
  for (let i = mxs.length - 1; i >= 0; i--) {
    if (mxs[i] > 0) {
      mx = i
      break
    }
  }
  return [mn, mx]
}

export async function firstLastNonZero3D(tensor3D) {
  const [row_min, row_max] = await firstLastNonZero(tensor3D, 0)
  const [col_min, col_max] = await firstLastNonZero(tensor3D, 1)
  const [depth_min, depth_max] = await firstLastNonZero(tensor3D, 2)
  console.log('row min and max  :', row_min, row_max)
  console.log('col min and max  :', col_min, col_max)
  console.log('depth min and max  :', depth_min, depth_max)
  return [row_min, row_max, col_min, col_max, depth_min, depth_max]
}

/*
//simpler function, but x4 slower
export async function firstLastNonZero3D(tensor3D) {
  const coords = await tf.whereAsync(tensor3D)
  const row_min = coords.min(0).arraySync()[0]
  const row_max = coords.max(0).arraySync()[0]
  const col_min = coords.min(0).arraySync()[1]
  const col_max = coords.max(0).arraySync()[1]
  const depth_min = coords.min(0).arraySync()[2]
  const depth_max = coords.max(0).arraySync()[2]
  coords.dispose()
  return [row_min, row_max, col_min, col_max, depth_min, depth_max]
}
*/

export async function generateBrainMask(
  unstackOutVolumeTensor,
  num_of_slices,
  slice_height,
  slice_width,
  modelEntry,
  opts,
  callbackUI,
  callbackImg,
  isFinalImage = true
) {
  if (unstackOutVolumeTensor[0].dtype !== 'int32') {
    callbackUI('', -1, 'generateBrainMask assumes int32')
  }
  if (modelEntry.preModelPostProcess) {
    callbackUI('', -1, 'generateBrainMask assumes BWLabeler instead of preModelPostProcess')
  }
  const numSlices = unstackOutVolumeTensor.length
  const numPixels2D = unstackOutVolumeTensor[0].size
  const numVox3D = numSlices * numPixels2D
  // preallocate to reduce heap usage
  const brainOut = new Int32Array(numVox3D)
  let offset = 0
  for (let i = 0; i < numSlices; i++) {
    brainOut.set(unstackOutVolumeTensor[i].dataSync(), offset)
    offset += numPixels2D
  }
  for (let i = 0; i < numVox3D; i++) {
    brainOut[i] = brainOut[i] !== 0 ? 1 : 0
  }
  if (isFinalImage || opts.showPhase1Output) {
    // all done
    callbackImg(brainOut, opts, modelEntry)
    callbackUI('Segmentation finished', 0)
  }
  return tf.tensor(brainOut, [num_of_slices, slice_height, slice_width])
}

export async function generateOutputSlicesV2(
  img,
  OutVolumeTensorShape,
  OutVolumeTensorType,
  num_of_slices,
  numSegClasses,
  slice_height,
  slice_width,
  modelEntry,
  opts,
  niftiImage
) {
  // Convert all slices into 1 Dim array
  if (opts.isPostProcessEnable) {
    const BWInstance = new BWLabeler()
    const dim = new Uint32Array(OutVolumeTensorShape)
    const conn = 26 // Example connectivity
    const binarize = true
    const onlyLargestClusterPerClass = true
    const [_labelCount, labeledImage] = BWInstance.bwlabel(img, dim, conn, binarize, onlyLargestClusterPerClass)
    for (let i = 0; i < img.length; i++) {
      img[i] *= labeledImage[i]
    }
  } // if isPostProcessEnable
  const typedArrayConstructor = {
    float32: Float32Array,
    int32: Int32Array
    // Add other cases as needed for different dtypes
  }[OutVolumeTensorType]
  // Create a new TypedArray from img with the same type as outLabelVolume
  const allOutputSlices3DCC1DimArray = new Uint8Array(img)
  switch (modelEntry.type) {
    case 'Brain_Masking': {
      const brainMask = new Uint8Array(allOutputSlices3DCC1DimArray.length)
      for (let i = 0; i < allOutputSlices3DCC1DimArray.length; i++) {
        brainMask[i] = allOutputSlices3DCC1DimArray[i] !== 0 ? 1 : 0
      }
      return brainMask
    }
    case 'Brain_Extraction': {
      const maskedData = new Uint8Array(allOutputSlices3DCC1DimArray.length)
      for (let i = 0; i < allOutputSlices3DCC1DimArray.length; i++) {
        // Create the mask - 1 where the value is non-zero, 0 where it is zero.
        const maskValue = allOutputSlices3DCC1DimArray[i] !== 0 ? 1 : 0
        // Apply the mask to the data - multiply by the mask value.
        maskedData[i] = niftiImage[i] * maskValue
      }
      return maskedData
    }
  }
  return img
}

export async function getAllSlicesDataAsTF3D(num_of_slices, niftiHeader, niftiImage) {
  // Get nifti dimensions
  const cols = niftiHeader.dims[1] // Slice width
  const rows = niftiHeader.dims[2] // Slice height
  let typedData
  if (niftiHeader.datatypeCode === 2) {
    // enum from nvimage/utils DT_UINT8 = 2
    typedData = new Uint8Array(niftiImage)
  } else if (niftiHeader.datatypeCode === 4) {
    // DT_INT16 = 4
    typedData = new Int16Array(niftiImage)
  } else if (niftiHeader.datatypeCode === 8) {
    // DT_INT32 = 8
    typedData = new Int32Array(niftiImage)
  } else if (niftiHeader.datatypeCode === 16) {
    // DT_FLOAT32 = 16
    typedData = new Float32Array(niftiImage)
  } else if (niftiHeader.datatypeCode === 64) {
    // DT_FLOAT64 = 64
    typedData = new Float64Array(niftiImage)
  } else if (niftiHeader.datatypeCode === 256) {
    // DT_INT8 = 256
    typedData = new Int8Array(niftiImage)
  } else if (niftiHeader.datatypeCode === 512) {
    // DT_UINT16 = 512
    typedData = new Uint16Array(niftiImage)
  } else if (niftiHeader.datatypeCode === 768) {
    // DT_UINT32 = 768
    typedData = new Uint32Array(niftiImage)
  } else {
    return
  }
  const allSlices_2D = []
  let offset3D = 0
  // Draw pixels
  for (let slice = 0; slice < num_of_slices; slice++) {
    const slice = new Array(rows * cols)
    let offset2D = 0
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const value = typedData[offset3D++]
        // Create 1Dim Array of pixel value, this 1 dim represents one channel
        slice[offset2D++] = value & 0xff
      }
    }
    allSlices_2D.push(tf.tensor(slice, [rows, cols])) // slice_height, slice_width
  }
  const allSlices_3D = tf.stack(allSlices_2D)
  tf.dispose(allSlices_2D)
  return allSlices_3D
}

export async function getModelNumLayers(modelObj) {
  return modelObj.layers.length
}

export async function getModelNumParameters(modelObj) {
  let numParameters = 0
  for (let layerIdx = 0; layerIdx < modelObj.layers.length; layerIdx++) {
    numParameters += modelObj.layers[layerIdx].countParams()
  }
  return numParameters
}

export async function isModelChnlLast(modelObj) {
  for (let layerIdx = 0; layerIdx < modelObj.layers.length; layerIdx++) {
    if (modelObj.layersByDepth[layerIdx][0].dataFormat) {
      return modelObj.layersByDepth[layerIdx][0].dataFormat === 'channelsLast'
    }
  }
}

export async function load_model(modelUrl) {
  return await tf.loadLayersModel(modelUrl)
}

export async function minMaxNormalizeVolumeData(volumeData) {
  // Normalize the data to the range 0 - 1 using min-max scaling
  const volumeData_Max = volumeData.max()
  const volumeData_Min = volumeData.min()
  const normalizedSlices_3d = await volumeData.sub(volumeData_Min).div(volumeData_Max.sub(volumeData_Min))
  return normalizedSlices_3d
}

function processTensorInChunks(inputTensor, filterWeights, chunkSize) {
  // Assuming inputTensor's shape: [batch, depth, height, width, inChannels]
  // and filterWeights's shape: [filterDepth, filterHeight, filterWidth, inChannels, outChannels]
  const stride = 1
  const pad = 0
  const dilationRate = 1
  const inChannels = inputTensor.shape[4]
  const numSlices = Math.ceil(inChannels / chunkSize)

  let accumulatedResult = null
  for (let i = 0; i < numSlices; i++) {
    const startChannel = i * chunkSize
    const endChannel = Math.min((i + 1) * chunkSize, inChannels)
    const channels = endChannel - startChannel

    const inputSlice = tf.tidy(() => {
      // Slice the input tensor to get the current chunk
      return inputTensor.slice([0, 0, 0, 0, startChannel], [-1, -1, -1, -1, channels])
    })
    const filterSlice = tf.tidy(() => {
      // Slice the filter weights to match the input tensor's current chunk
      return filterWeights.slice([0, 0, 0, startChannel, 0], [-1, -1, -1, channels, -1])
    })

    const resultSlice = tf.conv3d(inputSlice, filterSlice, stride, pad, 'NDHWC', dilationRate)
    // Clean up the slices to free memory
    inputSlice.dispose()
    filterSlice.dispose()

    // Squeeze the result slice to remove dimensions of size 1
    const squeezedResultSlice = tf.squeeze(resultSlice)
    resultSlice.dispose() // Dispose of the original resultSlice after squeezing

    if (accumulatedResult === null) {
      accumulatedResult = squeezedResultSlice
    } else {
      // Accumulate the result by adding the new result slice to it
      const newAccumulatedResult = accumulatedResult.add(squeezedResultSlice)

      // Dispose of the previous accumulatedResult and squeezedResultSlice
      accumulatedResult.dispose()
      // Dispose of squeezedResultSlice only if it wasn't assigned to accumulatedResult
      if (accumulatedResult !== squeezedResultSlice) {
        squeezedResultSlice.dispose()
      }
      // Update accumulatedResult with the new result
      accumulatedResult = newAccumulatedResult
    }

    tf.tidy(() => {
      tf.matMul(tf.zeros([1, 1]), tf.zeros([1, 1]))
    })
  }

  return accumulatedResult
}

export async function quantileNormalizeVolumeData(tensor, lowerQuantile = 0.05, upperQuantile = 0.95) {
  // Call calculateQuantiles and wait for the result
  const { qmin, qmax } = await calculateQuantiles(tensor, lowerQuantile, upperQuantile)

  // Convert qmin and qmax back to scalars
  const qminScalar = tf.scalar(qmin)
  const qmaxScalar = tf.scalar(qmax)

  // Perform the operation: (tensor - qmin) / (qmax - qmin)
  const resultTensor = tensor.sub(qminScalar).div(qmaxScalar.sub(qminScalar))

  // Dispose of the created scalars to free memory
  qminScalar.dispose()
  qmaxScalar.dispose()

  // Return the resulting tensor
  return resultTensor
}

export async function removeZeroPaddingFrom3dTensor(tensor3d, rowPad = 1, colPad = 1, depthPad = 1) {
  if (tensor3d.rank !== 3) {
    throw new Error('Tensor must be 3D')
  }
  const [h, w, d] = tensor3d.shape
  return tensor3d.slice([rowPad, colPad, depthPad], [h - 2 * rowPad, w - 2 * colPad, d - 2 * depthPad])
}

export async function resizeWithZeroPadding(croppedTensor3d, newDepth, newHeight, newWidth, refVoxel, boundVolSizeArr) {
  const row_pad_befor = refVoxel[0]
  const col_pad_befor = refVoxel[1]
  const depth_pad_befor = refVoxel[2]
  // last and lower volume voxel
  const row_max = row_pad_befor + boundVolSizeArr[0] - 1 // size [2, 2, 2] means 2 voxels total in each dim
  const col_max = col_pad_befor + boundVolSizeArr[1] - 1
  const depth_max = depth_pad_befor + boundVolSizeArr[2] - 1

  const row_pad_after = newHeight - row_max - 1 > 0 ? newHeight - row_max - 1 : 0
  const col_pad_after = newWidth - col_max - 1 > 0 ? newWidth - col_max - 1 : 0
  const depth_pad_after = newDepth - depth_max - 1 > 0 ? newDepth - depth_max - 1 : 0

  return croppedTensor3d.pad([
    [row_pad_befor, row_pad_after],
    [col_pad_befor, col_pad_after],
    [depth_pad_befor, depth_pad_after]
  ])
}


export class SequentialConvLayer {
  constructor(model, chunkSize, isChannelLast, callbackUI, isWebWorker = true) {
    this.model = model;
    this.outChannels = model.outputLayers[0].kernel.shape[4];
    this.chunkSize = chunkSize;
    this.isChannelLast = isChannelLast;
    this.callbackUI = callbackUI;
    this.isWebWorker = isWebWorker;
  }

  async apply(inputTensor) {
    const startTime = performance.now();
    const convLayer = this.model.layers[this.model.layers.length - 1];
    const weights = convLayer.getWeights()[0];
    const biases = convLayer.getWeights()[1];
    const outputShape = this.isChannelLast ? inputTensor.shape.slice(1, -1) : inputTensor.shape.slice(2);

    // Initialize output tensors
    let outB = await tf.mul(tf.ones(outputShape), -10000);
    let outC = await tf.zeros(outputShape);

    // Process in larger chunks to reduce overhead
    const CHUNK_SIZE = 3; // Process 8 channels at once
    const chunks = Math.ceil(this.outChannels / CHUNK_SIZE);

    for (let chunk = 0; chunk < chunks; chunk++) {
      const startIdx = chunk * CHUNK_SIZE;
      const endIdx = Math.min((chunk + 1) * CHUNK_SIZE, this.outChannels);

      // Process chunk in single tidy to optimize memory
      const [newOutB, newOutC] = await tf.tidy(() => {
        let currentOutB = outB;
        let currentOutC = outC;

        for (let chIdx = startIdx; chIdx < endIdx; chIdx++) {
          const filterWeights = weights.slice([0, 0, 0, 0, chIdx], [-1, -1, -1, -1, 1]);
          const filterBiases = biases.slice([chIdx], [1]);

          const outA = processTensorInChunks(
            inputTensor,
            filterWeights,
            Math.min(this.chunkSize, this.outChannels)
          ).add(filterBiases);

          const greater = tf.greater(outA, currentOutB);
          currentOutB = tf.where(greater, outA, currentOutB);
          currentOutC = tf.where(greater, tf.fill(currentOutC.shape, chIdx), currentOutC);
        }

        return [currentOutB, currentOutC];
      });

      // Clean up previous tensors
      tf.dispose([outB, outC]);
      outB = newOutB;
      outC = newOutC;

      // Update progress
      this.callbackUI(`Processing chunk ${chunk + 1}/${chunks}`, (chunk + 1) / chunks);

      // Allow UI update and prevent GPU timeout
      if (!this.isWebWorker) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    // Clean up and return result
    const result = outC.clone();
    tf.dispose([outB, outC]);

    const endTime = performance.now();
    console.log(`Execution time: ${endTime - startTime} milliseconds`);
    return result;
  }
}



/**
 * Main orchestrator function to process a segmentation volume.
 * OPTIMIZED: This version performs a single GPU->CPU data transfer and then
 * executes all subsequent logic on the CPU, avoiding inefficient data round-trips.
 * It is based on the logic of the proven `generateOutputSlicesV2` function.
 *
 * @param {tf.Tensor} outLabelVolume The final tensor from the model inference.
 * @param {Uint8Array|Float32Array} niftiImage The raw data from the original NIfTI file.
 * @param {object} modelEntry The model configuration object.
 * @param {object} opts The options object, containing `isPostProcessEnable`.
 * @returns {Promise<Uint8Array>} The final processed image data as a Uint8Array.
 */
export async function processSegmentationVolume(outLabelVolume, niftiImage, modelEntry, opts) {
  // --- Step 1: Single Data Transfer from GPU to CPU ---
  // This is the only 'await' and the only interaction with the GPU.
    console.log('Downloading segmentation data from GPU to CPU...');
    const segmentationData = await outLabelVolume.data(); // This returns a TypedArray (e.g., Int32Array)

  const Vshape = outLabelVolume.shape;
  console.log('Data download complete. Starting CPU processing.');

  // --- Step 2: Apply Post-Processing (if enabled) ---
  // This logic is now identical to your old, working function.
  if (opts.isPostProcessEnable) {
    console.log('Applying CPU-based connected-component labeling...');
    const bwStartTime = performance.now();

    const BWInstance = new BWLabeler();
    const [_labelCount, labeledImage] = BWInstance.bwlabel(
      segmentationData,
      Vshape,
      26,    // conn
      true,  // binarize
      true   // onlyLargestClusterPerClass
    );

    // This loop applies the mask IN-PLACE, which is very efficient.
    for (let i = 0; i < segmentationData.length; i++) {
      segmentationData[i] *= labeledImage[i];
    }

    const bwTime = ((performance.now() - bwStartTime) / 1000).toFixed(4);
    console.log(`Connected-component labeling took: ${bwTime} seconds.`); // <-- This will likely show ~5 seconds.
  }

  // --- Step 3: Apply Final Model Logic on the CPU ---
  // This switch statement is adapted directly from your old function.
  switch (modelEntry.type) {
    case 'Brain_Masking': {
      const brainMask = new Uint8Array(segmentationData.length);
      for (let i = 0; i < segmentationData.length; i++) {
        brainMask[i] = segmentationData[i] !== 0 ? 1 : 0;
      }
      return brainMask;
    }
    case 'Brain_Extraction': {
      const maskedData = new Uint8Array(segmentationData.length);
      for (let i = 0; i < segmentationData.length; i++) {
        const maskValue = segmentationData[i] !== 0 ? 1 : 0;
        maskedData[i] = niftiImage[i] * maskValue;
      }
      return maskedData;
    }
    default: {
      // For other cases, return the (potentially modified) segmentation data.
      return new Uint8Array(segmentationData);
    }
  }
}
