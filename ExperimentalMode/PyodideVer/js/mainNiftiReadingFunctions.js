/*
=========================================================
* Brainchop - v1.0.0
=========================================================

* Discription:  A user interface for whole brain segmentation
*               Input shape : [1, D, H, W, 1] e.g. [1, 38, 38, 38, 1]                
*               Model : Meshnet or similar     
*
* Authors:  Mohamed Masoud  and Sergey Plis  - 2021
=========================================================



=========================================================
           Brainchop for 3D Brain Segmentation
=========================================================*/  


/** For future use
* Function to normalize Nifti image data for nii files with float values or values > 255
*
* @since 1.0.0
* @param {ArrayBuffer} rawData, raw data of browsing Nifti file 
* @returns {ArrayBuffer} Returns normalized Nifti image ArrayBuffer 
* @example
*
*  normalizeNiftiRawData(ArrayBuffer) 
*
* // => ArrayBuffer { byteLength: 16777568 }
*/

normalizeNiftiImageData = (rawData) => {
      let headerObj = readNiftiHeader(rawData);
      let imageDataArrBuf = readNiftiImageData(headerObj, rawData);
      let imageDataArr = arrayBuffer2Array(imageDataArrBuf, headerObj.datatypeCode);

      //Round image data
      let imageDataTensor = tf.round(tf.tensor1d(imageDataArr));
      //Normalize image data
      imageDataArr = tensor2Array(tf.mul(normalizeVolumeData(imageDataTensor), tf.scalar(255)));

      return array2ArrayBuffer(imageDataArr);
} 



/**
* Function to decompress/check Nifti arraybuffer from uploaded file source
*
* @since 1.0.0
* @param {ArrayBuffer} rawData, raw data of browsing Nifti file 
* @returns {ArrayBuffer} Returns checked/decompressed Nifti ArrayBuffer 
* @example
*
*reader.onloadend = function(event) {
*    getNiftiRawData(event.target.result)
*}
* // => ArrayBuffer { byteLength: 16777568 }
*/

getNiftiRawData = (rawData) => {
     
    // Parse nifti
    if (nifti.isCompressed(rawData)) {
        rawData = nifti.decompress(rawData);
    }

    return nifti.isNIFTI(rawData) ? rawData : null;
}    


/**
* Function to read Nifti  header 
*
* @since 1.0.0
* @param {ArrayBuffer} Nifti Raw data
* @returns {Object} Returns Nifti header object 
* @example
*
* readNiftiHeader(ArrayBuffer)
* // => Object { littleEndian: true, dim_info: 0, dims: (8) […], datatypeCode: 2, numBitsPerVoxel: 8, slice_start: 0, … }
*/

readNiftiHeader = (rawNiftiData) => {
        return rawNiftiData ? nifti.readHeader(rawNiftiData) : null;
} 

/**
* Function to read Nifti file image data
*
* @since 1.0.0
* @param {ArrayBuffer} data, raw data of browsing Nifti file 
* @param {Object} Nifti header data
* @returns {ArrayBuffer} Returns  Nifti image  ArrayBuffer 
* @example
*
* readNiftiImageData(headerObject, ArrayBuffer)
*
* // => ArrayBuffer { byteLength: 16777216 }
*/

readNiftiImageData = (niftiHeader, rawNiftiData) => {
        return niftiHeader ? nifti.readImage(niftiHeader, rawNiftiData) : null;
} 

/**
* Create Nifti Output Array Buffer
*
* @since 1.0.0
* @param {ArrayBuffer} rawData 
* @param {Array} data 
* @returns {ArrayBuffer} Returns Output labels as ArrayBuffer
*
*/

createNiftiOutArrayBuffer = (rawData, data) => {
    // read rawNiftiData header
    let header = readNiftiHeader(rawData);
    let imageData = [];
    let outNifti = []
    let headerArrBuf = [];
    let outImageArray = [];

    let imageOffset = header.vox_offset,
        timeDim = 1,
        statDim = 1;

    if (header.dims[4]) {
        timeDim = header.dims[4];
    }

    if (header.dims[5]) {
        statDim = header.dims[5];
    }

    let imageSize = header.dims[1] * header.dims[2] * header.dims[3] * timeDim * statDim * (header.numBitsPerVoxel / 8);

    headerArrBuf = rawData.slice(0, imageOffset);

    // Convert to normal array
    let headerArray = arrayBuffer2Array(headerArrBuf, header.datatypeCode);

    outImageArray = headerArray.concat(data)

    return    array2ArrayBuffer(outImageArray, header.datatypeCode); 
};


/**
* Convert array to ArrayBuffer
*
* @since 1.0.0
* @param {Array} array 
* @returns {ArrayBuffer} Returns 
* @example
*
* array2ArrayBuffer([1,2,3])
* // => ArrayBuffer { byteLength: 3 }
*
*/ 

