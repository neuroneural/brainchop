/*
=========================================================
* 3D xSegmentation Demo - v1.0.0
=========================================================

* Discription:  A user interface for whole brain segmentation
*               Input shape : [1, 38, 38, 38, 1]                  
*               Model : Meshnet      
*
* Author:  Mohamed Masoud , (Sergey Plis Lab) - 2021
=========================================================



=========================================================
                3D Brain Segmentation
=========================================================*/  
/**
* Function to read Nifti files header and data
*
* @since 1.0.0
* @param {ArrayBuffer} data 
*
*/

readNIFTIBasics = (data) => {

    // parse nifti
    if (nifti.isCompressed(data)) {
        data = nifti.decompress(data);
    }

    if (nifti.isNIFTI(data)) {
        // have raw nifti data to use for save
        rawNiftiData = data;
        niftiHeader = nifti.readHeader(data);
        niftiImage = nifti.readImage(niftiHeader, data);
    }

}    

/**
* Create Nifti Output Array Buffer
*
* @since 1.0.0
* @param {object} header 
* @param {ArrayBuffer} rawData 
* @param {Array} data 
* @returns {ArrayBuffer} Returns Output labels as ArrayBuffer
*
*/

createNiftiOutArrayBuffer = (header, rawData, data) => {
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
    hearderArray = arrayBuffer2Array(headerArrBuf);

    outImageArray = hearderArray.concat(data)

    return    array2ArrayBuffer(outImageArray); 
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

array2ArrayBuffer = (array) => {
    // convert array to typedarray
    let typedArray = Uint8Array.from(array);
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
 
arrayBuffer2Array = (arrayBuffer) => {
    // Convert arrayBuffer to TypedArray
    let typedArrData = new Uint8Array(arrayBuffer);
    // Convert typedArray to array using Spread syntax[...]
    let arr = [...typedArrData];
    return arr;
}


/**
* Download Nifti data as *.nii file
*
* @since 1.0.0
* @param {Array} mriData - All Output Slices  labels as 1Dim Array
* @returns {Array} Returns 
* @example
*
* arrBuf = array2ArrayBuffer([1,2,3])
*
* arrayBuffer2Array( arrBuf)
* // =>  [ 1, 2, 3 ]
*
*/ 


downloadNifti = (mriData, fileName) => {
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
     var data = createNiftiOutArrayBuffer(niftiHeader, rawNiftiData, mriData);

     if (nifti.isNIFTI(data)) {
          // save arraybuffer data to disk  
          downloadFileData(data, fileName);
      } else {
          console.log("Not Nifti data....... ");
      }   
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
   for(let i=1; i < arr.length; i++){
     if(arr[i] > max){
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

      // set canvas dimensions to nifti slice dimensions
      canvas.width = cols;
      canvas.height = rows;
     

      // make canvas image data
      let ctx = canvas.getContext("2d");
      let canvasImageData = ctx.createImageData(canvas.width, canvas.height);

      // convert raw data to typed array based on nifti datatype
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
      // document.getElementById("results").innerHTML = "Found " + n_classes.toString().fontcolor("green").bold() + " classes in the ground truth";

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




