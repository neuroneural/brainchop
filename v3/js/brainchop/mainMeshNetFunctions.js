/*
=========================================================
* Brainchop - v3.0.0
=========================================================

* Discription:  A user interface for whole brain segmentation
*               Input shape : [1, D, H, W, 1] e.g. [1, 38, 38, 38, 1]
*               Model : Meshnet or similar
*
* Authors:  Mohamed Masoud  and Sergey Plis  - 2022
=========================================================



=========================================================
           Brainchop for 3D Brain Segmentation
=========================================================*/

(function() {


/**
* Return 1-Dim Array of the slice pixels value, this 1 dim represents one channel
*
* @since 1.0.0
* @param {number} sliceIdx- The slice index.
* @param {object} niftiHeader- The header of nifti file.
* @param {ArrayBuffer} niftiImage- The image data of nifti file.
* @returns {Array} Returns the slice data as 1 dim array- Array length = slice width * slice height
* @example
*
* getSliceData1D(100, niftiHeader, niftiImage)
* // => [0, 0, ...];
*
*/


  getSliceData1D = (sliceIdx, niftiHeader, niftiImage) => {
      // Get nifti dimensions
      let cols = niftiHeader.dims[1]; // Slice width
      let rows = niftiHeader.dims[2]; // Slice height

      let typedData;

      if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT8) {
          typedData = new Uint8Array(niftiImage);
      } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT16) {
          typedData = new Int16Array(niftiImage);
      } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT32) {
          typedData = new Int32Array(niftiImage);
      } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT32) {
          typedData = new Float32Array(niftiImage);
      } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT64) {
          typedData = new Float64Array(niftiImage);
      } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT8) {
          typedData = new Int8Array(niftiImage);
      } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT16) {
          typedData = new Uint16Array(niftiImage);
      } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT32) {
          typedData = new Uint32Array(niftiImage);
      } else {
          return;
      }

      // offset to specified slice
      let sliceSize = cols * rows;

      let sliceOffset = sliceSize * sliceIdx;

      let data1DimArr = [];

      // Draw pixels
      for (let row = 0; row < rows; row++) {
          let rowOffset = row * cols;

          for (let col = 0; col < cols; col++) {
              let offset = sliceOffset + rowOffset + col;
              let value = typedData[offset];
              // Create 1Dim Array of pixel value, this 1 dim represents one channel
              data1DimArr[(rowOffset + col)] = value & 0xFF;

          }
      }

      return data1DimArr;
  }


/**
* Check if string
*
* @since 3.0.0
* @param {Any} variable
* @returns {bool}
* @example
*
* isString("someString")
* // => true
*
* isString({ "0": "BG",  "1": "Cerebral-White-Matter",  "2": "Ventricle"})
* // => false
*
* isString("")
* // => false
*/

 isString = (variable) => {
     return  (typeof variable === 'string' || variable instanceof String) &&
                     (variable !== null) && variable.length ?  true  : false;
 }


/**
* Check if object
*
* @since 3.0.0
* @param {Any} variable
* @returns {bool}
* @example
*
* isObject({ "0": "BG",  "1": "Cerebral-White-Matter",  "2": "Ventricle"})
* // => true
*
* isObject("someString")
* // => false
*
*/

 isObject = (variable) => {
     return  (typeof variable === 'object') && (variable !== null) ?  true  : false;
 }


  /**
   * Find  if two arrays are identical.
   *
   * @function
   * @since 3.0.0
   * @version 3.0.0
   * @category Array
   * @param {Array} array1 - The array of values.
   * @param {Array} array2 - The array of values.
   * @returns {boolean}
   * @example
   *
   * areArraysEquals( [1, 1, 2, 3], [1, 1, 2, 5])
   *
   * => false
   */

    areArraysEquals = (array1, array2) => {
        return JSON.stringify(array1) === JSON.stringify(array2) ? true : false;
    }


  /**
   * Verify if parent object has all keys of child object
   * e.g.  child object: labelsHistoObj,  parent object: colorLutObj or labelsObj
   *
   *
   * @function
   * @since 1.0.0
   * @version 3.0.0
   * @param {object} childObj - The child object e.g. labelsHistoObj
   * @param {object} parentObj - The parent object e.g. colorLutObj or labelsObj
   * @returns {boolean}
   * @example
   *
   * verifyChildParentObjects( {"x": 1, "y": 2}, {"y": 2, "z": 3, "x": 4})
   *
   * => true
   */

    verifyChildParentObjects = (childObj, parentObj) => {

         Object.keys(childObj).forEach((childKey, idx) => {

                if ( ! parentObj.hasOwnProperty(childKey)) {
                       return false;
                }
         })

         return true;
    }

/**
* Generates number of colors using HSL wheel hsl(hue, saturation, lightness).
*
* @since 1.0.0
* @param {number} s- The saturation number.
* @param {number} l- The lightness number.
* @param {number} num_colors- The number of colors to generate.
* @returns {Array} Returns colors array of string
* @example
*
* generateColors(100, 50,  3)
* // => [ "hsla(0,100%,50%)", "hsla(120,100%,50%)", "hsla(240,100%,50%)" ]
*
*/

  generateColors = (s, l,  num_colors) => {
	  let colors = []
	  let delta = Math.trunc(360 / num_colors)

	  for (let i = 0; i < num_colors; i++) {
	    let h = i * delta
	    colors.push("hsla("+ h + "," + s +"%," + l+ "%"  + ")")
	  }

	  return colors
  }

/**
* Convert rgb string to rgb object.
*
* @since 1.0.0
* @param {string} rgbString- The rgb string.
* @returns {Object} Returns RGB as object
* @example
*
* getRgbObject( "rgb(255,0,0)" )
* // => { r: 255, g: 0, b: 0 }
*
*/

   getRgbObject = (rgbString) => {
	  let RGB = {};
    let rgbArray = rgbString;
	  rgbArray = rgbArray.replace(/[^\d,]/g, '').split(',');
	  let rgbKeys=["r","g","b"];
	  RGB=rgbKeys.reduce((obj, key, index) => ({ ...obj, [key]:parseInt(rgbArray[index]) }), {});
	  return RGB;
  }

/**
* Convert "hsl(hue, saturation, lightness)" string to "rgb(rValue,gValue,bValue)" string.
*
* @since 1.0.0
* @param {string} hsl- The hsl string.
* @returns {string} Returns RGB as string
* @example
*
* hslToRgb( "hsla(0,100%,50%)" )
* // => "rgb(255,0,0)"
*
*/

  hslToRgb = (hsl) => {
	 let sep = hsl.indexOf(",") > -1 ? "," : " ";
	 hsl = hsl.substr(5).split(")")[0].split(sep);

	 if (hsl.indexOf("/") > -1) {
	     hsl.splice(3,1);
     }

	 let h = hsl[0],
	      s = hsl[1].substr(0,hsl[1].length - 1) / 100,
	      l = hsl[2].substr(0,hsl[2].length - 1) / 100;



     let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c/2,
        r = 0,
        g = 0,
        b = 0;
     if (0 <= h && h < 60) {
       r = c; g = x; b = 0;
     } else if (60 <= h && h < 120) {
       r = x; g = c; b = 0;
     } else if (120 <= h && h < 180) {
       r = 0; g = c; b = x;
     } else if (180 <= h && h < 240) {
       r = 0; g = x; b = c;
     } else if (240 <= h && h < 300) {
       r = x; g = 0; b = c;
     } else if (300 <= h && h < 360) {
       r = c; g = 0; b = x;
     }
     r = Math.round((r + m) * 255);
     g = Math.round((g + m) * 255);
     b = Math.round((b + m) * 255);


  return "rgb(" + r + "," + g + "," + b + ")";
  }


/**
* Convert rgb object to hex string.
* Credit: https://stackoverflow.com/questions/5623838/
*
* @since 1.2.0
* @param {object} rgbOb
* @returns {string} Returns hex as string
* @example
*
* rgbToHex( { r: 255, g: 0, b: 0 } )
* // => "#"
*
*/

rgbToHex = (rgbObj) => {
     chToHex = (ch) => {
      let hex = ch.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }

    return "#" + chToHex(rgbObj.r) + chToHex(rgbObj.g) + chToHex(rgbObj.b);
}


/**
* For Dice calculations- find the intersection
*
* @since 1.0.0
* @param {Array} ar1- The array represents output labels in 1D
* @param {Array} ar2- The array represents GT data in 1D
* @returns {Array} Returns intersection 1D array
* @example
*
* intersect([0,1,1], [0,2,2])
* // => [0]
*
*/

 intersect = (ar1, ar2) => {
      const intersection = [];
      for(let i = 0; i < ar1.length ; i++) {
        if(ar1[i] == ar2[i]) {
          intersection.push(ar1[i]);
        }
      }

      return intersection;
  }


/**
* For Dice calculations- diceCoefficient
*
* @since 1.0.0
* @param {Array} ar1- The array represents output labels in 1D
* @param {Array} ar2- The array represents GT data in 1D
* @returns {number} Returns dice Coefficient number
* @example
*
* diceCoefficient([0,1,1], [0,2,2])
* // => 0.333
*
*/

  diceCoefficient = (ar1, ar2) => {
      return ( 2 * intersect(ar1, ar2).length ) / ( ar1.length + ar2.length );
  }


/**
* Get maximum region mask using contour method to filter 2D slice smaller regions
*
* @since 1.0.0
* @param {ImageData} canvasImageData- The imageData object represents slice canvas data e.g. ImageData { width: 100, height: 100, data: Uint8ClampedArray(40000) }
* @returns {TypedArray} Returns contour pixels value {0, 255}
* @example
*
* ctx = papayaContainers[0].viewer.canvas.getContext("2d")
*
* getMaxRegionMaskByContour( ctx.getImageData(0, 0, 255, 255) )
* // => Uint8Array(65025) [ 0, 0, 0, 0, 0, 0, 0,... , 255, 255, 255, … ]
*
*/

  getMaxRegionMaskByContour= (canvasImageData) => { // slice matrix

          let mat = cv.matFromImageData(canvasImageData);

          let mask = cv.Mat.zeros(mat.cols, mat.rows, cv.CV_8UC3);

          let mask_gray = new cv.Mat ();
          let mask_binary = new cv.Mat ();
          let contours = new cv.MatVector();
          let hierarchy = new cv.Mat();

          // Grayscale conversion
          cv.cvtColor (mat, mask_gray, cv.COLOR_RGBA2GRAY, 0);

          cv.findContours(mask_gray, contours, hierarchy,  cv.RETR_EXTERNAL, cv.CHAIN_APPROX_NONE); // cv.CHAIN_APPROX_SIMPLE

  	      let maxContourArea = 0
  	      let maxContourAreaIdx = -1
  	      for (let i = 0; i < contours.size(); ++i) {
  	                  let cnt = contours.get(i);
  	                  let area = cv.contourArea(cnt, false);

  	                  if(maxContourArea < area) {
  	                     maxContourArea = area;
  	                     maxContourAreaIdx = i;
  	                  }

  	                  cnt.delete();
  	      }

          let color = new cv.Scalar(255, 255, 255);
          cv.drawContours(mask, contours, maxContourAreaIdx, color, -1); //cv.LINE_8

	        cv.cvtColor (mask, mask_gray, cv.COLOR_RGBA2GRAY, 0);
	        cv.threshold (mask_gray, mask_binary,  0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);


          mat.delete();
          mask.delete();
          mask_gray.delete();

          contours.delete();
          hierarchy.delete();

          return  mask_binary.data;
  }


/////////////******************* 3D Connected Components**************************/////////////////
/**
* Post processing the resulted labels from the inference model by removing noisy 3D regions, and keep only largest region
*
* @since 1.0.0
* @param {Array} outputSlices- 2D array[sliceIdx][sliceHeight*sliceWidth] such that outputSlices[i] gives slice data as 1d Array
* @param {number} sliceHeight- Slice Height
* @param {number} sliceWidth - Slice Width
* @returns {Array} Returns 2D labels array outputSlices[sliceIdx][sliceHeight*sliceWidth] after filtering noisy 3d regions
* @example
*
* await postProcessSlices3D( [ [0,0,0,0,  0,1,1,0,  0,0,0,0],
                             [0,0,0,0,  0,0,1,1,  0,0,0,0],
                             [0,0,0,0,  0,0,0,1,  0,1,1,0] ], 3, 4)
*
* // =>  [ [0,0,0,0,  0,1,1,0,  0,0,0,0],
*          [0,0,0,0,  0,0,1,1,  0,0,0,0],
*          [0,0,0,0,  0,0,0,1,  0,0,0,0]
*        ]
*
*/

   postProcessSlices3D = (outputSlices, sliceHeight, sliceWidth) => {

      let cc3d = new ConnectCompFor3D();

      outputSlices = cc3d.findLargest3dRegion(outputSlices, sliceHeight, sliceWidth);

      // postprocess outputSlices after remove noisy regions or smaller regions
      delete cc3d;
      return outputSlices;
  }



///////////////************************3D Contours*********************************////////////////////

   getSliceContoursMaskByLabel = (imgDataForLabel, mask, color) => {

          let mat = cv.matFromImageData( imgDataForLabel );
          let mask_gray = new cv.Mat ();
          let mask_binary = new cv.Mat ();
          let contours = new cv.MatVector();
          let hierarchy = new cv.Mat();

          // Grayscale conversion
          cv.cvtColor (mat, mask_gray, cv.COLOR_RGBA2GRAY, 0);
          cv.findContours(mask_gray, contours, hierarchy,  cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE); //cv.RETR_CCOMP cv.CHAIN_APPROX_SIMPLE cv.CHAIN_APPROX_NONE  cv.RETR_EXTERNAL

          // Draw contours on mask
          for (let i = 0; i < contours.size(); ++i) {
              cv.drawContours(mask, contours, i, color, 1, cv.LINE_8, hierarchy, 100);
          }

          mask_gray.delete();  contours.delete(); hierarchy.delete();

          return mask;
   }



  getCustomContoursColor = (numSegClasses) => {
          let colors = generateColors(100, 50,  numSegClasses);
          let colorsRgbObj = [];
           //Find the color object for each class
           for(let classIdx = 0; classIdx < numSegClasses; classIdx ++ ) {
                 colorsRgbObj[classIdx] =  getRgbObject(hslToRgb(colors[classIdx]));
           }

          return colorsRgbObj;
  }


  getCanvasImageDataForImgRegion = (sliceData1D,  imgHeight, imgWidth, regionLabel) => {
      let canvas = document.createElement("CANVAS");

      // Set canvas dimensions to nifti slice dimensions
      canvas.width = imgWidth;
      canvas.height = imgHeight;

      // make canvas image data
      let ctx = canvas.getContext("2d");
      let canvasImageData = ctx.createImageData(canvas.width, canvas.height);

      for (let idx = 0; idx < sliceData1D.length; idx++) {

           if(sliceData1D[idx] ==  regionLabel) {
              value = 255;
           } else {
              value = 0;
           }

          canvasImageData.data[idx * 4] = value;
          canvasImageData.data[idx * 4 + 1] = value;
          canvasImageData.data[idx * 4 + 2] = value;
          canvasImageData.data[idx * 4 + 3] = 255; // Alpha channel
      }

      return canvasImageData;

  }


   getSliceContours = ( sliceData1D, sliceHeight, sliceWidth,  numSegClasses, isRGBA = false) => {

          let sliceContoursMask = cv.Mat.zeros(sliceWidth, sliceHeight, cv.CV_8UC3);

          let allLabelColors = getCustomContoursColor(numSegClasses);
          //-- e.g. allLabelColors : [ { r: 255, g: 0, b: 0 }, { r: 0, g: 255, b: 0 }, { r: 0, g: 0, b: 255 } ]

          // For future use
          let bgLabel = 0;

          // For each labeled region  find its contours
          for(let label = 0; label < numSegClasses; label++) {

              if(label != bgLabel) {

                  let labelColor;

                  if(isRGBA) {
                      labelColor = { 0: allLabelColors[label].r , 1: allLabelColors[label].g, 2: allLabelColors[label].b, 3: 0, length: 4 };
                  } else { // is Gray
                      let grayValue = Math.ceil(label*255/(numSegClasses - 1))
                      labelColor = { 0: grayValue , 1: grayValue, 2: grayValue, 3: 0, length: 4 };
                  }
                  sliceContoursMask = getSliceContoursMaskByLabel( getCanvasImageDataForImgRegion( [...sliceData1D], sliceHeight, sliceWidth, label ), sliceContoursMask, labelColor );
              }
          }

          if(isRGBA) {
              // Convert output contours mask to RGBA  to make background areas transparent.
              cv.cvtColor (sliceContoursMask, sliceContoursMask, cv.COLOR_RGB2RGBA, 0);

              // Make background areas transparent and keep only edges
              let slicePixelsRGBA1D = sliceContoursMask.data;

              for (let i = 0; i < slicePixelsRGBA1D.length; i += 4) {

                if( (slicePixelsRGBA1D[i] == 0) && (slicePixelsRGBA1D[i+1] == 0) && (slicePixelsRGBA1D[i+2] == 0) ) {
                   slicePixelsRGBA1D[i+3] = 0;
                }
              }

              sliceContoursMask.delete();

              return slicePixelsRGBA1D

          } else { // Gray is needed.

             cv.cvtColor (sliceContoursMask, sliceContoursMask, cv.COLOR_RGBA2GRAY, 0);
             return sliceContoursMask.data
          }

  }


  findVolumeContours = (volumeSlices, sliceHeight, sliceWidth, numSegClasses) => {
       let volumeSlicesWithContours = [];

       for(let sliceIdx = 0; sliceIdx < volumeSlices.length; sliceIdx++) {
               volumeSlicesWithContours[sliceIdx] =  getSliceContours( [...volumeSlices[sliceIdx]], sliceHeight, sliceWidth,  numSegClasses)
       }

       return volumeSlicesWithContours;
  }


////////////*******************************************************************////////////////////
/**
* Standard Normal variate using Box-Muller transformation.
* The transformation simply takes two variables that are uniformly distributed
* and sends them to two independent random variables with a standard normal distribution.
*
* @since 1.0.0
* @returns {number} Returns
* @example
*
* randn_bm()
*
* // => 0.2175
*
*/

    randn_bm = () => {
          //u and v are random variables, they are uniformly distributed in the interval (0,1)
          let u = 0, v = 0;
          while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
          while(v === 0) v = Math.random();
          // returns independent, random variable that has a standard normal distribution
          return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    }


/**
* Check whether the proposed subvolumes coords are feasible
*
* @since 1.0.0
* @param {Array} DHW- Generated Coordinates e.g. [100,150,100]
* @param {Array} cubeSides - MRI volume sides e.g.[256,256,256]
* @param {Array} subCubeSides -Batch size e.g. [38,38,38]
* @returns {boolean} Returns - true or false
* @example
*
* checkInside([100,150,100], [256,256,256], [38,38,38]) )
*
* // => true
*
*/


    checkInside = (DHW, cubeSides, subCubeSides) => {
        for (let i = 0; i < 3; i++) {
            if ( (Math.sign(DHW[i]) < 0) || ( (DHW[i] + subCubeSides[i]) > cubeSides[i]) ) {
                return false;
            }
        }

        return true;
    }



/**
* Generate feasible overlap coordinates for inference
*
* @since 1.0.0
* @param {number} numOfSubCubes- Number of ovelap subCubes to generate e.g. 200
* @param {Array} mean - MRI mean voxel coordinate e.g. [ 123, 145, 127 ]
* @param {Array} sigma - Variance
* @param {Array} cubeSides - MRI volume sides e.g.[256,256,256]
* @param {Array} subCubeSides -Batch size e.g. [38,38,38]
* @returns {Array} Returns all generated coords
* @example
*
* findCoordsOfAddBrainBatches(200, [ 123, 145, 127 ], [ 1454.45, 1099.23, 1178.78 ],  [256,256,256], [38,38,38])
*
* // => [[ 187, 132, 56 ], [ 109, 103, 208 ], ... , [ 54, 97, 29 ]]
*
*/

    findCoordsOfAddBrainBatches = (numOfSubCubes, mean, sigma, cubeSides, subCubeSides ) => {

        const allCoords = [];
        let  coord;

        for (let i = 0; i < numOfSubCubes; i++) {
            coord = Array(Math.round(mean[0]+randn_bm()*sigma[0]),
                          Math.round(mean[1]+randn_bm()*sigma[1]),
                          Math.round(mean[2]+randn_bm()*sigma[2]) );
            if( !checkInside(coord, cubeSides, subCubeSides) ) {
                i--;
                // console.log(coord);
            } else {
                allCoords[i] = coord;
            }
        }

        return allCoords;
    }

/**
*  Return Tensor with binary 3D volume data  0 or 1
*  Element-wise: (x > 0 ? 1 : alpha * x );  e.g. Tenosr [0, 0.9, 0.8, -3] => Tensor [0, 1, 1, 0]
*
* @since 1.0.0
* @param {tf.Tensor|TypedArray|Array} volumeDataTensor- e.g. tf.tensor1d([0, 0.2, 0.1, 0.3])
* @returns {tf.Tensor} Returns Binary value tensor {0,1}
* @example
*
* binarizeVolumeDataTensor(tf.tensor1d([0, 2, -1, -3])
*
* // => Tensor  [0, 1, 0, 0]
*
*/


  binarizeVolumeDataTensor = (volumeDataTensor) => {

   let alpha = 0;
   // element-wise: (x > 0 ? 1 : alpha * x );  e.g. Tenosr [0, 0.9, 0.8, -3] => Tensor [0, 1, 1, 0]
   return   volumeDataTensor.step(alpha);

  }


/**
*  Convert tensor to buffer so immutable tensor can be mutable buffer with get() and set()
*  To convert buffer to tensor use bufferObj.toTensor()
*
* @since 1.0.0
* @param {tf.Tensor|TypedArray|Array} tensor- e.g. tf.tensor1d([0, 0.2, 0.1, 0.3])
* @returns {tf.buffer} Returns mutable tf.buffer object
* @example
*
* tensor2Buffer(  tf.tensor1d( [0, 2, -1, -3] ) )
*
* // => tf.buffer:  Object { dtype: "float32", shape: (1) […], size: 4, values: Float32Array(4), strides: [] }
*
*/

  tensor2Buffer = (tensor) => {
     return tf.buffer(tensor.shape, tensor.dtype, tensor.dataSync());
  }



  tensor2LightBuffer = (tensor, dtype) => {
     return new Buffer(tensor.shape, dtype, Array.from(tensor.dataSync()) );
  }


/**
*  Convert single/multi dimensional tensor to single/multi dimensional Array
*
* @since 1.0.0
* @param {tf.Tensor} tensor- e.g. tf.tensor( [1,2,3,4,5,6,7,8], [2, 2, 2] )
* @returns {Array} Returns mutable  single/multi dimensional Array
* @example
*
* tensor2Array(  tf.tensor( [1,2,3,4,5,6,7,8], [2, 2, 2] ) )
*
* // =>Array  [ [ [1,2],
*                 [3,4] ],
*
*               [ [5,6],
*                 [7,8] ]
*             ]
*
*/

  tensor2Array = (tensor) => {
    return tensor.arraySync();
  }


/**
*  Convert single/multi dimensional array to single/multi tensor
*
* @since 1.0.0
* @param {Array} array- e.g. [1,2,3,4,5,6,7,8]
* @returns {tf.tensor} Returns tf.tensor
* @example
*
* t = array2Tensor([[ [1,2],
*                     [3,4] ],
*
*                   [ [5,6],
*                     [7,8] ]
*                 ])
*
* t.print()
* // =>tensor [ [ [1,2],
*                 [3,4] ],
*
*               [ [5,6],
*                 [7,8] ]
*             ]
*
*/

  array2Tensor = (array) => {
    return tf.tensor(array);
  }


/**
*  Convert single/multi dimensional tensor to flatten 1d dimensional Array
*
* @since 1.0.0
* @param {tf.Tensor} tensor- e.g. tf.tensor( [1,2,3,4,5,6,7,8], [2, 2, 2] )
* @returns {Array} Returns mutable  flatten 1d dimensional Array
* @example
*
* tensor2FlattenArray(  tf.tensor( [1,2,3,4,5,6,7,8], [2, 2, 2] ) )
*
* // =>Array  [ 1, 2, 3, 4, 5, 6, 7, 8 ]
*
*/

  tensor2FlattenArray = (tensor) => {
    return Array.from(tensor.dataSync());
  }




/**
*  Calculate the mements of the MRI volume to find mean and variance
*
* @since 1.0.0
* @param {tf.Tensor} cube3d- e.g slice3d repesents the MRI volume
* @param {number} threshold- filter  voxels based on the threshold value
* @returns {Array} Returns [meanArray, varArray]
* @example
*
* cubeMoments(  tf.tensor( [1,2,3,4,5,6,7,8], [2, 2, 2] ) , 0.5)
*
* // => Array [[0, 0, 0],[0.25, 0.25, 0.25]]
*
*/


  cubeMoments = (cube3d, threshold) => {
      // mean and variance of a normalized cube data [0, 1]
      let cube = tensor2Buffer(cube3d);
      let coords = [];
      for(let i = 0; i < cube3d.shape[0]; i++) {
          for(let j = 0; j < cube3d.shape[1]; j++) {
              for(let k = 0; k < cube3d.shape[2]; k++) {
                  if (cube.get(i,j,k) > threshold) {
                      coords.push([i, j, k]);
                  }
              }
          }
      }
      let coordsTensor = tf.tensor2d(coords);
      let moments = tf.moments(coordsTensor, 0, false);
      let meanArray = Array.from(tf.round(moments['mean']).dataSync());
      let varArray = Array.from(moments['variance'].dataSync());
      coordsTensor.dispose();
      return [meanArray, varArray];
  };




/**
*  For all MRI volume values > 0 , find the Centroid voxel Array [d, h, w]
*
* @since 1.0.0
* @param {tf.Tensor} slices_3d - e.g slice_3d repesents the MRI volume slices as tensor
* @param {number} num_of_slices- Total Number of slices aka z-dim
* @param {number} slice_height- - Slice Height
* @param {number} slice_width- Slice Width
* @returns {Array} Returns centroid voxel Array [d, h, w]
* @example
*
* [0.. 7] <==> Array.from({length: 8}, (x, i) => i)
*
* findHeadCentroid(  tf.tensor( Array.from({length: 27}, (x, i) => i) , [3, 3, 3] ), 3, 3, 3 )
*
* // => Array [ 1, 1, 1 ]
*
*/


  findHeadCentroid = (slices_3d, num_of_slices, slice_height, slice_width) => {
    // Threshold tensor volume values to 0 or 1 such that if (voxelVal > 0 ? 1 : 0 )
     let binarizeVolumeTensor = binarizeVolumeDataTensor(slices_3d);
     let binarizeVolumeBuffer = tensor2Buffer(binarizeVolumeTensor);

     const grid_coords = [];
     let counter = 0;


      // Find coordinates of nonzero voxels as (x_i, y_i, z_i) vectors
      for(let depthIdx = 0; depthIdx < num_of_slices; depthIdx += 1) {
        for(let rowIdx = 0; rowIdx < slice_height; rowIdx += 1) {
            for(let colIdx = 0; colIdx < slice_width; colIdx += 1) {

                 let voxelValue = binarizeVolumeBuffer.get(depthIdx, rowIdx, colIdx);
                 if(voxelValue == 1) {
                         grid_coords[counter] = Array(depthIdx, rowIdx, colIdx);
                         counter += 1;
                 }
            }
        }
      }

      // Create 2D Tesnor with three columns for depth, row, col index
      let gridCoordsTensor = tf.tensor2d(grid_coords);
      let axis = 0;

      let headCentroidTensor = tf.round(gridCoordsTensor.mean(axis));

      // Find the Centroid voxel Array [d, h, w]
      let headCentroidArray = Array.from(headCentroidTensor.dataSync());
      tf.dispose(gridCoordsTensor);
      tf.dispose(headCentroidTensor);

      return headCentroidArray;

  }


/**
*  Creates batches with the volume of slices each of D,H,W sub_volume and
*  focus on brain area for the additional sub_volumes
*
* @since 1.0.0
* @param {tf.Tensor} slices_3d - e.g slice_3d repesents the MRI volume slices as tensor
* @param {number} num_of_slices- Total Number of slices aka z-dim
* @param {number} slice_height- - Slice Height
* @param {number} slice_width- Slice Width
* @param {number} batch_D- batch depth-dim a.k.a z-dim
* @param {number} batch_H- batch height
* @param {number} batch_W- batch width
* @param {Array}  headSubCubesCoords - coordinates of overlap batches centered around the head
* @returns {Array} Returns Array of objects for all Slices Batch e.g. {id: number, coordinates:[Array], data: tf.Tensor }
*
* [0.. 7] <==> Array.from({length: 8}, (x, i) => i)
*  headSubCubesCoords = []
*
* sliceVolumeIntoOverlappedBatches(  tf.tensor( Array.from({length: 27}, (x, i) => i) , [3, 3, 3] ), 3, 3, 3, 2, 2, 2, [] )
*
* // => Array [ {id:1, coordinates:[0,0,0], data:{ kept: false, isDisposedInternal: false, dtype: "float32", … } }, {...}, ... ]
*
*/

  sliceVolumeIntoOverlappedBatches = (slices_3d, num_of_slices, slice_height, slice_width, batch_D, batch_H, batch_W, headSubCubesCoords ) => {

      let allSlicedBatches = [];
      let batch_id = 1;

      for(let depthIdx = 0; depthIdx < num_of_slices; depthIdx += batch_D) {
        for(let rowIdx = 0; rowIdx < slice_height; rowIdx += batch_H) {
            for(let colIdx = 0; colIdx < slice_width; colIdx += batch_W) {
                  // for overlap calculations of last batches
                  let depthIdxDiff = 0;
                  let rowIdxDiff = 0;
                  let colIdxDiff = 0;

                  if((depthIdx + batch_D) > num_of_slices) {
                    depthIdxDiff = (depthIdx + batch_D) - num_of_slices;
                  }

                  if((rowIdx + batch_H) > slice_height) {
                    rowIdxDiff = (rowIdx + batch_H) - slice_height;
                  }

                  if((colIdx + batch_W) > slice_width) {
                    colIdxDiff = (colIdx + batch_W) - slice_width;
                  }

                  let startIndex = [depthIdx - depthIdxDiff, rowIdx - rowIdxDiff, colIdx - colIdxDiff];
                  let batch = slices_3d.slice(startIndex, [batch_D, batch_H, batch_W]);

                  allSlicedBatches.push({id: batch_id , coordinates: startIndex, data: batch});
                  batch_id += 1;
            }
        }
      }

      // Additional sub_volumes or batches focus around the head centroid
      for(let cubeIdx = 0; cubeIdx < headSubCubesCoords.length; cubeIdx++) {

            let startIndex = [headSubCubesCoords[cubeIdx][0], headSubCubesCoords[cubeIdx][1], headSubCubesCoords[cubeIdx][2]];
            let batch = slices_3d.slice(startIndex, [batch_D, batch_H, batch_W]);
            allSlicedBatches.push({id: batch_id , coordinates: startIndex, data: batch});
            batch_id += 1;
      }


     return   allSlicedBatches;
  }

/**
*  Try to create batches with the volume of slices each of D,H,W sub_volume  with minimum overlap option
*
* @since 1.0.0
* @param {tf.Tensor} slices_3d - e.g slice_3d repesents the MRI volume slices as tensor
* @param {number} num_of_slices- Total Number of slices aka z-dim
* @param {number} slice_height- - Slice Height
* @param {number} slice_width- Slice Width
* @param {number} batch_D- batch depth-dim a.k.a z-dim
* @param {number} batch_H- batch height
* @param {number} batch_W- batch width
* @returns {Array} Returns Array of objects for all Slices Batch e.g. {id: number, coordinates:[Array], data: tf.Tensor }
*
* [0.. 7] <==> Array.from({length: 8}, (x, i) => i)
*
* sliceVolumeIntoBatches(  tf.tensor( Array.from({length: 27}, (x, i) => i) , [3, 3, 3] ), 3, 3, 3, 2, 2, 2 )
*
* // => Array [ {id:1, coordinates:[0,0,0], data:{ kept: false, isDisposedInternal: false, dtype: "float32", … } }, {...}, ... ]
*
*/


	sliceVolumeIntoBatches = (slices_3d, num_of_slices, slice_height, slice_width, batch_D, batch_H, batch_W ) => {
	    let allSlicedBatches = [];
	    let batch_id = 1;

	    for(let depthIdx = 0; depthIdx < num_of_slices; depthIdx += batch_D) {
	      for(let rowIdx = 0; rowIdx < slice_height; rowIdx += batch_H) {
	          for(let colIdx = 0; colIdx < slice_width; colIdx += batch_W) {
	                // for overlap calculations of last batches
	                let depthIdxDiff = 0;
	                let rowIdxDiff = 0;
	                let colIdxDiff = 0;

	                if((depthIdx + batch_D) > num_of_slices) {
	                  depthIdxDiff = (depthIdx + batch_D) - num_of_slices;
	                }

	                if((rowIdx + batch_H) > slice_height) {
	                  rowIdxDiff = (rowIdx + batch_H) - slice_height;
	                }

	                if((colIdx + batch_W) > slice_width) {
	                  colIdxDiff = (colIdx + batch_W) - slice_width;
	                }

	                let startIndex = [depthIdx - depthIdxDiff, rowIdx - rowIdxDiff, colIdx - colIdxDiff];
	                let batch = slices_3d.slice(startIndex, [batch_D, batch_H, batch_W]);

	                allSlicedBatches.push({id: batch_id , coordinates: startIndex, data: batch});
	                batch_id += 1;
	          }
	      }
	    }

	   return   allSlicedBatches;
	}