array2ArrayBuffer = (array, datatypeCode) => {
      let typedArray;

      if (datatypeCode === nifti.NIFTI1.TYPE_UINT8) {
          typedArray =  Uint8Array.from(array);
      } else if (datatypeCode === nifti.NIFTI1.TYPE_INT16) {
          typedArray =  Int16Array.from(array);
      } else if (datatypeCode === nifti.NIFTI1.TYPE_INT32) {
          typedArray =  Int32Array.from(array);
      } else if (datatypeCode === nifti.NIFTI1.TYPE_FLOAT32) {
          typedArray =  Float32Array.from(array);
      } else if (datatypeCode === nifti.NIFTI1.TYPE_FLOAT64) {
          typedArray =  Float64Array.from(array);
      } else if (datatypeCode === nifti.NIFTI1.TYPE_INT8) {
          typedArray =  Int8Array.from(array);
      } else if (datatypeCode === nifti.NIFTI1.TYPE_UINT16) {
          typedArray =  Uint16Array.from(array);
      } else if (datatypeCode === nifti.NIFTI1.TYPE_UINT32) {
          typedArray =  Uint32Array.from(array);
      } else {
          return;
      }  


    // Convert typedArray to ArrayBuffer and return ArrayBuffer
    return typedArray.buffer.slice(typedArray.byteOffset, typedArray.byteLength + typedArray.byteOffset)
}


/**
* Convert ArrayBuffer to array
*
* @since 1.0.0
* @param {ArrayBuffer} arrayBuffer 
* @returns {Array} Returns 
* @example
*
* arrBuf = array2ArrayBuffer([1,2,3])
*
* arrayBuffer2Array( arrBuf)
* // =>  [ 1, 2, 3 ]
*
*/ 
 
arrayBuffer2Array = (arrayBuffer, datatypeCode) => {
      let typedArrData;

      if (datatypeCode === nifti.NIFTI1.TYPE_UINT8) {
          typedArrData = new Uint8Array(arrayBuffer);
      } else if (datatypeCode === nifti.NIFTI1.TYPE_INT16) {
          typedArrData = new Int16Array(arrayBuffer);
      } else if (datatypeCode === nifti.NIFTI1.TYPE_INT32) {
          typedArrData = new Int32Array(arrayBuffer);
      } else if (datatypeCode === nifti.NIFTI1.TYPE_FLOAT32) {
          typedArrData = new Float32Array(arrayBuffer);
      } else if (datatypeCode === nifti.NIFTI1.TYPE_FLOAT64) {
          typedArrData = new Float64Array(arrayBuffer);
      } else if (datatypeCode === nifti.NIFTI1.TYPE_INT8) {
          typedArrData = new Int8Array(arrayBuffer);
      } else if (datatypeCode === nifti.NIFTI1.TYPE_UINT16) {
          typedArrData = new Uint16Array(arrayBuffer);
      } else if (datatypeCode === nifti.NIFTI1.TYPE_UINT32) {
          typedArrData = new Uint32Array(arrayBuffer);
      } else {
          return;
      }  


    // Convert typedArray to array using Spread syntax[...]
    let arr = [...typedArrData];
    return arr;
}



/**
* Convert typedArray to array
*
* @since 1.0.0
* @param {TypedArray} typedArray e.g.  Uint8Array(65536) [ 0, 0, 0, 0 ... ]
* @returns {Array} Returns 
* @example
*
* typedArr
* // =>  Uint8Array(3) [1,2,3]
*
* typedArray2Array(typedArr )
*
* // =>  [ 1, 2, 3 ]
*
*/ 
 
typedArray2Array = (typedArray) => {
    // Convert typedArray to array using Spread syntax[...]
    return [...typedArrData];
}



/**
* Download Nifti data as *.nii file
*
* @since 1.0.0
* @param {Array} mriData - All Output Slices  labels as 1Dim Array
* @param {string} fileName 
* @param {ArrayBuffer} rawNiftiData 
*
*/ 


downloadNifti = (mriData, rawNiftiData, fileName ) => {
      var downloadFileData = (function () {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        return function (data, fileName) {
            // create Blob "Binary Large Object" of type octet-binary for the ArrayBuffer
            var blob = new Blob([data], {type: "application/octet-binary;charset=utf-8"});
            var url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
            };
     }());

     //Get the data ArrayBuffer
     var data = createNiftiOutArrayBuffer(rawNiftiData, mriData);

     if (nifti.isNIFTI(data)) {
          // save arraybuffer data to disk  
          downloadFileData(data, fileName);
      } else {
          console.log("Not Nifti data....... ");
      }   
}



