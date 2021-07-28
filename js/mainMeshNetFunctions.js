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

(function(){


  allOutputSlices = [];
  maxLabel = 0;
  allOutputSlices2DCC = [];
  allOutputSlices3DCC = [];  

  getSliceData1D = (sliceIdx, niftiHeader, niftiImage) => {
      // get nifti dimensions
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

      // draw pixels
      for (let row = 0; row < rows; row++) {
          let rowOffset = row * cols;

          for (let col = 0; col < cols; col++) {
              let offset = sliceOffset + rowOffset + col;
              let value = typedData[offset];
              // Create 1Dim Array of pixel value, this 1 dim represent one channel 
              data1DimArr[(rowOffset + col)] = value & 0xFF;

          }
      }            

      return data1DimArr;    
  }

  // to use with ml5j
  computeConfusionMatrix = (trueLabels, predictedLabels) => {
      const CM = ConfusionMatrix.fromLabels(trueLabels, predictedLabels);
      return CM.getAccuracy();  

  }

  // to use with bci.js
  compConfusionMat = (predictedLabels, trueLabels) => {
      const CM = confusionMatrix(predictedLabels, trueLabels);
      return accuracy(CM);  

  }  

  generateColors = (s, l,  num_colors) => {
	  let colors = []
	  let delta = Math.trunc(360 / num_colors)

	  for (let i = 0; i < num_colors; i++) {
	    let h = i * delta
	    colors.push("hsla("+ h + "," + s +"%," + l+ "%"  + ")")	    
	  }

	  return colors
  }

   getRgbObject = (rgbString) => {

	  let RGB = {};
      let rgbArray = rgbString;
	  rgbArray = rgbArray.replace(/[^\d,]/g, '').split(',');
	  let rgbKeys=["r","g","b"];
	  RGB=rgbKeys.reduce((obj, key, index) => ({ ...obj, [key]:parseInt(rgbArray[index]) }), {});
	  return RGB;
  }

  hslToRgb = (hsl) => {
	 let sep = hsl.indexOf(",") > -1 ? "," : " ";
	 hsl = hsl.substr(5).split(")")[0].split(sep);

	 if (hsl.indexOf("/") > -1)
	    hsl.splice(3,1);

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



 async function drawConfusionMat(groundTruthLabels, predictedLabels, elemId) {

     if(elemId == "accuracyTitleFilter3DCC") {
        const values = await tfvis.metrics.confusionMatrix(groundTruthLabels, predictedLabels);  
        const data = { values };   
        const surface = { name: 'Confusion Matrix 3D CC', tab: 'Charts' };
        tfvis.render.confusionMatrix(surface, data);
     }
 }

 async function calculateAccuracy(groundTruthLabels, predictedLabels, elemId) {

    document.getElementById(elemId).innerHTML = "Accuracy: " + 
     ( await tfvis.metrics.accuracy(groundTruthLabels, predictedLabels) ).toFixed(3); 

 } 

 drawOutputCanvas = (canvas, sliceIdx, niftiHeader, niftiImage, outputSlices) => {

      let n_classes = parseInt(document.getElementById("numOfClassesId").value);
      let isColorEnable =  document.getElementById("mriColoring").checked;
      // get nifti dimensions
      let cols = niftiHeader.dims[1];
      let rows = niftiHeader.dims[2];

      // set canvas dimensions to nifti slice dimensions
      canvas.width = cols;
      canvas.height = rows;

      // make canvas image data
      let ctx = canvas.getContext("2d");
      let canvasImageData = ctx.createImageData(canvas.width, canvas.height); 

      let colors = generateColors(100, 50,  n_classes);
      let bgLabelValue = parseInt(document.getElementById("bgLabelId").value);

      for (let pixelIdx = 0; pixelIdx < outputSlices[sliceIdx].length; pixelIdx++) {
          if(isColorEnable) {
              let color = { r: 0, g: 0, b: 0 };
              if(outputSlices[sliceIdx][pixelIdx] != bgLabelValue) {
                 color =  getRgbObject(hslToRgb(colors[outputSlices[sliceIdx][pixelIdx]]));
              } 
              canvasImageData.data[pixelIdx * 4] = color.r & 0xFF;
              canvasImageData.data[pixelIdx * 4 + 1] = color.g & 0xFF;
              canvasImageData.data[pixelIdx * 4 + 2] = color.b & 0xFF;
              canvasImageData.data[pixelIdx * 4 + 3] = 0xFF;   

            } else {
              let value = Math.ceil(outputSlices[sliceIdx][pixelIdx]*255/(n_classes - 1));

              canvasImageData.data[pixelIdx * 4] = value & 0xFF;
              canvasImageData.data[pixelIdx * 4 + 1] = value & 0xFF;
              canvasImageData.data[pixelIdx * 4 + 2] = value & 0xFF;
              canvasImageData.data[pixelIdx * 4 + 3] = 0xFF;
            }

      }      

      ctx.putImageData(canvasImageData, 0, 0);

   
      let elemId = null;

      if(canvas.id == "outputCanvas") {
          document.getElementById("predTitle").innerHTML = "Model Output"; 
          elemId = "accuracyTitleModelPred"; 
      }

      if(canvas.id == "out2dCC") {
          document.getElementById("CC2DTitle").innerHTML = "Filter by 2D CC";  
          elemId = "accuracyTitleFilter2DCC";           
      }

      if(canvas.id == "out3dCC") {
          document.getElementById("CC3DTitle").innerHTML = "Filter by 3D CC";  
          elemId = "accuracyTitleFilter3DCC"; 
      }      

      let gtCanvas = document.getElementById('gtCanvas');
      let ctxGt = gtCanvas.getContext("2d");

      let trueLabels =  ctxGt.getImageData(0, 0, gtCanvas.width, gtCanvas.height)

      // trueLabels.data is Uint8ClampedArray  and need to convert to regular array first such that
      // normalArray = Array.prototype.slice.call(trueLabels.data);


      if(! isColorEnable){
          if(gtLabelLoaded) { 

              const labels = tf.tensor1d( Array.prototype.slice.call(trueLabels.data) );
              const predictions = tf.tensor1d( Array.prototype.slice.call(canvasImageData.data) ); 

              calculateAccuracy(labels, predictions, elemId); 

          }

        } else {
            document.getElementById(elemId).innerHTML = "";
        }

  } 




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
  	                  let area = cv.contourArea(cnt, false) 
  	                  if(maxContourArea < area){
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



  postProcessSlices = (outputSlices) => {
  	  let canvas = document.createElement("CANVAS");

      // get nifti dimensions
      let cols = niftiHeader.dims[1];
      let rows = niftiHeader.dims[2];

      // set canvas dimensions to nifti slice dimensions
      canvas.width = cols;
      canvas.height = rows;

      // make canvas image data
      let ctx = canvas.getContext("2d");

      let canvasImageData = ctx.createImageData(canvas.width, canvas.height); 

      let bgLabelValue = parseInt(document.getElementById("bgLabelId").value);
     
      for(let sliceIdx = 0; sliceIdx < outputSlices.length; sliceIdx++) {

		      for (let pixelIdx = 0; pixelIdx < outputSlices[sliceIdx].length; pixelIdx++) {

		      	      let color = { r: 0, g: 0, b: 0 };
		      	      if(outputSlices[sliceIdx][pixelIdx] != bgLabelValue) {
		      	      	 color = { r: 255, g: 255, b: 255 };
		      	      } 

		              canvasImageData.data[pixelIdx * 4] = color.r & 0xFF;
		              canvasImageData.data[pixelIdx * 4 + 1] = color.g & 0xFF;
		              canvasImageData.data[pixelIdx * 4 + 2] = color.b & 0xFF;
		              canvasImageData.data[pixelIdx * 4 + 3] = 0xFF; 
		      }      

		      let maskData = getMaxRegionMaskByContour(canvasImageData);
            
		      // show slice max area only 
		      for( let idx = 0; idx < maskData.length; idx += 1) {

		            if(maskData[idx] == bgLabelValue ) {
		                   outputSlices[sliceIdx][idx] = 0;
		             } 
		      } 

     }

     return outputSlices;
  }  


      getBinaryMaskData1D = (sliceData) => { // greyImage is one channel 2D image with values 0-255
          
          let maskBinaryData1D = [];
          for (let idx = 0; idx < sliceData.length; idx++) {

               if(sliceData[idx] > 0) {
                  maskBinaryData1D[idx] = 1;                   
               } else {
                  maskBinaryData1D[idx] = 0;                   
               }
          }
      
          return maskBinaryData1D;
    }

    getBinaryMaskImage = (greyImage) => { // greyImage is one channel 2D image with values 0-255
        let binaryMaskImage = greyImage.clone();   // from opencvjs
        let value = null;

        for (let idx = 0; idx < greyImage.data.length; idx++) {

             if(greyImage.data[idx] > 0) {
                value = 255;                 
             } else {
                value = 0;                  
             }

            binaryMaskImage.data[idx] = value;
            binaryMaskImage.data[idx + 1] = value;
            binaryMaskImage.data[idx + 2] = value;
            binaryMaskImage.data[idx + 3] = 255; // Alpha channel     
        }

        return binaryMaskImage;
    } 

    convertBinaryDataTo2D = (binaryData1D, imgHeight, imgWidth) => {
        return tf.tensor(binaryData1D, [imgHeight, imgWidth]).arraySync();
    }


    getConComponentsFor2D = (binaryMaskData2D, imgHeight, imgWidth) => {  
        // initiat label
        let label1D = [];
        resetEquivalenceTable();           
        for(let idx = 0; idx < imgHeight * imgWidth; idx++) {
                 label1D[idx] = 0;
        }     
        
        let label2D = convertBinaryDataTo2D(label1D, imgHeight, imgWidth);

        // maxLabel initiation to zero, starting label for 2d and 3d labeling
        maxLabel = 0; 

        // 1st pass
        for(let row = 0; row < imgHeight; row++) {
            for(let col = 0; col < imgWidth; col++) { 
               
               if( binaryMaskData2D[row][col] != 0) {
                  label2D[row][col] = checkNeighbors2D(label2D, row, col, maxLabel)
                  if(maxLabel < label2D[row][col]) {
                     maxLabel = label2D[row][col];
                  }

               }
            }
        }
 
        // adjust Equivalence table labels such that  eqvTabel[3] = 2 && eqvTabel[2] = 1 => eqvTabel[3] = 1      
        for(let labelIdx = equivalenceTabel.length - 1; labelIdx > 0; labelIdx = labelIdx-1 ) {          
            adjustEquivalenceTable (labelIdx);
        }  

        // 2nd pass : relabeling the slice after eqvTable adjustment 
        for(let row = 0; row < imgHeight; row++) {
            for(let col = 0; col < imgWidth; col++) { 
               
               if( label2D[row][col] != 0) {
                    label2D[row][col] = equivalenceTabel[label2D[row][col]];
               }
            }
        }          

        return   label2D;
    }


    getMaxLabelFor2D = (label2D, imgHeight, imgWidth) => {  

        let maxLabelFor2D = 0; 
        for(let row = 0; row < imgHeight; row++) {
            for(let col = 0; col < imgWidth; col++) { 
               
               if( label2D[row][col] > maxLabelFor2D) {
                   maxLabelFor2D = label2D[row][col];
               }
            }
        }

        return   maxLabelFor2D;
    }


    getMaxLabelFor3D = (label3D, sliceHeight, sliceWidth, numSlices) => {  

        let maxLabelFor3D = 0; 

        for(let sliceIdx = 0; sliceIdx < numSlices; sliceIdx++ ) {
	          for(let row = 0; row < sliceHeight; row++) {
	              for(let col = 0; col < sliceWidth; col++) { 
	                 
	                 if( label3D[sliceIdx][row][col] > maxLabelFor3D) {
	                     maxLabelFor3D = label3D[sliceIdx][row][col];
	                 }
	              }
	          }
        } 
        return   maxLabelFor3D;
    }

    
    getMaxVolumeLabel3D = (label3D, sliceHeight, sliceWidth, numSlices) => {

        // Initiat connected component volumes to zeros   
        let  ccVolume = [];
        let maxCCLabel3D = getMaxLabelFor3D(label3D, sliceHeight, sliceWidth, numSlices)

        for( let idx = 0; idx < maxCCLabel3D; idx ++) {         
              ccVolume[idx] = 0;
        }  
        
        for(let sliceIdx = 0; sliceIdx < numSlices; sliceIdx++ ) {         
		        for(let row = 0; row < sliceHeight; row++) {
		            for(let col = 0; col < sliceWidth; col++) { 
		               ccVolume[label3D[sliceIdx][row][col]] = ccVolume[label3D[sliceIdx][row][col]] +1;
		            }  
		        }
        }
     
        let maxCcVolume = 0;
        let maxCcVolumeLabel = -1;

        for( let idx = 1; idx < maxCCLabel3D; idx ++) {  

            if( maxCcVolume < ccVolume[idx] ) {
                 maxCcVolume = ccVolume[idx];
                 maxCcVolumeLabel = idx;
            }      
        } 

        return   maxCcVolumeLabel;
    }



    getMaxAreaLabel2D = (label2D, imgHeight, imgWidth) => {  

        // Initiat connected component areas to zeros   
        let  ccAreas = [];
        let maxCCLabel = getMaxLabelFor2D(label2D, imgHeight, imgWidth)

        for( let idx = 0; idx < maxCCLabel; idx ++) {         
              ccAreas[idx] = 0;
        }  
        
         // Find areas of connected components where ccAreas[0] is for background
        for(let row = 0; row < imgHeight; row++) {
            for(let col = 0; col < imgWidth; col++) { 
               ccAreas[label2D[row][col]] = ccAreas[label2D[row][col]] +1;
            }  
        }
     
        let maxCcArea = 0;
        let maxCcAreaLabel = -1;
        for( let idx = 1; idx < maxCCLabel; idx ++) {  
            if( maxCcArea < ccAreas[idx] ) {
                 maxCcArea = ccAreas[idx];
                 maxCcAreaLabel = idx;
            }      
        } 


        return   maxCcAreaLabel;
    }


    resetEquivalenceTable = () => {
       equivalenceTabel = [];
       equivalenceTabel[0] = 0;
    }

    updateEquivalenceTable = (label, newLabel) => {
        equivalenceTabel[label] = newLabel;

    }


    adjustEquivalenceTable = (labelIdx) => {

        if(equivalenceTabel[labelIdx] != labelIdx) {
            equivalenceTabel[labelIdx] = adjustEquivalenceTable(equivalenceTabel[labelIdx]);
        } 
       
        return equivalenceTabel[labelIdx];
    }


    checkNeighbors2D = (label, row, col, maxLabel) => {

        if ( label[row][col - 1] && label[row - 1][col]) {

              if(label[row][col - 1] == label[row - 1][col]) {
                 return label[row ][col - 1];

              } else {

                 let smallerLabel = ( label[row][col - 1] < label[row - 1][col] ) ? label[row][col - 1] : label[row - 1][col];
                 let largerLabel = ( label[row][col - 1] > label[row - 1][col] ) ? label[row][col - 1] : label[row - 1][col];
                 updateEquivalenceTable(largerLabel, smallerLabel);                
                 return smallerLabel;
              }

        } else if ( label[row ][col - 1] ) {
            return label[row ][col - 1] ;
        } else if ( label[row - 1][col] ) {
            return label[row - 1][col];            
        } else {
            updateEquivalenceTable(maxLabel+1, maxLabel+1); 
            return maxLabel+1 ;
        }  

    }

    checkNeighbors3D = (label, z_1PixelLabel, row, col, maxLabel) => { //z_1PixelLabel same x,y pixel label of z-1 prev slice
          if ( label[row][col - 1] && label[row - 1][col] && z_1PixelLabel) {

                if( (label[row][col - 1] == label[row - 1][col]) && (label[row][col - 1] == z_1PixelLabel) ) {
                   return z_1PixelLabel;

                } else {

                   let smallLabel = ( label[row][col - 1] < label[row - 1][col] ) ? label[row][col - 1] : label[row - 1][col];
                   let smallestLabel = ( z_1PixelLabel < smallLabel ) ? z_1PixelLabel : smallLabel;                
                   let largerLabel = ( label[row][col - 1] > label[row - 1][col] ) ? label[row][col - 1] : label[row - 1][col];
                   updateEquivalenceTable(largerLabel, smallestLabel);                   
                   updateEquivalenceTable(smallLabel, smallestLabel);                
                   return smallestLabel;
                }

          } else if ( label[row][col - 1] && label[row - 1][col] ) {

              if(label[row][col - 1] == label[row - 1][col]) {
                 return label[row ][col - 1];

              } else {

                 let smallerLabel = ( label[row][col - 1] < label[row - 1][col] ) ? label[row][col - 1] : label[row - 1][col];
                 let largerLabel = ( label[row][col - 1] > label[row - 1][col] ) ? label[row][col - 1] : label[row - 1][col];
                 updateEquivalenceTable(largerLabel, smallerLabel);                
                 return smallerLabel;
              }
              

          } else if ( label[row - 1][col] && z_1PixelLabel ) {

              if(label[row - 1][col] == z_1PixelLabel) {
                 return z_1PixelLabel;

              } else {

                 let smallerLabel = ( z_1PixelLabel < label[row - 1][col] ) ? z_1PixelLabel : label[row - 1][col];
                 let largerLabel = ( z_1PixelLabel > label[row - 1][col] ) ? z_1PixelLabel : label[row - 1][col];
                 updateEquivalenceTable(largerLabel, smallerLabel);                
                 return smallerLabel;
              }                

          } else if ( label[row][col - 1] && z_1PixelLabel ) {
              
              if( label[row][col - 1] == z_1PixelLabel ) {
                 return z_1PixelLabel;

              } else {

                 let smallerLabel = ( label[row][col - 1] < z_1PixelLabel ) ? label[row][col - 1] : z_1PixelLabel;
                 let largerLabel = ( label[row][col - 1] > z_1PixelLabel ) ? label[row][col - 1] : z_1PixelLabel;
                 updateEquivalenceTable(largerLabel, smallerLabel);                
                 return smallerLabel;
              }
                                              
          } else if ( label[row ][col - 1] ) {
              return label[row ][col - 1] ;
          } else if ( label[row - 1][col] ) {
              return label[row - 1][col]; 
          } else if ( z_1PixelLabel) {
              return z_1PixelLabel;  
          } else {
              updateEquivalenceTable(maxLabel+1, maxLabel+1); 
              return maxLabel+1 ;
          } 
    }

  
    getConComponentsFor3D = (binaryMaskData2D, preSliceLabels, imgHeight, imgWidth) => {  
        let label1D = [];
        // resetEquivalenceTable();           
        for(let idx = 0; idx < imgHeight * imgWidth; idx++) {
                 label1D[idx] = 0;
        }     
        
        let label2D =   convertBinaryDataTo2D(label1D, imgHeight, imgWidth);
        // let maxLabel = 0; 
        for(let row = 0; row < imgHeight; row++) {
            for(let col = 0; col < imgWidth; col++) { 
               
               if( binaryMaskData2D[row][col] != 0) {
                  label2D[row][col] = checkNeighbors3D(label2D, preSliceLabels[row][col], row, col, maxLabel)
                  if(maxLabel < label2D[row][col]) {
                     maxLabel = label2D[row][col];
                  }

               }
            }
        }
        
        // console.log("First pass label2D :", label2D);
        for(let labelIdx = equivalenceTabel.length - 1; labelIdx > 0; labelIdx = labelIdx-1 ) {          
            adjustEquivalenceTable (labelIdx);
        }  

        for(let row = 0; row < imgHeight; row++) {
            for(let col = 0; col < imgWidth; col++) { 
               
               if( label2D[row][col] != 0) {
                    label2D[row][col] = equivalenceTabel[label2D[row][col]];
               }
            }
        }          

        return   label2D;
    }


   postProcessSlices3D = (outputSlices) => {
      // get nifti dimensions
      let sliceWidth = niftiHeader.dims[1];
      let sliceHeight = niftiHeader.dims[2];

      let bgLabelValue = parseInt(document.getElementById("bgLabelId").value);

//      let grey = new Array(outputSlices.length).fill(0).map(() => new Array(outputSlices[0].length).fill(0));
      let binaryMaskData1D = [];
      let binaryMaskData2D = [];
      let maxAreaLabel = [];
      let label3D = [];  

      for(let sliceIdx = 0; sliceIdx < outputSlices.length; sliceIdx++) {
           
	          binaryMaskData1D[sliceIdx] = getBinaryMaskData1D(outputSlices[sliceIdx]); // binaryMaskData1D has values 0 or 1 

	          binaryMaskData2D[sliceIdx] = convertBinaryDataTo2D(binaryMaskData1D[sliceIdx], sliceHeight, sliceWidth);

	          if(sliceIdx == 0) {
	              label3D[sliceIdx] = getConComponentsFor2D(binaryMaskData2D[sliceIdx], sliceHeight, sliceWidth);
	          } else {
	              label3D[sliceIdx] = getConComponentsFor3D(binaryMaskData2D[sliceIdx], label3D[sliceIdx - 1], sliceHeight, sliceWidth);
	          }

      }

      let maxVolumeLabel =  getMaxVolumeLabel3D(label3D, sliceHeight, sliceWidth, outputSlices.length);	


      for(let sliceIdx = 0; sliceIdx < outputSlices.length; sliceIdx++) {
              //Get max volume mask 
              let row, col;
              for(row = 0; row < sliceHeight; row++) {
                  for(col = 0; col < sliceWidth; col++) { 
                     if(label3D[sliceIdx][row][col] != maxVolumeLabel) {
                         label3D[sliceIdx][row][col] = 0;
                     } else {
                         label3D[sliceIdx][row][col] = 255;
                     }
                  }  
              }  		          

		          let pixelIdx;

		          for(row = 0, pixelIdx = 0; row < sliceHeight; row++) {
		              for(col = 0; col < sliceWidth; col++, pixelIdx++) { 
		                 
		                 if(label3D[sliceIdx][row][col] == 0) {
		                    outputSlices[sliceIdx][pixelIdx] = 0;
		                 }

		              }  
		          } 
     }

     return outputSlices;
  }   



   postProcessSlices2D = (outputSlices) => {
      // get nifti dimensions
      let sliceWidth = niftiHeader.dims[1];
      let sliceHeight = niftiHeader.dims[2];

      // let bgLabelValue = parseInt(document.getElementById("bgLabelId").value);

//      let grey =  new Array(outputSlices[0].length).fill(0); // for 2d CC
      let binaryMaskData1D = [];
      let binaryMaskData2D = [];
      let maxAreaLabel;
      let label2D = [];  

      for(let sliceIdx = 0; sliceIdx < outputSlices.length; sliceIdx++) {
           
            binaryMaskData1D = getBinaryMaskData1D(outputSlices[sliceIdx]); // binaryMaskData1D has values 0 or 1 

            binaryMaskData2D = convertBinaryDataTo2D(binaryMaskData1D, sliceHeight, sliceWidth);

            // labels 2d are starting from 0 and increment by 1 with each new label
            label2D = getConComponentsFor2D(binaryMaskData2D, sliceHeight, sliceWidth);

            
            maxAreaLabel =  getMaxAreaLabel2D(label2D, sliceHeight,  sliceWidth);


            // Get max area mask 
            // It is fine to set label2D to 255 since each slice labels have no effect on other slices labels.
            let row, col;
            for(row = 0; row < sliceHeight; row++) {
                for(col = 0; col < sliceWidth; col++) { 
                   if(label2D[row][col] != maxAreaLabel){
                       label2D[row][col] = 0;
                   } else {
                       label2D[row][col] = 255;
                   }
                }  
            }    


            // Remove all areas except largest brain area  
            let pixelIdx;
            for(row = 0, pixelIdx = 0; row < sliceHeight; row++) {
                for(col = 0; col < sliceWidth; col++, pixelIdx++) { 
                   if(label2D[row][col] == 0){
                      outputSlices[sliceIdx][pixelIdx] = 0;
                   }
                }  
            }                                
      }

     return outputSlices;
  }   


///////////////******************************************************************////////////////////

	 // Try to create batches with the volume of slices each of D,H,W sub_volume  
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

	getAllSlicesData1D = (num_of_slices) => {
	      let allSlices = [];
	      for(let sliceIdx = 0; sliceIdx < num_of_slices; sliceIdx++) {
	          let slice = getSliceData1D(sliceIdx, niftiHeader, niftiImage);
	          allSlices.push(slice);
	      }        

	     return   allSlices; 
	}

	getAllSlices2D = (allSlices, slice_height, slice_width) => {
	    let allSlices_2D = [];
	    for(let sliceIdx = 0; sliceIdx < allSlices.length; sliceIdx ++){
	        allSlices_2D.push(tf.tensor(allSlices[sliceIdx], [slice_height, slice_width]));
	    }   

	    return   allSlices_2D;   
	}

	getSlices3D = (allSlices_2D) => {

	  return tf.stack(allSlices_2D);  

	}

	normalizeVolumeData = (volumeData) => {
	    //Normalize the data to the range 0 - 1 using min-max scaling
	    const volumeData_Max = volumeData.max();
	    const volumeData_Min = volumeData.min();
	    const normalizedSlices_3d = volumeData.sub(volumeData_Min).div(volumeData_Max.sub(volumeData_Min));
	    return  normalizedSlices_3d;      
	}

	async function load_model() {
	    let modelUrl = './mnm_tfjs_me_test/model.json';		
      // let modelUrl = './meshnet_dropout/mnm_dropout/model2.json';        
	    const Model = await tf.loadLayersModel(modelUrl);
	    return Model;
	}

	generateOutputSlices = (allPredictions, num_of_slices, slice_height, slice_width, batch_D, batch_H, batch_W) => {
	      // buffer set ( depth, H, W) in order
	      let outVolumeBuffer =  tf.buffer([num_of_slices, slice_height, slice_width], dtype=tf.float32) 
              let isPostProcessEnable =  document.getElementById("postProcessing").checked;

	      for(batchIdx = 0; batchIdx < allPredictions.length; batchIdx += 1) { 

	              let coord = allPredictions[batchIdx]["coordinates"] 
	              let pixelValues = allPredictions[batchIdx]["data"]
	              let pixelValuesCounter = 0;       

	              for(depthIdx = coord[0]; depthIdx < (batch_D + coord[0]); depthIdx += 1) {        
	                  for(rowIdx = coord[1]; rowIdx < (batch_H + coord[1]); rowIdx += 1) {      
	                    for(colIdx = coord[2]; colIdx < (batch_W + coord[2]); colIdx += 1) {
	                        outVolumeBuffer.set(pixelValues[pixelValuesCounter], depthIdx, rowIdx, colIdx );
	                        pixelValuesCounter += 1;
	                    } 
	                  }
	              }
	       }

	       // convert output  buffer to tensor
	      let outVolumeTensor =  outVolumeBuffer.toTensor();

	      let unstackOutVolumeTensor = tf.unstack(outVolumeTensor)

	      console.log("Converting unstack tensors to arrays: ") 


	      for(sliceTensorIdx = 0; sliceTensorIdx < unstackOutVolumeTensor.length; sliceTensorIdx++ ) {
		      allOutputSlices[sliceTensorIdx] = Array.from(unstackOutVolumeTensor[sliceTensorIdx].dataSync())
		      allOutputSlices2DCC[sliceTensorIdx] = Array.from(unstackOutVolumeTensor[sliceTensorIdx].dataSync())              
		      allOutputSlices3DCC[sliceTensorIdx] = Array.from(unstackOutVolumeTensor[sliceTensorIdx].dataSync())
	      }

	      
		if(isPostProcessEnable) {
		    console.log("wait postprocessing slices");
		    document.getElementById("postProcessHint").innerHTML =   "Post processing status => 2D Connected Comp:  " + " In progress".fontcolor("red").bold();
		    allOutputSlices2DCC = postProcessSlices(allOutputSlices2DCC); // remove noisy regions using 2d CC
		    document.getElementById("postProcessHint").innerHTML =  "postprocessing status => 2D Connected Comp:  " + " Done".fontcolor("green").bold() + " => 3D Connected Comp: " + " In progress".fontcolor("red").bold()
		    allOutputSlices3DCC = postProcessSlices3D(allOutputSlices3DCC); // remove noisy regions using 3d CC           
		    document.getElementById("postProcessHint").innerHTML =  "Post processing status => 2D Connected Comp:  " + " Done".fontcolor("green").bold() + " => 3D Connected Comp : " + " Done".fontcolor("green").bold()
		}        
   
	      // draw output canvas
              let outCanvas = document.getElementById('outputCanvas');  
              let output2dCC = document.getElementById('out2dCC');           
              let output3dCC = document.getElementById('out3dCC');     
	      let slider = document.getElementById('sliceNav');
              drawOutputCanvas(outCanvas, slider.value, niftiHeader, niftiImage, allOutputSlices);  
              drawOutputCanvas(output2dCC, slider.value, niftiHeader, niftiImage, allOutputSlices2DCC);              
	      drawOutputCanvas(output3dCC, slider.value, niftiHeader, niftiImage, allOutputSlices3DCC);

	}


	inputVolumeChange = (val) => {
	    document.getElementById("inputVolumeId").innerHTML = "<b>Input Volume Dim :</b>" + " [" + document.getElementById("batchSizeId").value + ", 38, 38, 38, " +
	    document.getElementById("numOfChanId").value + "]"
	}

	// For future use
	download = (content, fileName, contentType) => {
	    var a = document.createElement("a");
	    var file = new Blob([content], {type: contentType});
	    a.href = URL.createObjectURL(file);
	    a.download = fileName;
	    a.click();
	}


	runInference = () => {

	        let processingFlag = true;

	        let batchSize = parseInt(document.getElementById("batchSizeId").value);
	        let numOfChan = parseInt(document.getElementById("numOfChanId").value);

	        if (document.getElementById("file").value == "") {
	            document.getElementById("results").innerHTML = "No NIfTI file is selected".fontcolor("red");
	            processingFlag = false;
	        }               

	        if (isNaN(batchSize) || batchSize < 1 || batchSize > 1) {
	            document.getElementById("results").innerHTML = "The batch Size must be 1 for this demo".fontcolor("red");
	            processingFlag = false;
	        }   

	        if (isNaN(numOfChan) || (numOfChan !=1)) {
	            document.getElementById("results").innerHTML = "The number of channels must be a number of 1 for this demo".fontcolor("red");
	            processingFlag = false;
	        }                

	        if(processingFlag) {
	            console.log("Batch size: ", batchSize);
	            console.log("Num of Channels: ", numOfChan);

	            // Propose subvolume size as needed by inference model input e.g. 38x38x38
	            let batch_D = 38;
	            let batch_H = 38;
	            let batch_W = 38;

	        
	            let slice_width = niftiHeader.dims[1];
	            let slice_height = niftiHeader.dims[2];
	            let num_of_slices = niftiHeader.dims[3];

	            // This option will  cover all slices, some slices that are not enough to create a batch will need overlap with prevous batch slices
	            // e.g. slice volume = 3*5*5 DHW , and batch is 2*2*2 ,   2*3*3 =18 batches will be considered        
	            let num_of_batches = Math.ceil(slice_width/batch_W) * Math.ceil(slice_height/batch_H) * Math.ceil(num_of_slices/batch_D); 

	            console.log("Num of Batches for inference: ", num_of_batches);

	            let input_shape = [batchSize, 38, 38, 38, numOfChan];


	            let allSlices = getAllSlicesData1D(num_of_slices);

	            let allSlices_2D = getAllSlices2D(allSlices, slice_height, slice_width)
	            let slices_3d = getSlices3D(allSlices_2D);
	            slices_3d = normalizeVolumeData(slices_3d);

	            let allBatches = sliceVolumeIntoBatches(slices_3d, num_of_slices, slice_height, slice_width, batch_D, batch_H, batch_W);
	       
	            console.log(" sample of a batch for inference : ", Array.from(allBatches[0].data.dataSync())) 

	            // Load tfjs json model
	            const model =  load_model();
	            console.log(tf.getBackend());
	            // model.summary();

	            let allPredictions = [];

	            model.then(function (res) {

	                 try {
	                     let startTime = performance.now();
	                     
	                     let j = 0;
	                     let timer = window.setInterval(function() {

	                        tf.engine().startScope()
	                        let curTensor = tf.tensor(allBatches[j].data.dataSync(),input_shape);
	                        let prediction = res.predict( curTensor );
	                        tf.dispose(curTensor);
	                        let axis = 4;
	                        let prediction_argmax = tf.argMax(prediction, axis);
	                        allPredictions.push({"id": allBatches[j].id, "coordinates": allBatches[j].coordinates, "data": Array.from(prediction_argmax.dataSync()) }) 
	                        tf.engine().endScope()


	                        let memStatus = tf.memory().unreliable ? "Red" : "Green";     
	                        let unreliableReasons  =  tf.memory().unreliable ?    "unreliable reasons :" + tf.memory().reasons.fontcolor("red").bold() : "";            
	                        document.getElementById("completed").innerHTML = "Batches completed:  " + (j+1) + " / " + allBatches.length +  
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
	                        
	               
	                        if( j == allBatches.length-1 ){
	                           window.clearInterval( timer );
                            // Generate output volume or slices
	                           generateOutputSlices(allPredictions, num_of_slices, slice_height, slice_width, batch_D, batch_H, batch_W);
	                           let stopTime = performance.now()
	                           document.getElementById("results").innerHTML ="Processing the whole brain volume in tfjs tooks for multi-class output mask : " + 
												                              ((stopTime -startTime)/1000).toFixed(4).fontcolor("green").bold() + 
												                              "  Seconds.<br> Press " + " F12 ".fontcolor("red").bold() + 
												                              "to see the inference results in Console"   
	                           //download(JSON.stringify(allPredictions), 'prediction.json', 'text/plain');                                                                                
	                        }

	                        j++;

	                     }, 0);                            

	                  }
	                  catch(err) {
	                    document.getElementById("results").innerHTML = err.message.fontcolor("red").bold() + 
	                        "  Try to decrease batch size or increase H/W resources".fontcolor("red").bold() +
	                        "<br>" +"If webgl context is lost, try to restore webgl context by visit the link ".fontcolor("red") + 
	                        '<a href="https://support.biodigital.com/hc/en-us/articles/218322977-How-to-turn-on-WebGL-in-my-browser">here</a>'
	                  }
	            }); 
	      }       
	 }
        

})();