/**
* Return 2-Dim Array of the all slices data where each slice data is a 1d array
*
* @since 1.0.0
* @param {number} num_of_slices- Total Number of slices a.k.a z-dim
* @param {object} niftiHeader- The header of nifti file.
* @param {ArrayBuffer} niftiImage- The image data of nifti file.
* @returns {Array} Returns All slices data where each slice data is a 1-dim array- e.g. allSlices[0] = [0,0,0, ..., 0]
* @example
*
* getAllSlicesData1D(256, niftiHeader, niftiImage)
* // => [ [0,0, 0, ...], [0,0,...,0], ... ];
*
*/


	getAllSlicesData1D = (num_of_slices, niftiHeader, niftiImage) => {
	      let allSlices = [];
	      for(let sliceIdx = 0; sliceIdx < num_of_slices; sliceIdx++) {
	          let slice = getSliceData1D(sliceIdx, niftiHeader, niftiImage);
	          allSlices.push(slice);
	      }

	     return   allSlices;
	}


/**
* Return 2-Dim Array of the all slices data where each slice data is a 2d array
*
* @since 1.0.0
* @param {Array} allSlices- Array of all slices data as 1D
* @param {number} slice_height- - Slice Height
* @param {number} slice_width- Slice Width
* @returns {Array}  Returns All slices data where each slice data is tensor2d.  e.g. allSlices[0] = Tensor [[0,0,0, ..., 0], .. [..]]
* @example
*
* arrSlices2d = getAllSlices2D([ [0,0,0,255,255,255,255,255,255,0,0,0], [0,0,0,255,255,255,255,255,255,0,0,0] ], 4, 3)
* // => Array of tensors [ { kept: false, isDisposedInternal: false, dtype: "float32", … }, {...}];
*
* arrSlices2d[0].print()
*  // =>   Tensor
*            [[0  , 0  , 0  ],
*             [255, 255, 255],
*             [255, 255, 255],
*             [0  , 0  , 0  ]]
*
*/

	getAllSlices2D = (allSlices, slice_height, slice_width) => {
	    let allSlices_2D = [];
	    for(let sliceIdx = 0; sliceIdx < allSlices.length; sliceIdx ++){
	        allSlices_2D.push(tf.tensor(allSlices[sliceIdx], [slice_height, slice_width]));
	    }

	    return   allSlices_2D;
	}


/**
* Return volumatric 3-Dim tensor of all slices data
* @since 1.0.0
* @param {Array} allSlices_2D- Array of 2d tensors of all slices data
* @returns {tf.Tensor}  Returns Tensor of all slices data
* @example
*
* slices3d = getSlices3D([ tf.tensor( Array.from({length: 16}, (x, i) => i) , [4, 4]),
*                          tf.tensor( Array.from({length: 16}, (x, i) => i) , [4, 4])
*                       ])
*
* // => object { kept: false, isDisposedInternal: false, shape: (3) […], dtype: "float32",
*                size: 32, strides: (2) […], dataId: {…}, id: 355, rankType: "3", scopeId: 29
*              }
*
* slices3d.print()
*  // =>   Tensor
*                [[[0 , 1 , 2 , 3 ],
*                  [4 , 5 , 6 , 7 ],
*                  [8 , 9 , 10, 11],
*                  [12, 13, 14, 15]],
*
*                 [[0 , 1 , 2 , 3 ],
*                  [4 , 5 , 6 , 7 ],
*                  [8 , 9 , 10, 11],
*                  [12, 13, 14, 15]]]
*
*/

	getSlices3D = (allSlices_2D) => {
   	    return tf.stack(allSlices_2D);
	}


/**
* Normalize the tensor data to the range 0 - 1 using min-max scaling
* @since 1.0.0
* @param {tf.Tensor} volumeData- Tensor1d/Tensor2d/Tensor3d,  e.g. Tensor3d of all MRI volume data
* @returns {tf.Tensor}  Returns Tensor of all normalized data
* @example
*
* normSlices = minMaxNormalizeVolumeData (  tf.tensor( Array.from({length: 8}, (x, i) => i) , [2, 2, 2]) )
*
* // => Object { kept: false, isDisposedInternal: false, shape: (3) […], dtype: "float32",
*                size: 8, strides: (2) […], dataId: {…}, id: 369, rankType: "3", scopeId: 39 }
*
* normSlices.print()
*  // =>   Tensor
*             [[[0        , 0.1428571],
*               [0.2857143, 0.4285715]],
*
*              [[0.5714286, 0.7142857],
*               [0.8571429, 1        ]]]
*
*/

	minMaxNormalizeVolumeData = (volumeData) => {
	    //Normalize the data to the range 0 - 1 using min-max scaling
	    const volumeData_Max = volumeData.max();
	    const volumeData_Min = volumeData.min();
	    const normalizedSlices_3d = volumeData.sub(volumeData_Min).div(volumeData_Max.sub(volumeData_Min));
	    return  normalizedSlices_3d;
	}

/**
* For future use
* Calculate the tensor data quantiles
* @since 3.0.0
* @param {tf.Tensor} tensor - Tensor1d/Tensor2d/Tensor3d,  e.g. Tensor3d of all MRI volume data
* @param {number} lowerQuantile
* @param {number} upperQuantile
* @returns {object}
* @example
*
* await calculateQuantiles (  tf.tensor( Array.from({length: 8}, (x, i) => i) , [2, 2, 2]) )
*
* // => Object { qmin: 0, qmax: 7 }
*
*/


  calculateQuantiles = async(tensor, lowerQuantile = 0.01, upperQuantile = 0.99) => {
      // Flatten the tensor
      const flatTensor = tensor.flatten();

      // Convert the flattened tensor to an array to sort it
      const flatArray = await flatTensor.array();
      flatArray.sort((a, b) => a - b); // Sort the array in ascending order

      // Convert the sorted array back to a tensor
      const sortedTensor = tf.tensor1d(flatArray);

      // Calculate the indices for the quantiles
      const numElements = sortedTensor.shape[0];
      const lowIndex = Math.floor(numElements * lowerQuantile);
      const highIndex = Math.ceil(numElements * upperQuantile) - 1; // Subtract 1 because indices are 0-based

      // Slice the sorted tensor to get qmin and qmax
      const qmin = sortedTensor.slice(lowIndex, 1); // Get the value at the low index
      const qmax = sortedTensor.slice(highIndex, 1); // Get the value at the high index

      // Get the actual values from the tensors
      const qminValue = (await qmin.array())[0];
      const qmaxValue = (await qmax.array())[0];

      // Clean up tensors to free memory
      flatTensor.dispose();
      sortedTensor.dispose();
      qmin.dispose();
      qmax.dispose();

      return { qmin: qminValue, qmax: qmaxValue };
  }


/**
* For future use
* Normalize the tensor data using quantiles
* @since 3.0.0
* @param {tf.Tensor} tensor - Tensor1d/Tensor2d/Tensor3d,  e.g. Tensor3d of all MRI volume data
* @param {number} lowerQuantile
* @param {number} upperQuantile
* @returns {tf.Tensor}
* @example
*
* normTensor = await quantileNormalizeVolumeData (  tf.tensor( Array.from({length: 8}, (x, i) => i) , [2, 2, 2]) )
*
* // => Object Object { kept: false, isDisposedInternal: false, shape: (3) […], dtype: "float32", size: 8,
*                       strides: (2) […], dataId: {…}, id: 9, rankType: "3", scopeId: 5 }
*
* normTensor.print()
*
* //=>     Tensor
*              [[[0        , 0.1428571],
*                [0.2857143, 0.4285715]],
*
*               [[0.5714286, 0.7142857],
*                [0.8571429, 1        ]]]
*/


  quantileNormalizeVolumeData = async (tensor, lowerQuantile = 0.05, upperQuantile = 0.95) => {
      // Call calculateQuantiles and wait for the result
      const { qmin, qmax } = await calculateQuantiles(tensor, lowerQuantile, upperQuantile);

      // Convert qmin and qmax back to scalars
      const qminScalar = tf.scalar(qmin);
      const qmaxScalar = tf.scalar(qmax);

      // Perform the operation: (tensor - qmin) / (qmax - qmin)
      const resultTensor = tensor.sub(qminScalar).div(qmaxScalar.sub(qminScalar));

      // Dispose of the created scalars to free memory
      qminScalar.dispose();
      qmaxScalar.dispose();

      // Return the resulting tensor
      return resultTensor;
  }



/**
* Get MRI mask after threshold noisy voxels around the brain for better cropping later
* @since 3.0.0
* @param {tf.Tensor} tensor - Tensor3d,  e.g. Tensor3d of all MRI volume data
* @param {number} percentage - Threshold percentage is just a number between 0 and 1
* @returns {tf.Tensor}
*
*/


applyMriThreshold = async(tensor, percentage) => {
    // Perform asynchronous operations outside of tf.tidy
    const maxTensor = tensor.max();
    const thresholdTensor = maxTensor.mul(percentage);
    const threshold = await thresholdTensor.data(); // Extracts the threshold value

    // Dispose tensors not needed anymore
    maxTensor.dispose();
    thresholdTensor.dispose();

    // Use tf.tidy for synchronous operations
    return tf.tidy(() => {
      const dataForProcessing = tensor.clone();

      // Thresholding (assuming background has very low values compared to the head)
      const mask = dataForProcessing.greater(threshold[0]);
      //-- const denoisedMriData = dataForProcessing.mul(mask);

      // No need to  manually dispose dataForProcessing and mask, as tf.tidy() will dispose them auto.
      return mask;
    });

    //-- return denoisedMriData;
}




/**
* Get MRI copping coordinates after threshold
* @since 3.0.0
* @param {tf.Tensor} tensor - Tensor3d,  e.g. Tensor3d of all MRI volume data
* @param {number} percentage - Threshold percentage is just a number between 0 and 1
* @returns {Array}
* @example
*
* arr = Array.from({length: 27}, (x, i) => i/10)
* => Array(27) [ 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, … , 2.6]
*
* cropped = await cropTensorWithThreshold (  tf.tensor( Array.from({length: 27}, (x, i) => i/10) , [3, 3, 3]),  0.2  )
*
* =>  Array [ {…}, {…} ]
*
* cropped[0].print()
*
*/


   cropTensorWithThreshold = async(tensor, percentage) => {

      // Find the maximum value of the tensor
      const maxTensor = tensor.max();

      // Multiply the maximum value by the thresholdRatio to get % of the max
      const thresholdTensor = maxTensor.mul(percentage);

      // Extract the value from the tensor
      const threshold = await thresholdTensor.data();

      const dataForProcessing = tensor.clone();

      // Thresholding (assuming background has very low values compared to the head)
      const mask = dataForProcessing.greater(threshold[0]);
      const masked_data = dataForProcessing.mul(mask);

      // Find the bounding box around the head (non-zero region) in the filtered data
      const indices = await tf.whereAsync(masked_data.greater(0));
      dataForProcessing.dispose();
      mask.dispose();
      masked_data.dispose();

      // Extract z, y, x coordinates from the indices
      const zs = indices.slice([0, 0], [indices.shape[0], 1]); // z coordinates
      const ys = indices.slice([0, 1], [indices.shape[0], 1]); // y coordinates
      const xs = indices.slice([0, 2], [indices.shape[0], 1]); // x coordinates

      // Compute min and max indices for each dimension
      const min_z = zs.min().arraySync();
      const max_z = zs.max().arraySync();
      const min_y = ys.min().arraySync();
      const max_y = ys.max().arraySync();
      const min_x = xs.min().arraySync();
      const max_x = xs.max().arraySync();

      // Crop the original tensor using the bounding box from the filtered data
      const cropped_tensor = tensor.slice([min_z, min_y, min_x], [max_z - min_z + 1, max_y - min_y + 1, max_x - min_x + 1]);

      // Clean up tensors to free memory
      indices.dispose();
      zs.dispose();
      ys.dispose();
      xs.dispose();

      // Return the cropped tensor along with the min and max indices
      return  [cropped_tensor, {
          minZ: min_z,
          maxZ: max_z,
          minY: min_y,
          maxY: max_y,
          minX: min_x,
          maxX: max_x
      }];

  }



/**
* load pre-trained model from local drive
*
* @since 1.0.0
* @param {string} modelUrl - the model URL e.g. "./models/mnm_tfjs_me_test/model.json"
* @returns {promise} Promise object represents the model to load
* @example
*
* load_model("./models/mnm_tfjs_me_test/model.json")
* // => Promise { <state>: "fulfilled", <value>: {…} }
*
*/

	load_model = async( modelUrl) => {
        return await tf.loadLayersModel(modelUrl);
	}

/**
* load uploaded pre-trained model from local drive
*
* @since 1.0.0
* @param {File} modelFile - the model File e.g. { name: "model.json", lastModified: 1625122369308, webkitRelativePath: "", size: 250, type: "" }
* @param {File} weightFile - the weight File e.g. { name: "weight.bin", lastModified: 1625122369308, webkitRelativePath: "", size: 250, type: "" }
* @returns {promise} Promise object represents the model to load
* @example
*
* load_browser_model(uploadJSONInput.files[0], uploadWeightsInput.files[0])
* // => Promise { <state>: "fulfilled", <value>: {…} }
*
*/

  load_browser_model = async( modelFile, weightFile) => {
      return await tf.loadLayersModel(tf.io.browserFiles( [ modelFile, weightFile ]));
  }

/**
* Generates range of colors for Segmentation classes -- (refine)
*
* @since 1.0.0
* @param {number} numSegClasses - The number of segmentation classes.
* @returns {function} Returns custom color table function
* @example
*
* getCustomColorTable(3)
* // => function customColorTable()
*
*/
getCustomColorTable = (numSegClasses) => {

        var customColorTable = function() { };
        let colors = [];

        if( (!opts.isAutoColors) && (numSegClasses <= manualColorsRange.length) ) {
            //Manual coloring
            colors = manualColorsRange;
        } else {
            //Auto coloring
            colors = generateColors(100, 50,  numSegClasses);

            if(!opts.isAutoColors) { // if manual coloring was requested but failed
                if(numSegClasses > manualColorsRange.length) {
                     console.log("number of Segmentation classes > manualColorsRange --> Auto coloring enabled");
                     webix.message("number of Segmentation classes > manualColorsRange --> Auto coloring enabled");
                }

            }
        }


        let colorsRgbObj = [];

        // Array of threshold grey value of each class
        let classGreyValue = [];

        if(opts.isColorEnable) {

            //Find the threshold grey value of each class
            for(let classIdx = 0; classIdx < numSegClasses; classIdx ++ ) {
                      classGreyValue[classIdx] = Math.ceil(classIdx*255/(numSegClasses - 1));
                      colorsRgbObj[classIdx] =  getRgbObject(hslToRgb(colors[classIdx]));

            }


            customColorTable.prototype.lookupRed = function (screenVal, imageVal) {
                for(let classIdx = 0; classIdx < numSegClasses; classIdx ++ ) {

                    if (screenVal == 0) {
                        return 0;
                    } else  if (screenVal == classGreyValue[classIdx]) {
                        return colorsRgbObj[classIdx].r;
                    }

                 }

            };

            customColorTable.prototype.lookupGreen = function (screenVal, imageVal) {
                for(let classIdx = 0; classIdx < numSegClasses; classIdx ++ ) {

                    if (screenVal == 0) {
                        return 0;
                    } else  if (screenVal == classGreyValue[classIdx]) {
                        return colorsRgbObj[classIdx].g;
                    }

                 }
            };

            customColorTable.prototype.lookupBlue = function (screenVal, imageVal) {
                for(let classIdx = 0; classIdx < numSegClasses; classIdx ++ ) {

                    if (screenVal == 0) {
                        return 0;
                    } else  if (screenVal == classGreyValue[classIdx]) {
                        return colorsRgbObj[classIdx].b;
                    }

                 }
            };

        }

        return customColorTable;
}



/**
* Get object from external json file
*
* @since 1.2.0
* @param {string} jsonURL - External file URL
* @returns {object}
* @example
*
* getExternalJSON("colorLUT.json")
* // => {0: "rgb(0,0,0)", 1: "rgb(0,255,0)", 2: "rgb(255,0,255)"}
*
*/

getExternalJSON = (jsonURL) => {
        let jsonObj;
        // read json file in sync mode
        $.ajax({
              url: jsonURL,
              async: false,
              dataType: 'json',
              success: function (response) {
                jsonObj = response
                //-- colors : {0: "rgb(0,0,0)", 1: "rgb(0,255,0)", 2: "rgb(255,0,255)"}
              }
            });

        return jsonObj;

}


getCustomColorTableFromUrl = (numSegClasses, colorURL ) => {


        var customColorTable = function() { };

        let colors;
        // read json file in sync mode
        $.ajax({
              url: colorURL,
              async: false,
              dataType: 'json',
              success: function (response) {
                colors = response
                //-- colors : {0: "rgb(0,0,0)", 1: "rgb(0,255,0)", 2: "rgb(255,0,255)"}
              }
            });



        // console.log("colors: ", colors);


        let colorsRgbObj = [];

        // Array of threshold grey value of each class
        let classGreyValue = [];


        // Find the threshold grey value of each class
        for(let classIdx = 0; classIdx < numSegClasses; classIdx ++ ) {
              classGreyValue[classIdx] = Math.round(classIdx*255/(numSegClasses - 1));
              // if file exist
              colorsRgbObj[classIdx] =  getRgbObject(colors[classIdx]);
              //console.log(" colorsRgbObj[classIdx] ", colorsRgbObj[classIdx])
        }


        customColorTable.prototype.lookupRed = function (screenVal, imageVal) {

            for(let classIdx = 0; classIdx < numSegClasses; classIdx ++ ) {

                if (screenVal == 0) {
                    return 0;
                } else  if (screenVal == classGreyValue[classIdx]) {
                    return colorsRgbObj[classIdx].r;
                }

             }

        };

        customColorTable.prototype.lookupGreen = function (screenVal, imageVal) {
            for(let classIdx = 0; classIdx < numSegClasses; classIdx ++ ) {

                if (screenVal == 0) {
                    return 0;
                } else  if (screenVal == classGreyValue[classIdx]) {
                    return colorsRgbObj[classIdx].g;
                }

             }
        };

        customColorTable.prototype.lookupBlue = function (screenVal, imageVal) {
            for(let classIdx = 0; classIdx < numSegClasses; classIdx ++ ) {

                if (screenVal == 0) {
                    return 0;
                } else  if (screenVal == classGreyValue[classIdx]) {
                    return colorsRgbObj[classIdx].b;
                }

             }
        };

        return customColorTable;
}


/**
* Fetch Labels data from labels.json file  -- (refine)
*
* @since 1.0.0
* @param {string} labelsURL - label url e.g. "./models/meshnet_dropout/mnm_dropout/labels.json".
* @example
*
* fetchLabelStructure("./models/meshnet_dropout/mnm_dropout/labels.json")
*
*/

fetchLabelStructure = (labelsURL) => {

    if(labelsURL !== null) {

        let labelsDataObj;
        $.ajax({
              url: labelsURL,
              async: false,
              dataType: 'json',
              success: function (response) {
                labelsDataObj = response
                //-- labelsDataObj { 0: "background", 1: "Grey Matter", 2: "White Matter" }
              }
            });


        var customAtlas = function() { };

        customAtlas.prototype.getLabelAtCoordinate = function (xWorld, yWorld, zWorld, xIndex, yIndex, zIndex ) {
            let labels = labelsDataObj;
            let voxelValue = papayaContainers[1].viewer.getCurrentValueAt(xIndex,yIndex,zIndex);
            return [labels[voxelValue]]; //-- [labels[0]] = "background"

        };

        papaya.Container.atlas =  new customAtlas();

    } else {
       console.log(" No labels file found for this model")
    }
}



/**
* Fetch Labels data from labels.json file and annotate while mouse moving  --(refine)
*
* @since 1.0.0
* @param {string} labelsURL - label url e.g. "./models/meshnet_dropout/mnm_dropout/labels.json".
* @param {number} papayaContainerIdx - 0 for MRI viewer and 1 for laber viewer.
* @example
*
* addMouseMoveHandler("./models/meshnet_dropout/mnm_dropout/labels.json", 0)
*
*/

addMouseMoveHandler = (labelsURL, papayaContainerIdx = 1) => {

    if(labelsURL !== null) {

        let labelsDataObj; //-- labelsDataObj { 0: "background", 1: "Grey Matter", 2: "White Matter" }
        $.ajax({
              url: labelsURL,
              async: false,
              dataType: 'json',
              success: function (response) {
                labelsDataObj = response
              }
            });

        let canvasMain  = papayaContainers[papayaContainerIdx].viewer.canvas;

        mouseMoveHandler = () => {
                let curVoxelPosition = papayaContainers[papayaContainerIdx].viewer.cursorPosition;
                let xIndex = curVoxelPosition["x"];
                let yIndex = curVoxelPosition["y"];
                let zIndex = curVoxelPosition["z"];

                try {

                    let voxelValue = papayaContainers[papayaContainerIdx].viewer.getCurrentValueAt(xIndex,yIndex,zIndex);
                    document.getElementById("annotOfContainer_" + papayaContainerIdx).value = labelsDataObj[voxelValue];

                } catch(err) {
                    console.log("Wait loading")
                }
        }

        canvasMain.addEventListener('mousemove', mouseMoveHandler);

        mouseOutHandler = () => {
                document.getElementById("annotOfContainer_" + papayaContainerIdx).value = "";
        }

        canvasMain.addEventListener('mouseout', mouseOutHandler);


    } else {
       console.log(" No labels file found for this model")
    }
}



/**
* remove mouse handler after reset the label viewer
*
* @since 1.0.0
* @param {number} papayaContainerIdx - 0 for MRI viewer and 1 for laber viewer.
* @example
*
* removeMouseMoveHandler( 1 )
*
*/

removeMouseMoveHandler = ( papayaContainerIdx ) => {

        let canvasMain  = papayaContainers[papayaContainerIdx].viewer.canvas;

        canvasMain.removeEventListener('mousemove', mouseMoveHandler);

        mouseOutHandler = () => {
                document.getElementById("annotOfContainer_" + papayaContainerIdx).value = "";
        }

        canvasMain.removeEventListener('mouseout', mouseOutHandler);

}



/**
* Remove any existing overlay from MRI Viewer on the left
*
* @since 1.0.0
* @param {number} overlayIdx- papaya viewer overlay  index
*
*/


resetMriViewerOverlay = ( overlayIdx = 1) => {

        if(numOfOverlays == 1) {
             papaya.Container.removeImage(0, overlayIdx);
             removeMouseMoveHandler(0);
             numOfOverlays = numOfOverlays -1;
        }

}

/**
* Reset label viewer (1)
*
* @since 1.0.0
*
*/


resetLabelViewer = () => {
        removeMouseMoveHandler(1);
        papayaContainers[1].viewer.resetViewer();
}


/**
* argMax large to find final labels by looping to overcome tf.argMax limitations
*
* @since 1.2.0
* @param {buffer} outVolumeBuffer- resulted buffer e.g. shape: [ 1, 256, 256, 256, 3 ]
* @param {number} num_of_slices- Total Number of slices a.k.a z-dim
* @param {number} slice_height- - Slice Height
* @param {number} slice_width- Slice Width
* @param {number} numSegClasses- The number of segmentation classes
* @returns {tf.Tensor}  Returns prediction_argmax
*
*/

argMaxLarge = (outVolumeBuffer, num_of_slices, slice_height, slice_width, numOfClasses, dtype = 'float32') => {

    if( findMinNumOfArrBufs(num_of_slices, slice_height, slice_width, numOfClasses, dtype) == 1) {

         // console.log("Convert output tensor to buffer");
        // reshape modelOutTensor.shape  : [ 1, 256, 256, 256, 3 ] to [ 256, 256, 256, 3 ]
        //-- let outVolumeBuffer = tensor2Buffer(modelOutTensor.relu().reshape([num_of_slices, slice_height, slice_width, numOfClasses]));

        //-- let  outVolumeBuffer = tensor2Buffer(modelOutTensor.reshape([num_of_slices, slice_height, slice_width, numOfClasses]));
        //-- let  outVolumeBuffer = tensor2LightBuffer(modelOutTensor.reshape([num_of_slices, slice_height, slice_width, numOfClasses]), dtype);

        console.log("Start argMaxLarge for  buffer  with last axis -1")

        let outBuffer = tf.buffer([num_of_slices, slice_height, slice_width ], dtype=tf.float32);

        for(let depthIdx = 0; depthIdx < num_of_slices; depthIdx += 1) {
            for(let rowIdx = 0; rowIdx < slice_height; rowIdx += 1) {
                for(let colIdx = 0; colIdx < slice_width; colIdx += 1) {
                    // index of buffer with max Freq or max number so the index of that buffer is the right concensus label
                    let indexOfMaxVotedBuffer = -1;
                    // let maxVoxelValue = -Infinity;
                    let maxVoxelValue = -1000000;

                    for(let bufferIdx = 0; bufferIdx < numOfClasses; bufferIdx += 1) {
                        //Requested out of range element at 1,0,0,0.   Buffer shape=1,256,256,256,3
                        let voxelValue = outVolumeBuffer.get(depthIdx, rowIdx, colIdx, bufferIdx );

                        if(maxVoxelValue <= voxelValue) {
                              maxVoxelValue = voxelValue;
                              indexOfMaxVotedBuffer = bufferIdx;
                        }
                    }

                    outBuffer.set(indexOfMaxVotedBuffer, depthIdx, rowIdx, colIdx);

                }
            }
        }

        console.log("argMaxLarge for buffer ..Done");

        return outBuffer.toTensor();

    } else {
       webix.alert(" Terminated due to browser memory limitation");
       console.log("argMaxLarge needs buffer division .. ");
       return 0;
    }
}


//-- buffersThresholds [ 3, 6] --> 0-1-2, 3-4-5
//- findBufferThreBinIdx( buffersThresholds = [3, 6], value=3) ==> return index 1 or bin-1, because bin-0 range 0-> 2

/**
* Find which buffer have the label value
*
* @since 1.0.0
* @param {Array} buffersThresholds - Array of buffers threshold values e.g.  [ 3, 6]--> 0-1-2, 3-4-5
* @param {number} labelValue- Total Number of slices a.k.a z-dim
* @returns {number}  Returns buffer index that has label value
* @example
*
* findBufferThreBinIdx( buffersThresholds = [3, 6], value=3)
*
* //==> 1     // or bin-1, because bin-0 range 0-> 2( 1 ))
*
*/

findBufferThreBinIdx = (buffersThresholds, labelValue) => {

    let binIdx = 0;

    for(let bin = 1; bin < buffersThresholds.length; bin ++) {
        if(  (labelValue >= buffersThresholds[bin-1]) &&  (labelValue < buffersThresholds[bin]) )  {
              binIdx = bin;
        }
    }

    return binIdx;
}


/**
* Create 3D tf.buffer from large 4D segmenation model
*
*
* @since 1.0.0
* @param {Array} allPredictions - Array of objects {"id": number, "coordinates": Array,  "data":1dArray })
* @param {number} num_of_slices- Total Number of slices a.k.a z-dim
* @param {number} numSegLabels- The number of segmentation classes/labels
* @param {number} slice_height- - Slice Height
* @param {number} slice_width- Slice Width
* @param {number} batch_D- batch depth-dim a.k.a z-dim
* @param {number} batch_H- batch height
* @param {number} batch_W- batch width
* @returns {tf.buffer}  Returns 3D buffer of ouput volume
*/

bufferLarge = (allPredictions, num_of_slices, slice_height, slice_width, numSegLabels, batch_D, batch_H, batch_W ) => {

            console.log(" Start buffer large ...");
            let bufferNumLabels = findSubArrBufSizes(num_of_slices, slice_height, slice_width, numSegLabels); // [25, 25, 25, 25] each buffer represent range of segmentation labels
            let numArrBufPartitions = bufferNumLabels.length;
            console.log(" Num of sub buffers : ", numArrBufPartitions);
            let buffersThresholds = accumulateArrBufSizes(bufferNumLabels); // => [ 25, 50, 75, 100 ]

            //-- Create sub-buffers
            let outVolumeBuffer = [];
            for(let arrBufIdx = 0; arrBufIdx < numArrBufPartitions; arrBufIdx ++) {
                    outVolumeBuffer[arrBufIdx] =  tf.buffer([num_of_slices, slice_height, slice_width, bufferNumLabels[arrBufIdx] ], dtype=tf.float32);
                    //labels : 0-49
                    console.log("outVolumeBuffer-" + (arrBufIdx + 1) +  " created");
            }

            console.log(" Num of created buffers : ", outVolumeBuffer.length);

            //Convert to buffer
            for(let batchIdx = 0; batchIdx < allPredictions.length; batchIdx += 1) {

                    let coord = allPredictions[batchIdx]["coordinates"];
                    let pixelValues = allPredictions[batchIdx]["data"];
                    let pixelValuesCounter = 0;

                    for(let depthIdx = coord[0]; depthIdx < (batch_D + coord[0]); depthIdx += 1) {
                        for(let rowIdx = coord[1]; rowIdx < (batch_H + coord[1]); rowIdx += 1) {
                          for(let colIdx = coord[2]; colIdx < (batch_W + coord[2]); colIdx += 1) {
                              // Find current voxel value of the related seg class buffer
                              // if we have numSegClasses = 3 then we have 3 buffers, one for each seg classes 0, 1, 2
                              let binIdx = findBufferThreBinIdx(buffersThresholds, pixelValues[pixelValuesCounter]);

                              if(binIdx == 0) {
                                 let voxelValue = outVolumeBuffer[ binIdx ].get(depthIdx, rowIdx, colIdx, pixelValues[pixelValuesCounter] );
                                 outVolumeBuffer[ binIdx ].set(voxelValue + 1, depthIdx, rowIdx, colIdx, pixelValues[pixelValuesCounter] );

                              } else {
                                  // maping to higher labels to range 0 to   (numSegClasses - Buffer1NumLabels)
                                 let voxelValue = outVolumeBuffer[ binIdx ].get(depthIdx, rowIdx, colIdx, pixelValues[pixelValuesCounter] - buffersThresholds[ binIdx-1 ]  );
                                 // increment current voxel value by 1 in the current class buffer
                                 outVolumeBuffer[ binIdx ].set(voxelValue + 1, depthIdx, rowIdx, colIdx, pixelValues[pixelValuesCounter] - buffersThresholds[ binIdx-1 ]  );
                              }

                              pixelValuesCounter += 1;
                          }
                        }
                    }
            }


            let outBuffer = [];
            for(let arrBufIdx = 0; arrBufIdx < numArrBufPartitions; arrBufIdx ++) {
                    console.log("Start argMax for  buffer-" + (arrBufIdx + 1) +  "  with last axis -1");
                    outBuffer[arrBufIdx] = tf.buffer([num_of_slices, slice_height, slice_width ], dtype=tf.float32);
                    // convert output  buffer to tensor
                    // let axis = -1; // last axis
                    // Set for each voxel the value of the index of the buffer that has the max voxel value, e.g. third buffer with index = 2 (cont..)
                    // has max voxel value = 10 then the related voxel in outVolumeTensor will have value of 2
                    for(let depthIdx = 0; depthIdx < num_of_slices; depthIdx += 1) {
                        for(let rowIdx = 0; rowIdx < slice_height; rowIdx += 1) {
                            for(let colIdx = 0; colIdx < slice_width; colIdx += 1) {
                                // index of buffer with max Freq or max number so the index of that buffer is the right concensus label
                                let indexOfMaxVotedBuffer = -1;
                                let maxVoxelValue = -1;
                                // Move through all buffers for the same voxel location and find which buffer indx has that max voxel value
                                for(let bufferIdx = 0; bufferIdx < bufferNumLabels[ arrBufIdx ] ; bufferIdx += 1) {

                                    let voxelValue = outVolumeBuffer[ arrBufIdx ].get(depthIdx, rowIdx, colIdx, bufferIdx );
                                    if(maxVoxelValue < voxelValue) {
                                       maxVoxelValue = voxelValue;
                                       indexOfMaxVotedBuffer = bufferIdx;
                                    }
                                }

                                outBuffer[ arrBufIdx ].set(indexOfMaxVotedBuffer, depthIdx, rowIdx, colIdx);

                            }
                        }
                    }

                    console.log("argMax in  buffer-" + ( arrBufIdx +1) +  " ..Done")
            }


            let outFinaleBuffer =  tf.buffer([num_of_slices, slice_height, slice_width], dtype=tf.float32);

            for(let depthIdx = 0; depthIdx < num_of_slices; depthIdx += 1) {
                for(let rowIdx = 0; rowIdx < slice_height; rowIdx += 1) {
                  for(let colIdx = 0; colIdx < slice_width; colIdx += 1) {
                         let voxelValue = [];
                         let voxel_histoMax = [];

                         for(let arrBufIdx = 0; arrBufIdx < numArrBufPartitions; arrBufIdx ++) {

                              voxelValue[ arrBufIdx ] = outBuffer[ arrBufIdx ].get(depthIdx, rowIdx, colIdx);
                              voxel_histoMax[ arrBufIdx ] = outVolumeBuffer[arrBufIdx].get(depthIdx, rowIdx, colIdx, voxelValue[ arrBufIdx ] );
                         }

                         idxMaxVal = voxel_histoMax.indexOf(voxel_histoMax.reduce((a, b) => { return Math.max(a, b) }));

                         if(idxMaxVal == 0) {
                            outFinaleBuffer.set(voxelValue[idxMaxVal], depthIdx, rowIdx, colIdx);
                         } else {
                            outFinaleBuffer.set(voxelValue[idxMaxVal] + buffersThresholds[ idxMaxVal-1 ], depthIdx, rowIdx, colIdx);
                         }
                  }
              }
            }

            return outFinaleBuffer;
}