/**
* Download current viewer canvas data as *.png or *.jpg image file
*
* @since 1.0.0
* @param {object} canvas e.g. papayaContainers[0].viewer.canvas
* @param {string} fileName 
* @example
*
* downloadCanvas( papayaContainers[0].viewer.canvas, "slice125.png")
*
*/ 

downloadCanvas = (canvas, fileName) => { // canvas : papayaContainers[0].viewer.canvas
      var downloadFileData = (function () {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        return function (canvas, fileName) {
            let image = canvas.toDataURL("image/jpg");
            a.href = image;
            a.download = fileName;
            a.click();
            };
     }());

     downloadFileData(canvas, fileName);
}


/**
* Find max value with array
*
* @since 1.0.0
* @param {Array} arr 
* @returns {number} max 
* @example
*
*
* labelMax( [1,2,3])
* // => 3
*
*/ 

labelMax = (arr) => {
   let max = arr[0];

   for(let i=1; i < arr.length; i++) {
       if(arr[i] > max) {
         max = arr[i];   
       }
    }

    return max;
}  


/**
* Draw Ground Truth labels if any
*
* @since 1.0.0
* @param {Array} canvas 
* @param {number} sliceIdx 
* @param {object} labelNiftiHeader- The header of nifti file.
* @param {ArrayBuffer} labelNiftiImage- The image data of nifti file.
*/ 

drawGtCanvas = (canvas, sliceIdx, labelNiftiHeader, labelNiftiImage) => {
      // get nifti dimensions
      let cols = labelNiftiHeader.dims[1];
      let rows = labelNiftiHeader.dims[2];

      // Set canvas dimensions to nifti slice dimensions
      canvas.width = cols;
      canvas.height = rows;
     

      // Make canvas image data
      let ctx = canvas.getContext("2d");
      let canvasImageData = ctx.createImageData(canvas.width, canvas.height);

      // Convert raw data to typed array based on nifti datatype
      let typedData;

      if (labelNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT8) {
          typedData = new Uint8Array(labelNiftiImage);
      } else if (labelNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT16) {
          typedData = new Int16Array(labelNiftiImage);
      } else if (labelNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT32) {
          typedData = new Int32Array(labelNiftiImage);
      } else if (labelNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT32) {
          typedData = new Float32Array(labelNiftiImage);
      } else if (labelNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT64) {
          typedData = new Float64Array(labelNiftiImage);
      } else if (labelNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT8) {
          typedData = new Int8Array(labelNiftiImage);
      } else if (labelNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT16) {
          typedData = new Uint16Array(labelNiftiImage);
      } else if (labelNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT32) {
          typedData = new Uint32Array(labelNiftiImage);
      } else {
          return;
      }

      
      let n_classes = labelMax(typedData) + 1;
      // offset to specified slice
      let sliceSize = cols * rows;
      let sliceOffset = sliceSize * sliceIdx;

      // draw pixels
      for (let row = 0; row < rows; row++) {
          let rowOffset = row * cols;

          for (let col = 0; col < cols; col++) {
              let offset = sliceOffset + rowOffset + col;
              let value = typedData[offset];

              /* 
                 Assumes data is 8-bit, otherwise you would need to first convert 
                 to 0-255 range based on datatype range, data range (iterate through
                 data to find), or display range (cal_min/max).
                 
                 Other things to take into consideration:
                   - data scale: scl_slope and scl_inter, apply to raw value before 
                     applying display range
                   - orientation: displays in raw orientation, see nifti orientation 
                     info for how to orient data
                   - assumes voxel shape (pixDims) is isometric, if not, you'll need 
                     to apply transform to the canvas
                   - byte order: see littleEndian flag
              */
              value = Math.ceil(value*255/(n_classes - 1))

              canvasImageData.data[(rowOffset + col) * 4] = value & 0xFF;
              canvasImageData.data[(rowOffset + col) * 4 + 1] = value & 0xFF;
              canvasImageData.data[(rowOffset + col) * 4 + 2] = value & 0xFF;
              canvasImageData.data[(rowOffset + col) * 4 + 3] = 0xFF;

          }
      }

      ctx.putImageData(canvasImageData, 0, 0);

  }

/**
* Draw Ground Truth labels if any
*
* @since 1.0.0
* @param {object} file 
* @param {number} start - e.g. 0
* @param {number} length - File size
* @returns {blob object}  
*
*/    

  makeSlice = (file, start, length) => {
      var fileType = (typeof File);

      if (fileType === 'undefined') {
          return function () {};
      }

      if (File.prototype.slice) {
          return file.slice(start, start + length);
      }

      if (File.prototype.mozSlice) {
          return file.mozSlice(start, length);
      }

      if (File.prototype.webkitSlice) {
          return file.webkitSlice(start, length);
      }

      return null;
  }




