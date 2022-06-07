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


(function(){


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
* postProcessSlices3D( [ [0,0,0,0,  0,1,1,0,  0,0,0,0],
*                        [0,0,0,0,  0,0,1,1,  0,0,0,0],
*                        [0,0,0,0,  0,0,0,1,  0,1,1,0] ], 3, 4)
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
* normSlices = normalizeVolumeData (  tf.tensor( Array.from({length: 8}, (x, i) => i) , [2, 2, 2]) )
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

	normalizeVolumeData = (volumeData) => {
	    //Normalize the data to the range 0 - 1 using min-max scaling
	    const volumeData_Max = volumeData.max();
	    const volumeData_Min = volumeData.min();
	    const normalizedSlices_3d = volumeData.sub(volumeData_Min).div(volumeData_Max.sub(volumeData_Min));
	    return  normalizedSlices_3d;      
	}

/**
* load pre-trained model from local drive
*
* @since 1.0.0
* @param {string} modelUrl - the model URL e.g. "./ModelToLoad/mnm_tfjs_me_test/model.json"
* @returns {promise} Promise object represents the model to load
* @example
*
* load_model("./ModelToLoad/mnm_tfjs_me_test/model.json")
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



        console.log("colors: ", colors)
        

        let colorsRgbObj = [];

        // Array of threshold grey value of each class
        let classGreyValue = [];


            
        // Find the threshold grey value of each class
        for(let classIdx = 0; classIdx < numSegClasses; classIdx ++ ) {
              classGreyValue[classIdx] = Math.ceil(classIdx*255/(numSegClasses - 1));
              // if file exist
              colorsRgbObj[classIdx] =  getRgbObject(colors[classIdx]);
              console.log(" colorsRgbObj[classIdx] ", colorsRgbObj[classIdx])
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
* @param {string} labelsURL - label url e.g. "./ModelToLoad/meshnet_dropout/mnm_dropout/labels.json".
* @example
*
* fetchLabelStructure("./ModelToLoad/meshnet_dropout/mnm_dropout/labels.json")
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
* @param {string} labelsURL - label url e.g. "./ModelToLoad/meshnet_dropout/mnm_dropout/labels.json".
* @param {number} papayaContainerIdx - 0 for MRI viewer and 1 for laber viewer.
* @example
*
* addMouseMoveHandler("./ModelToLoad/meshnet_dropout/mnm_dropout/labels.json", 0)
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
* @returns {tf.Tensor}  Returns Tensor of ouput volume 
*/ 


mergeSubVolumes = (allPredictions, num_of_slices, numSegClasses, slice_height, slice_width, batch_D, batch_H, batch_W) => {

        console.log("Num of seg classes: ", numSegClasses);
        console.log("Wait while generate output labels... ");
        let unstackOutVolumeTensor;

        // buffer set ( depth, H, W) in order
        if(numSegClasses <= opts.browserArrayBufferMaxZDim ) {
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
            let axis = -1; // last axis 
            // Set for each voxel the value of the index of the buffer that has the max voxel value, e.g. third buffer with index = 2 (cont..)
            // has max voxel value = 10 then the related voxel in outVolumeTensor will have value of 2 
            let outVolumeTensor = tf.argMax(outVolumeBuffer.toTensor(), axis); 
            
            let transpose = inferenceModelsList[$$("selectModel").getValue() - 1]["enableTranpose"];

            // Transpose MRI data to be match pytorch/keras input output
            if(transpose) {
               console.log("outVolumeTensor transposed");
               outVolumeTensor = outVolumeTensor.transpose();   
            }

            unstackOutVolumeTensor = tf.unstack(outVolumeTensor);

            outVolumeTensor.dispose();


        } else {

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

            let transpose = inferenceModelsList[$$("selectModel").getValue() - 1]["enableTranpose"];

            // Transpose MRI data to be match pytorch/keras input output
            if(transpose) {
               console.log("Final merged buffer transposed");
               outFinaleTensor = outFinaleTensor.transpose();               
            }

            unstackOutVolumeTensor = tf.unstack(outFinaleBuffer.toTensor());
            outFinaleTensor.dispose();

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

 
generateOutputSlicesV2 = (unstackOutVolumeTensor, num_of_slices, numSegClasses, slice_height, slice_width) => {


        // Convert all slices into 1 Dim array to download

        let allOutputSlices3DCC = [];
        let allOutputSlices3DContours = [];

        // dataSync() using to flatten array
        for(let sliceTensorIdx = 0; sliceTensorIdx < unstackOutVolumeTensor.length; sliceTensorIdx++ ) {
              allOutputSlices3DCC[sliceTensorIdx] = Array.from(unstackOutVolumeTensor[sliceTensorIdx].dataSync());
        }

        
        if(opts.isPostProcessEnable) {
            console.log("Post processing enabled ... "); 
            // Remove noisy regions using 3d CC   
            let sliceWidth = niftiHeader.dims[1];
            let sliceHeight = niftiHeader.dims[2];                                
            allOutputSlices3DCC = postProcessSlices3D(allOutputSlices3DCC, sliceHeight, sliceWidth ); 
        }   

        if(opts.isContoursViewEnable) { // Enable contour for overlay option
            // Remove noisy regions using 3d CC   
            let sliceWidth = niftiHeader.dims[1];
            let sliceHeight = niftiHeader.dims[2];                                
            allOutputSlices3DCC = findVolumeContours(allOutputSlices3DCC, sliceHeight, sliceWidth, numSegClasses ); 
        }  


        allOutputSlices3DCC1DimArray = [];
        // Use this conversion to download output slices as nii file
        for(let sliceIdx = 0; sliceIdx < allOutputSlices3DCC.length; sliceIdx++ ) {
              allOutputSlices3DCC1DimArray.push.apply(allOutputSlices3DCC1DimArray, allOutputSlices3DCC[sliceIdx])
        } 

        var labelArrayBuffer;
        let modelType = inferenceModelsList[$$("selectModel").getValue() - 1]["type"];

        switch ( modelType) {
                 case 'Brain_Masking':
                                     { 
                                        let brainMaskTensor1d =  binarizeVolumeDataTensor(tf.tensor1d(allOutputSlices3DCC1DimArray));
                                        let brainMask = Array.from(brainMaskTensor1d.dataSync());
                                        labelArrayBuffer = createNiftiOutArrayBuffer(rawNiftiData, brainMask);  
                                        allOutputSlices3DCC1DimArray = brainMask;
                                        break;             
                                     }             
               case 'Brain_Extraction':
                                     { 
                                        // Input data or loaded nifti file data 
                                        let allSlices = getAllSlicesData1D(num_of_slices, niftiHeader, niftiImage); 
                                        let brainExtractionData1DimArr = [];

                                        for(let sliceIdx = 0; sliceIdx < allOutputSlices3DCC.length; sliceIdx++ ) {
                                            for(pixelIdx = 0; pixelIdx < (slice_height * slice_width); pixelIdx++) {
                                                 //Filter smaller regions original MRI data 
                                                 if(allOutputSlices3DCC[sliceIdx][pixelIdx] == 0) {
                                                    allSlices[sliceIdx][pixelIdx] = 0;
                                                 } 
                                             }               
                                             brainExtractionData1DimArr.push.apply(brainExtractionData1DimArr, allSlices[sliceIdx])
                                        }           
                                       
                                        labelArrayBuffer = createNiftiOutArrayBuffer(rawNiftiData, brainExtractionData1DimArr); 
                                        allOutputSlices3DCC1DimArray = brainExtractionData1DimArr;
                                        break;             
                                    }  
                             default:
                                    {
                                      labelArrayBuffer = createNiftiOutArrayBuffer(rawNiftiData, allOutputSlices3DCC1DimArray); 
                                      break;             
                                    }                                        
        }


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
                                            let colorURL = inferenceModelsList[$$("selectModel").getValue() - 1]["colorsPath"];
                                            if(colorURL) { // colorURL file exists
                                                    let customColorTable = getCustomColorTableFromUrl(numSegClasses, colorURL);  
                                                     params_label[file["name"]] = {lut:  new customColorTable(), interpolation: false}

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
        addImageParams["binaryImages"] = [labelArrayBuffer];
        papaya.Container.addImage(0, [labelArrayBuffer], addImageParams);  
        numOfOverlays += 1; 

      
        // Label segmenation voxels according to label file
        console.log("label path: ", inferenceModelsList[$$("selectModel").getValue() - 1]["labelsPath"])
      
        // set 1 for label viewer 
        papaya.Container.resetViewer(1, params_label);    

        //Activate annotation for papaya container 0
        addMouseMoveHandler(inferenceModelsList[$$("selectModel").getValue() - 1]["labelsPath"], 0);

        //Activate annotation for papaya container 1        
        addMouseMoveHandler(inferenceModelsList[$$("selectModel").getValue() - 1]["labelsPath"], 1);

        // To sync swap view button 
        document.getElementById(PAPAYA_CONTROL_MAIN_SWAP_BUTTON_CSS + papayaContainers[0].containerIndex).addEventListener("click", function(){
              papayaContainers[1].viewer.rotateViews()

        })

        document.getElementById(PAPAYA_CONTROL_MAIN_SWAP_BUTTON_CSS + papayaContainers[1].containerIndex).addEventListener("click", function(){
              papayaContainers[0].viewer.rotateViews()

        })                  

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
            const scriptURL = 'https://script.google.com/macros/s/AKfycbz_upISiPpQ4CWL2B2oRGcF416RFEvCc6bRKAbM-xvAkMuTGRz8SFoq41vHxIKYWM2c/exec'
            const form = document.forms['google-sheet']
          
            //-- Add event handler to the form.
            form.addEventListener('submit', e => {
                  e.preventDefault()
                  fetch(scriptURL, { method: 'POST', body: new FormData(form)})
                    .then(response => console.log("time recorded"))
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
* Inference Function for sub-volumes
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
 
  inferenceSubVolumes = (model, slices_3d, input_shape, isChannelLast, num_of_slices, slice_height, slice_width, batch_D, batch_H, batch_W) => {
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
                                                                  new Array(num_of_slices, slice_height, slice_width), 
                                                                  new Array(batch_D, batch_H, batch_W));

              allBatches = sliceVolumeIntoOverlappedBatches(slices_3d, num_of_slices, slice_height, slice_width, batch_D, batch_H, batch_W, headSubCubesCoords); 

           } else {
              // This option will  cover all slices, some slices that are not enough to create a batch will need overlap with prevous batch slices
              // e.g. slice volume = 3*5*5 DHW , and batch is 2*2*2 ,   2*3*3 =18 batches will be considered        
              let num_of_batches = Math.ceil(slice_width/batch_W) * Math.ceil(slice_height/batch_H) * Math.ceil(num_of_slices/batch_D); 
              console.log("Num of Batches for inference: ", num_of_batches);

              allBatches = sliceVolumeIntoBatches(slices_3d, num_of_slices, slice_height, slice_width, batch_D, batch_H, batch_W);
           }

            tf.dispose(slices_3d);    

            statData["No_SubVolumes"] = allBatches.length; 

            let allPredictions = [];

            model.then(function (res) {

                 try {
                      let startTime = performance.now();
                      let inferenceStartTime = performance.now();
                      // maxLabelPredicted in whole volume of the brain
                      let maxLabelPredicted = 0;
                      let expected_Num_labels;

                      let layersLength = res.layers.length;
                      console.log("res.layers.length ", layersLength);   
                     
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
                                            if( isChrome() ) {
                                                webix.alert("Context lost due to limited Memory available, try please to use Firefox instead of Chrome ");
                                            } else {
                                                webix.alert("Context lost due to limited Memory available ");
                                            }
                                        } else {
                                            webix.alert(err.message);
                                        }
                                       
                                        window.clearInterval( timer ); 
                                        tf.engine().endScope();

                                        statData["Inference_t"] = Infinity;
                                        statData["Postprocess_t"] = Infinity;
                                        statData["Status"] = "Fail";
                                        statData["Error_Type"] = err.message;

                                       if(opts.telemetryFlag) { 
                                            submitTiming2GoogleSheet(statData);
                                       }

                                        

                                        return 0;
                                  }

                                  if( j == allBatches.length-1 ) {
                                    console.log("layer ", i);            
                                    console.log("layer output Tenosr shape : ", curTensor[i].shape);                                              
                                    console.log("layer count params ", res.layers[i].countParams());
                                  }

                                  curTensor[i-1].dispose();   
                                  lastIdx += 1;                               
                            }
                            


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
                            document.getElementById("progressBar").style.width=  (j+1)*100/allBatches.length + "%";

                            document.getElementById("memoryStatus").style.backgroundColor =  memStatus;
                            
                            // let memoryStatusData=[{ memoryUse: Math.round(tf.memory().numBytesInGPU/(1024*1024*20))}];
                            // $$("memoryMonitor").clearAll();
                            // $$("memoryMonitor").parse(memoryStatusData);                      

                            // document.getElementById("progressBar").innerHTML=  Math.floor((j+1)*100/allBatches.length) + "%";
                     
                            if( j == allBatches.length-1 ) {
                                 window.clearInterval( timer );

                                 let Inference_t = ((performance.now() - startTime)/1000).toFixed(4);

                                 let numSegClasses = maxLabelPredicted + 1;

                                 statData["Actual_Labels"] = numSegClasses;
                                 statData["Expect_Labels"] = expected_Num_labels;
                                 statData["NumLabels_Match"] = numSegClasses == expected_Num_labels? true : false;                                  
                                 

                                 startTime = performance.now();
                                 // Generate output volume or slices   
                                 console.log("Generating output");  

                                 let unstackOutVolumeTensor = mergeSubVolumes(allPredictions, num_of_slices, numSegClasses, slice_height, slice_width, batch_D, batch_H, batch_W);                        
                                 generateOutputSlicesV2(unstackOutVolumeTensor, num_of_slices, numSegClasses, slice_height, slice_width);

                                 let Postprocess_t = ((performance.now() - startTime)/1000).toFixed(4);

                                 document.getElementById("progressBar").style.width = 0;   
                                 //webix.message.hide("waitMessage");

                                 $$("downloadBtn").enable();   
                                 $$("segmentBtn").enable();  
                              //    $$("imageUploader").enable();                    
                                 tf.engine().endScope();

                                
                                 console.log("Processing the whole brain volume in tfjs tooks for multi-class output mask : ",  
                                                          ((performance.now()-inferenceStartTime)/1000).toFixed(4) + "  Seconds");

                                 //-- Timing data to collect
                                 statData["Inference_t"] = Inference_t;
                                 statData["Postprocess_t"] = Postprocess_t;
                                 statData["Status"] = "OK"

                                 if(opts.telemetryFlag) { 
                                      submitTiming2GoogleSheet(statData);
                                 }

                                                                                
                              }

                              j++;

                     }, 0);                            

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


/**
* Inference Function for full volume
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
 
  inferenceFullVolume = (model, slices_3d, input_shape, isChannelLast, num_of_slices, slice_height, slice_width, batch_D, batch_H, batch_W) => {

            statData["No_SubVolumes"] = 1;

            // let modelLayersOrg =  JSON.parse(JSON.stringify(modelObject));


            model.then(function (res) {

                 try {
                      startTime = performance.now();
                      let inferenceStartTime = performance.now();
                      // maxLabelPredicted in whole volume of the brain
                      let maxLabelPredicted = 0;

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
                                      if( isChrome() ) {
                                          webix.alert("Context lost due to limited Memory available, try please to use Firefox instead of Chrome ");
                                      } else {
                                          webix.alert("Context lost due to limited Memory available ");
                                      }
                                  } else {
                                      webix.alert(err.message);
                                  }
                                 
                                  window.clearInterval( timer ); 
                                  tf.engine().endScope();

                                  statData["Inference_t"] = Infinity;
                                  statData["Postprocess_t"] = Infinity;
                                  statData["Status"] = "Fail";
                                  statData["Error_Type"] = err.message;

                                  if(opts.telemetryFlag) { 
                                      submitTiming2GoogleSheet(statData);
                                  }

                                  return 0;
                            }      

                            console.log("layer ", i);            
                            console.log("layer output Tenosr shape : ", curTensor[i].shape);                                              
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
                                console.log("last Tenosr shape : ", curTensor[i].shape);
                                //-- curTensor[i].shape  : [ 1, 256, 256, 256, 3 ]
                                let expected_Num_labels = isChannelLast ? curTensor[i].shape[4] : curTensor[i].shape[1];

                                let prediction_argmax = tf.argMax(curTensor[i], axis);
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
                                let outLabelVolume = prediction_argmax.reshape([num_of_slices, slice_height, slice_width]).transpose();
                                tf.dispose(prediction_argmax);

                                let unstackOutVolumeTensor = tf.unstack(outLabelVolume);
                                tf.dispose(outLabelVolume);

                                startTime = performance.now();
                                // Generate output volume or slices      
                                console.log("Generating output");                       
                                generateOutputSlicesV2(unstackOutVolumeTensor , num_of_slices, numSegClasses, slice_height, slice_width, batch_D, batch_H, batch_W);
        
                                let Postprocess_t = ((performance.now() - startTime)/1000).toFixed(4);

                                document.getElementById("progressBar").style.width = 0;   
                                //webix.message.hide("waitMessage");

                                $$("downloadBtn").enable();   
                                $$("segmentBtn").enable();  
                                //    $$("imageUploader").enable();                    
                                tf.engine().endScope();

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

                     }, 1000);                            

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
* Inference Function 
* @since 1.0.0
*
*/
 
  runInference = () => {
        let startTime = performance.now();

	      const batchSize = opts.batchSize;
	      const numOfChan = opts.numOfChan;

        //-- Reset papaya MRI viewer overlay if exists
        resetMriViewerOverlay(1);
        //-- Reset Label Viewer        
        resetLabelViewer();        
                 

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

          let modelObject = {};
          // get model object data e.g. layers etc
          model.then(function(res) {
                modelObject = res;
 
                let batchInputShape = [];    
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
                let isFullVolModel;

                if ( (batch_D == 256) && (batch_H == 256) && (batch_W == 256) ) {
                        isFullVolModel = true;

                } else {
                        isFullVolModel = false;

                } 
                 

                let allSlices = getAllSlicesData1D(num_of_slices, niftiHeader, niftiImage);

                let allSlices_2D = getAllSlices2D(allSlices, slice_height, slice_width);

                // Get slices_3d tensor
                let slices_3d = getSlices3D(allSlices_2D);
                tf.dispose(allSlices_2D);               

                // Nomalize MRI data to be from 0 to 1
                slices_3d = normalizeVolumeData(slices_3d);

                let transpose = inferenceModelsList[$$("selectModel").getValue() - 1]["enableTranpose"];

                // Transpose MRI data to be match pytorch/keras input output
                if(transpose) {
                   slices_3d = slices_3d.transpose()
                   console.log("Input transposed");
                } else {
                   console.log("Transpose not enabled");
                }

                 
                 let Preprocess_t = ((performance.now() - startTime)/1000).toFixed(4);                    
                
             
       
                  console.log(tf.getBackend());


                 //-- set this flag so that textures are deleted when tensors are disposed.
                  tf.env().set("WEBGL_DELETE_TEXTURE_THRESHOLD", 0);
                  console.log("tf env() features :", tf.env().features);
                  console.log("tf env total features: ", Object.keys(tf.env().features).length);

                  // tf.env().set('WEBGL_PACK', false);

                  //-- Timing data to collect
                  let today = new Date();

                  if(isFullVolModel) {
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

                  statData["Img_Size"] = JSON.stringify([num_of_slices, slice_height, slice_width]);  
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
                  statData["TF_Backend"] = tf.getBackend();      


                  //-- Init 
                  statData["Actual_Labels"] = Infinity;
                  statData["Expect_Labels"] = Infinity;
                  statData["NumLabels_Match"] = null;       
                  statData["Inference_t"] = Infinity;
                  statData["Postprocess_t"] = Infinity;
                  statData["Status"] = null;
                  statData["Error_Type"] = null;  

              
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

                  if(isFullVolModel) {
                       inferenceFullVolume(model, slices_3d, input_shape, isChannelLast, num_of_slices, slice_height, slice_width, batch_D, batch_H, batch_W);
                  } else {
                       inferenceSubVolumes(model, slices_3d, input_shape, isChannelLast, num_of_slices, slice_height, slice_width, batch_D, batch_H, batch_W);

                  }
       })    
	            
	 } //-- End of runInference


})();