/**
* Merge  all subvolumes output from the inference model
*
*
* @since 1.0.0
* @param {Array} allPredictions - Array of objects {"id": number, "coordinates": Array,  "data":1dArray })
* @param {number} num_of_slices- Total Number of slices a.k.a z-dim
* @param {number} numSegClasses- The number of segmentation classes
* @param {number} slice_height- - Slice Height
* @param {number} slice_width- Slice Width
* @param {number} batch_D- batch depth-dim a.k.a z-dim
* @param {number} batch_H- batch height
* @param {number} batch_W- batch width
* @param {number} axis-
* @returns {tf.Tensor}  Returns Tensor of ouput volume
*/

mergeSubVolumesV2 = (allPredictions, num_of_slices, slice_height, slice_width, numSegClasses, batch_D, batch_H, batch_W, axis) => {

        console.log("Wait while generate output labels... ");

        let outVolumeTensor;

        let transpose = inferenceModelsList[$$("selectModel").getValue() - 1]["enableTranspose"];

        let isValidBuf = isArrBufSizeValid(num_of_slices, slice_height, slice_width, numSegClasses, 'uint16');

        console.log("Buffer is uint16 Valid ..")

        // buffer set ( depth, H, W) in order
        // -- if(numSegClasses <= opts.browserArrayBufferMaxZDim ) {
        if( isValidBuf ) {
            let outVolumeBuffer =  new Buffer([num_of_slices, slice_height, slice_width, numSegClasses ], 'uint16');
            console.log("New uint16 buffer called ..")

            //Convert to buffer
            for(let batchIdx = 0; batchIdx < allPredictions.length; batchIdx += 1) {

                    let coord = allPredictions[batchIdx]["coordinates"];
                    let pixelValues = allPredictions[batchIdx]["data"];
                    let pixelValuesCounter = 0;

                    for(depthIdx = coord[0]; depthIdx < (batch_D + coord[0]); depthIdx += 1) {
                        for(rowIdx = coord[1]; rowIdx < (batch_H + coord[1]); rowIdx += 1) {
                          for(colIdx = coord[2]; colIdx < (batch_W + coord[2]); colIdx += 1) {
                              // Find current voxel value of the related seg class buffer
                              // if we have numSegClasses = 3 then we have 3 buffers, one for each seg classes 0, 1, 2
                              let voxelValue = outVolumeBuffer.get(depthIdx, rowIdx, colIdx, pixelValues[pixelValuesCounter] );
                              // increment current voxel value by 1 in the current class buffer
                              outVolumeBuffer.set(voxelValue + 1, depthIdx, rowIdx, colIdx, pixelValues[pixelValuesCounter] );

                              pixelValuesCounter += 1;
                          }
                        }
                    }
             }

            // convert output  buffer to tensor

            // Set for each voxel the value of the index of the buffer that has the max voxel value, e.g. third buffer with index = 2 (cont..)
            // has max voxel value = 10 then the related voxel in outVolumeTensor will have value of 2



            try {
                  console.log(" Try for merging  with tf.argMax ..");
                  //-- outVolumeBuffer.toTensor() will convert to dtype float32
                  outVolumeTensor = tf.argMax(outVolumeBuffer.toTensor(), axis);

            } catch(err1) {
                 // -- common error message:
                 //-- WebGL2RenderingContext.texImage2D: Argument 9 can't be
                 //-- an ArrayBuffer or an ArrayBufferView larger than 2 GB
                 if(axis == -1) {

                       try {
                           let argMaxLargeTime = performance.now();
                           console.log(" tf.argMax failed .. try argMaxLarge ..");
                           outVolumeTensor = argMaxLarge(outVolumeBuffer, num_of_slices, slice_height, slice_width, numSegClasses, 'uint8');
                           console.log("argMaxLarge for fullVolume takes : ", ((performance.now() - argMaxLargeTime)/1000).toFixed(4)  );


                       } catch(err2) {

                              let errTxt = "Merging argMax buffer couldn't be created due to limited memory resources.";
                              webix.alert(errTxt);

                              //window.clearInterval( timer );
                              tf.engine().endScope();
                              tf.engine().disposeVariables();

                              statData["Inference_t"] = Infinity;
                              statData["Postprocess_t"] = Infinity;
                              statData["Status"] = "Fail";
                              statData["Error_Type"] = err2.message;
                              statData["Extra_Err_Info"] = "Merging function tf.argMax failed and  argMaxLarge failed.";

                             if(opts.telemetryFlag) {
                                  submitTiming2GoogleSheet(statData);
                             }

                             return 0;

                       }

                  } else {
                      // if channel first ..
                      let errTxt = "Merging argMax buffer couldn't be created due to limited memory resources.";
                      webix.alert(errTxt);

                      tf.engine().endScope();
                      tf.engine().disposeVariables();

                      statData["Inference_t"] = Infinity;
                      statData["Postprocess_t"] = Infinity;
                      statData["Status"] = "Fail";
                      statData["Error_Type"] = err1.message;
                      statData["Extra_Err_Info"] = "Merging function tf.argMax failed and argMaxLarge not support yet channel first";

                     if(opts.telemetryFlag) {
                          submitTiming2GoogleSheet(statData);
                     }

                     return 0;
                  }

            }


            // Transpose MRI data to be match pytorch/keras input output
            if(transpose) {
               console.log("outVolumeTensor transposed");
               outVolumeTensor = outVolumeTensor.transpose();
            }


        } else { // Can be subdivided into 2 subBuffers

            let outFinaleBuffer;

             try {
                 outFinaleBuffer = bufferLarge(allPredictions, num_of_slices, slice_height, slice_width, numSegClasses, batch_D, batch_H, batch_W);
             } catch(err3) {

                    let errTxt = "Buffer couldn't be created due to limited memory resources.";
                    webix.alert(errTxt);
                    tf.engine().endScope();
                    tf.engine().disposeVariables();

                    statData["Inference_t"] = Infinity;
                    statData["Postprocess_t"] = Infinity;
                    statData["Status"] = "Fail";
                    statData["Error_Type"] = err3.message;
                    statData["Extra_Err_Info"] = "bufferLarge couldn't be created due to limited memory resources.";

                   if(opts.telemetryFlag) {
                        submitTiming2GoogleSheet(statData);
                   }

                   return 0;

             }

            console.log("Final merged buffer -- Done");
            outVolumeTensor =  outFinaleBuffer.toTensor();


            // Transpose MRI data to be match pytorch/keras input output
            if(transpose) {
               console.log("Final merged buffer transposed");
               outVolumeTensor = outVolumeTensor.transpose();
            }

        }

      return outVolumeTensor;

}


mergeSubVolumes_old = (allPredictions, num_of_slices, slice_height, slice_width, numSegClasses, batch_D, batch_H, batch_W, axis) => {

        console.log("Wait while generate output labels... ");
        let unstackOutVolumeTensor;

        let transpose = inferenceModelsList[$$("selectModel").getValue() - 1]["enableTranspose"];

        let isValidBuf = isArrBufSizeValid(num_of_slices, slice_height, slice_width, numSegClasses);

        // buffer set ( depth, H, W) in order
        // -- if(numSegClasses <= opts.browserArrayBufferMaxZDim ) {
        if( isValidBuf ) {
            let outVolumeBuffer =  tf.buffer([num_of_slices, slice_height, slice_width, numSegClasses ], dtype=tf.float32)


            //Convert to buffer
            for(let batchIdx = 0; batchIdx < allPredictions.length; batchIdx += 1) {

                    let coord = allPredictions[batchIdx]["coordinates"];
                    let pixelValues = allPredictions[batchIdx]["data"];
                    let pixelValuesCounter = 0;

                    for(depthIdx = coord[0]; depthIdx < (batch_D + coord[0]); depthIdx += 1) {
                        for(rowIdx = coord[1]; rowIdx < (batch_H + coord[1]); rowIdx += 1) {
                          for(colIdx = coord[2]; colIdx < (batch_W + coord[2]); colIdx += 1) {
                              // Find current voxel value of the related seg class buffer
                              // if we have numSegClasses = 3 then we have 3 buffers, one for each seg classes 0, 1, 2
                              let voxelValue = outVolumeBuffer.get(depthIdx, rowIdx, colIdx, pixelValues[pixelValuesCounter] );
                              // increment current voxel value by 1 in the current class buffer
                              outVolumeBuffer.set(voxelValue + 1, depthIdx, rowIdx, colIdx, pixelValues[pixelValuesCounter] );

                              pixelValuesCounter += 1;
                          }
                        }
                    }
             }

            // convert output  buffer to tensor

            // Set for each voxel the value of the index of the buffer that has the max voxel value, e.g. third buffer with index = 2 (cont..)
            // has max voxel value = 10 then the related voxel in outVolumeTensor will have value of 2

            let outVolumeTensor;

            try {
                  console.log(" Try for merging tf.argMax ..");
                  outVolumeTensor = tf.argMax(outVolumeBuffer.toTensor(), axis);

            } catch(err1) {
                 // -- common error message:
                 //-- WebGL2RenderingContext.texImage2D: Argument 9 can't be
                 //-- an ArrayBuffer or an ArrayBufferView larger than 2 GB
                 if(axis == -1) {

                       try {
                           let argMaxLargeTime = performance.now();
                           console.log(" tf.argMax failed .. try argMaxLarge ..");
                           outVolumeTensor = argMaxLarge(outVolumeBuffer, num_of_slices, slice_height, slice_width, numSegClasses, 'uint16');
                           console.log("argMaxLarge for fullVolume takes : ", ((performance.now() - argMaxLargeTime)/1000).toFixed(4)  );

                       } catch(err2) {

                              let errTxt = "Merging argMax buffer couldn't be created due to limited memory resources.";
                              webix.alert(errTxt);

                              // window.clearInterval( timer );
                              tf.engine().endScope();
                              tf.engine().disposeVariables();

                              statData["Inference_t"] = Infinity;
                              statData["Postprocess_t"] = Infinity;
                              statData["Status"] = "Fail";
                              statData["Error_Type"] = err2.message;
                              statData["Extra_Err_Info"] = "Merging function tf.argMax failed and  argMaxLarge failed.";

                             if(opts.telemetryFlag) {
                                  submitTiming2GoogleSheet(statData);
                             }

                             return 0;

                       }

                  } else {
                      // if channel first ..
                      let errTxt = "Merging argMax buffer couldn't be created due to limited memory resources.";
                      webix.alert(errTxt);

                      tf.engine().endScope();
                      tf.engine().disposeVariables();

                      statData["Inference_t"] = Infinity;
                      statData["Postprocess_t"] = Infinity;
                      statData["Status"] = "Fail";
                      statData["Error_Type"] = err1.message;
                      statData["Extra_Err_Info"] = "Merging function tf.argMax failed and argMaxLarge not support yet channel first";

                     if(opts.telemetryFlag) {
                          submitTiming2GoogleSheet(statData);
                     }

                     return 0;
                  }

            }


            // Transpose MRI data to be match pytorch/keras input output
            if(transpose) {
               console.log("outVolumeTensor transposed");
               outVolumeTensor = outVolumeTensor.transpose();
            }

            unstackOutVolumeTensor = tf.unstack(outVolumeTensor);

            outVolumeTensor.dispose();


        } else if( findMinNumOfArrBufs(num_of_slices, slice_height, slice_width, numSegClasses) <= 2) { // Can be subdivided into 2 subBuffers

            let Buffer1NumLabels = Math.round(numSegClasses/2);

            let outVolumeBuffer1 =  tf.buffer([num_of_slices, slice_height, slice_width, Buffer1NumLabels ], dtype=tf.float32)
            //labels : 0-49
            console.log("outVolumeBuffer-1 created");

            let outVolumeBuffer2 =  tf.buffer([num_of_slices, slice_height, slice_width, numSegClasses - Buffer1NumLabels ], dtype=tf.float32)
            // labels : 50 - (numSegClasses-1)
            console.log("outVolumeBuffer-2 created");


            //Convert to buffer
            for(let batchIdx = 0; batchIdx < allPredictions.length; batchIdx += 1) {

                    let coord = allPredictions[batchIdx]["coordinates"];
                    let pixelValues = allPredictions[batchIdx]["data"];
                    let pixelValuesCounter = 0;

                    for(let depthIdx = coord[0]; depthIdx < (batch_D + coord[0]); depthIdx += 1) {
                        for(let rowIdx = coord[1]; rowIdx < (batch_H + coord[1]); rowIdx += 1) {
                          for(let colIdx = coord[2]; colIdx < (batch_W + coord[2]); colIdx += 1) {
                              // Find current voxel value of the related seg class buffer
                              // if we have numSegClasses = 3 then we have 3 buffers, one for each seg classes 0, 1, 2
                              if(pixelValues[pixelValuesCounter] < Buffer1NumLabels) {
                                  let voxelValue1 = outVolumeBuffer1.get(depthIdx, rowIdx, colIdx, pixelValues[pixelValuesCounter] );
                                  // increment current voxel value by 1 in the current class buffer
                                  outVolumeBuffer1.set(voxelValue1 + 1, depthIdx, rowIdx, colIdx, pixelValues[pixelValuesCounter] );
                              } else {
                                   // maping to higher labels to range 0 to   (numSegClasses - Buffer1NumLabels)
                                  let voxelValue2 = outVolumeBuffer2.get(depthIdx, rowIdx, colIdx, pixelValues[pixelValuesCounter] - Buffer1NumLabels );
                                  // increment current voxel value by 1 in the current class buffer
                                  outVolumeBuffer2.set(voxelValue2 + 1, depthIdx, rowIdx, colIdx, pixelValues[pixelValuesCounter] - Buffer1NumLabels );

                              }

                              pixelValuesCounter += 1;
                          }
                        }
                    }
             }

            console.log("Start argMax for  buffer-1  with last axis -1")

            let outBuffer1 = tf.buffer([num_of_slices, slice_height, slice_width ], dtype=tf.float32) ;


            // convert output  buffer to tensor
            // let axis = -1; // last axis
            // Set for each voxel the value of the index of the buffer that has the max voxel value, e.g. third buffer with index = 2 (cont..)
            // has max voxel value = 10 then the related voxel in outVolumeTensor will have value of 2
            for(let depthIdx = 0; depthIdx < num_of_slices; depthIdx += 1) {
                for(let rowIdx = 0; rowIdx < slice_height; rowIdx += 1) {
                    for(let colIdx = 0; colIdx < slice_width; colIdx += 1) {
                        // index of buffer with max Freq or max number so the index of that buffer is the right concensus label
                        let indexOfMaxVotedBuffer = -1;
                        let maxVoxelValue = -1;
                        // Move through all buffers for the same voxel location and find which buffer indx has that max voxel value
                        for(let bufferIdx = 0; bufferIdx < Buffer1NumLabels; bufferIdx += 1) {
                            let voxelValue = outVolumeBuffer1.get(depthIdx, rowIdx, colIdx, bufferIdx );
                            if(maxVoxelValue < voxelValue) {
                               maxVoxelValue = voxelValue;
                               indexOfMaxVotedBuffer = bufferIdx;
                            }
                        }

                        outBuffer1.set(indexOfMaxVotedBuffer, depthIdx, rowIdx, colIdx);

                    }
                }
            }

            console.log("argMax in  buffer-1 ..Done")


            console.log("Start argMax for  buffer-2  with last axis -1")

            let outBuffer2 = tf.buffer([num_of_slices, slice_height, slice_width ], dtype=tf.float32) ;

            for(let depthIdx = 0; depthIdx < num_of_slices; depthIdx += 1) {
                for(let rowIdx = 0; rowIdx < slice_height; rowIdx += 1) {
                    for(let colIdx = 0; colIdx < slice_width; colIdx += 1) {
                        // index of buffer with max Freq or max number so the index of that buffer is the right concensus label
                        let indexOfMaxVotedBuffer = -1;
                        let maxVoxelValue = -1;

                        for(let bufferIdx = 0; bufferIdx < (numSegClasses - Buffer1NumLabels); bufferIdx += 1) {
                            let voxelValue = outVolumeBuffer2.get(depthIdx, rowIdx, colIdx, bufferIdx );
                            if(maxVoxelValue < voxelValue) {
                               maxVoxelValue = voxelValue;
                               indexOfMaxVotedBuffer = bufferIdx;
                            }
                        }

                        outBuffer2.set(indexOfMaxVotedBuffer, depthIdx, rowIdx, colIdx);

                    }
                }
            }

            console.log("argMax in  buffer-2 ..Done")
            let outFinaleBuffer =  tf.buffer([num_of_slices, slice_height, slice_width], dtype=tf.float32)

            for(let depthIdx = 0; depthIdx < num_of_slices; depthIdx += 1) {
                for(let rowIdx = 0; rowIdx < slice_height; rowIdx += 1) {
                  for(let colIdx = 0; colIdx < slice_width; colIdx += 1) {

                     let voxelValue1 = outBuffer1.get(depthIdx, rowIdx, colIdx);
                     let voxel1_histoMax = outVolumeBuffer1.get(depthIdx, rowIdx, colIdx, voxelValue1 );
                     let voxelValue2 = outBuffer2.get(depthIdx, rowIdx, colIdx);
                     let voxel2_histoMax = outVolumeBuffer2.get(depthIdx, rowIdx, colIdx, voxelValue2 );
                     if(voxel2_histoMax < voxel1_histoMax) {
                         outFinaleBuffer.set(voxelValue1, depthIdx, rowIdx, colIdx);
                     } else {
                         outFinaleBuffer.set(voxelValue2 + Buffer1NumLabels, depthIdx, rowIdx, colIdx);

                     }

                  }
              }
          }

            console.log("Final merged buffer -- Done");
            let outFinaleTensor =  outFinaleBuffer.toTensor();


            // Transpose MRI data to be match pytorch/keras input output
            if(transpose) {
               console.log("Final merged buffer transposed");
               outFinaleTensor = outFinaleTensor.transpose();
            }

            unstackOutVolumeTensor = tf.unstack(outFinaleTensor);
            outFinaleTensor.dispose();

        } else {

              let errTxt = "Merging buffer couldn't be created due to limited memory resources.";
              webix.alert(errTxt);

              tf.engine().endScope();
              tf.engine().disposeVariables();

              statData["Inference_t"] = Infinity;
              statData["Postprocess_t"] = Infinity;
              statData["Status"] = "Fail";
              //statData["Error_Type"] = "SW Enhancement needed";
              statData["Extra_Err_Info"] = "Merging buffer needs divide into more than 2 partitions";

             if(opts.telemetryFlag) {
                  submitTiming2GoogleSheet(statData);
             }

             return 0;

        }

      return unstackOutVolumeTensor;

}





/**
* Generate output labels of all slices. (refine)
* Find current voxel value of the related seg class buffer, if we have numSegClasses = 3 then we have 3 buffers,
* one for each seg classes 0, 1, 2
*
* @since 1.0.0
* @param {tf.Tensor}  unstackOutVolumeTensor
* @param {number} num_of_slices- Total Number of slices a.k.a z-dim
* @param {number} numSegClasses- The number of segmentation classes
* @param {number} slice_height- - Slice Height
* @param {number} slice_width- Slice Width
*
*/

    function convertTo3DArrayAndFlip(allOutputSlices3DCC1DimArray, shape) {
        const [num_of_slices, slice_height, slice_width] = shape;
  // Create a 3D array (as a flattened 1D typed array for efficiency)
  const size = num_of_slices * slice_height * slice_width;
  const threeDArray = new allOutputSlices3DCC1DimArray.constructor(size);

  for (let slice = 0; slice < num_of_slices; slice++) {
    for (let row = 0; row < slice_height; row++) {
      // Calculate the starting index for this row in the source and destination arrays
      const srcStartIndex = (slice * slice_height * slice_width) + (row * slice_width);
      const destStartIndex = (slice * slice_height * slice_width) + ((slice_height - row - 1) * slice_width);
      
      // Copy a slice row into the correct position in the 3D array, flipping it in the process
      threeDArray.set(
        allOutputSlices3DCC1DimArray.subarray(srcStartIndex, srcStartIndex + slice_width), 
        destStartIndex
      );
    }
  }

  // Convert the flattened typed array back to a nested regular array structure
  const nestedArray = [];
  for (let slice = 0; slice < num_of_slices; slice++) {
    const twoDArray = [];
    for (let row = 0; row < slice_height; row++) {
      const start = (slice * slice_height * slice_width) + (row * slice_width);
      const end = start + slice_width;
      twoDArray.push(Array.from(threeDArray.subarray(start, end)));
    }
    nestedArray.push(twoDArray);
  }

  return nestedArray;
}
    generateOutputSlicesV2 = (img, OutVolumeTensorShape, OutVolumeTensorType, num_of_slices, numSegClasses, slice_height, slice_width) => {


        // Convert all slices into 1 Dim array
        let allOutputSlices3DCC = [];
    let allOutputSlices3DContours = [];


    if(opts.isPostProcessEnable) {
        const niivueInstance = new Niivue();
        const dim = new Uint32Array(OutVolumeTensorShape);
        const conn = 26; // Example connectivity
        const binarize = true;
        const onlyLargestClusterPerClass = true;

        const [labelCount, labeledImage] = niivueInstance.bwlabel(img,
                                                                  dim,
                                                                  conn,
                                                                  binarize,
                                                                  onlyLargestClusterPerClass);
        for (let i = 0; i < img.length; i++) {
            img[i] *= labeledImage[i];
        }
    };
        const typedArrayConstructor = {
            'float32': Float32Array,
            'int32': Int32Array,
            // Add other cases as needed for different dtypes
        }[OutVolumeTensorType];

        // Create a new TypedArray from img with the same type as outLabelVolume
       allOutputSlices3DCC1DimArray = new Uint8Array(img);


        let maskBrainExtraction = false;

        let labelArrayBuffer;
        let modelType = inferenceModelsList[$$("selectModel").getValue() - 1]["type"];

        switch ( modelType) {
                 case 'Brain_Masking':
                                     {
                                        const brainMask = new Uint8Array(allOutputSlices3DCC1DimArray.length);
                                        for (let i = 0; i < allOutputSlices3DCC1DimArray.length; i++) {
                                            brainMask[i] = allOutputSlices3DCC1DimArray[i] !== 0 ? 1 : 0;
                                        }
                                        labelArrayBuffer = createNiftiOutArrayBuffer(rawNiftiData, brainMask);
                                        allOutputSlices3DCC1DimArray = brainMask;
                                        // --labelsHistogramMap = null;
                                        maskBrainExtraction = true;
                                        break;
                                     }
               case 'Brain_Extraction':
                                    {
                                        const maskedData = new Uint8Array(allOutputSlices3DCC1DimArray.length);
                                        const brainData = nifti2data(rawNiftiData);

                                        for (let i = 0; i < allOutputSlices3DCC1DimArray.length; i++) {
                                            // Create the mask - 1 where the value is non-zero, 0 where it is zero.
                                            const maskValue = allOutputSlices3DCC1DimArray[i] !== 0 ? 1 : 0;
                                            // Apply the mask to the data - multiply by the mask value.
                                            maskedData[i] = brainData[i] * maskValue;
                                        }
                                        labelArrayBuffer = createNiftiOutArrayBuffer(rawNiftiData, maskedData);

                                        // Update `allOutputSlices3DCC1DimArray` if needed.
                                        allOutputSlices3DCC1DimArray = maskedData;

                                        // Other operations...
                                        maskBrainExtraction = true;

                                        break;
                                    }
                             default:
                                    {
                                      labelArrayBuffer = createNiftiOutArrayBuffer(rawNiftiData, allOutputSlices3DCC1DimArray);
                                      break;
                                    }
        }


        // Find voxel values frequency
        let labelsHistogramMap = arrValuesFreq(allOutputSlices3DCC1DimArray);
        console.log("Output Segmentation Labels (ROI) volumes : ",  labelsHistogramMap);

        // Convert map to object
        let labelsHistoObj = map2Object(labelsHistogramMap);

        // to plot 3d shape
        console.log("convert out1DArr to 3DArr: let keep it 1D though")
        // outVolumeStatus['out3DArr'] = tf.tensor(allOutputSlices3DCC1DimArray, [num_of_slices, slice_height, slice_width]).reverse(1).arraySync();
        // outVolumeStatus['out3DArr'] = convertTo3DArrayAndFlip(allOutputSlices3DCC1DimArray, num_of_slices, slice_height, slice_width);
        // Let us leave the processing to the last moment, when the user choses to view this in 3D. Let's not waste time on conversion now
        outVolumeStatus['out3DArr'] = allOutputSlices3DCC1DimArray;
        outVolumeStatus['out3DArrShape'] = [num_of_slices, slice_height, slice_width];
        let colorURL = inferenceModelsList[$$("selectModel").getValue() - 1]["colorsPath"];

        if(opts.isColorEnable) {
            let blob = new Blob([labelArrayBuffer], {type: "application/octet-binary;charset=utf-8"});
            let file = new File([blob], "temp.nii");
            params_label["files"] = [file];

            switch ( modelType) {
                        case 'Brain_Mask':
                                         {
                                            params_label[file["name"]] = {lut: "Grayscale", interpolation: false};
                                            break;
                                         }
                   case 'Brain_Extraction':
                                         {
                                            params_label[file["name"]] = {lut: "Grayscale", interpolation: false};
                                            break;
                                        }
                                 default:
                                        {
                                            if(colorURL) { // colorURL file exists
                                                    let customColorTable = getCustomColorTableFromUrl(numSegClasses, colorURL);
                                                     params_label[file["name"]] = {lut:  new customColorTable(), interpolation: false};

                                            } else {// No colorURL file
                                                if(numSegClasses > 3) {
                                                    params_label[file["name"]] = {lut: opts.atlasSelectedColorTable, interpolation: false};

                                                } else {
                                                    let customColorTable = getCustomColorTable(numSegClasses);
                                                    params_label[file["name"]] = {lut: new customColorTable(), interpolation: false};
                                                }
                                            }

                                          break;
                                        }
            }


        } else {
            params_label["binaryImages"] = [labelArrayBuffer];
        }

        // Set the view of container-2 as container-1
        params_label["mainView"] = papayaContainers[0].viewer.mainImage.sliceDirection == 1? "axial" :
                                   papayaContainers[0].viewer.mainImage.sliceDirection == 2? "coronal" : "sagittal";



        //-- Remove any existing overlay
        resetMriViewerOverlay(1);

        // Add new overlay to MRI viewer
        var addImageParams = [];
        addImageParams["binaryImages"] = {lut: "Spectrum"};
        papaya.Container.addImage(0, [labelArrayBuffer], addImageParams);
        numOfOverlays += 1;


        // Label segmenation voxels according to label file
        console.log("label path: ", inferenceModelsList[$$("selectModel").getValue() - 1]["labelsPath"])

        // set 1 for label viewer
        papaya.Container.resetViewer(1, params_label);

        let labelsURL = inferenceModelsList[$$("selectModel").getValue() - 1]["labelsPath"];

        //Activate annotation for papaya container 0
        addMouseMoveHandler(labelsURL , 0);

        //Activate annotation for papaya container 1
        addMouseMoveHandler(labelsURL, 1);

        // Activate Swap view button for MRI viewer
        // This needed to deactivated because of async behave
        document.getElementById(PAPAYA_CONTROL_MAIN_SWAP_BUTTON_CSS + papayaContainers[0].containerIndex).disabled = false;


        // To sync swap view button
        document.getElementById(PAPAYA_CONTROL_MAIN_SWAP_BUTTON_CSS + papayaContainers[0].containerIndex).addEventListener("click", function(){
              papayaContainers[1].viewer.rotateViews()

        })

        document.getElementById(PAPAYA_CONTROL_MAIN_SWAP_BUTTON_CSS + papayaContainers[1].containerIndex).addEventListener("click", function(){
              papayaContainers[0].viewer.rotateViews()
        })


        outVolumeStatus['labelsHistoObj'] = labelsHistoObj;

        //--Remvoe background volume
        delete labelsHistoObj['0'];
        let totalTissueVol = 0;
        Object.keys(labelsHistoObj).forEach((labelKey, idx) => {
              //-- Make sure to delete labelsHistoObj['0'] before
              totalTissueVol += labelsHistoObj[labelKey];
        })

        let roiData = [];
        let roiLabels = [];
        let chartXaxisStep = 1;

        // console.log("labelsHistoObj Keys: ", Object.keys(labelsHistoObj));


        let colorLutObj = getExternalJSON(colorURL);
        //--e.g. colorLutObj- e.g. {"0": "rgb(0,0,0)", "1": "rgb(245,245,245)", "2": "rgb(196,58,250)", ... }
        let labelsObj = getExternalJSON(labelsURL);
        //-- e.g. labelsObj- { "0": "BG",  "1": "Cerebral-White-Matter",  "2": "Ventricle",..}

        // Color object, check if segmenation labels less or equal colors
        if ( isObject(colorLutObj) ? verifyChildParentObjects( Object.keys(labelsHistoObj).length, Object.keys(colorLutObj).length) : false ) {

                Object.keys(labelsHistoObj).forEach((labelKey, idx) => {
                     roiData.push({y: labelsHistoObj[labelKey] * 1 / totalTissueVol, color: rgbToHex( getRgbObject( colorLutObj[labelKey] ) ) });
                })

        } else {
                colorLutObj = {};

                Object.keys(labelsHistoObj).forEach((labelKey, idx) => {
                      colorLutObj[labelKey] =  "rgb(" + labelKey + "," + labelKey + "," + labelKey + ")";
                })

                Object.keys(labelsHistoObj).forEach((labelKey, idx) => {
                     roiData.push({y: labelsHistoObj[labelKey] * 1 / totalTissueVol, color: rgbToHex( getRgbObject( colorLutObj[labelKey] ) ) });

                })

        }

        outVolumeStatus['colorLutObj'] = colorLutObj;


        // label object, check if segmenation classes have less or equal labels in the label json file
        if ( isObject(labelsObj) ? verifyChildParentObjects( Object.keys(labelsHistoObj), Object.keys(labelsObj) ): false ) {

                Object.keys(labelsHistoObj).forEach((labelKey, idx) => {
                     roiLabels[idx] =  labelsObj[labelKey];
                })

                outVolumeStatus['labelsObj'] = labelsObj;

        } else {
                labelsObj = {};

                Object.keys(labelsHistoObj).forEach((labelKey, idx) => {
                      labelsObj[labelKey] = labelKey;
                })

                Object.keys(labelsHistoObj).forEach((labelKey, idx) => {
                     if(idx == 0 || idx == Math.round(Object.keys(labelsHistoObj).length * opts.chartXaxisStepPercent) || idx == Object.keys(labelsHistoObj).length -1 ){
                         roiLabels[idx] =  labelsObj[labelKey];
                     }

                })

                chartXaxisStep = Math.round(Object.keys(labelsHistoObj).length * opts.chartXaxisStepPercent);
                // To only show All make label null
                outVolumeStatus['labelsObj'] = null;
        }



        // if( (! maskBrainExtraction) && (labelsURL !== null) && (colorURL !== null) ) { // If Atlas 50, 104  or GMWM Segmenations

        //      let colorLutObj = getExternalJSON(colorURL);
        //      outVolumeStatus['colorLutObj'] = colorLutObj;
        //      //--e.g. colorLutObj- e.g. {"0": "rgb(0,0,0)", "1": "rgb(245,245,245)", "2": "rgb(196,58,250)", ... }

        //      let labelsObj = getExternalJSON(labelsURL);
        //      outVolumeStatus['labelsObj'] = labelsObj;
        //      //-- e.g. labelsObj- { "0": "BG",  "1": "Cerebral-White-Matter",  "2": "Ventricle",..}


        //       Object.keys(labelsHistoObj).forEach((labelKey, idx) => {
        //            roiData.push({y: labelsHistoObj[labelKey] * 1 / totalTissueVol, color: rgbToHex( getRgbObject( colorLutObj[labelKey] ) ) });
        //            roiLabels[idx] =  labelsObj[labelKey];
        //       })

        //       //-- roiData = [ {y: 34.4, color: 'red'}, {y: 20.1, color: '#aaff99'}];
        //       //-- roiLabels = ['Roi-1','Roi-2'];

        // } else { // For mask or brain extraction models or when label/color json not provided

        //       let colorLutObj = {};
        //       let labelsObj = {};

        //       Object.keys(labelsHistoObj).forEach((labelKey, idx) => {
        //             colorLutObj[labelKey] =  "rgb(" + labelKey + "," + labelKey + "," + labelKey + ")";
        //             labelsObj[labelKey] = labelKey;
        //       })


        //       Object.keys(labelsHistoObj).forEach((labelKey, idx) => {
        //            roiData.push({y: labelsHistoObj[labelKey] * 1 / totalTissueVol, color: rgbToHex( getRgbObject( colorLutObj[labelKey] ) ) });
        //            if(idx == 0 || idx == Math.round(Object.keys(labelsHistoObj).length * opts.chartXaxisStepPercent) || idx == Object.keys(labelsHistoObj).length -1 ){
        //                roiLabels[idx] =  labelsObj[labelKey];
        //            }

        //       })

        //       chartXaxisStep = Math.round(Object.keys(labelsHistoObj).length * opts.chartXaxisStepPercent);

        //       outVolumeStatus['colorLutObj'] = colorLutObj;
        //       // To only show All make label null
        //       outVolumeStatus['labelsObj'] = null;
        // }


        $$("hchart").config.settings.xAxis.categories = roiLabels;
        $$("hchart").config.settings.xAxis.labels.step = chartXaxisStep;
        $$("hchart").config.settings.series[0].data  = roiData;
        $$("hchart")._render();

        $$("out3DIcon").enable();
        $$("outChartIcon").enable();
        document.getElementById("out3D-1").style.opacity = 1;
        document.getElementById("outChart-1").style.opacity = 1;
        document.getElementById("out3D-1").style.filter = "alpha(opacity=100)";
        document.getElementById("outChart-1").style.filter = "alpha(opacity=100)";

  }


/**
* Threshold canvas of the viewer
*
* @since 1.0.0
* @param {CanvasRenderingContext2D } ctx - renderContext e.g.  papayaContainers[0].viewer.canvas.getContext("2d")
* @param {number} Threshold - To threshold the canvas context
* @param {object} RGB - e.g. { r: 110, g: 255, b: 182 }
*
*/

  thresholdRenderContext = (ctx,Threshold, RGB ={ r: 110, g: 255, b: 182 }) => {

        let imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        let pixels = imgData.data;
        for (var i = 0; i < pixels.length; i += 4) {

          if(pixels[i] <= Threshold) {
             pixels[i] = pixels[i + 1] = pixels[i + 2] = 0
          }
        }

        ctx.putImageData(imgData, 0, 0);
  }





  refreshDiv = (divId) => {
      $( "#"+ divId ).load(window.location.href + " #"+ divId );
  }


/**
* Function to use with checking output file name, it must start with letter a-z or A-Z
*
* @since 1.0.0
* @param {*} ch - character to check
* @returns {boolean} Returns - true or false
* @example
*
* isLetter(3)
* // => false
*
* isLetter("A")
* // => true
*
* isLetter("$")
* // => false
*/

  isLetter = (ch) => {
      return (/[a-zA-Z]/).test(ch)
  }


/**
* Function to find maximum array value
*
* @since 1.0.0
* @param {Array} array - character to check
* @returns {number}
* @example
*
* findArrayMax([3, 0, 2])
* // => 3
*/

  findArrayMax = (array) => {
    return array.reduce( (e1, e2) => {
      return ( e1 > e2 ? e1 : e2 );
    });
  }




/**
* Function to check if GPU installed
*
* @since 1.0.0
* @returns {boolean} Returns - true or false
*
*/

  checkGPU = () => {
          let runActivateFlag = true;

          if( ! checkWebGl2() ) {

             document.getElementById("webGl2Status").style.backgroundColor =  "red";

             if( ! checkWebGl1() ) {
                   webix.alert(" WebGL2 and WebGL1 are not supported<br> Run deactivated");
                   runActivateFlag = false;

             } else {
                  webix.confirm("WebGL2 is not supported<br> Run process will be very slow").then(function(result){
                         runActivateFlag = true;
                    }).fail(function() {
                        runActivateFlag = false;
                  });
             }
          } else {
                  console.log("webGl2Status Ok")
                  document.getElementById("webGl2Status").style.backgroundColor =  "green";
          }

          return runActivateFlag;
  }


/**
* Function to check if browser is chrome
*
* @since 1.0.0
* @returns {boolean} Returns - true or false
*
*/

isChrome = () => {
   return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
}


/**
* Function to online connection is established
*
* @since 1.0.0
* @returns {boolean} Returns - true or false
*
*/

isOnline= () => {
   return navigator.onLine;
}



/**
* Function to check if checkWebGl1 is supported
*
* @since 1.0.0
* @returns {boolean} Returns - true or false
*
*/

  checkWebGl1 = () => {
      const gl = document.createElement('canvas').getContext('webgl');
      if (!gl) {
                if (typeof WebGLRenderingContext !== 'undefined') {
                  console.log('WebGL1 may be disabled. Please try updating video card drivers');
                } else {
                  console.log('WebGL1 is not supported');
                }

                return false;
      } else {
          console.log('WebGl1 is enabled');
          return true;
      }

  }


/**
* Function to check if WebGL context is lost
*
* @since 1.0.0
* @returns {boolean} Returns - true or false
*
*/

  isWebGL2ContextLost = () => {
      const gl = document.createElement('canvas').getContext('webgl2');
      return gl.isContextLost();
  }

/**
* Function to check if checkWebGl2 is supported
*
* @since 1.0.0
* @returns {boolean} Returns - true or false
*
*/

  checkWebGl2 = () => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) {
                if (typeof WebGL2RenderingContext !== 'undefined') {
                  console.log('WebGL2 may be disabled. Please try updating video card drivers');
                  webix.alert("WebGL2 may be disabled. Please try updating video card drivers");
                } else {
                  console.log('WebGL2 is not supported');
                }
                return false;
      } else {
        console.log('WebGl2 is enabled');
        return true;
      }
  }

/**
* Function to detect GPU Vendor
*
* @since 1.0.0
* @returns {String} Returns - e.g.: 'NVIDIA Corporation'.
*
*/

  detectGPUVendor_v0 = () => {
          let  gl = document.createElement('canvas').getContext('webgl');

          if(gl) {
              let debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
              return debugInfo ?  gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : null;

          } else {
               return null;
          }
   }

  detectGPUVendor = () => {
          let  gl = document.createElement('canvas').getContext('webgl');
          let debugInfo;

          if(gl) {
              debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

              if (debugInfo) {
                       let result =  gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                        //--e.g. : NVIDIA Corporation

                        if( (result.indexOf( "(" ) > -1) && (result.indexOf( ")" ) > -1) ) {
                               return result.substring( result.indexOf( '(' ) + 1, result.indexOf( ')' ) );
                        }

                        return result;
              }
          }

          return null;
   }

/**
* Function to detect GPU renderer or card type
*
* @since 1.0.0
* @returns {String} Returns - e.g.: 'GeForce'.
*
*/

  detectGPUCardType_v0 = () => {
          let  gl = document.createElement('canvas').getContext('webgl');

          if(gl) {

              if(detectBrowser() === "Firefox" ) {
                    //-- return e.g: "GeForce GTX 980/PCIe/SSE2"
                    return gl.getParameter(gl.RENDERER);

              }

              let debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
              return debugInfo ?  gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : null;

          } else {
               return null;
          }
   }


  detectGPUCardType = () => {
          let  gl = document.createElement('canvas').getContext('webgl');
          let debugInfo;

          if(gl) {
              if(detectBrowser() === "Firefox" ) {
                    //-- return e.g: "GeForce GTX 980/PCIe/SSE2"
                    return gl.getParameter(gl.RENDERER);

              }

              debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

              if (debugInfo) {

                       let result =  gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                        //--e.g. : ANGLE (NVIDIA Corporation, GeForce GTX 1050 Ti/PCIe/SSE2, OpenGL 4.5.0 NVIDIA 390.144) as with Chrome
                        // Or:  GeForce GTX 1050 Ti/PCIe/SSE2    as with fireFox

                        if( (result.indexOf( "(" ) > -1) && (result.indexOf( ")" ) > -1) && (result.indexOf( "(R)" ) == -1) ) {

                               result = result.substring( result.indexOf( '(' ) + 1, result.indexOf( ')' ) );

                               if (  result.split(',').length == 3) {
                                     return result.split(',')[1].trim();
                               }

                        }

                        return result;

              }
          }

          return null;
   }



/**
* Function to detect browser version
*
* @since 1.0.0
* @returns {String} Returns - e.g.: 96.
*
*/

  detectBrowserVersion = () => {

        if ( navigator.userAgent.indexOf("OPR/") > -1) {
            return parseInt(navigator.userAgent.split('OPR/')[1]);

        } else if (navigator.userAgent.indexOf("Edg/") > -1) {
            return  parseInt(navigator.userAgent.split('Edg/')[1]);

        } else if (navigator.userAgent.indexOf("Falkon/") > -1) {
            return  parseInt(navigator.userAgent.split('Falkon/')[1]);

        } else if (navigator.userAgent.indexOf("Chrome/") > -1) {
            return  parseInt(navigator.userAgent.split('Chrome/')[1]);

        } else if (navigator.userAgent.indexOf("Firefox/") > -1) {
            return  parseInt(navigator.userAgent.split('Firefox/')[1]);

        } else if (navigator.userAgent.indexOf("Safari/") > -1) {
            return  parseInt(navigator.userAgent.split('Safari/')[1]);

        } else if (navigator.userAgent.indexOf("MSIE/") > -1 || navigator.userAgent.indexOf("rv:") > -1) {
            return  parseInt(navigator.userAgent.split('MSIE/')[1]);

        } else {

          return Infinity;
        }
   }

/**
* Function to find browser Location Info
*
* @since 1.0.0
* @returns {Object} Returns
*
*/

  getBrowserLocationInfo = () => {
      let LocationDataObj = {};

      if(isOnline()){
          try {
              $.ajax({
                    url: 'https://api.ipregistry.co/?key=tryout',
                    async: false,
                    dataType: "json",
                    success: function(response) {
                        LocationDataObj = {Country: response.location.country.name, Region: response.location.region.name, City: response.location.city, latitude: response.location.latitude, longitude: response.location.longitude};
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        // alert("Status: " + textStatus); alert("Error: " + errorThrown);
                          $.ajax({
                                url: "https://geolocation-db.com/json/",
                                async: false,
                                dataType: 'json',
                                success: function (response) {
                                  LocationDataObj = {Country: response.country_name, Region: response.state, City: response.city, latitude: response.latitude, longitude: response.longitude};
                                },
                                error: function(XMLHttpRequest, textStatus, errorThrown) {
                                    console.log("Resource for browser info not available ");
                                }
                          });
                    }
              });
          } catch(err) {
                    console.log("Online resources for browser info currently not available ");
          }

     }

       return LocationDataObj;
}




/**
* Function to detect browser
*
* @since 1.0.0
* @returns {String} Returns - e.g.: Firefox etc.
*
*/

  detectBrowser = () => {

        if ( navigator.userAgent.indexOf("OPR/") > -1) {
            return "Opera";

        } else if (navigator.userAgent.indexOf("Edg/") > -1) {
            return "Edge";

        } else if (navigator.userAgent.indexOf("Falkon/") > -1) {
            return "Falkon";

        } else if (navigator.userAgent.indexOf("Chrome/") > -1) {
            return "Chrome";

        } else if (navigator.userAgent.indexOf("Firefox/") > -1) {
            return "Firefox";

        } else if (navigator.userAgent.indexOf("Safari/") > -1) {
            return "Safari";

        } else if (navigator.userAgent.indexOf("MSIE/") > -1 || navigator.userAgent.indexOf("rv:") > -1) {
            return "IExplorer";

        } else {

          return "Unknown";
        }
   }

/**
* Function to detect Operating System
*
* @since 1.0.0
* @returns {String} Returns - e.g.: Linux
*
*/

detectOperatingSys = () => {

        if (navigator.userAgent.indexOf("Win") > -1) {
            return "Windows";

        } else if (navigator.userAgent.indexOf("Mac") > -1) {
            return "MacOS";

        } else if (navigator.userAgent.indexOf("Linux") > -1) {
            return "Linux";

        } else if (navigator.userAgent.indexOf("UNIX") > -1) {
            return "UNIX";

        } else {
            return "Unknown";

        }
}


/**
* Function to detect CPU number of cores
*
* @since 1.0.0
* @returns {number} Returns - e.g.: 12
*
*/

  getCPUNumCores = () => {
      return   navigator.hardwareConcurrency;
   }



/**
* Function to submit data to google sheet
*
* @since 1.0.0
* @param {object} dataObj - e.g. { Brainchop_Ver: 1.0.0, Data_Load: 10, ... }
*
*/

submitTiming2GoogleSheet = (dataObj) => {

      if(isOnline()){

            // -- Fill form with data to submit
            Object.keys(dataObj).forEach(dataKey =>{
                 document.getElementById(dataKey).value = dataObj[dataKey];
            })

            //-- Settings of submission
            const scriptURL = 'https://script.google.com/macros/s/AKfycbwn-Ix6IVGOwUSU1VBU8hFcABT9PqwCwN90UxfK_fXp5CEfxvIoQHZXs2XQRZQo_N8I/exec'
            const form = document.forms['google-sheet']

            //-- Add event handler to the form.
            form.addEventListener('submit', e => {
                  e.preventDefault()
                  fetch(scriptURL, { method: 'POST', body: new FormData(form)})
                    .then(response => console.log("------Done------"))
                    .catch(error => console.error('Error!', error.message))
            })

            //-- Submit the form
            document.getElementById("SubmitStatisticalData").click();

     } else {
         console.log(" Offline Mode ")

     }

}


/**
* For adjust time by adding 0
* @since 1.0.0
* @param {number} timeValue - e.g. 0 to 59
* @returns {String} Returns - e.g.: 00
* @example
*
* checkZero( 2 )
* // => 02
*/

checkZero = (timeValue) => {
    return timeValue < 10 ? timeValue : "0" + timeValue;
}


/**
* Function to check whether the model channel bin is last
*
* @since 1.0.0
* @param {Object} modelObj - Model to check
* @returns {boolean} Returns - true or false e.g. if true:  [batchSize, batch_D, batch_H, batch_W, numOfChan]
*
*/

 isModelChnlLast = (modelObj) => {
     for(let layerIdx = 0; layerIdx < modelObj.layers.length; layerIdx ++ ) {
          if(modelObj.layersByDepth[layerIdx][0]["dataFormat"]) {
             return modelObj.layersByDepth[layerIdx][0]["dataFormat"] === "channelsLast"? true : false;
          }
     }
 }


/**
* Function to find output segmentation total number
* Can be used to test browser feasibility before run the inference, e.g: test buffer of that size
*
* @since 1.0.0
* @param {Object} modelObj - Model to check
* @returns {number} Returns - e.g.: 3 or 50
*
*/

 getModelOutputNumLabels = (modelObject) => {
          if(modelObject.output.shape.length >= 4) {
               return isModelChnlLast(modelObject) ? modelObject.output.shape[ modelObject.output.shape.length-1 ] :
                                                  modelObject.output.shape[1];
          }

          return null;
 }

/**
* Function to calculate the model total number of parameters
*
* @since 1.0.0
* @param {Object} modelObj - Model to check
* @returns {number} Returns - e.g.: 5000
*
*/

 getModelNumParameters = (modelObj) => {
     let numParameters = 0;

     for(let layerIdx = 0; layerIdx < modelObj.layers.length; layerIdx ++ ) {
            numParameters += modelObj.layers[layerIdx].countParams();
     }

     return numParameters;
 }


/**
* Function to calculate the max texture size for current browser
*
* @since 1.0.0
* @returns {number} Returns - e.g.: 8192
*
*/

 getMaxTextureSize = () => {
            let  gl = checkWebGl2() ? document.createElement('canvas').getContext('webgl2') :
                      checkWebGl1() ? document.createElement('canvas').getContext('webgl1') : null;

            return gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : null;
 }



/**
* Function to calculate the model total number of layers
*
* @since 1.0.0
* @param {Object} modelObj - Model to check
* @returns {number} Returns - e.g.: 20
*
*/

 getModelNumLayers= (modelObj) => {
     return modelObj.layers.length;
 }



/**
* Function to test tf.argMax size allocation in browser
*
* @since 1.2.0
* @param {number} depth- Total Number of slices a.k.a z-dim
* @param {number} height- - Slice or shape Height
* @param {number} width- Slice or shape Width
* @param {number} numSegLabels - Number of segmenation labels resulted from model
* @param {String} dataType - e.g.: 'float32' , 'int32'
* @param {number} axis - e.g.: -1
* @returns {boolean} Returns - e.g.: true/false
* @example
*
* isArgMaxValid( 256, 256, 256, 200, 'float32' )
* // => false
*
* isArgMaxValid( 256, 256, 256, 200, 'bool' )
* // => true
*/


isArgMaxValid = (depth, height, width, numSegLabels, dataType = 'float32', axis = -1) => {
    let isValid = true;
    let tensorToTest;

    try {
         tensorToTest = tf.argMax(  tf.ones([depth, height, width, numSegLabels], dataType) ,  axis);
         tensorToTest.dispose();

    } catch(err) {
              // console.log("Error :",  err);
              isValid = false;
    }

    return isValid;
}


/**
* Function to find feasible number of  tf.argMax.
*
* @since 1.2.0
* @param {number} depth- Total Number of slices a.k.a z-dim
* @param {number} height- - Slice or shape Height
* @param {number} width- Slice or shape Width
* @param {number} numSegLabels - Number of segmenation labels resulted from model
* @param {String} dataType - e.g.: 'float32' , 'int32'
* @param {number} numArgMaxParts - Number of minimum argMax partitions needed to breakdown the original argMax.
* @param {number} axis - e.g.: -1
* @returns {number} Returns - e.g.: 1 , 2, 4, ..
* @example
*
* findMinNumOfArgMaxs( 256, 256, 256, 3 )
* // => 1
*
* findMinNumOfArgMaxs( 256, 256, 256, 300, 'float32' )
* // => 4
*
* findMinNumOfArgMaxs( 256, 256, 256, 300, 'bool' )
* // => 1
*/

findMinNumOfArgMaxs = (depth, height, width, numSegLabels,  dataType = 'float32', numArgMaxParts = 1, axis = -1) => {

    if( ! isArgMaxValid(depth, height, width, numSegLabels, dataType, axis)) {
        return findMinNumOfArgMaxs(depth, height, width, Math.ceil(numSegLabels/2) , dataType, numArgMaxParts * 2, axis);
    }

    return numArgMaxParts;
}




/**
* Function to test arraybuffer size allocation in browser
*
* @since 1.2.0
* @param {number} depth- Total Number of slices a.k.a z-dim
* @param {number} height- - Slice or shape Height
* @param {number} width- Slice or shape Width
* @param {number} numSegLabels - Number of segmenation labels resulted from model
* @param {String} dataType - e.g.: 'uint8'|'int8'|'uint16'|'int16'| 'float16'
* @returns {boolean} Returns - e.g.: true/false
* @example
*
* isArrBufSizeValid( 256, 256, 256, 200, 'int16' )
* // => false
*
* isArrBufSizeValid( 256, 256, 256, 200, 'bool' )
* // => true
*/


isArrBufSizeValid = (depth, height, width, numSegLabels, dataType = 'float32') => {
    let isValid = true;
    let bufferToTest;

    try {
          if( dataType === 'float32' || dataType === 'int32') {
              bufferToTest = tf.buffer([depth, height, width, numSegLabels], dataType);
          } else {
              bufferToTest = new Buffer([depth, height, width, numSegLabels], dataType);
          }
    } catch(err) {
              console.log("Error :",  err);
              isValid = false;
    }

    return isValid;
}

/**
* Function to find feasible number of  arraybuffers to subvolume and argMax.
*
* @since 1.2.0
* @param {number} depth- Total Number of slices a.k.a z-dim
* @param {number} height- - Slice or shape Height
* @param {number} width- Slice or shape Width
* @param {number} numSegLabels - Number of segmenation labels resulted from model
* @param {String} dataType - e.g.: 'float32' , 'int32'
* @param {number} numBufParts - Number of minimum array buffer partitions needed to breakdown the original buffer.
* @returns {number} Returns - e.g.: 1 , 2, 4, ..
* @example
*
* findMinNumOfArrBufs( 256, 256, 256, 3 )
* // => 1
*
* findMinNumOfArrBufs( 256, 256, 256, 300, 'float32' )
* // => 4
*
* findMinNumOfArrBufs( 256, 256, 256, 300, 'uint8' )
* // => 4
*
* findMinNumOfArrBufs( 256, 256, 256, 300, 'bool' )
* // => 1
*/


findMinNumOfArrBufs = (depth, height, width, numSegLabels,  dataType = 'float32', numBufParts = 1) => {

    if( ! isArrBufSizeValid(depth, height, width, numSegLabels, dataType)) {
        return findMinNumOfArrBufs(depth, height, width, Math.ceil(numSegLabels/2) , dataType, numBufParts * 2);
    }

    return numBufParts;
}

/**
* Function to find feasible sizes of sub arraybuffers.
*
* @since 1.2.0
* @param {number} depth- Total Number of slices a.k.a z-dim
* @param {number} height- - Slice or shape Height
* @param {number} width- Slice or shape Width
* @param {number} numSegLabels - Number of segmenation labels resulted from model e.g. 401
* @param {String} dataType - e.g.: 'float32' , 'int32'
* @returns {Array} Returns - e.g.: [ 101, 101, 101, 98 ]
* @example
*
* findSubArrBufSizes( 256, 256, 256, 401 )
* // => [ 101, 101, 101, 98 ]
*
* findSubArrBufSizes( 256, 256, 256, 401, 'float32' )
* // => [ 101, 101, 101, 98 ]
*
* findSubArrBufSizes( 256, 256, 256, 401, 'bool' )
* // => [ 401 ]
*/


findSubArrBufSizes = (depth, height, width, numSegLabels, dataType = 'float32') => {

      let numPartitions = findMinNumOfArrBufs(depth, height, width, numSegLabels, dataType);
      let arrBufSizes = [];
      let totalPartitionSize = 0;

      for(let idx = 0; idx < numPartitions; idx ++ ) {

          if(idx == (numPartitions -1) ) {
              arrBufSizes[idx] = numSegLabels - totalPartitionSize;

          } else {
              arrBufSizes[idx] =  Math.ceil(numSegLabels/numPartitions)
              totalPartitionSize +=  arrBufSizes[idx];
          }
      }

      return arrBufSizes;
}


/**
* Function to accumulate Array Buffers Size and find segmenation labels range for each buffer
*
* @since 1.2.0
* @param {Array} BufferNumLabelsArr - e.g. [ 100, 100, 100, 99]
* @returns {Array} Returns - e.g.: [ 100, 200, 300, 399 ]
* @example
*
* accumulateArrBufSizes( [ 100, 100, 100, 99] )
* // => [ 100, 200, 300, 399 ]
*/

accumulateArrBufSizes = (bufferSizesArr) => {

   let thresholds = [];

   for(let i = 0; i < bufferSizesArr.length; i++) {

       if(i == 0) {
           thresholds[i] = bufferSizesArr[i]
       } else {

           thresholds[i] = thresholds[i-1] + bufferSizesArr[i]
       }
   }

   return thresholds;
}




/**
* Inference Function for sub-volumes
*
* In version 3.0.0 this function not used, can reuse in future versions
*
* @since 1.0.0
* @param {promise}  model
* @param {tf.Tensor}  slices_3d
* @param {Array} input_shape - e.g. [?, D, H, W, Ch] or [?, Ch, D, H, W]
* @param {boolen} isChannelLast- check input shape for channel position.
* @param {number} num_of_slices- Total Number of slices a.k.a z-dim
* @param {number} slice_height- - Slice Height
* @param {number} slice_width- Slice Width
* @param {number} batch_D- Batch Depth
* @param {number} batch_H- Batch Height
* @param {number} batch_W- Batch Width
*
*/

  inferenceSubVolumes = async(model, slices_3d, num_of_slices, slice_height, slice_width, pipeline1_out = null) => {

          let refVoxel = [], boundVolSizeArr = [];
          let enableCrop = inferenceModelsList[$$("selectModel").getValue() - 1]["enableCrop"];

          let quantileNorm = inferenceModelsList[$$("selectModel").getValue() - 1]["enableQuantileNorm"];

          if(quantileNorm) {
              // Quantile normalize function needs specific models to be used
              console.log("preModel Quantile normalization enabled");
              slices_3d = await quantileNormalizeVolumeData(slices_3d);
          } else {
              // Min Max Nomalize MRI data to be from 0 to 1
              console.log("preModel Min Max normalization enabled");
              slices_3d = minMaxNormalizeVolumeData(slices_3d);
          }

          if(enableCrop) {

                  //--Phase-2, After remove the skull try to allocate brain volume and make inferece
                  console.log(" ---- Start SubVolume inference phase-II ---- ");

                  let mask_3d;

                  if(pipeline1_out == null) {
                      // binarize original image if there is no pre-model for masking task
                      mask_3d = slices_3d.greater([0]).asType('bool');

                  } else {

                      mask_3d = pipeline1_out.greater([0]).asType('bool');
                      pipeline1_out.dispose();

                  }

                  console.log(" mask_3d shape :  ", mask_3d.shape);

                  const coords = await tf.whereAsync(mask_3d);
                   //-- Get each voxel coords (x, y, z)

                  mask_3d.dispose();

                  const coordsArr =    coords.arraySync();

                  let row_min = slice_height,  row_max = 0,  col_min = slice_width,  col_max = 0,  depth_min = num_of_slices,  depth_max = 0;

                  for(let i = 0; i < coordsArr.length; i++) {

                         if ( row_min > coordsArr[i][0] ) {
                              row_min = coordsArr[i][0];
                         } else if(row_max < coordsArr[i][0]) {
                              row_max = coordsArr[i][0];
                         }

                         if ( col_min > coordsArr[i][1] ) {
                              col_min = coordsArr[i][1];
                         } else if(col_max < coordsArr[i][1]) {
                              col_max = coordsArr[i][1];
                         }

                         if ( depth_min > coordsArr[i][2] ) {
                              depth_min = coordsArr[i][2];
                         } else if(depth_max < coordsArr[i][2]) {
                              depth_max = coordsArr[i][2];
                         }
                  }


                  console.log( "row min and max  :", row_min, row_max);
                  console.log( "col min and max  :", col_min, col_max);
                  console.log( "depth min and max  :", depth_min, depth_max);

                  //-- Reference voxel that cropped volume started slice with it
                  refVoxel = [row_min, col_min, depth_min];
                  // -- Starting form refVoxel, size of bounding volume
                  boundVolSizeArr = [row_max - row_min + 1, col_max - col_min + 1, depth_max - depth_min + 1];


                  coords.dispose();

                   //-- Extract 3d object (e.g. brain)
                  slices_3d =  slices_3d.slice([row_min, col_min, depth_min], [row_max - row_min + 1, col_max - col_min + 1, depth_max - depth_min + 1] )


                  //-- Padding size add to cropped brain
                  let pad =  inferenceModelsList[$$("selectModel").getValue() - 1]["cropPadding"];

                  // Create margin around the bounding volume
                  slices_3d = addZeroPaddingTo3dTensor(slices_3d, [pad, pad] , [pad, pad], [pad, pad]);
                  console.log(" cropped slices_3d with padding shape:  ", slices_3d.shape);


                  if(opts.drawBoundingVolume) {

                        let testVol = removeZeroPaddingFrom3dTensor(slices_3d, pad, pad, pad);
                        console.log(" testVol without padding shape :  ", testVol.shape);

                        testVol =  resizeWithZeroPadding(testVol, num_of_slices, slice_height, slice_width, refVoxel,  boundVolSizeArr );
                        console.log(" testVol final shape after resizing :  ", testVol.shape);

                        draw3dObjBoundingVolume(tf.unstack(testVol));
                        testVol.dispose();

                        return 0;
                  }

          }


          let transpose = inferenceModelsList[$$("selectModel").getValue() - 1]["enableTranspose"];
          if(transpose) {
             slices_3d = slices_3d.transpose()
             console.log("Input transposed for model");
          } else {
             console.log("Transpose not enabled for model");
          }


          model.then(function (res) {

                let batch_D, batch_H, batch_W;
                let input_shape;

                let modelObject =  {};

                modelObject =  res;

                let isChannelLast = isModelChnlLast(modelObject);
                const batchSize = opts.batchSize;
                const numOfChan = opts.numOfChan;

                //-- Test and adjust model input shape dim after padding ..
                for (let i = 0; i < slices_3d.rank; i++) {
                    if(isChannelLast) {
                        if(slices_3d.shape[i] < modelObject.layers[0].batchInputShape[i+1]) {
                             console.log(" cropped slices_3d with pad < model input shape dim ");
                             modelObject.layers[0].batchInputShape[i+1] = slices_3d.shape[i];
                        }

                    } else {
                        if(slices_3d.shape[i] < modelObject.layers[0].batchInputShape[i+2]) {
                             console.log(" cropped slices_3d with pad < model input shape dim ");
                             modelObject.layers[0].batchInputShape[i+2] = slices_3d.shape[i];
                        }
                    }
                }


                // Get model input shape
                if(isChannelLast) {
                    batch_D = modelObject.layers[0].batchInputShape[1];
                    batch_H = modelObject.layers[0].batchInputShape[2];
                    batch_W = modelObject.layers[0].batchInputShape[3];
                    input_shape = [batchSize, batch_D, batch_H, batch_W, numOfChan];
                } else {
                    batch_D = modelObject.layers[0].batchInputShape[2];
                    batch_H = modelObject.layers[0].batchInputShape[3];
                    batch_W = modelObject.layers[0].batchInputShape[4];
                    input_shape = [batchSize, numOfChan,  batch_D, batch_H, batch_W];
                }

                const isBatchOverlapEnable =  inferenceModelsList[$$("selectModel").getValue() - 1]["isBatchOverlapEnable"];

                let allBatches = [];
                let headSubCubesCoords = [];

                if(isBatchOverlapEnable) {
                    // Number of additional batches focus on the brain/head volume
                    let numOverlapBatches = inferenceModelsList[$$("selectModel").getValue() - 1]["numOverlapBatches"];
                    console.log(" num of overlapped batches: ", numOverlapBatches);

                    // Find the centroid of 3D head volume  and the variance
                    let cent_var = cubeMoments(slices_3d, 0.5);
                    // Mean or centroid
                    const headCentroid = cent_var[0];
                    console.log(" Head 3D Centroid : ", headCentroid);
                    // Variance
                    const sigma = cent_var[1];
                    console.log(" Head 3D Variance : ", sigma);

                    headSubCubesCoords = findCoordsOfAddBrainBatches(numOverlapBatches,
                                                                        new Array(headCentroid[0], headCentroid[1], headCentroid[2]),
                                                                        new Array(sigma[0], sigma[1], sigma[2]),
                                                                        new Array(slices_3d.shape[0], slices_3d.shape[1], slices_3d.shape[2]),
                                                                        new Array(batch_D, batch_H, batch_W));

                    allBatches = sliceVolumeIntoOverlappedBatches(slices_3d, slices_3d.shape[0], slices_3d.shape[1], slices_3d.shape[2], batch_D, batch_H, batch_W, headSubCubesCoords);

                 } else {
                    // This option will  cover all slices, some slices that are not enough to create a batch will need overlap with prevous batch slices
                    // e.g. slice volume = 3*5*5 DHW , and batch is 2*2*2 ,   2*3*3 =18 batches will be considered
                    let num_of_batches = Math.ceil(slices_3d.shape[2]/batch_W) * Math.ceil(slices_3d.shape[1]/batch_H) * Math.ceil(slices_3d.shape[0]/batch_D);
                    console.log("Num of Batches for inference: ", num_of_batches);

                    allBatches = sliceVolumeIntoBatches(slices_3d, slices_3d.shape[0], slices_3d.shape[1], slices_3d.shape[2], batch_D, batch_H, batch_W);
                 }

                 tf.dispose(slices_3d);

                 statData["No_SubVolumes"] = allBatches.length;
                 statData["Brainchop_Ver"] = "SubVolumes";

                 let allPredictions = [];

                 try {
                      let startTime = performance.now();
                      let inferenceStartTime = performance.now();
                      // maxLabelPredicted in whole volume of the brain
                      let maxLabelPredicted = 0;
                      let expected_Num_labels;

                      let delay = inferenceModelsList[$$("selectModel").getValue() - 1]["inferenceDelay"];
                      console.log("Inference delay :", delay);

                      let layersLength = res.layers.length;
                      console.log("res.layers.length ", layersLength);

                      statData["Input_Shape"] = JSON.stringify(res.layers[0].batchInputShape);
                      statData["Output_Shape"] = JSON.stringify(res.output.shape);
                      statData["Channel_Last"] = isChannelLast;
                      statData["Model_Param"] = getModelNumParameters(res);
                      statData["Model_Layers"] = getModelNumLayers(res);
                      statData["Model"] = inferenceModelsList[$$("selectModel").getValue() - 1]["modelName"];
                      statData["Extra_Info"] = null;

                      let curProgBar = parseInt(document.getElementById("progressBar").style.width);

                      let j = 0;
                      let timer = window.setInterval(function() {
                            let curTensor = [];
                            curTensor[0] = tf.tensor(allBatches[j].data.dataSync(), input_shape);

                            let lastIdx = 0;

                            for (let i = 1; i < layersLength; i++) {
                                  try {
                                        curTensor[i] = res.layers[i].apply( curTensor[i-1]);

                                  } catch(err) {

                                        if( err.message === "Failed to compile fragment shader.") {
                                                        webix.confirm({
                                                          title:"",
                                                          ok:"Ok",
                                                          cancel:"Cancel",
                                                          type: "confirm-error",
                                                          width: 500,
                                                          text: "Context lost due to limited Memory available, please check current browser resouces in the toolbar and verified GPUs for each model"
                                                        })
                                                          .then(() => {
                                                                 //---
                                                                 $$("browserResourcesWindow").show();


                                                        }).fail(() => {
                                                                 //---

                                                        });

                                        } else {
                                            webix.alert(err.message);
                                        }

                                        window.clearInterval( timer );
                                        tf.engine().endScope();
                                        tf.engine().disposeVariables();

                                        statData["Inference_t"] = Infinity;
                                        statData["Postprocess_t"] = Infinity;
                                        statData["Status"] = "Fail";
                                        statData["Error_Type"] = err.message;
                                        statData["Extra_Err_Info"] = "Failed while model layer " + i + " apply";

                                       if(opts.telemetryFlag) {
                                            submitTiming2GoogleSheet(statData);
                                       }



                                        return 0;
                                  }

                                  if( j == allBatches.length-1 ) {
                                    console.log("layer ", i);
                                    console.log("layer output Tensor shape : ", curTensor[i].shape);
                                    console.log("layer count params ", res.layers[i].countParams());
                                  }

                                  curTensor[i-1].dispose();
                                  lastIdx += 1;
                            }


                            // Get axis
                            let axis =  isChannelLast ? -1 : 1;
                            let prediction_argmax = tf.argMax(curTensor[lastIdx], axis);

                            if( j == allBatches.length - 1 ) {
                                 expected_Num_labels = isChannelLast ? curTensor[lastIdx].shape[4] : curTensor[lastIdx].shape[1];
                            }

                            tf.dispose(curTensor[lastIdx]);

                            allPredictions.push({"id": allBatches[j].id, "coordinates": allBatches[j].coordinates, "data": Array.from(prediction_argmax.dataSync()) })
                            let curBatchMaxLabel =  findArrayMax(Array.from(prediction_argmax.dataSync()));

                            if( maxLabelPredicted < curBatchMaxLabel ) {
                                  maxLabelPredicted = curBatchMaxLabel;
                            }

                            tf.dispose(prediction_argmax);


                            let memStatus = tf.memory().unreliable ? "Red" : "Green";
                            let unreliableReasons  =  tf.memory().unreliable ?    "unreliable reasons :" + tf.memory().reasons.fontcolor("red").bold() : "";
                            document.getElementById("progressBar").style.width = (curProgBar + (j + 1)*(100 - curProgBar)/allBatches.length) + "%";

                            document.getElementById("memoryStatus").style.backgroundColor =  memStatus;

                            //-- let memoryStatusData=[{ memoryUse: Math.round(tf.memory().numBytesInGPU/(1024*1024*20))}];
                            //-- $$("memoryMonitor").clearAll();
                            //-- $$("memoryMonitor").parse(memoryStatusData);

                            //-- document.getElementById("progressBar").innerHTML=  Math.floor((j+1)*100/allBatches.length) + "%";

                            if( j == allBatches.length-1 ) {
                                 window.clearInterval( timer );

                                 let Inference_t = ((performance.now() - startTime)/1000).toFixed(4);

                                 let numSegClasses = maxLabelPredicted + 1;
                                 console.log("Num of seg classes: ", numSegClasses);

                                 statData["Actual_Labels"] = numSegClasses;
                                 statData["Expect_Labels"] = expected_Num_labels;
                                 statData["NumLabels_Match"] = numSegClasses == expected_Num_labels? true : false;


                                 startTime = performance.now();
                                 // Generate output volume or slices
                                 console.log("Merging subvolumes... ");
                                 let outLabelVolume  = tf.tidy(() => {
                                                                return mergeSubVolumesV2(allPredictions, slices_3d.shape[0], slices_3d.shape[1], slices_3d.shape[2], numSegClasses, batch_D, batch_H, batch_W, axis);
                                                              })

                                 allPredictions = [];
                                 let Merge_t = ((performance.now() - startTime)/1000).toFixed(4);


                                 if(enableCrop) {
                                     let pad =  inferenceModelsList[$$("selectModel").getValue() - 1]["cropPadding"];
                                     outLabelVolume = removeZeroPaddingFrom3dTensor(outLabelVolume, pad, pad, pad);
                                     console.log(" outLabelVolume without padding shape :  ", outLabelVolume.shape);
                                     outLabelVolume =  resizeWithZeroPadding(outLabelVolume, num_of_slices, slice_height, slice_width, refVoxel,  boundVolSizeArr );
                                     console.log(" outLabelVolume final shape after resizing :  ", outLabelVolume.shape);
                                 }

                                 startTime = performance.now();
                                 console.log("Generating output...");
                                try {
                                    const img = new Uint32Array(outLabelVolume.dataSync());
                                    const Vshape = outLabelVolume.shape;
                                    const Vtype = outLabelVolume.dtype;
                                     tf.dispose(outLabelVolume);
                                    generateOutputSlicesV2(img, Vshape, Vtype, num_of_slices, numSegClasses, slice_height, slice_width);
                                    tf.engine().endScope();
                                    tf.engine().disposeVariables();

                                    console.log(" SubVolume inference num of tensors after generateOutputSlicesV2: " , tf.memory().numTensors );
                                 } catch(error) {


                                        //-- Timing data to collect

                                        tf.engine().endScope();
                                        tf.engine().disposeVariables();

                                        webix.alert("Failed while generating output due to limited browser memory available");

                                        statData["Inference_t"] = Inference_t;
                                        statData["Merge_t"] = Merge_t;
                                        statData["Postprocess_t"] = Infinity;
                                        statData["Status"] = "Fail";
                                        statData["Error_Type"] = error.message;
                                        statData["Extra_Err_Info"] = "Failed while generating output";

                                        document.getElementById("progressBar").style.width = 0;

                                       if(opts.telemetryFlag) {
                                            submitTiming2GoogleSheet(statData);
                                       }

                                       return 0;

                                 }

                                 let Postprocess_t = ((performance.now() - startTime)/1000).toFixed(4);

                                 document.getElementById("progressBar").style.width = 0;
                                 //webix.message.hide("waitMessage");


                                 $$("downloadBtn").enable();
                                 $$("segmentBtn").enable();
                              //    $$("imageUploader").enable();
                                 tf.engine().disposeVariables();


                                 console.log("Processing the whole brain volume in tfjs tooks for multi-class output mask : ",
                                                          ((performance.now()-inferenceStartTime)/1000).toFixed(4) + "  Seconds");

                                 //-- Timing data to collect
                                 statData["Inference_t"] = Inference_t;
                                 statData["Merge_t"] = Merge_t;
                                 statData["Postprocess_t"] = Postprocess_t;
                                 statData["Status"] = "OK"

                                 if(opts.telemetryFlag) {
                                      submitTiming2GoogleSheet(statData);
                                 }


                              }

                              j++;

                     }, delay);

                  }
                  catch(err) {
                    webix.alert(err.message);
                    console.log( err.message );
                    console.log(
                        "If webgl context is lost, try to restore webgl context by visit the link " +
                        '<a href="https://support.biodigital.com/hc/en-us/articles/218322977-How-to-turn-on-WebGL-in-my-browser">here</a>'
                    );

                    document.getElementById("webGl2Status").style.backgroundColor =  isWebGL2ContextLost() ? "Red" : "Green";
                    document.getElementById("memoryStatus").style.backgroundColor =  tf.memory().unreliable ? "Red" : "Green";
                  }

           });

  }

 /////////////////////////////////////////////////////////////////////////
///////////////----------------SEQ LAYER-----------------////////////////
////////////////////////////////////////////////////////////////////////

/**
* This function is designed to process a large tensor in smaller chunks to manage memory usage effectively.
*
* @since 3.0.0
* @param {tf.Tensor} inputTensor e.g.[ D, H, W, Ch] or [ Ch, D, H, W]->[ 256, 256, 256, 5 ] or [ 5, 256, 256, 256 ]
* @param {tf.Tensor} vector - e.g. filterWeight: [-1.4474995, 0.6897876, -0.2812168, -0.0344299, 1.266812]
* @param {number} chunkSize -parameter important for memory, the larger it is, the more memory in use. e.g. 4
* @return {tf.Tensor}
*
*/
function processTensorInChunks(inputTensor, filterWeights, chunkSize) {
    // Assuming inputTensor's shape: [batch, depth, height, width, inChannels]
    // and filterWeights's shape: [filterDepth, filterHeight, filterWidth, inChannels, outChannels]
    const stride = 1;
    const pad = 0;
    const dilationRate = 1;
    const inChannels = inputTensor.shape[4];
    const numSlices = Math.ceil(inChannels / chunkSize);

    let accumulatedResult = null;

    for (let i = 0; i < numSlices; i++) {
        const startChannel = i * chunkSize;
        const endChannel = Math.min((i + 1) * chunkSize, inChannels);
        const channels = endChannel - startChannel;

        const inputSlice = tf.tidy(() => {
            // Slice the input tensor to get the current chunk
            return inputTensor.slice([0, 0, 0, 0, startChannel], [-1, -1, -1, -1, channels]);
        });

        const filterSlice = tf.tidy(() => {
            // Slice the filter weights to match the input tensor's current chunk
            return filterWeights.slice([0, 0, 0, startChannel, 0], [-1, -1, -1, channels, -1]);
        });

        const resultSlice = tf.conv3d(inputSlice, filterSlice, stride, pad, 'NDHWC', dilationRate);
        // Clean up the slices to free memory
        inputSlice.dispose();
        filterSlice.dispose();

        // Squeeze the result slice to remove dimensions of size 1
        const squeezedResultSlice = tf.squeeze(resultSlice);
        resultSlice.dispose(); // Dispose of the original resultSlice after squeezing

        if (accumulatedResult === null) {
            accumulatedResult = squeezedResultSlice;
        } else {
            // Accumulate the result by adding the new result slice to it
            const newAccumulatedResult = accumulatedResult.add(squeezedResultSlice);

            // Dispose of the previous accumulatedResult and squeezedResultSlice
            accumulatedResult.dispose();
            // Dispose of squeezedResultSlice only if it wasn't assigned to accumulatedResult
            if (accumulatedResult !== squeezedResultSlice) {
                squeezedResultSlice.dispose();
            }
            // Update accumulatedResult with the new result
            accumulatedResult = newAccumulatedResult;
        }

        tf.tidy(() => {
            tf.matMul(tf.zeros([1, 1]), tf.zeros([1, 1]));
        });
    }

    return accumulatedResult;
}

/**
* This function is show memory status while running sequential processing
*
* @since 3.0.0
* @param {number} chIdx
* @param {number} totalChannels
* @return {promise}
*
*/

showMemStatus = async(chIdx, totalChannels) => {

  return new Promise((resolve, reject) => {

        let memStatus = tf.memory().unreliable ? "Red" : "Green";
        let unreliableReasons  =  tf.memory().unreliable ?    "unreliable reasons :" + tf.memory().reasons.fontcolor("red").bold() : "";
        document.getElementById("memoryStatus").style.backgroundColor =  memStatus;

        document.getElementById("memStatusParagraph").innerHTML = "Channels completed:  " + (chIdx + 1) + " / " + totalChannels +
                              // https://js.tensorflow.org/api/latest/#memory
                              "<br><br>" +"TF Memory Status: " + memStatus.fontcolor(tf.memory().unreliable ? "red" : "green").bold()  +
                              // numBytes: Number of bytes allocated (undisposed) at this time
                              "<br>" + "numBytes :   " +  Math.round(tf.memory().numBytes/(1024*1024)) + "   MB" +
                              //numBytesInGPU : Number of bytes allocated (undisposed) in the GPU only at this time
                              "<br>" + "numBytesInGPU :   " + Math.round(tf.memory().numBytesInGPU/(1024*1024)) + "   MB" +
                              "<br>" + "numBytesInGPUAllocated :   " + Math.round(tf.memory().numBytesInGPUAllocated/(1024*1024)) + "   MB" +
                              "<br>" + "numBytesInGPUFree :   " + Math.round(tf.memory().numBytesInGPUFree/(1024*1024)) + "   MB" +
                              // numDataBuffers : Number of unique data buffers allocated (undisposed) at this time, which is ≤ the number of tensors
                              "<br>" + "numDataBuffers :   " + tf.memory().numDataBuffers +
                              "<br>" + "numTensors :   " + tf.memory().numTensors +
                              "<br>" + unreliableReasons ;

        resolve(); // When this fires, the code in a().then(/..../); is executed.

  });


}


class SequentialConvLayer {
    constructor(model, chunkSize, isChannelLast) {
        this.model = model;
        this.outChannels = model.outputLayers[0].kernel.shape[4];
        this.chunkSize = chunkSize;
        this.isChannelLast = isChannelLast;
    }

    /**
    * Apply sequential convolution layer
    * @since 3.0.0
    * @member SequentialConvLayer
    * @param {tf.Tensor}  inputTensor  e.g.  [ 1, 256, 256, 256, 5 ]
    * @return {promise}
    *
    * convLayer.rank -> 3
    * typeof(convLayer) -> "object"
    * convLayer:  Object { dataFormat: "channelsLast", dilationRate: Array(3) [ 1, 1, 1 ], inputSpec: Array [ {…} ],
    *                      name: "output", padding: "same", strides: Array(3) [ 1, 1, 1 ], ...}
    *
    * weights.shape ->  Array(5) [ 1, 1, 1, 5, 3 ]
    * weights.print()
    * //=>    Tensor
    *           [[[[[0.146999 , -1.4474995, -2.8961499],
    *               [1.1067894, 0.6897876 , -0.7573005],
    *               [-0.38512 , -0.2812168, -0.8637539],
    *               [0.9341159, -0.0344299, -2.3668685],
    *               [0.1052373, 1.266812  , 0.6542516 ]]]]]
    *
    * biases.shape ->  Array [ 3 ]
    * biases.print()
    * //=>      Tensor
    *             [-0.7850812, -2.3238883, 2.1639345]
    *
    * for idx = 0 -> filterWeights.shape  -> Array(5) [ 1, 1, 1, 5, 1 ]
    * filterWeights.print()
    * //=>  Tensor
    *         [[[[[0.146999 ],
    *             [1.1067894],
    *             [-0.38512 ],
    *             [0.9341159],
    *             [0.1052373]]]]]
    *
    * for idx = 0 -> filterBiases.shape  -> Array [1]
    * filterBiases.print()
    * //=>   Tensor
    *          [-0.7850812]

    */

    async apply(inputTensor) {

        const oldDeleteTextureThreshold = tf.ENV.get('WEBGL_DELETE_TEXTURE_THRESHOLD')
        tf.ENV.set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0)

        const self = this
        // Important to avoid "undefined" class var members inside the timer.
        // "this" has another meaning inside the timer.

        document.getElementById("progressBarChild").parentElement.style.visibility = "visible";

        return new Promise((resolve) => {

              const startTime = performance.now()

              const convLayer = self.model.layers[self.model.layers.length - 1]
              const weights = convLayer.getWeights()[0]
              const biases = convLayer.getWeights()[1]
              const outputShape = self.isChannelLast ? inputTensor.shape.slice(1,-1) : inputTensor.shape.slice(2)
              //-- e.g.  outputShape : [256,256,256] or cropped Dim
              //-- if inputTensor [ 1, D, H, W, 50 ], channelLast true ->   outputShape : outputShape [D, H, W]
              //-- if inputTensor [ 1, 50, D, H, W ], channelLast false ->   outputShape : outputShape [D, H, W]

              let outB = tf.mul(tf.ones(outputShape), -10000)
              //-- e.g. outB.shape  [256,256,256]
              let outC = tf.zeros(outputShape)
              //-- e.g. outC.shape  [256,256,256]
              let chIdx = 0

              // console.log("---------------------------------------------------------");
              console.log(" channel loop")

              const seqTimer = window.setInterval(async function() {

                  tf.engine().startScope(); // Start TensorFlow.js scope
                  console.log('=======================');
                  const memoryInfo0 = await tf.memory();
                  console.log(`| Number of Tensors: ${memoryInfo0.numTensors}`);
                  console.log(`| Number of Data Buffers: ${memoryInfo0.numDataBuffers}`);
                  console.log("Channel : ", chIdx);

                  const result = await tf.tidy(() => {
                      const filterWeights = weights.slice([0, 0, 0, 0, chIdx], [-1, -1, -1, -1, 1]);
                      // -- e.g. filterWeights.shape [ 1, 1, 1, 5, 1 ]
                      const filterBiases = biases.slice([chIdx], [1]);
                      //-- e.g. filterBiases.shape [1] -> Tensor  [-0.7850812]
                      const outA = processTensorInChunks(inputTensor,
                                                         filterWeights,
                                                         Math.min(self.chunkSize, self.outChannels))
                            .add(filterBiases);
                      const greater = tf.greater(outA, outB);
                      const newoutB = tf.where(greater, outA, outB);
                      const newoutC = tf.where(greater, tf.fill(outC.shape, chIdx), outC);
                      // Dispose the old tensors before reassigning
                      tf.dispose([outB, outC, filterWeights, filterBiases, outA, greater]);
                      // Dummy operation to trigger cleanup
                      // tf.tidy(() => tf.matMul(tf.ones([1, 1]), tf.ones([1, 1])));
                      return [newoutC, newoutB];
                  });

                  // Log memory usage
                  const memoryInfo = await tf.memory();                 
                  console.log('=======================');
                  console.log(`Number of Tensors: ${memoryInfo.numTensors}`)
                  console.log(`Number of Data Buffers: ${memoryInfo.numDataBuffers}`)        
                  console.log(`Megabytes In Use: ${(memoryInfo.numBytes / 1048576).toFixed(3)} MB`)
                  if (memoryInfo.unreliable) {
                      console.log(`Unreliable: ${memoryInfo.unreliable}`)
                  }

                  // Dispose of previous values before assigning new tensors to outC and outB
                  if (typeof outC !== 'undefined') {
                      outC.dispose()
                  }
                  if (typeof outB !== 'undefined') {
                      outB.dispose()
                  }
                  // Assign the new values to outC and outB
                  outC = tf.keep(result[0]);
                  outB = tf.keep(result[1]);
                  // // Assign the new values to outC and outB
                  // outC = result[0];
                  // outB = result[1];
                  tf.engine().endScope();

                  if(chIdx == (self.outChannels -1)) {
                      window.clearInterval( seqTimer );
                      document.getElementById("progressBarChild").style.width = 0 + "%";
                      tf.dispose(outB);
                      const endTime = performance.now();
                      const executionTime = endTime - startTime;
                      console.log(`Execution time for output layer: ${executionTime} milliseconds`);
                      tf.ENV.set('WEBGL_DELETE_TEXTURE_THRESHOLD', oldDeleteTextureThreshold);
                      resolve(outC)
                  } else {

                      chIdx++;

                    document.getElementById("progressBarChild").style.width = (chIdx + 1) * 100 / self.outChannels + "%";

                  }

                  // Artificially introduce a pause to allow for garbage collection to catch up
                  await new Promise((resolve) => setTimeout(resolve, 300));

              }, 0);
        });


    }



} // <<<< End of class



/**
* This function better memory managment during the model layer processing
*
* @since 3.0.0
* @param {tf.Tensor} input
* @param {tf.Tensor} filter
* @param {tf.Tensor} biases
* @param {Array} stride           e.g. [ 1, 1, 1 ]
* @param {string} pad             e.g. "same"
* @param {Array} dilationRate     e.g. [ 1, 1, 1 ]
* @param {number} sliceSize       e.g. 3
* @return {}
*
*/

function convByOutputChannelAndInputSlicing(input, filter, biases, stride, pad, dilationRate, sliceSize) {
    const batchSize = input.shape[0];
    const depth = input.shape[1];
    const height = input.shape[2];
    const width = input.shape[3];
    const inChannels = input.shape[4];
    const outChannels = filter.shape[4];

    // Create an empty array to hold the output channels
    let outputChannels = null;

    // Slice the input tensor and process one output channel at a time
    for (let channel = 0; channel < outChannels; channel++) {
        const numSlices = Math.ceil(inChannels /  sliceSize);
        const biasesSlice = biases.slice([channel], [1]);
        let outputChannel = null;

        for (let i = 0; i < numSlices; i++) {
            const startChannel = i * sliceSize;
            const endChannel = Math.min((i + 1) * sliceSize, inChannels);

            // Only proceed if there are channels to process
            if (startChannel < inChannels) {
                const resultSlice = tf.tidy(() => {
                    const inputSlice = input.slice([0, 0, 0, 0, startChannel], [-1, -1, -1, -1, endChannel - startChannel]);
                    const filterSlice = filter.slice([0, 0, 0, startChannel, channel], [-1, -1, -1, endChannel - startChannel, 1]);
                    // Perform the convolution for the current slice and output channel
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

        // Add the biases to the accumulated convolutions for this channel
        const biasedOutputChannel = outputChannel.add(biasesSlice);
        outputChannel.dispose();
        biasesSlice.dispose();

        // Accumulate the channel to the output array
        if (outputChannels == null){
            outputChannels = biasedOutputChannel;
        }else{
            const updatedOutputChannels = tf.concat([outputChannels, biasedOutputChannel], 4);
            biasedOutputChannel.dispose();
            outputChannels.dispose();
            outputChannels = updatedOutputChannels;
        }
    }

    return outputChannels;
}



/**
* Inference Function for full volume and also apply sequential convoluton layer
* Suitable for  low memory devices and low performance devices.
*
* @since 1.0.0
* @param {promise}  model
* @param {tf.Tensor}  slices_3d
* @param {Array} input_shape - e.g. [?, D, H, W, Ch] or [?, Ch, D, H, W]
* @param {boolen} isChannelLast- check input shape for channel position.
* @param {number} num_of_slices- Total Number of slices a.k.a z-dim
* @param {number} slice_height- - Slice Height
* @param {number} slice_width- Slice Width
*
*/

  async function inferenceFullVolumeSeqCovLayer(model, slices_3d, input_shape, isChannelLast, num_of_slices, slice_height, slice_width) {
            console.log(" ---- Start FullVolume Inference with Sequential Convoluton Layer ---- ");

            statData["No_SubVolumes"] = 1;

            model.then(async function (res) {

                 try {
                      startTime = performance.now();
                      let inferenceStartTime = performance.now();
                      // maxLabelPredicted in whole volume of the brain
                      let maxLabelPredicted = 0;
                      let transpose = inferenceModelsList[$$("selectModel").getValue() - 1]["enableTranspose"];
                      let delay = inferenceModelsList[$$("selectModel").getValue() - 1]["inferenceDelay"];
                      console.log("Inference delay :", delay);

                      let quantileNorm = inferenceModelsList[$$("selectModel").getValue() - 1]["enableQuantileNorm"];

                      if(quantileNorm) {
                        // Quantile normalize function needs specific models to be used
                        console.log("preModel Quantile normalization enabled");
                        slices_3d = await quantileNormalizeVolumeData(slices_3d);
                      } else {
                        // Min Max Nomalize MRI data to be from 0 to 1
                        console.log("preModel Min Max normalization enabled");
                        slices_3d = minMaxNormalizeVolumeData(slices_3d);
                      }


                      let i = 1;
                      let layersLength = res.layers.length;
                      console.log("Total num of layers ", layersLength);

                      // Determine the number of output channels in the last layer of the model
                      //  e.g. 3, 50, 104
                      const outputLayer = res.layers[res.layers.length - 1];
                      console.log("Output Layer : ", outputLayer);

                      const expected_Num_labels = isChannelLast ?
                                                  outputLayer.outputShape[outputLayer.outputShape.length - 1]:
                                                  outputLayer.outputShape[1];
                      console.log("Num of output channels : ", expected_Num_labels);


                      let curTensor = [];
                      curTensor[0] = slices_3d.reshape(input_shape);
                      // console.log("curTensor[0] :", curTensor[0].dataSync());

                      const timer = window.setInterval(async function() {

                          try {
                                if (res.layers[i].activation.getClassName() !== 'linear') {
                                    curTensor[i] = await res.layers[i].apply( curTensor[i-1]);
                                } else {

                                    curTensor[i] = await convByOutputChannelAndInputSlicing(
                                        curTensor[i-1],
                                        res.layers[i].getWeights()[0],
                                        res.layers[i].getWeights()[1],
                                        res.layers[i].strides,
                                        res.layers[i].padding,
                                        res.layers[i].dilationRate,
                                        3); // important for memory use
                                }

                                // Log memory usage
                                const memoryInfo = tf.memory();
                                console.log(`Iteration ${i}:`);
                                console.log(`Number of Tensors: ${memoryInfo.numTensors}`);
                                console.log(`Number of Data Buffers: ${memoryInfo.numDataBuffers}`);
                                console.log(`Bytes In Use: ${memoryInfo.numBytes}`);
                                console.log(`Megabytes In Use: ${(memoryInfo.numBytes / 1048576).toFixed(3)} MB`);
                                console.log(`Unreliable: ${memoryInfo.unreliable}`);


                                tf.dispose(curTensor[i-1]);

                            } catch(err) {

                                  if( err.message === "Failed to compile fragment shader.") {
                                                  webix.confirm({
                                                    title:"",
                                                    ok:"Ok",
                                                    cancel:"Cancel",
                                                    type: "confirm-error",
                                                    width: 500,
                                                    text: "Context lost due to limited Memory available, please check current browser resouces in the toolbar and verified GPUs for each model"
                                                  })
                                                    .then(() => {
                                                           //---
                                                           $$("browserResourcesWindow").show();


                                                  }).fail(() => {
                                                           //---

                                                  });

                                  } else {
                                      webix.alert(err.message);
                                  }

                                  window.clearInterval( timer );
                                  tf.engine().endScope();
                                  tf.engine().disposeVariables();

                                  statData["Inference_t"] = Infinity;
                                  statData["Postprocess_t"] = Infinity;
                                  statData["Status"] = "Fail";
                                  statData["Error_Type"] = err.message;
                                  statData["Extra_Err_Info"] = "Failed while model layer " + i + " apply";

                                  if(opts.telemetryFlag) {
                                      submitTiming2GoogleSheet(statData);
                                  }

                                  return 0;
                            }  // end of catch

                            console.log("layer ", i);
                            console.log("layer output Tensor shape : ", curTensor[i].shape);
                            console.log("layer count params ", res.layers[i].countParams());

                            res.layers[i].dispose();
                            curTensor[i-1].dispose();

                            document.getElementById("progressBar").style.width = (i + 1)*100/layersLength + "%";
                            let memStatus = tf.memory().unreliable ? "Red" : "Green";
                            let unreliableReasons  =  tf.memory().unreliable ?    "unreliable reasons :" + tf.memory().reasons : "";
                            document.getElementById("memoryStatus").style.backgroundColor =  memStatus;

                            if( i == layersLength - 2) { //Stop before the last layer or classification layer.

                                  window.clearInterval( timer );

                                  // // Create an instance of SequentialConvLayer
                                  // The second parameter is important for memory,
                                  // the larger it is, the more memory it uses
                                  // it was 8, but I set it to 3, got a different error
                                  const seqConvLayer = await new SequentialConvLayer(res, 10, isChannelLast);

                                  let outputTensor = await seqConvLayer.apply(curTensor[i]);


                                  //-- document.getElementById("progressBarChild").style.width = 0 + "%";;

                                  // Dispose the previous layer input tensor
                                  tf.dispose(curTensor[i]);
                                  // delete the used class
                                  // delete seqConvLayer;

                                  // You can now use 'outputTensor' as needed
                                  console.log(outputTensor);
                                  console.log(" Output tensor shape : ", outputTensor.shape);
                                  // Array(3) [ 256, 256, 256 ]

                                  if(outputTensor.shape.length != 3) {
                                      webix.alert("Output tensor shape should be 3 dims but it is " + outputTensor.shape.length, "alert-error");
                                  }

                                  let Inference_t = ((performance.now() - startTime) / 1000).toFixed(4);

                                  console.log("find array max: ");
                                  let curBatchMaxLabel =  findArrayMax(Array.from(outputTensor.dataSync()));

                                  if( maxLabelPredicted < curBatchMaxLabel ) {
                                        maxLabelPredicted = curBatchMaxLabel;
                                  }

                                  let numSegClasses = maxLabelPredicted + 1;
                                  console.log("Predicted num of segmentation classes", numSegClasses);
                                  statData["Actual_Labels"] = numSegClasses;
                                  statData["Expect_Labels"] = expected_Num_labels;
                                  statData["NumLabels_Match"] = numSegClasses == expected_Num_labels? true : false;

                                  if( numSegClasses != expected_Num_labels ) {
                                      webix.alert("expected " + expected_Num_labels + " labels, but the predicted are " + numSegClasses + ". For possible solutions please refer to <a href='https://github.com/neuroneural/brainchop/wiki/FAQ#Q3' target='_blank'><b> FAQ </b></a>.", "alert-error");
                                      console.log("expected " + expected_Num_labels + " labels, but the predicted are " + numSegClasses);
                                  }

                                  // Transpose MRI data to be match pytorch/keras input output
                                  if(transpose) {
                                     console.log("outLabelVolume transposed");
                                     outputTensor = outputTensor.transpose();
                                  }

                                  startTime = performance.now();

                                  // Generate output volume or slices
                                  console.log("Generating output");

                                try {
                                    const img = new Uint32Array(outputTensor.dataSync());
                                    const Vshape = outputTensor.shape;
                                    const Vtype = outputTensor.dtype;
                                    tf.dispose(outputTensor);
                                    tf.engine().endScope();
                                    tf.engine().disposeVariables();
                                    
                                    generateOutputSlicesV2(img, Vshape, Vtype, num_of_slices, numSegClasses, slice_height, slice_width);
                                      console.log(" FullVolume inference num of tensors after generateOutputSlicesV2: " , tf.memory().numTensors );
                                  } catch (error) {

                                          //-- Timing data to collect
                                          tf.engine().endScope();
                                          tf.engine().disposeVariables();

                                          console.log("Error while generating output: ", error)

                                          webix.alert("Failed while generating output due to limited browser memory available");

                                          statData["Inference_t"] = Inference_t;
                                          statData["Postprocess_t"] = Infinity;
                                          statData["Status"] = "Fail";
                                          statData["Error_Type"] = error.message;
                                          statData["Extra_Err_Info"] = "Failed while generating output";

                                         if(opts.telemetryFlag) {
                                              submitTiming2GoogleSheet(statData);
                                         }

                                         return 0;
                                  }

                                  let Postprocess_t = ((performance.now() - startTime) / 1000).toFixed(4);

                                  document.getElementById("progressBar").style.width = 0;

                                  $$("downloadBtn").enable();
                                  $$("segmentBtn").enable();

                                  tf.engine().disposeVariables();

                                  console.log("Processing the whole brain volume in tfjs for multi-class output mask took : ",
                                                        ((performance.now()-inferenceStartTime)/1000).toFixed(4) + "  Seconds");

                                  //-- Timing data to collect
                                  statData["Inference_t"] = Inference_t;
                                  statData["Postprocess_t"] = Postprocess_t;
                                  statData["Status"] = "OK";

                                  if(opts.telemetryFlag) {
                                        submitTiming2GoogleSheet(statData);
                                  }

                            }  else {

                                   i++;
                            }


                     }, delay);

                  } catch(err) {

                        webix.alert(err.message);
                        console.log( err.message );
                        console.log(
                            "If webgl context is lost, try to restore webgl context by visit the link " +
                            '<a href="https://support.biodigital.com/hc/en-us/articles/218322977-How-to-turn-on-WebGL-in-my-browser">here</a>'
                        );


                        document.getElementById("webGl2Status").style.backgroundColor =  isWebGL2ContextLost() ? "Red" : "Green";

                        document.getElementById("memoryStatus").style.backgroundColor =  tf.memory().unreliable ? "Red" : "Green";
                  }
            });

 }



/**
* Inference function for full volume that crops input MRI and also apply sequential convoluton layer (Phase 2)
* Suitable for  low memory devices and low performance devices.
* Phase-1 find the mask
*
* @since 1.2.0
* @param {promise}  model, selected model for inference.
* @param {tf.Tensor}  pipeline1_out 3D  e.g. null or tensor
* @param {tf.Tensor}  slices_3d
* @param {Array} input_shape - e.g. [?, D, H, W, Ch] or [?, Ch, D, H, W]
* @param {number} num_of_slices- Total Number of slices a.k.a z-dim
* @param {number} slice_height- - Slice Height
* @param {number} slice_width- Slice Width
*
*/

async function inferenceFullVolumeSeqCovLayerPhase2 (model, slices_3d, num_of_slices, slice_height, slice_width, pipeline1_out) {

           //--Phase-2, After remove the skull try to allocate brain volume and make inferece
           console.log(" ---- Start FullVolume Inference with Sequential Conv Layer for phase-II ---- ");

           const quantileNorm = inferenceModelsList[$$("selectModel").getValue() - 1]["enableQuantileNorm"];

           if(quantileNorm) {
              // Quantile normalize function needs specific models to be used
              console.log("preModel Quantile normalization enabled");
              slices_3d = await quantileNormalizeVolumeData(slices_3d);
           } else {
              // Min Max Nomalize MRI data to be from 0 to 1
              console.log("preModel Min Max normalization enabled");
              slices_3d = await minMaxNormalizeVolumeData(slices_3d);
           }



           let mask_3d;

           if(pipeline1_out == null) { // preModel is null

              // Check if thresholding the MRI to remove noisy voxels for better cropping is needed.
              let autoThresholdValue = inferenceModelsList[$$("selectModel").getValue() - 1]["autoThreshold"];

              if( (autoThresholdValue > 0) && (autoThresholdValue <= 1) ) {

                  // Filtered MRI from noisy voxel below  autoThresholdValue
                  mask_3d = await applyMriThreshold(slices_3d, autoThresholdValue);
              } else {
                 console.log("No valid crop threshold value");
                 // binarize original image
                 mask_3d = await slices_3d.greater([0]).asType('bool');
              }

           } else {

              mask_3d = await pipeline1_out.greater([0]).asType('bool');
              //-- pipeline1_out.dispose();

           }

           console.log(" mask_3d shape :  ", mask_3d.shape);

           const coords = await tf.whereAsync(mask_3d);
           //-- Get each voxel coords (x, y, z)

           mask_3d.dispose();

           const coordsArr =    coords.arraySync();

           let row_min = slice_height,  row_max = 0,  col_min = slice_width,  col_max = 0,  depth_min = num_of_slices,  depth_max = 0;

           for(let i = 0; i < coordsArr.length; i++) {

                 if ( row_min > coordsArr[i][0] ) {
                      row_min = coordsArr[i][0];
                 } else if(row_max < coordsArr[i][0]) {
                      row_max = coordsArr[i][0];
                 }

                 if ( col_min > coordsArr[i][1] ) {
                      col_min = coordsArr[i][1];
                 } else if(col_max < coordsArr[i][1]) {
                      col_max = coordsArr[i][1];
                 }

                 if ( depth_min > coordsArr[i][2] ) {
                      depth_min = coordsArr[i][2];
                 } else if(depth_max < coordsArr[i][2]) {
                      depth_max = coordsArr[i][2];
                 }
           }


          console.log( "row min and max  :", row_min, row_max);
          console.log( "col min and max  :", col_min, col_max);
          console.log( "depth min and max  :", depth_min, depth_max);

          //-- Reference voxel that cropped volume started slice with it
          const refVoxel = [row_min, col_min, depth_min];
          // -- Starting form refVoxel, size of bounding volume
          const boundVolSizeArr = [row_max - row_min + 1, col_max - col_min + 1, depth_max - depth_min + 1];

          coords.dispose();

           //-- Extract 3d object (e.g. brain)
          const cropped_slices_3d =  slices_3d.slice([row_min, col_min, depth_min], [row_max - row_min + 1, col_max - col_min + 1, depth_max - depth_min + 1] )

          slices_3d.dispose();

          //-- Padding size add to cropped brain
          const pad =  inferenceModelsList[$$("selectModel").getValue() - 1]["cropPadding"];

          // Create margin around the bounding volume
          let cropped_slices_3d_w_pad = addZeroPaddingTo3dTensor(cropped_slices_3d, [pad, pad] , [pad, pad], [pad, pad]);
          console.log(" cropped slices_3d with padding shape:  ", cropped_slices_3d_w_pad.shape);

          cropped_slices_3d.dispose();


          if(opts.drawBoundingVolume) {

                let testVol = await removeZeroPaddingFrom3dTensor(cropped_slices_3d_w_pad, pad, pad, pad);
                console.log(" outLabelVolume without padding shape :  ", testVol.shape);

                testVol =  await resizeWithZeroPadding(testVol, num_of_slices, slice_height, slice_width, refVoxel,  boundVolSizeArr );
                console.log(" outLabelVolume final shape after resizing :  ", testVol.shape);

                draw3dObjBoundingVolume(tf.unstack(testVol));
                testVol.dispose();

                return 0;
          }


          statData["Brainchop_Ver"] = "FullVolume"

          // model.then(function (res) {
          const res = await model
                 try {
                      let startTime = performance.now();
                      const inferenceStartTime = performance.now();
                      // maxLabelPredicted in whole volume of the brain
                      let maxLabelPredicted = 0;
                      const transpose = inferenceModelsList[$$("selectModel").getValue() - 1]["enableTranspose"];
                      const delay = inferenceModelsList[$$("selectModel").getValue() - 1]["inferenceDelay"];
                      console.log("Inference delay :", delay);

                      if(transpose) {
                         cropped_slices_3d_w_pad = await cropped_slices_3d_w_pad.transpose()
                         console.log("Input transposed for pre-model");
                      } else {
                         console.log("Transpose not enabled for pre-model");
                      }

                      let i = 1;
                      let layersLength = res.layers.length;
                      console.log("res.layers.length ", layersLength);

                      let isChannelLast = isModelChnlLast(res);
                      const batchSize = opts.batchSize;
                      const numOfChan = opts.numOfChan;
                      let adjusted_input_shape
                      //-- Adjust model input shape
                      if(isChannelLast) {

                          res.layers[0].batchInputShape[1] = cropped_slices_3d_w_pad.shape[0];
                          res.layers[0].batchInputShape[2] = cropped_slices_3d_w_pad.shape[1];
                          res.layers[0].batchInputShape[3] = cropped_slices_3d_w_pad.shape[2];

                          adjusted_input_shape = [batchSize, res.layers[0].batchInputShape[1],
                                                             res.layers[0].batchInputShape[2],
                                                             res.layers[0].batchInputShape[3],
                                                             numOfChan];

                      } else {

                          res.layers[0].batchInputShape[2] = cropped_slices_3d_w_pad.shape[0];
                          res.layers[0].batchInputShape[3] = cropped_slices_3d_w_pad.shape[1];
                          res.layers[0].batchInputShape[4] = cropped_slices_3d_w_pad.shape[2];

                          adjusted_input_shape = [batchSize, numOfChan,
                                                             res.layers[0].batchInputShape[2],
                                                             res.layers[0].batchInputShape[3],
                                                             res.layers[0].batchInputShape[4]];

                      }

                      console.log(" Model batch input shape : ", res.layers[0].batchInputShape);
                      // -- batchInputShape {Array} input_shape - e.g. [?, D, H, W, Ch] or [?, Ch, D, H, W]

                      statData["Input_Shape"] = JSON.stringify(res.layers[0].batchInputShape);
                      statData["Output_Shape"] = JSON.stringify(res.output.shape);
                      statData["Channel_Last"] = isChannelLast;
                      statData["Model_Param"] = getModelNumParameters(res);
                      statData["Model_Layers"] = getModelNumLayers(res);
                      statData["Model"] = inferenceModelsList[$$("selectModel").getValue() - 1]["modelName"];
                      statData["Extra_Info"] = null;


                      // Determine the number of output channels in the last layer of the model
                      //  e.g. 3, 50, 104
                      const outputLayer = res.layers[res.layers.length - 1];
                      console.log("Output Layer : ", outputLayer);

                      const expected_Num_labels = isChannelLast ?
                                                  outputLayer.outputShape[outputLayer.outputShape.length - 1]:
                                                  outputLayer.outputShape[1];
                      console.log("Num of output channels : ", expected_Num_labels);



                      const curTensor = [];
                      curTensor[0] = await cropped_slices_3d_w_pad.reshape(adjusted_input_shape);
                      // console.log("curTensor[0] :", curTensor[0].dataSync());

                      let curProgBar = parseInt(document.getElementById("progressBar").style.width);

                      const timer = window.setInterval(async function() {

                         try {
                                  if (res.layers[i].activation.getClassName() !== 'linear') {
                                      curTensor[i] = await res.layers[i].apply( curTensor[i-1]);
                                  } else {

                                      curTensor[i] = await convByOutputChannelAndInputSlicing(curTensor[i-1],
                                                                                        res.layers[i].getWeights()[0],
                                                                                        res.layers[i].getWeights()[1],
                                                                                        res.layers[i].strides,
                                                                                        res.layers[i].padding,
                                                                                        res.layers[i].dilationRate,
                                                                                        3); // important for memory use
                                  }

                                  tf.dispose(curTensor[i-1]);

                            } catch(err) {

                                  if( err.message === "Failed to compile fragment shader.") {
                                                  webix.confirm({
                                                    title:"",
                                                    ok:"Ok",
                                                    cancel:"Cancel",
                                                    type: "confirm-error",
                                                    width: 500,
                                                    text: "Context lost due to limited Memory available, please check current browser resouces in the toolbar and verified GPUs for each model"
                                                  })
                                                    .then(() => {
                                                           //---
                                                           $$("browserResourcesWindow").show();


                                                  }).fail(() => {
                                                           //---

                                                  });

                                  } else {
                                      webix.alert(err.message);
                                  }

                                  window.clearInterval( timer );
                                  tf.engine().endScope();
                                  tf.engine().disposeVariables();

                                  statData["Inference_t"] = Infinity;
                                  statData["Postprocess_t"] = Infinity;
                                  statData["Status"] = "Fail";
                                  statData["Error_Type"] = err.message;
                                  statData["Extra_Err_Info"] = "Failed while model layer " + i + " apply";

                                  if(opts.telemetryFlag) {
                                      submitTiming2GoogleSheet(statData);
                                  }

                                  return 0;
                            }

                            console.log("layer ", i);
                            console.log("layer output Tensor shape : ", curTensor[i].shape);
                            console.log("layer count params ", res.layers[i].countParams());

                            res.layers[i].dispose();
                            curTensor[i-1].dispose();


                            document.getElementById("progressBar").style.width = (curProgBar + (i + 1)*(100 - curProgBar)/layersLength) + "%";
                            let memStatus = tf.memory().unreliable ? "Red" : "Green";
                            let unreliableReasons  =  tf.memory().unreliable ?    "unreliable reasons :" + tf.memory().reasons : "";
                            document.getElementById("memoryStatus").style.backgroundColor =  memStatus;


                            if( i == layersLength - 2) { //Stop before the last layer or classification layer.

                                    window.clearInterval( timer );


                                    // // Create an instance of SequentialConvLayer
                                    //The second parameter is important for memory,
                                    // the larger it is, the more memory it uses
                                    // it was 8, but I set it to 3, got a different error
                                    const seqConvLayer = await new SequentialConvLayer(res, 10, isChannelLast);


                                    // Apply the last output tensor to the seq. instance
                                    let outputTensor = await seqConvLayer.apply(curTensor[i])

                                    //-- document.getElementById("progressBarChild").style.width = 0 + "%";;

                                    // Dispose the previous layer input tensor
                                    tf.dispose(curTensor[i]);
                                    // delete the used class
                                    delete seqConvLayer;

                                    // You can now use 'outputTensor' as needed
                                    console.log(" Output tensor shape : ", outputTensor.shape);
                                    // Array(3) [ 256, 256, 256 ]

                                    if(outputTensor.shape.length != 3) {
                                        webix.alert("Output tensor shape should be 3 dims but it is " + outputTensor.shape.length, "alert-error");
                                    }


                                    const Inference_t = ((performance.now() - startTime)/1000).toFixed(4);

                                    console.log(" find array max ");
                                    let curBatchMaxLabel =  findArrayMax(Array.from(outputTensor.dataSync()));

                                    if( maxLabelPredicted < curBatchMaxLabel ) {
                                          maxLabelPredicted = curBatchMaxLabel;
                                    }

                                    const numSegClasses = maxLabelPredicted + 1;
                                    console.log("Predicted num of segmentation classes", numSegClasses);
                                    statData["Actual_Labels"] = numSegClasses;
                                    statData["Expect_Labels"] = expected_Num_labels;
                                    statData["NumLabels_Match"] = numSegClasses == expected_Num_labels? true : false;

                                    if( numSegClasses != expected_Num_labels ) {
                                        webix.alert("expected " + expected_Num_labels + " labels, but the predicted are " + numSegClasses + ". For possible solutions please refer to <a href='https://github.com/neuroneural/brainchop/wiki/FAQ#Q3' target='_blank'><b> FAQ </b></a>.", "alert-error");
                                        console.log("expected " + expected_Num_labels + " labels, but the predicted are " + numSegClasses);
                                    }

                                    //-- Transpose back to fit Papaya display settings
                                    let outLabelVolume = outputTensor.reshape([cropped_slices_3d_w_pad.shape[0], cropped_slices_3d_w_pad.shape[1], cropped_slices_3d_w_pad.shape[2]]);
                                    tf.dispose(outputTensor);

                                    // Transpose MRI data to be match pytorch/keras input output
                                    if(transpose) {
                                       console.log("outLabelVolume transposed");
                                       outLabelVolume = outLabelVolume.transpose();
                                    }

                                    outLabelVolume = removeZeroPaddingFrom3dTensor(outLabelVolume, pad, pad, pad);
                                    console.log(" outLabelVolume without padding shape :  ", outLabelVolume.shape);
                                    outLabelVolume =  resizeWithZeroPadding(outLabelVolume, num_of_slices, slice_height, slice_width, refVoxel,  boundVolSizeArr );
                                    console.log(" outLabelVolume final shape after resizing :  ", outLabelVolume.shape);

                                    let filterOutWithPreMask =  inferenceModelsList[$$("selectModel").getValue() - 1]["filterOutWithPreMask"];

                                    // To clean the skull area wrongly segmented inphase-2.
                                    if(pipeline1_out != null && opts.isBrainCropMaskBased && filterOutWithPreMask) {
                                        outLabelVolume = outLabelVolume.mul(binarizeVolumeDataTensor(pipeline1_out));
                                    }


                                    startTime = performance.now();
                                    // Generate output volume or slices
                                    console.log("Generating correct output");

                                    try {
                                        const img = new Uint32Array(outLabelVolume.dataSync());
                                        const Vshape = outLabelVolume.shape;
                                        const Vtype = outLabelVolume.dtype;
                                        tf.dispose(outLabelVolume);
                                        tf.engine().endScope();
                                        tf.engine().disposeVariables();
                                        
                                        generateOutputSlicesV2(img, Vshape, Vtype, num_of_slices, numSegClasses, slice_height, slice_width);
                                           console.log(" Phase-2 num of tensors after generateOutputSlicesV2: " , tf.memory().numTensors );

                                    } catch (error) {

                                            //-- Timing data to collect
                                            tf.engine().endScope();
                                            tf.engine().disposeVariables();
                                            console.log("Error while generating output: ", error)

                                            webix.alert("Failed while generating output due to limited browser memory available");

                                            statData["Inference_t"] = Inference_t;
                                            statData["Postprocess_t"] = Infinity;
                                            statData["Status"] = "Fail";
                                            statData["Error_Type"] = error.message;
                                            statData["Extra_Err_Info"] = "Failed while generating output";

                                           if(opts.telemetryFlag) {
                                                submitTiming2GoogleSheet(statData);
                                           }

                                           return 0;
                                    }

                                    let Postprocess_t = ((performance.now() - startTime)/1000).toFixed(4);

                                    document.getElementById("progressBar").style.width = 0;
                                    //webix.message.hide("waitMessage");

                                    $$("downloadBtn").enable();
                                    $$("segmentBtn").enable();
                                    //    $$("imageUploader").enable();
                                    tf.engine().disposeVariables();

                                    console.log("Processing the whole brain volume in tfjs for multi-class output mask took : ",
                                                            ((performance.now()-inferenceStartTime)/1000).toFixed(4) + "  Seconds");


                                    //-- Timing data to collect
                                    statData["Inference_t"] = Inference_t;
                                    statData["Postprocess_t"] = Postprocess_t;
                                    statData["Status"] = "OK";

                                    if(opts.telemetryFlag) {
                                          submitTiming2GoogleSheet(statData);
                                    }

                            }  else {

                                   i++;
                            }

                     }, delay);

                  } catch(err) {

                        webix.alert(err.message);
                        console.log( err.message );
                        console.log(
                            "If webgl context is lost, try to restore webgl context by visit the link " +
                            '<a href="https://support.biodigital.com/hc/en-us/articles/218322977-How-to-turn-on-WebGL-in-my-browser">here</a>'
                        );


                        document.getElementById("webGl2Status").style.backgroundColor =  isWebGL2ContextLost() ? "Red" : "Green";

                        document.getElementById("memoryStatus").style.backgroundColor =  tf.memory().unreliable ? "Red" : "Green";
                  }
            }




/**
* Inference Function for full volume
* No Sequential Convolution Layer
* Faster
*
* @since 1.0.0
* @param {promise}  model
* @param {tf.Tensor}  slices_3d
* @param {Array} input_shape - e.g. [?, D, H, W, Ch] or [?, Ch, D, H, W]
* @param {boolen} isChannelLast- check input shape for channel position.
* @param {number} num_of_slices- Total Number of slices a.k.a z-dim
* @param {number} slice_height- - Slice Height
* @param {number} slice_width- Slice Width
*
*/

async function  inferenceFullVolume(model, slices_3d, input_shape, isChannelLast, num_of_slices, slice_height, slice_width) {

            statData["No_SubVolumes"] = 1;

            //-- let modelLayersOrg =  JSON.parse(JSON.stringify(modelObject));

            model.then(async function (res) {

                 try {
                      startTime = performance.now();
                      let inferenceStartTime = performance.now();
                      // maxLabelPredicted in whole volume of the brain
                      let maxLabelPredicted = 0;
                      let transpose = inferenceModelsList[$$("selectModel").getValue() - 1]["enableTranspose"];
                      let delay = inferenceModelsList[$$("selectModel").getValue() - 1]["inferenceDelay"];
                      console.log("Inference delay :", delay);

                      let quantileNorm = inferenceModelsList[$$("selectModel").getValue() - 1]["enableQuantileNorm"];

                      if(quantileNorm) {
                        // Quantile normalize function needs specific models to be used
                        console.log("preModel Quantile normalization enabled");
                        slices_3d = await quantileNormalizeVolumeData(slices_3d);
                      } else {
                        // Min Max Nomalize MRI data to be from 0 to 1
                        console.log("preModel Min Max normalization enabled");
                        slices_3d = minMaxNormalizeVolumeData(slices_3d);
                      }

                      let i = 1;
                      let layersLength = res.layers.length;
                      console.log("res.layers.length ", layersLength);


                      let curTensor = [];
                      curTensor[0] = slices_3d.reshape(input_shape);
                      // console.log("curTensor[0] :", curTensor[0].dataSync());


                      let timer = window.setInterval(function() {

                            try {
                                  curTensor[i] = res.layers[i].apply( curTensor[i-1]);

                            } catch(err) {

                                  if( err.message === "Failed to compile fragment shader.") {
                                                  webix.confirm({
                                                    title:"",
                                                    ok:"Ok",
                                                    cancel:"Cancel",
                                                    type: "confirm-error",
                                                    width: 500,
                                                    text: "Context lost due to limited Memory available, please check current browser resouces in the toolbar and verified GPUs for each model"
                                                  })
                                                    .then(() => {
                                                           //---
                                                           $$("browserResourcesWindow").show();


                                                  }).fail(() => {
                                                           //---

                                                  });

                                  } else {
                                      webix.alert(err.message);
                                  }

                                  window.clearInterval( timer );
                                  tf.engine().endScope();
                                  tf.engine().disposeVariables();

                                  statData["Inference_t"] = Infinity;
                                  statData["Postprocess_t"] = Infinity;
                                  statData["Status"] = "Fail";
                                  statData["Error_Type"] = err.message;
                                  statData["Extra_Err_Info"] = "Failed while model layer " + i + " apply";

                                  if(opts.telemetryFlag) {
                                      submitTiming2GoogleSheet(statData);
                                  }

                                  return 0;
                            }

                            console.log("layer ", i);
                            console.log("layer output Tensor shape : ", curTensor[i].shape);
                            console.log("layer count params ", res.layers[i].countParams());

                            res.layers[i].dispose();
                            curTensor[i-1].dispose();


                            document.getElementById("progressBar").style.width = (i + 1)*100/layersLength + "%";
                            let memStatus = tf.memory().unreliable ? "Red" : "Green";
                            let unreliableReasons  =  tf.memory().unreliable ?    "unreliable reasons :" + tf.memory().reasons : "";
                            document.getElementById("memoryStatus").style.backgroundColor =  memStatus;


                            if( i == layersLength - 1) {
                                window.clearInterval( timer );

                                // prediction = res.layers[res.layers.length-1].apply(curTensor[i]);
                                // curTensor[i].print();
                                //outputDataBeforArgmx = Array.from(curTensor[i].dataSync())

                                let axis = isChannelLast ? -1 : 1;
                                console.log(" find argmax ")
                                console.log("last Tensor shape : ", curTensor[i].shape);
                                //-- curTensor[i].shape  : [ 1, 256, 256, 256, 3 ]
                                let expected_Num_labels = isChannelLast ? curTensor[i].shape[4] : curTensor[i].shape[1];
                                let prediction_argmax;

                                // Try for argMax with model output tensor.

                                try {
                                    let argMaxTime = performance.now();
                                    console.log(" Try tf.argMax for fullVolume ..");
                                    prediction_argmax = tf.argMax(curTensor[i], axis);
                                    console.log("tf.argMax for fullVolume takes : ",  ((performance.now() - argMaxTime)/1000).toFixed(4) );

                                } catch(err1) {
                                   // if channel last
                                   if(axis == -1) {

                                         try {
                                             let argMaxLargeTime = performance.now();
                                             console.log(" tf.argMax failed .. try argMaxLarge ..");
                                             let modelOutBuffer = tensor2LightBuffer(curTensor[i].reshape([num_of_slices, slice_height, slice_width, expected_Num_labels]), 'float16');
                                             prediction_argmax = argMaxLarge(modelOutBuffer, num_of_slices, slice_height, slice_width, expected_Num_labels, 'float16');
                                             console.log("argMaxLarge for fullVolume takes : ", ((performance.now() - argMaxLargeTime)/1000).toFixed(4)  );

                                         } catch(err2) {

                                                let errTxt = "argMax buffer couldn't be created due to limited memory resources.";
                                                webix.alert(errTxt);

                                                prediction_argmax.dispose();

                                                window.clearInterval( timer );
                                                tf.engine().endScope();
                                                tf.engine().disposeVariables();

                                                statData["Inference_t"] = Infinity;
                                                statData["Postprocess_t"] = Infinity;
                                                statData["Status"] = "Fail";
                                                statData["Error_Type"] = err2.message;
                                                statData["Extra_Err_Info"] = "prediction_argmax from argMaxLarge failed";

                                               if(opts.telemetryFlag) {
                                                    submitTiming2GoogleSheet(statData);
                                               }

                                               return 0;

                                         }

                                    } else {
                                        // if channel first ..
                                        let errTxt = "argMax buffer couldn't be created due to limited memory resources.";
                                        webix.alert(errTxt);

                                        prediction_argmax.dispose();

                                        window.clearInterval( timer );
                                        tf.engine().endScope();
                                        tf.engine().disposeVariables();

                                        statData["Inference_t"] = Infinity;
                                        statData["Postprocess_t"] = Infinity;
                                        statData["Status"] = "Fail";
                                        statData["Error_Type"] = err1.message;
                                        statData["Extra_Err_Info"] = "prediction_argmax from argMaxLarge not support yet channel first";

                                       if(opts.telemetryFlag) {
                                            submitTiming2GoogleSheet(statData);
                                       }

                                       return 0;
                                    }

                              }



                                console.log(" prediction_argmax shape : ", prediction_argmax.shape);
                                //-- prediction_argmax.shape  : [ 1, 256, 256, 256]

                                let Inference_t = ((performance.now() - startTime)/1000).toFixed(4);

                                //outputDataBeforArgmx = Array.from(prediction_argmax.dataSync())
                                tf.dispose(curTensor[i]);
                                // allPredictions.push({"id": allBatches[j].id, "coordinates": allBatches[j].coordinates, "data": Array.from(prediction_argmax.dataSync()) })
                                console.log(" find array max ");
                                let curBatchMaxLabel =  findArrayMax(Array.from(prediction_argmax.dataSync()));

                                if( maxLabelPredicted < curBatchMaxLabel ) {
                                      maxLabelPredicted = curBatchMaxLabel;
                                }

                                let numSegClasses = maxLabelPredicted + 1;
                                console.log("numSegClasses", numSegClasses);
                                statData["Actual_Labels"] = numSegClasses;
                                statData["Expect_Labels"] = expected_Num_labels;
                                statData["NumLabels_Match"] = numSegClasses == expected_Num_labels? true : false;


                                //-- Transpose back to fit Papaya display settings
                                let outLabelVolume = prediction_argmax.reshape([num_of_slices, slice_height, slice_width]);
                                tf.dispose(prediction_argmax);

                                // Transpose MRI data to be match pytorch/keras input output
                                if(transpose) {
                                   console.log("outLabelVolume transposed");
                                   outLabelVolume = outLabelVolume.transpose();
                                }

                                startTime = performance.now();
                                // Generate output volume or slices
                                console.log("Generating correct output");

                                try {
                                    const img = new Uint32Array(outLabelVolume.dataSync());
                                    const Vshape = outLabelVolume.shape;
                                    const Vtype = outLabelVolume.dtype;
                                    tf.dispose(outLabelVolume);
                                    tf.engine().endScope();
                                    tf.engine().disposeVariables();
                                    
                                    generateOutputSlicesV2(img, Vshape, Vtype, num_of_slices, numSegClasses, slice_height, slice_width);
                                    console.log(" FullVolume inference num of tensors after generateOutputSlicesV2: " , tf.memory().numTensors );
                                } catch (error) {

                                        //-- Timing data to collect
                                        tf.engine().endScope();
                                        tf.engine().disposeVariables();

                                        webix.alert("Failed while generating output due to limited browser memory available");

                                        statData["Inference_t"] = Inference_t;
                                        statData["Postprocess_t"] = Infinity;
                                        statData["Status"] = "Fail";
                                        statData["Error_Type"] = error.message;
                                        statData["Extra_Err_Info"] = "Failed while generating output";

                                       if(opts.telemetryFlag) {
                                            submitTiming2GoogleSheet(statData);
                                       }

                                       return 0;
                                }

                                let Postprocess_t = ((performance.now() - startTime)/1000).toFixed(4);

                                document.getElementById("progressBar").style.width = 0;
                                //webix.message.hide("waitMessage");

                                $$("downloadBtn").enable();
                                $$("segmentBtn").enable();
                                //    $$("imageUploader").enable();
                                tf.engine().disposeVariables();

                                console.log("Processing the whole brain volume in tfjs tooks for multi-class output mask : ",
                                                        ((performance.now()-inferenceStartTime)/1000).toFixed(4) + "  Seconds");


                                //-- Timing data to collect
                                statData["Inference_t"] = Inference_t;
                                statData["Postprocess_t"] = Postprocess_t;
                                statData["Status"] = "OK";

                                if(opts.telemetryFlag) {
                                      submitTiming2GoogleSheet(statData);
                                }

                            }
                        i++;

                     }, delay);

                  } catch(err) {

                        webix.alert(err.message);
                        console.log( err.message );
                        console.log(
                            "If webgl context is lost, try to restore webgl context by visit the link " +
                            '<a href="https://support.biodigital.com/hc/en-us/articles/218322977-How-to-turn-on-WebGL-in-my-browser">here</a>'
                        );


                        document.getElementById("webGl2Status").style.backgroundColor =  isWebGL2ContextLost() ? "Red" : "Green";

                        document.getElementById("memoryStatus").style.backgroundColor =  tf.memory().unreliable ? "Red" : "Green";
                  }
            });

 }

/**
* Remove zero padding from 3D tensor
* pad([[1,1],[1,1]]) means: 1 row of zeros befor, 1 row of zeros after,
*                           1 col of zeros befor, 1 col of zeros after,
*
* @since 1.2.0
* @param {tf.tensor/ Array} object3d- Can be tf.tensor or array, it can represent the cropped brain tissue in 3D with added padding
* @returns {tf.tensor} Returns same input tensor without zero padding margins
* @example
*
* tsr = removeZeroPaddingFrom3dTensor( array2Tensor ( [[[0, 0, 0, 0],
*                                                       [0, 0, 0, 0],
*                                                       [0, 0, 0, 0],
*                                                       [0, 0, 0, 0]],
*
*                                                      [[0, 0, 0, 0],
*                                                       [0, 0, 1, 0],
*                                                       [0, 2, 3, 0],
*                                                       [0, 0, 0, 0]],
*
*                                                      [[0, 0, 0, 0],
*                                                       [0, 4, 5, 0],
*                                                       [0, 6, 7, 0],
*                                                       [0, 0, 0, 0]],
*
*                                                      [[0, 0, 0, 0],
*                                                       [0, 0, 0, 0],
*                                                       [0, 0, 0, 0],
*                                                       [0, 0, 0, 0]]] )  )
*
* //=> tsr.print()
*    Tensor
*        [[[0, 1],
*          [2, 3]],
*
*         [[4, 5],
*          [6, 7]]]
*
*/

removeZeroPaddingFrom3dTensor = (tensor3d, rowPad = 1, colPad = 1, depthPad = 1) => {

    if(tensor3d.rank != 3) {
        throw "Tensor must be 3D";
    }

    [h, w, d] = tensor3d.shape;
    return tensor3d.slice( [rowPad , colPad, depthPad], [h - (2 * rowPad), w - (2 * colPad), d - (2 * depthPad) ] );
}


/**
* Add zero padding to 3D tensor
* pad([[1,1],[1,1]]) means: 1 row of zeros befor, 1 row of zeros after,
*                           1 col of zeros befor, 1 col of zeros after,
*
* @since 1.2.0
* @param {tf.tensor} tensor3d- tf.tensor,  it can represent the cropped brain tissue in 3D befor adding padding for inference
* @returns {tf.tensor} Returns same input tensor with zero padding margins
* @example
*
* tsr = addZeroPaddingTo3dTensor (   tf.tensor([0, 1, 2, 3, 4, 5, 6, 7, ], [2,2,2] )    )
*
* //=> tsr.print()
*    Tensor
*            [[[0, 0, 0, 0],
*              [0, 0, 0, 0],
*              [0, 0, 0, 0],
*              [0, 0, 0, 0]],
*
*             [[0, 0, 0, 0],
*              [0, 0, 1, 0],
*              [0, 2, 3, 0],
*              [0, 0, 0, 0]],
*
*             [[0, 0, 0, 0],
*              [0, 4, 5, 0],
*              [0, 6, 7, 0],
*              [0, 0, 0, 0]],
*
*             [[0, 0, 0, 0],
*              [0, 0, 0, 0],
*              [0, 0, 0, 0],
*              [0, 0, 0, 0]]]
*
*/


addZeroPaddingTo3dTensor = (tensor3d, rowPadArr = [1, 1], colPadArr = [1, 1], depthPadArr = [1, 1]) => {
    if(tensor3d.rank != 3) {
        throw "Tensor must be 3D";
    }

    return tensor3d.pad([ rowPadArr ,colPadArr, depthPadArr ]);
}



/**
* Resize cropped 3d tensor to original size with filling zero padding
* It creates padding around cropped volume to restore orginal MRI size after the inference
Original voxel is the x,y,z used for slicing the brain
* pad([[1,1],[1,1]]) means: 1 row of zeros befor, 1 row of zeros after,
*                           1 col of zeros befor, 1 col of zeros after,
*
* @since 1.2.0
* @param {tf.tensor} croppedTensor3d- tf.tensor,  it represents the cropped brain tissue resulted from the model inference
* @param {number} newDepth,  the new depth to resize cropped volume to it, e.g. 256
* @param {number} newHeight,  the new height to resize cropped volume to it, e.g. 256
* @param {number} newWidth,  the new width to resize cropped volume to it, e.g. 256
* @param {Array} refVoxel,  the reference voxel to position the cropped volume into the new volume or original volume size
* @param {Array} boundVolSizeArr, size dim of the cropped brain bounding volume
* @returns {tf.tensor} Returns same input tensor with zero padding margins
* @example
*
* tsr = resizeWithZeroPadding ( tf.tensor([0, 1, 2, 3, 4, 5, 6, 7, ], [2,2,2]),  4, 4, 4, [1, 1, 1], [2, 2, 2]  )
*
* //=> tsr.print()
*    Tensor
*            [[[0, 0, 0, 0],
*              [0, 0, 0, 0],
*              [0, 0, 0, 0],
*              [0, 0, 0, 0]],
*
*             [[0, 0, 0, 0],
*              [0, 0, 1, 0],
*              [0, 2, 3, 0],
*              [0, 0, 0, 0]],
*
*             [[0, 0, 0, 0],
*              [0, 4, 5, 0],
*              [0, 6, 7, 0],
*              [0, 0, 0, 0]],
*
*             [[0, 0, 0, 0],
*              [0, 0, 0, 0],
*              [0, 0, 0, 0],
*              [0, 0, 0, 0]]]
*
*/



 resizeWithZeroPadding = (croppedTensor3d, newDepth, newHeight, newWidth, refVoxel, boundVolSizeArr ) => {

        let row_pad_befor = refVoxel[0];
        let col_pad_befor = refVoxel[1];
        let depth_pad_befor = refVoxel[2];
        // last and lower volume voxel
        let row_max = row_pad_befor + boundVolSizeArr[0] -1; // size [2, 2, 2] means 2 voxels total in each dim
        let col_max = col_pad_befor + boundVolSizeArr[1] -1;
        let depth_max = depth_pad_befor + boundVolSizeArr[2] -1;

        let row_pad_after = (newHeight - row_max -1) > 0 ? (newHeight - row_max -1) : 0;
        let col_pad_after = (newWidth - col_max -1) > 0 ? (newWidth - col_max -1) : 0;
        let depth_pad_after = (newDepth - depth_max -1) > 0  ? (newDepth - depth_max -1) : 0;

        return croppedTensor3d.pad([ [row_pad_befor, row_pad_after] ,[col_pad_befor, col_pad_after], [depth_pad_befor, depth_pad_after] ]);

 }


/**
* Generate output labels of all slices. (refine)
* Find current voxel value of the related seg class buffer, if we have numSegClasses = 3 then we have 3 buffers,
* one for each seg classes 0, 1, 2
*
* @since 1.0.0
* @param {tf.Tensor}  unstackOutVolumeTensor
* @param {number} num_of_slices- Total Number of slices a.k.a z-dim
* @param {number} slice_height- - Slice Height
* @param {number} slice_width- Slice Width
* @return {tensor}
*
*/


generateBrainMask = (unstackOutVolumeTensor, num_of_slices, slice_height, slice_width) => {

        console.log("Generate Brain Masking ... ");
        // Convert all slices into 1 Dim array to download

        let allOutputSlices3DCC = [];
        let allOutputSlices3DContours = [];


        // dataSync() using to flatten array. Takes around 1.5 s
        for(let sliceTensorIdx = 0; sliceTensorIdx < unstackOutVolumeTensor.length; sliceTensorIdx++ ) {
              allOutputSlices3DCC[sliceTensorIdx] = Array.from(unstackOutVolumeTensor[sliceTensorIdx].dataSync());
        }


        let isPreModelPostProcessEnable = inferenceModelsList[$$("selectModel").getValue() - 1]["preModelPostProcess"];

        if(isPreModelPostProcessEnable) {
            console.log("Phase-1 Post processing enabled ... ");
            allOutputSlices3DCC = tf.tidy(() => {
                  // Remove noisy regions using 3d CC
                  let sliceWidth = niftiHeader.dims[1];
                  let sliceHeight = niftiHeader.dims[2];
                  return postProcessSlices3D(allOutputSlices3DCC, sliceHeight, sliceWidth );
            })
            console.log("Post processing done ");
        } else {
            console.log("Phase-1 Post processing disabled ... ");
        }


        let allOutputSlices3DCC1DimArray = [];
        // Use this conversion to download output slices as nii file. Takes around 0.5 s
        for(let sliceIdx = 0; sliceIdx < allOutputSlices3DCC.length; sliceIdx++ ) {
              allOutputSlices3DCC1DimArray.push.apply(allOutputSlices3DCC1DimArray, allOutputSlices3DCC[sliceIdx]);
        }


        let  brainOut = [];

        if(opts.isBrainCropMaskBased) { //  Mask-based

             let brainMaskTensor1d =  binarizeVolumeDataTensor(tf.tensor1d(allOutputSlices3DCC1DimArray));
             brainOut = Array.from(brainMaskTensor1d.dataSync());

        } else { //  Brain tissue

            let allSlices = getAllSlicesData1D(num_of_slices, niftiHeader, niftiImage);
            for(let sliceIdx = 0; sliceIdx < allOutputSlices3DCC.length; sliceIdx++ ) {
                for(pixelIdx = 0; pixelIdx < (slice_height * slice_width); pixelIdx++) {
                     //Filter smaller regions original MRI data
                     if(allOutputSlices3DCC[sliceIdx][pixelIdx] == 0) {
                        allSlices[sliceIdx][pixelIdx] = 0;
                     }
                 }

                 brainOut.push.apply(brainOut, allSlices[sliceIdx])
            }
       }


       let labelArrayBuffer = createNiftiOutArrayBuffer(rawNiftiData, brainOut);


       if(opts.showPhase1Output) { // flag to not draw for now

              if(opts.isColorEnable) {
                  let blob = new Blob([labelArrayBuffer], {type: "application/octet-binary;charset=utf-8"});
                  let file = new File([blob], "temp.nii");
                  params_label["files"] = [file];
                  params_label[file["name"]] = {lut: "Grayscale", interpolation: false};

              } else {
                  params_label["binaryImages"] = [labelArrayBuffer];
              }

              // Set the view of container-2 as container-1
              params_label["mainView"] = papayaContainers[0].viewer.mainImage.sliceDirection == 1? "axial" :
                                         papayaContainers[0].viewer.mainImage.sliceDirection == 2? "coronal" : "sagittal";


              //-- Remove any existing overlay
              resetMriViewerOverlay(1);



              // Label segmenation voxels according to label file
              console.log("label path: ", inferenceModelsList[$$("selectModel").getValue() - 1]["labelsPath"])

              // set 1 for label viewer
              papaya.Container.resetViewer(1, params_label);


              // To sync swap view button
              document.getElementById(PAPAYA_CONTROL_MAIN_SWAP_BUTTON_CSS + papayaContainers[0].containerIndex).addEventListener("click", function(){
                    papayaContainers[1].viewer.rotateViews()

              })

              document.getElementById(PAPAYA_CONTROL_MAIN_SWAP_BUTTON_CSS + papayaContainers[1].containerIndex).addEventListener("click", function(){
                    papayaContainers[0].viewer.rotateViews()

              })

       }

       if(opts.isBrainCropMaskBased) {
             // To show brain volume
             console.log("Output Segmentation Labels (ROI) volumes : ",  arrValuesFreq(brainOut));
       }

       return tf.tensor(brainOut, [num_of_slices, slice_height, slice_width] );

  }


/**
* (Option) Draw 3D bounding volume of the brain in Papaya label viewer
* For visualization purpose
* @since 1.2.0
* @param {tf.Tensor}  unstackOutVolumeTensor
*
*/


draw3dObjBoundingVolume= (unstackOutVolumeTensor) => {

         console.log("Plot cropped  volume shape ... ");
        // Convert all slices into 1 Dim array to download

        let allOutputSlices3DCC = [];
        let allOutputSlices3DContours = [];


        // dataSync() using to flatten array. Takes around 1.5 s
        for(let sliceTensorIdx = 0; sliceTensorIdx < unstackOutVolumeTensor.length; sliceTensorIdx++ ) {
              allOutputSlices3DCC[sliceTensorIdx] = Array.from(unstackOutVolumeTensor[sliceTensorIdx].dataSync());
        }

        // if(false) { // Enable contour for overlay option
        //     // Remove noisy regions using 3d CC
        //     let sliceWidth = niftiHeader.dims[1];
        //     let sliceHeight = niftiHeader.dims[2];
        //     allOutputSlices3DCC = findVolumeContours(allOutputSlices3DCC, sliceHeight, sliceWidth, 2 );
        // }

        let allOutputSlices3DCC1DimArray = [];
        // Use this conversion to download output slices as nii file. Takes around 0.5 s
        for(let sliceIdx = 0; sliceIdx < allOutputSlices3DCC.length; sliceIdx++ ) {
              allOutputSlices3DCC1DimArray.push.apply(allOutputSlices3DCC1DimArray, allOutputSlices3DCC[sliceIdx]);
        }

        console.log("Done with allOutputSlices3DCC1DimArray ")

        let  brainOut = [];


        let brainMaskTensor1d =  binarizeVolumeDataTensor(tf.tensor1d(allOutputSlices3DCC1DimArray));
        brainOut = Array.from(brainMaskTensor1d.dataSync());


         // labelArrayBuffer = createNiftiOutArrayBuffer(rawNiftiData, brainExtractionData1DimArr);
        let labelArrayBuffer = createNiftiOutArrayBuffer(rawNiftiData, brainOut);


        if(true) { // flag to not draw for now

              if(opts.isColorEnable) {
                  let blob = new Blob([labelArrayBuffer], {type: "application/octet-binary;charset=utf-8"});
                  let file = new File([blob], "temp.nii");
                  params_label["files"] = [file];
                  params_label[file["name"]] = {lut: "Grayscale", interpolation: false};

              } else {
                  params_label["binaryImages"] = [labelArrayBuffer];
              }

              // Set the view of container-2 as container-1
              params_label["mainView"] = papayaContainers[0].viewer.mainImage.sliceDirection == 1? "axial" :
                                         papayaContainers[0].viewer.mainImage.sliceDirection == 2? "coronal" : "sagittal";


              papaya.Container.resetViewer(1, params_label);
              papayaContainers[1].viewer.screenVolumes[0].alpha = 0.2;  // 0 to 1 screenVolumes[0] is first image loaded in Labels viewer
              papayaContainers[1].viewer.drawViewer(true, false);


              // To sync swap view button
              document.getElementById(PAPAYA_CONTROL_MAIN_SWAP_BUTTON_CSS + papayaContainers[0].containerIndex).addEventListener("click", function(){
                    papayaContainers[1].viewer.rotateViews()

              })

              document.getElementById(PAPAYA_CONTROL_MAIN_SWAP_BUTTON_CSS + papayaContainers[1].containerIndex).addEventListener("click", function(){
                    papayaContainers[0].viewer.rotateViews()

              })

         }

  }

/**
* Function return the  3D bounding volume of the brain
* For visualization purpose
* @since 1.2.0
* @param {tf.Tensor}  slices_3d,  input 3D tesnor shape
* @return {Pormise} promise with result has minVoxelCoord Array, maxVoxelCoord Array , boundVolSize Array.
* @example
*
* result = get3dObjectBoundingVolume(  array2Tensor ( [[[0, 0, 0, 0],
*                                                       [0, 0, 0, 0],
*                                                       [0, 0, 0, 0],
*                                                       [0, 0, 0, 0]],
*
*                                                      [[0, 0, 0, 0],
*                                                       [0, 0, 1, 0],
*                                                       [0, 2, 3, 0],
*                                                       [0, 0, 0, 0]],
*
*                                                      [[0, 0, 0, 0],
*                                                       [0, 4, 5, 0],
*                                                       [0, 6, 7, 0],
*                                                       [0, 0, 0, 0]],
*
*                                                      [[0, 0, 0, 0],
*                                                       [0, 0, 0, 0],
*                                                       [0, 0, 0, 0],
*                                                       [0, 0, 0, 0]]] )  )
*
* result.then(function (res){ console.log(res )})
* //=>
*  Object { minVoxelCoord: [1, 1, 1], maxVoxelCoord: [2, 2, 2 ], boundVolSize: [2, 2, 2 ] }
*
*/

get3dObjectBoundingVolume = async(slices_3d) => {

           // Get the shape mask
           let  maskTensor_3d = slices_3d.greater([0]).asType('bool');
           //-- Don't dispose slices_3d here, dispose it from the calling function..

           const coords = await tf.whereAsync(maskTensor_3d);
           //-- Get each voxel coords (x, y, z)
           maskTensor_3d.dispose();

           const coordsArr =    coords.arraySync();
           coords.dispose();


           let row_min = 256,  row_max = 0,  col_min = 256,  col_max = 0,  depth_min = 256,  depth_max = 0;

           for(let i = 0; i < coordsArr.length; i++) {

                 if ( row_min > coordsArr[i][0] ) {
                      row_min = coordsArr[i][0];
                 } else if(row_max < coordsArr[i][0]) {
                      row_max = coordsArr[i][0];
                 }

                 if ( col_min > coordsArr[i][1] ) {
                      col_min = coordsArr[i][1];
                 } else if(col_max < coordsArr[i][1]) {
                      col_max = coordsArr[i][1];
                 }

                 if ( depth_min > coordsArr[i][2] ) {
                      depth_min = coordsArr[i][2];
                 } else if(depth_max < coordsArr[i][2]) {
                      depth_max = coordsArr[i][2];
                 }
           }


           let minVoxel = [row_min, col_min, depth_min];
           let maxVoxel = [row_max, col_max, depth_max];
           let boundVolSize = [row_max - row_min + 1, col_max - col_min + 1, depth_max - depth_min + 1];

           return {"minVoxelCoord" : minVoxel, "maxVoxelCoord" :  maxVoxel, "boundVolSize": boundVolSize};

}


/**
* Inference function for full volume that crops input MRI (Phase 2)
* Phase-1 find the mask
*
* @since 1.2.0
* @param {promise}  model, selected model for inference.
* @param {tf.Tensor}  pipeline1_out 3D  e.g. null or tensor
* @param {tf.Tensor}  slices_3d
* @param {Array} input_shape - e.g. [?, D, H, W, Ch] or [?, Ch, D, H, W]
* @param {number} num_of_slices- Total Number of slices a.k.a z-dim
* @param {number} slice_height- - Slice Height
* @param {number} slice_width- Slice Width
*
*/

 inferenceFullVolumePhase2 = async(model, slices_3d, num_of_slices, slice_height, slice_width, pipeline1_out) => {

           //--Phase-2, After remove the skull try to allocate brain volume and make inferece
           console.log(" ---- Start FullVolume inference phase-II ---- ");

           let quantileNorm = inferenceModelsList[$$("selectModel").getValue() - 1]["enableQuantileNorm"];

           if(quantileNorm) {
              // Quantile normalize function needs specific models to be used
              console.log("preModel Quantile normalization enabled");
              slices_3d = await quantileNormalizeVolumeData(slices_3d);
           } else {
              // Min Max Nomalize MRI data to be from 0 to 1
              console.log("preModel Min Max normalization enabled");
              slices_3d = minMaxNormalizeVolumeData(slices_3d);
           }


           let mask_3d;

           if(pipeline1_out == null) { // preModel is null

              // Check if thresholding the MRI to remove noisy voxels for better cropping is needed.
              let autoThresholdValue = inferenceModelsList[$$("selectModel").getValue() - 1]["autoThreshold"];

              if( (autoThresholdValue > 0) && (autoThresholdValue <= 1) ) {

                  // Filtered MRI from noisy voxel below  autoThresholdValue
                  mask_3d = await applyMriThreshold(slices_3d, autoThresholdValue);
              } else {
                 console.log("No valid crop threshold value");
                 // binarize original image
                 mask_3d = slices_3d.greater([0]).asType('bool');
              }

           } else {

              mask_3d = pipeline1_out.greater([0]).asType('bool');
              //-- pipeline1_out.dispose();

           }

           console.log(" mask_3d shape :  ", mask_3d.shape);

           const coords = await tf.whereAsync(mask_3d);
           //-- Get each voxel coords (x, y, z)

           mask_3d.dispose();

           const coordsArr =    coords.arraySync();

           let row_min = slice_height,  row_max = 0,  col_min = slice_width,  col_max = 0,  depth_min = num_of_slices,  depth_max = 0;

           for(let i = 0; i < coordsArr.length; i++) {

                 if ( row_min > coordsArr[i][0] ) {
                      row_min = coordsArr[i][0];
                 } else if(row_max < coordsArr[i][0]) {
                      row_max = coordsArr[i][0];
                 }

                 if ( col_min > coordsArr[i][1] ) {
                      col_min = coordsArr[i][1];
                 } else if(col_max < coordsArr[i][1]) {
                      col_max = coordsArr[i][1];
                 }

                 if ( depth_min > coordsArr[i][2] ) {
                      depth_min = coordsArr[i][2];
                 } else if(depth_max < coordsArr[i][2]) {
                      depth_max = coordsArr[i][2];
                 }
           }


          console.log( "row min and max  :", row_min, row_max);
          console.log( "col min and max  :", col_min, col_max);
          console.log( "depth min and max  :", depth_min, depth_max);

          //-- Reference voxel that cropped volume started slice with it
          let refVoxel = [row_min, col_min, depth_min];
          console.log("refVoxel :", refVoxel)

          // -- Starting form refVoxel, size of bounding volume
          let boundVolSizeArr = [row_max - row_min + 1, col_max - col_min + 1, depth_max - depth_min + 1];

          console.log("boundVolSizeArr :", boundVolSizeArr)

          coords.dispose();

           //-- Extract 3d object (e.g. brain)
          let cropped_slices_3d =  slices_3d.slice([row_min, col_min, depth_min], [row_max - row_min + 1, col_max - col_min + 1, depth_max - depth_min + 1] )

          slices_3d.dispose();

          //-- Padding size add to cropped brain
          let pad =  inferenceModelsList[$$("selectModel").getValue() - 1]["cropPadding"];

          // Create margin around the bounding volume
          cropped_slices_3d_w_pad = addZeroPaddingTo3dTensor(cropped_slices_3d, [pad, pad] , [pad, pad], [pad, pad]);
          console.log(" cropped slices_3d with padding shape:  ", cropped_slices_3d_w_pad.shape);

          cropped_slices_3d.dispose();


          //-- Test dim after padding ..
          // for (let i = 0; i < cropped_slices_3d_w_pad.rank; i++) {
          //     if(cropped_slices_3d_w_pad.shape[i] > 256) {
          //          console.log(" cropped_slices_3d_w_pad > 256 ");
          //     }

          // }



          if(opts.drawBoundingVolume) {

                let testVol = removeZeroPaddingFrom3dTensor(cropped_slices_3d_w_pad, pad, pad, pad);
                console.log(" outLabelVolume without padding shape :  ", testVol.shape);

                testVol =  resizeWithZeroPadding(testVol, num_of_slices, slice_height, slice_width, refVoxel,  boundVolSizeArr );
                console.log(" outLabelVolume final shape after resizing :  ", testVol.shape);

                draw3dObjBoundingVolume(tf.unstack(testVol));
                testVol.dispose();

                return 0;
          }


          statData["Brainchop_Ver"] = "FullVolume";

          model.then(function (res) {

                 try {
                      startTime = performance.now();
                      let inferenceStartTime = performance.now();
                      // maxLabelPredicted in whole volume of the brain
                      let maxLabelPredicted = 0;
                      let transpose = inferenceModelsList[$$("selectModel").getValue() - 1]["enableTranspose"];
                      let delay = inferenceModelsList[$$("selectModel").getValue() - 1]["inferenceDelay"];
                      console.log("Inference delay :", delay);

                      if(transpose) {
                         cropped_slices_3d_w_pad = cropped_slices_3d_w_pad.transpose()
                         console.log("Input transposed for pre-model");
                      } else {
                         console.log("Transpose not enabled for pre-model");
                      }

                      let i = 1;
                      let layersLength = res.layers.length;
                      console.log("res.layers.length ", layersLength);

                      let isChannelLast = isModelChnlLast(res);
                      const batchSize = opts.batchSize;
                      const numOfChan = opts.numOfChan;

                      //-- Adjust model input shape
                      if(isChannelLast) {

                          res.layers[0].batchInputShape[1] = cropped_slices_3d_w_pad.shape[0];
                          res.layers[0].batchInputShape[2] = cropped_slices_3d_w_pad.shape[1];
                          res.layers[0].batchInputShape[3] = cropped_slices_3d_w_pad.shape[2];

                          adjusted_input_shape = [batchSize, res.layers[0].batchInputShape[1],
                                                             res.layers[0].batchInputShape[2],
                                                             res.layers[0].batchInputShape[3],
                                                             numOfChan];

                      } else {

                          res.layers[0].batchInputShape[2] = cropped_slices_3d_w_pad.shape[0];
                          res.layers[0].batchInputShape[3] = cropped_slices_3d_w_pad.shape[1];
                          res.layers[0].batchInputShape[4] = cropped_slices_3d_w_pad.shape[2];

                          adjusted_input_shape = [batchSize, numOfChan,
                                                             res.layers[0].batchInputShape[2],
                                                             res.layers[0].batchInputShape[3],
                                                             res.layers[0].batchInputShape[4]];

                      }

                      console.log(" Model batch input shape : ", res.layers[0].batchInputShape);
                      // -- batchInputShape {Array} input_shape - e.g. [?, D, H, W, Ch] or [?, Ch, D, H, W]

                      statData["Input_Shape"] = JSON.stringify(res.layers[0].batchInputShape);
                      statData["Output_Shape"] = JSON.stringify(res.output.shape);
                      statData["Channel_Last"] = isChannelLast;
                      statData["Model_Param"] = getModelNumParameters(res);
                      statData["Model_Layers"] = getModelNumLayers(res);
                      statData["Model"] = inferenceModelsList[$$("selectModel").getValue() - 1]["modelName"];
                      statData["Extra_Info"] = null;


                      let curTensor = [];
                      curTensor[0] = cropped_slices_3d_w_pad.reshape(adjusted_input_shape);
                      // console.log("curTensor[0] :", curTensor[0].dataSync());

                      let curProgBar = parseInt(document.getElementById("progressBar").style.width);

                      let timer = window.setInterval(function() {

                            try {
                                  //-- curTensor[i] = res.layers[i].apply( curTensor[i-1]);
                                  curTensor[i] = res.layers[i].apply( curTensor[i-1]);

                            } catch(err) {

                                  if( err.message === "Failed to compile fragment shader.") {
                                                  webix.confirm({
                                                    title:"",
                                                    ok:"Ok",
                                                    cancel:"Cancel",
                                                    type: "confirm-error",
                                                    width: 500,
                                                    text: "Context lost due to limited Memory available, please check current browser resouces in the toolbar and verified GPUs for each model"
                                                  })
                                                    .then(() => {
                                                           //---
                                                           $$("browserResourcesWindow").show();


                                                  }).fail(() => {
                                                           //---

                                                  });

                                  } else {
                                      webix.alert(err.message);
                                  }

                                  window.clearInterval( timer );
                                  tf.engine().endScope();
                                  tf.engine().disposeVariables();

                                  statData["Inference_t"] = Infinity;
                                  statData["Postprocess_t"] = Infinity;
                                  statData["Status"] = "Fail";
                                  statData["Error_Type"] = err.message;
                                  statData["Extra_Err_Info"] = "Failed while model layer " + i + " apply";

                                  if(opts.telemetryFlag) {
                                      submitTiming2GoogleSheet(statData);
                                  }

                                  return 0;
                            }

                            console.log("layer ", i);
                            console.log("layer output Tensor shape : ", curTensor[i].shape);
                            console.log("layer count params ", res.layers[i].countParams());

                            res.layers[i].dispose();
                            curTensor[i-1].dispose();


                            document.getElementById("progressBar").style.width = (curProgBar + (i + 1)*(100 - curProgBar)/layersLength) + "%";
                            let memStatus = tf.memory().unreliable ? "Red" : "Green";
                            let unreliableReasons  =  tf.memory().unreliable ?    "unreliable reasons :" + tf.memory().reasons : "";
                            document.getElementById("memoryStatus").style.backgroundColor =  memStatus;


                            if( i == layersLength - 1) {
                                window.clearInterval( timer );

                                // prediction = res.layers[res.layers.length-1].apply(curTensor[i]);
                                // curTensor[i].print();
                                //outputDataBeforArgmx = Array.from(curTensor[i].dataSync())

                                let axis = isChannelLast ? -1 : 1;
                                console.log(" find argmax ")
                                console.log("last Tensor shape : ", curTensor[i].shape);
                                //-- curTensor[i].shape  e.g. [ 1, 256, 256, 256, 3 ]
                                let expected_Num_labels = isChannelLast ? curTensor[i].shape[4] : curTensor[i].shape[1];
                                let prediction_argmax;

                                // Try for argMax with model output tensor.

                                try {
                                    let argMaxTime = performance.now();
                                    console.log(" Try tf.argMax for fullVolume ..");
                                    prediction_argmax = tf.argMax(curTensor[i], axis);
                                    console.log("tf.argMax for fullVolume takes : ",  ((performance.now() - argMaxTime)/1000).toFixed(4) );

                                } catch(err1) {
                                   // if channel last
                                   if(axis == -1) {

                                         try {
                                             let argMaxLargeTime = performance.now();
                                             console.log(" tf.argMax failed .. try argMaxLarge ..");
                                             let modelOutBuffer = tensor2LightBuffer(curTensor[i].reshape([cropped_slices_3d_w_pad.shape[0], cropped_slices_3d_w_pad.shape[1], cropped_slices_3d_w_pad.shape[2], expected_Num_labels]), 'float16');
                                             prediction_argmax = argMaxLarge(modelOutBuffer, cropped_slices_3d_w_pad.shape[0], cropped_slices_3d_w_pad.shape[1], cropped_slices_3d_w_pad.shape[2], expected_Num_labels, 'float16');
                                             console.log("argMaxLarge for fullVolume takes : ", ((performance.now() - argMaxLargeTime)/1000).toFixed(4)  );

                                         } catch(err2) {

                                                let errTxt = "argMax buffer couldn't be created due to limited memory resources.";
                                                webix.alert(errTxt);


                                                window.clearInterval( timer );
                                                tf.engine().endScope();
                                                tf.engine().disposeVariables();

                                                statData["Inference_t"] = Infinity;
                                                statData["Postprocess_t"] = Infinity;
                                                statData["Status"] = "Fail";
                                                statData["Error_Type"] = err2.message;
                                                statData["Extra_Err_Info"] = "prediction_argmax from argMaxLarge failed";

                                               if(opts.telemetryFlag) {
                                                    submitTiming2GoogleSheet(statData);
                                               }

                                               return 0;

                                         }

                                    } else {
                                        // if channel first ..
                                        let errTxt = "argMax buffer couldn't be created due to limited memory resources.";
                                        webix.alert(errTxt);

                                        prediction_argmax.dispose();

                                        window.clearInterval( timer );
                                        tf.engine().endScope();
                                        tf.engine().disposeVariables();

                                        statData["Inference_t"] = Infinity;
                                        statData["Postprocess_t"] = Infinity;
                                        statData["Status"] = "Fail";
                                        statData["Error_Type"] = err1.message;
                                        statData["Extra_Err_Info"] = "prediction_argmax from argMaxLarge not support yet channel first";

                                       if(opts.telemetryFlag) {
                                            submitTiming2GoogleSheet(statData);
                                       }

                                       return 0;
                                    }

                              }



                                console.log(" prediction_argmax shape : ", prediction_argmax.shape);
                                //-- prediction_argmax.shape  : [ 1, 256, 256, 256]

                                let Inference_t = ((performance.now() - startTime)/1000).toFixed(4);

                                //outputDataBeforArgmx = Array.from(prediction_argmax.dataSync())
                                tf.dispose(curTensor[i]);
                                // allPredictions.push({"id": allBatches[j].id, "coordinates": allBatches[j].coordinates, "data": Array.from(prediction_argmax.dataSync()) })
                                console.log(" find array max ");
                                let curBatchMaxLabel =  findArrayMax(Array.from(prediction_argmax.dataSync()));

                                if( maxLabelPredicted < curBatchMaxLabel ) {
                                      maxLabelPredicted = curBatchMaxLabel;
                                }

                                let numSegClasses = maxLabelPredicted + 1;
                                console.log("numSegClasses", numSegClasses);
                                statData["Actual_Labels"] = numSegClasses;
                                statData["Expect_Labels"] = expected_Num_labels;
                                statData["NumLabels_Match"] = numSegClasses == expected_Num_labels? true : false;


                                if( numSegClasses != expected_Num_labels ) {
                                    webix.alert("expected " + expected_Num_labels + " labels, but the predicted are " + numSegClasses + ". For possible solutions please refer to <a href='https://github.com/neuroneural/brainchop/wiki/FAQ#Q3' target='_blank'><b> FAQ </b></a>.", "alert-error");
                                    console.log("expected " + expected_Num_labels + " labels, but the predicted are " + numSegClasses);
                                }


                                //-- Transpose back to fit Papaya display settings
                                let outLabelVolume = prediction_argmax.reshape([cropped_slices_3d_w_pad.shape[0], cropped_slices_3d_w_pad.shape[1], cropped_slices_3d_w_pad.shape[2]]);
                                tf.dispose(prediction_argmax);

                                // Transpose MRI data to be match pytorch/keras input output
                                if(transpose) {
                                   console.log("outLabelVolume transposed");
                                   outLabelVolume = outLabelVolume.transpose();
                                }

                                outLabelVolume = removeZeroPaddingFrom3dTensor(outLabelVolume, pad, pad, pad);
                                console.log(" outLabelVolume without padding shape :  ", outLabelVolume.shape);
                                outLabelVolume =  resizeWithZeroPadding(outLabelVolume, num_of_slices, slice_height, slice_width, refVoxel,  boundVolSizeArr );
                                console.log(" outLabelVolume final shape after resizing :  ", outLabelVolume.shape);

                                let filterOutWithPreMask =  inferenceModelsList[$$("selectModel").getValue() - 1]["filterOutWithPreMask"];
                                  // To clean the skull area wrongly segmented in phase-2.
                                if(pipeline1_out != null && opts.isBrainCropMaskBased && filterOutWithPreMask) {
                                    outLabelVolume = outLabelVolume.mul(binarizeVolumeDataTensor(pipeline1_out));
                                }

                                startTime = performance.now();
                                // Generate output volume or slices
                                console.log("Generating correct output");

                                try {
                                    const img = new Uint32Array(outLabelVolume.dataSync());
                                    const Vshape = outLabelVolume.shape;
                                    const Vtype = outLabelVolume.dtype;
                                    tf.dispose(outLabelVolume);
                                    tf.engine().endScope();
                                    tf.engine().disposeVariables();
                                    
                                    generateOutputSlicesV2(img, Vshape, Vtype, num_of_slices, numSegClasses, slice_height, slice_width);
                                       console.log(" Phase-2 num of tensors after generateOutputSlicesV2: " , tf.memory().numTensors );

                                } catch (error) {

                                        //-- Timing data to collect
                                        tf.engine().endScope();
                                        tf.engine().disposeVariables();

                                        webix.alert("Failed while generating output due to limited browser memory available");

                                        statData["Inference_t"] = Inference_t;
                                        statData["Postprocess_t"] = Infinity;
                                        statData["Status"] = "Fail";
                                        statData["Error_Type"] = error.message;
                                        statData["Extra_Err_Info"] = "Failed while generating output";

                                       if(opts.telemetryFlag) {
                                            submitTiming2GoogleSheet(statData);
                                       }

                                       return 0;
                                }

                                let Postprocess_t = ((performance.now() - startTime)/1000).toFixed(4);

                                document.getElementById("progressBar").style.width = 0;
                                //webix.message.hide("waitMessage");

                                $$("downloadBtn").enable();
                                $$("segmentBtn").enable();
                                //    $$("imageUploader").enable();
                                //tf.engine().endScope();
                                tf.engine().disposeVariables();

                                console.log("Processing the whole brain volume in tfjs for multi-class output mask took : ",
                                                        ((performance.now()-inferenceStartTime)/1000).toFixed(4) + "  Seconds");


                                //-- Timing data to collect
                                statData["Inference_t"] = Inference_t;
                                statData["Postprocess_t"] = Postprocess_t;
                                statData["Status"] = "OK";

                                if(opts.telemetryFlag) {
                                      submitTiming2GoogleSheet(statData);
                                }

                            }
                        i++;

                     }, delay);

                  } catch(err) {

                        webix.alert(err.message);
                        console.log( err.message );
                        console.log(
                            "If webgl context is lost, try to restore webgl context by visit the link " +
                            '<a href="https://support.biodigital.com/hc/en-us/articles/218322977-How-to-turn-on-WebGL-in-my-browser">here</a>'
                        );


                        document.getElementById("webGl2Status").style.backgroundColor =  isWebGL2ContextLost() ? "Red" : "Green";

                        document.getElementById("memoryStatus").style.backgroundColor =  tf.memory().unreliable ? "Red" : "Green";
                  }
            });

 }

/**
* Function to check if there is any problem with the sequence of ids
*
* @since 1.2.0
*
*/

checkInferenceModelList = () => {
   inferenceModelsList.forEach((model, idx) => {
          if(model.id != ( idx + 1) ) {
             webix.alert("inferenceModelsList needs review for inconsistency in models ID");
             return 0;
          }
   });

}


/**
* Inference function for full volume that find tissue first (Phase-1) by apply pre-model e.g. Brain_Extraction or Brain_Masking
* This is a first part of pipeline of two stages, phase-1 to apply pre-model, and phase-2 to crop the MRI
* @since 1.2.0
* @param {promise}  model, selected model for inference.
* @param {tf.Tensor}  slices_3d
* @param {number} num_of_slices- Total Number of slices a.k.a z-dim
* @param {number} slice_height- - Slice Height
* @param {number} slice_width- Slice Width
*
*/


  inferenceFullVolumePhase1 = async(model, slices_3d, num_of_slices, slice_height, slice_width, isModelFullVol) => {

            statData["No_SubVolumes"] = 1;

            let modelEntry = inferenceModelsList[$$("selectModel").getValue() - 1];
            console.log("modelEntry ", modelEntry)

            // load pre-model for inference first, can be null if no pre-model such as GWM models
            if(modelEntry["preModelId"]) {

                let preModel =  load_model(inferenceModelsList[ modelEntry["preModelId"] - 1]['path'] );
                let transpose = inferenceModelsList[ modelEntry["preModelId"]  - 1]["enableTranspose"];
                let quantileNorm = inferenceModelsList[ modelEntry["preModelId"]  - 1]["enableQuantileNorm"];
                let preModel_slices_3d = null;

                //-- If pre-model is not null then slices_3d mask will be generated..
                //-- The mask is needed to remove the skull and set noise in background to 0, and get the brain bounding volume properly
                let slices_3d_mask = null;

                if(quantileNorm) {
                    // Quantile normalize function needs specific models to be used
                    console.log("preModel Quantile normalization enabled");
                    preModel_slices_3d = await quantileNormalizeVolumeData(slices_3d);
                } else {
                    // Min Max Nomalize MRI data to be from 0 to 1
                    console.log("preModel Min Max normalization enabled");
                    preModel_slices_3d = minMaxNormalizeVolumeData(slices_3d);
                }


                //-- Transpose MRI data to be match pytorch/keras input output
                //-- Check if pre-model needs transpose..
                if(transpose) {

                   preModel_slices_3d = preModel_slices_3d.transpose();
                   console.log("Input transposed for pre-model");

                } else {
                   console.log("Transpose not enabled for pre-model");
                }

                statData["Brainchop_Ver"] = "PreModel_FV"  ;  // e.g. "PreModel_FV"

                preModel.then(function (res) {

                     try {

                          let inferenceStartTime = performance.now();
                          let preModelObject  = res;

                          // read input shape from model.json object
                          let preModelBatchInputShape = preModelObject.layers[0].batchInputShape;
                          console.log(" Pre-Model batch input shape : ", preModelBatchInputShape)

                          //-- Verify input shape
                          if(preModelBatchInputShape.length != 5) {
                                webix.alert("The pre-model input shape must be 5D ");
                                return 0;
                          }

                          let isPreModelChannelLast = isModelChnlLast(preModelObject);
                          const batchSize = opts.batchSize;
                          const numOfChan = opts.numOfChan;
                          let   batch_D, batch_H, batch_W;

                          if(isPreModelChannelLast ) {
                              console.log("Pre-Model Channel Last")
                              if (isNaN(preModelBatchInputShape[4]) || (preModelBatchInputShape[4] !=1)) {
                                    webix.alert("The number of channels for pre-model input shape must be 1");
                                    return 0;
                              }

                              batch_D = preModelBatchInputShape[1];
                              batch_H = preModelBatchInputShape[2];
                              batch_W = preModelBatchInputShape[3];

                              preModel_input_shape = [batchSize, batch_D, batch_H, batch_W, numOfChan];

                          } else {
                              console.log("Pre-Model Channel First")
                              if (isNaN(preModelBatchInputShape[1]) || (preModelBatchInputShape[1] !=1)) {
                                    webix.alert("The number of channels for pre-model input shape must be 1");
                                    return 0;
                              }

                              batch_D = preModelBatchInputShape[2];
                              batch_H = preModelBatchInputShape[3];
                              batch_W = preModelBatchInputShape[4];

                              preModel_input_shape = [batchSize, numOfChan,  batch_D, batch_H, batch_W];

                          }


                          statData["Input_Shape"] = JSON.stringify(preModel_input_shape);
                          statData["Output_Shape"] = JSON.stringify(preModelObject.output.shape);
                          statData["Channel_Last"] = isPreModelChannelLast;
                          statData["Model_Param"] = getModelNumParameters(preModelObject);
                          statData["Model_Layers"] = getModelNumLayers(preModelObject);
                          statData["Model"] = inferenceModelsList[ modelEntry["preModelId"] - 1]["modelName"];
                          statData["Extra_Info"] = inferenceModelsList[$$("selectModel").getValue() - 1]["modelName"];


                          // maxLabelPredicted in whole volume of the brain
                          let maxLabelPredicted = 0;
                          let delay = inferenceModelsList[ modelEntry["preModelId"] - 1]["inferenceDelay"];

                          let i = 1;
                          let layersLength = res.layers.length;

                          let curTensor = [];
                          //-- reshape MRI to model input shape
                          curTensor[0] = preModel_slices_3d.reshape(preModel_input_shape);

                          //Dispose the volume
                          tf.dispose(preModel_slices_3d);

                          let timer = window.setInterval(function() {

                                try {
                                      curTensor[i] = res.layers[i].apply( curTensor[i-1]);

                                } catch(err) {

                                      if( err.message === "Failed to compile fragment shader.") {
                                                      webix.confirm({
                                                        title:"",
                                                        ok:"Ok",
                                                        cancel:"Cancel",
                                                        type: "confirm-error",
                                                        width: 500,
                                                        text: "Context lost due to limited Memory available, please check current browser resouces in the toolbar and verified GPUs for each model"
                                                      })
                                                        .then(() => {
                                                               //---
                                                               $$("browserResourcesWindow").show();


                                                      }).fail(() => {
                                                               //---

                                                      });

                                      } else {
                                          webix.alert(err.message);
                                      }

                                      window.clearInterval( timer );
                                      tf.engine().endScope();
                                      tf.engine().disposeVariables();

                                      statData["Inference_t"] = Infinity;
                                      statData["Postprocess_t"] = Infinity;
                                      statData["Status"] = "Fail";
                                      statData["Error_Type"] = err.message;
                                      statData["Extra_Err_Info"] = "PreModel Failed while model layer " + i + " apply";

                                      if(opts.telemetryFlag) {
                                          submitTiming2GoogleSheet(statData);
                                      }

                                      return 0;
                                }

                                console.log("layer ", i);

                                res.layers[i].dispose();
                                curTensor[i-1].dispose();


                                document.getElementById("progressBar").style.width = (i + 1)*50/layersLength + "%";
                                let memStatus = tf.memory().unreliable ? "Red" : "Green";
                                let unreliableReasons  =  tf.memory().unreliable ?    "unreliable reasons :" + tf.memory().reasons : "";
                                document.getElementById("memoryStatus").style.backgroundColor =  memStatus;


                                if( i == layersLength - 1) {
                                    window.clearInterval( timer );

                                    //-- prediction = res.layers[res.layers.length-1].apply(curTensor[i]);
                                    //-- curTensor[i].print();
                                    //-- outputDataBeforArgmx = Array.from(curTensor[i].dataSync())

                                    let axis = isPreModelChannelLast ? -1 : 1;
                                    console.log(" find argmax ")
                                    console.log("last Tensor shape : ", curTensor[i].shape);
                                    //-- curTensor[i].shape  : [ 1, 256, 256, 256, 3 ]
                                    let expected_Num_labels = isPreModelChannelLast ? curTensor[i].shape[4] : curTensor[i].shape[1];
                                    let prediction_argmax;

                                    // Try for argMax with model output tensor.

                                    try {
                                        console.log(" Try tf.argMax for fullVolume ..");
                                        prediction_argmax = tf.argMax(curTensor[i], axis);

                                    } catch(err1) {
                                       // if channel last
                                       if(axis == -1) {

                                             try {
                                                 let argMaxLargeTime = performance.now();
                                                 console.log(" tf.argMax failed .. try argMaxLarge ..");
                                                 let modelOutBuffer = tensor2LightBuffer(curTensor[i].reshape([num_of_slices, slice_height, slice_width, expected_Num_labels]), 'float16');
                                                 prediction_argmax = argMaxLarge(modelOutBuffer, num_of_slices, slice_height, slice_width, expected_Num_labels, 'float16');
                                                 console.log("argMaxLarge for fullVolume takes : ", ((performance.now() - argMaxLargeTime)/1000).toFixed(4)  );

                                             } catch(err2) {

                                                    let errTxt = "argMax buffer couldn't be created due to limited memory resources.";
                                                    webix.alert(errTxt);

                                                    prediction_argmax.dispose();

                                                    window.clearInterval( timer );
                                                    tf.engine().endScope();
                                                    tf.engine().disposeVariables();

                                                    statData["Inference_t"] = Infinity;
                                                    statData["Postprocess_t"] = Infinity;
                                                    statData["Status"] = "Fail";
                                                    statData["Error_Type"] = err2.message;
                                                    statData["Extra_Err_Info"] = "preModel prediction_argmax from argMaxLarge failed";

                                                   if(opts.telemetryFlag) {
                                                        submitTiming2GoogleSheet(statData);
                                                   }

                                                   return 0;

                                             }

                                        } else {
                                            // if channel first ..
                                            let errTxt = "argMax buffer couldn't be created due to limited memory resources.";
                                            webix.alert(errTxt);

                                            prediction_argmax.dispose();

                                            window.clearInterval( timer );
                                            tf.engine().endScope();
                                            tf.engine().disposeVariables();

                                            statData["Inference_t"] = Infinity;
                                            statData["Postprocess_t"] = Infinity;
                                            statData["Status"] = "Fail";
                                            statData["Error_Type"] = err1.message;
                                            statData["Extra_Err_Info"] = "preModel prediction_argmax from argMaxLarge not support yet channel first";

                                           if(opts.telemetryFlag) {
                                                submitTiming2GoogleSheet(statData);
                                           }

                                           return 0;
                                        }

                                  }



                                    console.log(" Pre-model prediction_argmax shape : ", prediction_argmax.shape);
                                    //-- prediction_argmax.shape  : [ 1, 256, 256, 256]

                                    let Inference_t = ((performance.now() - inferenceStartTime)/1000).toFixed(4);

                                    tf.dispose(curTensor[i]);

                                    console.log(" Pre-model find array max ");
                                    let curBatchMaxLabel =  findArrayMax(Array.from(prediction_argmax.dataSync()));

                                    if( maxLabelPredicted < curBatchMaxLabel ) {
                                          maxLabelPredicted = curBatchMaxLabel;
                                    }

                                    let numSegClasses = maxLabelPredicted + 1;
                                    console.log("Pre-model numSegClasses", numSegClasses);

                                    statData["Actual_Labels"] = numSegClasses;
                                    statData["Expect_Labels"] = expected_Num_labels;
                                    statData["NumLabels_Match"] = numSegClasses == expected_Num_labels? true : false;

                                    //-- Transpose back to fit Papaya display settings
                                    let outLabelVolume = prediction_argmax.reshape([num_of_slices, slice_height, slice_width]);
                                    tf.dispose(prediction_argmax);

                                    // Transpose MRI data to be match pytorch/keras input output
                                    if(transpose) {
                                       console.log("Pre-model outLabelVolume transposed");
                                       outLabelVolume = outLabelVolume.transpose();
                                    }


                                    startTime = performance.now();
                                    // Generate output volume or slices
                                    console.log("Generating pre-model output");

                                    try {
                                        slices_3d_mask = tf.tidy(() => {
                                             let unstackOutVolumeTensor = tf.unstack(outLabelVolume);
                                             tf.dispose(outLabelVolume);
                                             return generateBrainMask(unstackOutVolumeTensor, num_of_slices, slice_height, slice_width);
                                        });

                                        console.log(" Phase-1 num of tensors after generateBrainMask: " , tf.memory().numTensors );

                                    } catch (error) {

                                            //-- Timing data to collect
                                            tf.engine().endScope();
                                            tf.engine().disposeVariables();

                                            webix.alert("Failed while generating pre-model output due to limited browser memory available");

                                            statData["Inference_t"] = Inference_t;
                                            statData["Postprocess_t"] = Infinity;
                                            statData["Status"] = "Fail";
                                            statData["Error_Type"] = error.message;
                                            statData["Extra_Err_Info"] = "Pre-model failed while generating output";

                                           if(opts.telemetryFlag) {
                                                submitTiming2GoogleSheet(statData);
                                           }

                                           return 0;
                                    }

                                    let Postprocess_t = ((performance.now() - startTime)/1000).toFixed(4);


                                    console.log("Pre-model processing the whole brain volume in tfjs tooks for multi-class output mask : ",
                                                            ((performance.now()-inferenceStartTime)/1000).toFixed(4) + "  Seconds");


                                    //-- Timing data to collect
                                    statData["Inference_t"] = Inference_t;
                                    statData["Postprocess_t"] = Postprocess_t;
                                    statData["Status"] = "OK";

                                    if(opts.telemetryFlag) {
                                          submitTiming2GoogleSheet(statData);
                                    }


                                    if(slices_3d_mask == null) {

                                       console.log("slice_3d_mask failed ...");
                                       webix.message("slice_3d_mask failed ...");
                                       return 0;

                                    } else {

                                       //--Phase-2, After remove the skull try to allocate brain volume and make inferece
                                       console.log("--- pre-model done ---");
                                       // --mask_3d = slices_3d_mask.greater([0]).asType('bool');
                                       // --slices_3d_mask.dispose();

                                       if(isModelFullVol) {

                                            if(modelEntry["enableSeqConv"]) {
                                                 // Mask cropping & seq conv
                                                 // Non-Atlas model (e.g. GWM) needs sequential convolution layer.
                                                 // Sequential convolution layer to be used after cropping - slow but reliable on most machines
                                                 console.log("------ Mask Cropping & Seq Convoluton ------");
                                                 inferenceFullVolumeSeqCovLayerPhase2(model, slices_3d, num_of_slices, slice_height, slice_width, slices_3d_mask);
                                                 // inferenceFullVolumeSeqCovLayerPhase2(model, slices_3d.transpose(), num_of_slices, slice_height, slice_width, slices_3d_mask);
                                            } else {
                                                 // Mask cropping BUT no seq conv
                                                 console.log("------ Mask Cropping  -  NO Seq Convoluton ------");
                                                 inferenceFullVolumePhase2(model, slices_3d, num_of_slices, slice_height, slice_width, slices_3d_mask);
                                                 // inferenceFullVolumePhase2(model, slices_3d.transpose(), num_of_slices, slice_height, slice_width, slices_3d_mask);
                                            }

                                       } else {
                                            // -- In version 3.0.0 this function not used
                                            inferenceSubVolumes(model, slices_3d, num_of_slices, slice_height, slice_width, slices_3d_mask);
                                            //inferenceSubVolumes(model, slices_3d.transpose(), num_of_slices, slice_height, slice_width, slices_3d_mask);
                                       }

                                    }

                               }
                            i++;

                         }, delay);

                      } catch(err) {

                            webix.alert(err.message);
                            console.log( err.message );
                            console.log(
                                "If webgl context is lost, try to restore webgl context by visit the link " +
                                '<a href="https://support.biodigital.com/hc/en-us/articles/218322977-How-to-turn-on-WebGL-in-my-browser">here</a>'
                            );


                            document.getElementById("webGl2Status").style.backgroundColor =  isWebGL2ContextLost() ? "Red" : "Green";

                            document.getElementById("memoryStatus").style.backgroundColor =  tf.memory().unreliable ? "Red" : "Green";
                      }
                });

           //-- if(...)  end
           } else { // No preModel

               //--Phase-2, After remove the skull try to allocate brain volume and make inferece
               console.log("--- No pre-model is selected ---");
               console.log("------ Run voxel cropping ------");
               //-- mask_3d = slices_3d.greater([0]).asType('bool');

               if(isModelFullVol) {

                    if(modelEntry["enableSeqConv"]) {
                         // Voxel cropping & seq conv
                         // Non-Atlas model (e.g. GWM) needs sequential convolution layer.
                         // Sequential convolution layer to be used after cropping - slow but reliable on most machines
                         console.log("------ Seq Convoluton ------");
                         inferenceFullVolumeSeqCovLayerPhase2(model, slices_3d, num_of_slices, slice_height, slice_width, null);
                    } else {
                         // Voxel cropping BUT no seq conv
                         inferenceFullVolumePhase2(model, slices_3d, num_of_slices, slice_height, slice_width, null);
                    }

               } else {
                    // -- In version 3.0.0 this function not used
                    inferenceSubVolumes(model, slices_3d, num_of_slices, slice_height, slice_width, null);
               }
           }



 }

 /**
* Inference Function
* @since 1.2.0
*
*/

 enableProductionMode = async(textureF16Flag = true) => {

                        //-- tf.setBackend('cpu');
                        //-- tf.removeBackend('cpu')

                        //-- Calling enableProdMode() method
                        await tf.enableProdMode();
                        //-- Setting debug mode of the  environment
                        tf.env().set('DEBUG', false);


                        tf.env().set('WEBGL_FORCE_F16_TEXTURES', textureF16Flag);
                        //-- set this flag so that textures are deleted when tensors are disposed.
                        tf.env().set("WEBGL_DELETE_TEXTURE_THRESHOLD", 0);
                        //-- tf.env().set('WEBGL_PACK', false);

                        //-- Put ready after sets above
                        await tf.ready();

                        //-- Printing output
                        console.log(tf.env().flags);
                        console.log("tf env() features :", tf.env().features);
                        console.log("tf env total features: ", Object.keys(tf.env().features).length);
                        console.log(tf.getBackend());
 }

/**
* Pre-Inference settings
* @since 1.3.0
*
*/

resetMainParameters = () => {
    // free global variable of 16777216 voxel
    allOutputSlices3DCC1DimArray = [];
    Object.keys(outVolumeStatus).forEach(key => outVolumeStatus[key] = null);
}

/**
* Inference function
* @since 1.0.0
*
*/

  runInference = async() => {
          let startTime = performance.now();

	        const batchSize = opts.batchSize;
	        const numOfChan = opts.numOfChan;



	        if (isNaN(batchSize) || batchSize != 1) {
                webix.alert("The batch Size for input shape must be 1");
                return 0;

	        }

	        if (isNaN(numOfChan) || (numOfChan != 1)) {
                webix.alert("The number of channels for input shape must be 1");
	            return 0;
	        }

          tf.engine().startScope()

          console.log("Batch size: ", batchSize);
          console.log("Num of Channels: ", numOfChan);

          //-- Get model
          let modelEntry, model;

          if($$("selectModel").getValue() <= numOfModelsWithoutBrowse) { //-- inferenceModelsList orginal num of models are five
                 modelEntry = inferenceModelsList[$$("selectModel").getValue() - 1];
                 model =  load_model(modelEntry["path"]);
          } else {
                modelEntry = browserModelList.filter(entry => entry.id == $$("selectModel").getValue().toString())[0];
                model =  load_browser_model( modelEntry.modelFile, modelEntry.weightFile);
          }

          // Enable production model:
          // true enable F16 bit, false enable F32 bit processing
          await enableProductionMode(true);

          let modelObject = {};
          // get model object data e.g. layers etc
          model.then(function(res) {
                modelObject = res;

                let batchInputShape = [];

                // free global variable of 16777216 voxel
                // allOutputSlices3DCC1DimArray = [];
                // outputSceneRendered = false;
                // read input shape from model.json object
                batchInputShape = modelObject.layers[0].batchInputShape;
                console.log(" Model batch input shape : ", batchInputShape)

                //-- Verify input shape
                if(batchInputShape.length != 5) {
                      webix.alert("The model input shape must be 5D ");
                      return 0;
                }

                let batch_D, batch_H, batch_W;
                let slice_width, slice_height, num_of_slices;
                let input_shape;


                slice_width = niftiHeader.dims[1];
                slice_height = niftiHeader.dims[2];
                num_of_slices = niftiHeader.dims[3];

                let isChannelLast = isModelChnlLast(modelObject);

                if(isChannelLast) {
                    console.log("Model Channel Last")
                    if (isNaN(batchInputShape[4]) || (batchInputShape[4] !=1)) {
                          webix.alert("The number of channels for input shape must be 1");
                          return 0;
                    }

                    batch_D = batchInputShape[1];
                    batch_H = batchInputShape[2];
                    batch_W = batchInputShape[3];

                    input_shape = [batchSize, batch_D, batch_H, batch_W, numOfChan];

                } else {
                    console.log("Model Channel First")
                    if (isNaN(batchInputShape[1]) || (batchInputShape[1] !=1)) {
                          webix.alert("The number of channels for input shape must be 1");
                          return 0;
                    }

                    batch_D = batchInputShape[2];
                    batch_H = batchInputShape[3];
                    batch_W = batchInputShape[4];

                    input_shape = [batchSize, numOfChan,  batch_D, batch_H, batch_W];

                }

                //  //-- Atlas version check
                // if ( (batch_D > 30) && (batch_H == 256) && (batch_W == 256) ) {
                //       webix.alert("The subvolume dimension in z-axis shouldn't exceed 30 number of slices for browser limitation");
                //       return 0;
                // }

                //--Check whether the model will make inference at once as FullVolumeModel
                let isModelFullVol;

                if ( (batch_D == 256) && (batch_H == 256) && (batch_W == 256) ) {
                        isModelFullVol = true;

                } else {
                        isModelFullVol = false;

                }


                let modelNumLayers = modelObject.layers.length;
                // Model output number of segmentations
                let outLabels = modelObject.layers[ modelNumLayers - 1 ].bias.shape[0];

                let allSlices = getAllSlicesData1D(num_of_slices, niftiHeader, niftiImage);

                let allSlices_2D = getAllSlices2D(allSlices, slice_height, slice_width);

                // free array from mem
                allSlices = null;

                // Get slices_3d tensor
                let slices_3d = getSlices3D(allSlices_2D);

                // free tensor from mem
                tf.dispose(allSlices_2D);


                // if(inferenceModelsList[$$("selectModel").getValue() - 1]["enableQuantileNorm"]) {
                //     // Quantile normalize function needs specific models to be used
                //     console.log("Quantile normalization enabled");
                //     slices_3d = await quantileNormalizeVolumeData(slices_3d);
                // } else {
                //     // Min Max Nomalize MRI data to be from 0 to 1
                //     console.log("Min Max normalization enabled");
                //     slices_3d = minMaxNormalizeVolumeData(slices_3d);
                // }


                let Preprocess_t = ((performance.now() - startTime)/1000).toFixed(4);


                //-- Timing data to collect
                let today = new Date();

                if(isModelFullVol) {
                     statData["Brainchop_Ver"] = "FullVolume";
                } else {
                     statData["Brainchop_Ver"] = "SubVolumes";

                }


                let geoData = getBrowserLocationInfo();
                if(geoData) {
                      statData["Country"] = geoData["Country"];
                      statData["State"] = geoData["Region"];
                      statData["City"] = geoData["City"];
                } else {
                      statData["Country"] = "";
                      statData["State"] = "";
                      statData["City"] = "";
                }



                statData["Date"] = parseInt(today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear();
                statData["Time"] = checkZero(today.getHours()) + ":" + checkZero(today.getMinutes()) + ":" + checkZero(today.getSeconds());
                statData["File_Name"] = refFileName == "" ? opts.uiSampleName: refFileName;
                statData["Input_Shape"] = JSON.stringify(batchInputShape);
                statData["Output_Shape"] = JSON.stringify(modelObject.output.shape);
                statData["Channel_Last"] = isChannelLast;
                statData["Model_Param"] = getModelNumParameters(modelObject);
                statData["Model_Layers"] = getModelNumLayers(modelObject);

                statData["Preprocess_t"] = Preprocess_t;
                statData["Model"] = inferenceModelsList[$$("selectModel").getValue() - 1]["modelName"];
                statData["Browser"] = detectBrowser();
                statData["Browser_Ver"] = detectBrowserVersion();
                statData["OS"] = detectOperatingSys();
                statData["WebGL1"] = checkWebGl1();
                statData["WebGL2"] = checkWebGl2();
                statData["GPU_Vendor"] = detectGPUVendor();
                statData["GPU_Card"] = detectGPUCardType();
                statData["GPU_Vendor_Full"] = detectGPUVendor_v0();
                statData["GPU_Card_Full"] = detectGPUCardType_v0();
                statData["CPU_Cores"] = getCPUNumCores();
                statData["TF_Backend"] = tf.getBackend();

                statData["Which_Brainchop"] = "latest";
                statData["Seq_Conv"] =  inferenceModelsList[$$("selectModel").getValue() - 1]["enableSeqConv"];


                //-- Init
                statData["Actual_Labels"] = Infinity;
                statData["Expect_Labels"] = Infinity;
                statData["NumLabels_Match"] = null;
                statData["Inference_t"] = Infinity;
                statData["Merge_t"] = Infinity;
                statData["Postprocess_t"] = Infinity;
                statData["Status"] = null;
                statData["Error_Type"] = null;
                statData["Extra_Err_Info"] = null;
                statData["Extra_Info"] = null;


                if(isChrome()) {
                    statData["Heap_Size_MB"] = window.performance.memory["totalJSHeapSize"]/(1024*1024).toFixed(2);
                    statData["Used_Heap_MB"] = window.performance.memory["usedJSHeapSize"]/(1024*1024).toFixed(2);
                    statData["Heap_Limit_MB"] = window.performance.memory["jsHeapSizeLimit"]/(1024*1024).toFixed(2);
                }


                let  gl = checkWebGl2() ? document.createElement('canvas').getContext('webgl2') :
                          checkWebGl1() ? document.createElement('canvas').getContext('webgl1') : null;

                console.log("MAX_TEXTURE_SIZE :",  gl.getParameter(gl.MAX_TEXTURE_SIZE));
                console.log("MAX_RENDERBUFFER_SIZE :",  gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));

                //-- check to see   if  machine has two graphics card: one is the builtin e.g. Intel Iris Pro, the other is NVIDIA GeForce GT 750M.
                //-- check browser use which one, if debugInfo is null then installed  GPU is not used
                let  debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                console.log("VENDOR WEBGL:",  gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) );

                if(gl) {
                    statData["Texture_Size"] = gl.getParameter(gl.MAX_TEXTURE_SIZE) //--returns the maximum dimension the GPU can address
                } else {
                    statData["Texture_Size"] = null;
                }


                let transpose = inferenceModelsList[$$("selectModel").getValue() - 1]["enableTranspose"];
                let enableCrop = inferenceModelsList[$$("selectModel").getValue() - 1]["enableCrop"];


                if (isModelFullVol) {

                    if( enableCrop) {
                        // FullVolume with Crop option before inference ..
                        // pre-model to mask the volume, can also be null and the cropping will be on the MRI.
                        inferenceFullVolumePhase1(model, slices_3d, num_of_slices, slice_height, slice_width, isModelFullVol);
                    } else {
                        // Transpose MRI data to be match pytorch/keras input output
                        console.log("Cropping Disabled");

                        if(transpose) {
                           slices_3d = slices_3d.transpose()
                           console.log("Input transposed");
                        } else {
                           console.log("Transpose NOT Enabled");
                        }

                       let enableSeqConv = inferenceModelsList[$$("selectModel").getValue() - 1]["enableSeqConv"];

                       if(enableSeqConv) {
                            console.log("Seq Convoluton Enabled");
                            inferenceFullVolumeSeqCovLayer(model, slices_3d, input_shape, isChannelLast, num_of_slices, slice_height, slice_width);
                       } else {
                            console.log("Seq Convoluton Disabled");
                            inferenceFullVolume(model, slices_3d, input_shape, isChannelLast, num_of_slices, slice_height, slice_width);
                       }


                    }

                } else {

                    // // In version 3.0.0 this function not used
                    //-- if(enableCrop) {
                    //       // FullVolume with Crop option before inference ..
                    //       // pre-model to mask the volume, can also be null and the cropping will be on the MRI.
                    //--     inferenceFullVolumePhase1(model, slices_3d, num_of_slices, slice_height, slice_width, isModelFullVol);
                    //-- } else {
                    //       // Transpose MRI data to be match pytorch/keras input output
                    //--     if(transpose) {
                    //--        slices_3d = slices_3d.transpose()
                    //--        console.log("Input transposed");
                    //--     } else {
                    //--        console.log("Transpose not enabled");
                    //--     }

                    //--  inferenceSubVolumes(model, slices_3d, num_of_slices, slice_height, slice_width);
                    //-- }

                   console.log("This is not a full volume model");
                   webix.alert({title: "",    text: "This is not a full volume model",    type:"alert-error"});

               }

        }) //-- End of model.then

	 } //-- End of runInference


})();
