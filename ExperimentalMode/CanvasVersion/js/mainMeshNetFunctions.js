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

  // Return 1-Dim Array of pixel value, this 1 dim represent one channel 
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

  // For Dice calculations
  intersect = (ar1, ar2) => {
      const intersection = [];
      for(let i = 0; i < ar1.length ; i++) {
        if(ar1[i] == ar2[i]) {
          intersection.push(ar1[i]);
        }
      }

      return intersection;
  }

  diceCoefficient = (ar1, ar2) => {
      return ( 2 * intersect(ar1, ar2).length ) / ( ar1.length + ar2.length );
  } 


 drawConfusionMat = async(groundTruthLabels, predictedLabels, elemId) => {

     if(elemId == "accuracyTitleFilter3DCC") {
        const values = await tfvis.metrics.confusionMatrix(groundTruthLabels, predictedLabels);  
        const data = { values };   
        const surface = { name: 'Confusion Matrix 3D CC', tab: 'Charts' };
        tfvis.render.confusionMatrix(surface, data);
     }
 }

 calculateAccuracy = async(groundTruthLabels, predictedLabels, elemId) => {
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

      // console.log("canvasImageData :", canvasImageData.data)

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

              if(document.getElementById("metricsId").value == "DiceCoef") {
                    document.getElementById(elemId).innerHTML = "Dice Coef: " +
                           diceCoefficient( Array.prototype.slice.call(trueLabels.data) , 
                                            Array.prototype.slice.call(canvasImageData.data) 
                                           ).toFixed(4);
              }


              if(document.getElementById("metricsId").value == "Accuracy") {
                       calculateAccuracy(labels, predictions, elemId); 
                       labels.dispose();
                       predictions.dispose();

              }


              if(elemId = "accuracyTitleFilter3DCC") {
                 // drawConfusionMat(labels, predictions, elemId); 
              }

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

/////////////******************* 3D Connected Components**************************/////////////////

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
   
    getConComponentsFor3DVolume = (outputSlices, sliceHeight, sliceWidth) => {

          let binaryMaskData1D = [];
          let binaryMaskData2D = [];     
          let label3D = [];  

          for(let sliceIdx = 0; sliceIdx < outputSlices.length; sliceIdx++) {
               
                binaryMaskData1D[sliceIdx] = getBinaryMaskData1D(outputSlices[sliceIdx]); // binaryMaskData1D has values 0 or 1 

                binaryMaskData2D[sliceIdx] = convertBinaryDataTo2D(binaryMaskData1D[sliceIdx], sliceHeight, sliceWidth);

                if(sliceIdx == 0) {
                    label3D[sliceIdx] = getConComponentsFor2D(binaryMaskData2D[sliceIdx], sliceHeight, sliceWidth);

                } else {
                    label3D[sliceIdx] = getConComponentsFor2Slices(binaryMaskData2D[sliceIdx], label3D[sliceIdx - 1], sliceHeight, sliceWidth);
                }

          }

          // 3d cc third pass
          for(let sliceIdx = 0; sliceIdx < outputSlices.length; sliceIdx++) {
              let row, col;
              for(row = 0; row < sliceHeight; row++) {
                  for(col = 0; col < sliceWidth; col++) {
                     
                     if( label3D[sliceIdx][row][col] != 0) {
                          label3D[sliceIdx][row][col] = equivalenceTabel[label3D[sliceIdx][row][col]];
                     }
                  }
              }  
          }    

          return  label3D;              
    }
  
    getConComponentsFor2Slices = (binaryMaskData2D, preSliceLabels, imgHeight, imgWidth) => {  
        let label1D = [];

        for(let idx = 0; idx < imgHeight * imgWidth; idx++) {
             label1D[idx] = 0;
        }     
        
        let label2D =   convertBinaryDataTo2D(label1D, imgHeight, imgWidth);

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

      let label3D = [];  

      label3D = getConComponentsFor3DVolume(outputSlices, sliceHeight, sliceWidth);

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


    //1- Standard Normal variate using Box-Muller transform.
    randn_bm = () => {
          let u = 0, v = 0;
          while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
          while(v === 0) v = Math.random();
          return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    }


    // check whether the proposed subvolumes coords are feasible
    checkInside = (DHW, cubeSides, subCubeSides) => {
        for (let i = 0; i < 3; i++) {
            if ( (Math.sign(DHW[i]) < 0) || ( (DHW[i] + subCubeSides[i]) > cubeSides[i]) ) {
                return false;
            }
        }

        return true;
    }


    
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

  // Return Tensor with binary 3D volume data  0 or 1
  binarizeVolumeDataTensor = (volumeDataTensor) => {

   let alpha = 0;
   return   volumeDataTensor.step(alpha); // element-wise: (x > 0 ? 1 : alpha * x );  e.g. Tenosr [0, 0.9, 0.8, -3] => Tensor [0, 1, 1, 0]
  }


  // Convert tensor to buffer so immutable tensor can be mutable buffer with get() and set()
  tensor2Buffer = (tensor) => {
     return tf.buffer(tensor.shape, tensor.dtype, tensor.dataSync());
  } 


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


  // For all MRI volume values > 0 , find the centroid of those data
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

 // Try to create batches with the volume of slices each of D,H,W sub_volume and focus on brain area for the additional sub_volumes 
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

   // Try to create batches with the volume of slices each of D,H,W sub_volume  with minimum overlap option
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

  load_model = async() => {
      let modelUrl = './mnm_tfjs_me_test/model.json';   
      // let modelUrl = './meshnet_dropout/mnm_dropout/model2.json';        
      const Model = await tf.loadLayersModel(modelUrl);
      return Model;
  }


  findPixelIndex = (allPixels, d, h, w) => {     
    
      for( pIndex = 0; pIndex < allPixels.length; pIndex++) {
           if( (allPixels[pIndex]["d"] == d) && 
             (allPixels[pIndex]["h"] == h) && 
             (allPixels[pIndex]["w"] == w)  ) {

                return pIndex;
           } 

      }

      return null;
  }

  

// Find current voxel value of the related seg class buffer, if we have numSegClasses = 3 then we have 3 buffers, one for each seg classes 0, 1, 2
generateOutputSlicesV2 = (allPredictions, num_of_slices, numSegClasses, slice_height, slice_width, batch_D, batch_H, batch_W) => {

      console.log("version 2 num of seg classes: ", numSegClasses);
        // buffer set ( depth, H, W) in order
        let outVolumeBuffer =  tf.buffer([num_of_slices, slice_height, slice_width, numSegClasses ], dtype=tf.float32) 
        let isPostProcessEnable =  document.getElementById("postProcessing").checked;


        for(batchIdx = 0; batchIdx < allPredictions.length; batchIdx += 1) { 

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


        let unstackOutVolumeTensor = tf.unstack(outVolumeTensor);
        outVolumeTensor.dispose();

        console.log("Converting unstack tensors to arrays: ") 


        for(sliceTensorIdx = 0; sliceTensorIdx < unstackOutVolumeTensor.length; sliceTensorIdx++ ) {
              allOutputSlices[sliceTensorIdx] = Array.from(unstackOutVolumeTensor[sliceTensorIdx].dataSync())
              allOutputSlices2DCC[sliceTensorIdx] = Array.from(unstackOutVolumeTensor[sliceTensorIdx].dataSync())              
              allOutputSlices3DCC[sliceTensorIdx] = Array.from(unstackOutVolumeTensor[sliceTensorIdx].dataSync())
        }


        
        if(isPostProcessEnable) {
            // console.log("wait postprocessing slices");
            document.getElementById("postProcessHint").innerHTML =   "Post processing status => 2D Connected Comp:  " + " In progress".fontcolor("red").bold();
            allOutputSlices2DCC = postProcessSlices(allOutputSlices2DCC); // remove noisy regions using 2d CC
            document.getElementById("postProcessHint").innerHTML =  "postprocessing status => 2D Connected Comp:  " + " Ok".fontcolor("green").bold() + " => 3D Connected Comp: " + " In progress".fontcolor("red").bold()
            allOutputSlices3DCC = postProcessSlices3D(allOutputSlices3DCC); // remove noisy regions using 3d CC           
            document.getElementById("postProcessHint").innerHTML =  "Post processing status => 2D Connected Comp:  " + " Ok".fontcolor("green").bold() + " => 3D Connected Comp : " + " Ok".fontcolor("green").bold()
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


  generateOutputSlices = (allPredictions, num_of_slices, slice_height, slice_width, batch_D, batch_H, batch_W) => {
        console.log("version 1");
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
            // console.log("wait postprocessing slices");
            document.getElementById("postProcessHint").innerHTML =   "Post processing status => 2D Connected Comp:  " + " In progress".fontcolor("red").bold();
            allOutputSlices2DCC = postProcessSlices(allOutputSlices2DCC); // remove noisy regions using 2d CC
            document.getElementById("postProcessHint").innerHTML =  "postprocessing status => 2D Connected Comp:  " + " Ok".fontcolor("green").bold() + " => 3D Connected Comp: " + " In progress".fontcolor("red").bold()
            allOutputSlices3DCC = postProcessSlices3D(allOutputSlices3DCC); // remove noisy regions using 3d CC           
            document.getElementById("postProcessHint").innerHTML =  "Post processing status => 2D Connected Comp:  " + " Ok".fontcolor("green").bold() + " => 3D Connected Comp : " + " Ok".fontcolor("green").bold()
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

  checkWebGl1 = () => {

      const gl = document.createElement('canvas').getContext('webgl');
      if (!gl) {
          if (typeof WebGLRenderingContext !== 'undefined') {
            console.log('WebGL1 may be disabled. Please try updating video card drivers');
            document.getElementById("results").innerHTML += '<br>WebGL1 status: ' + "Disabled".fontcolor("red").bold() + '<br> Try updating video card driver';
          } else {
            console.log('WebGL1 is not supported'); 
            document.getElementById("results").innerHTML += '<br>WebGL1 status: ' + "Red".fontcolor("red").bold() + '<br> Not supported';
          }
      } else {
        console.log('WebGl1 is enabled');
        document.getElementById("results").innerHTML += '<br>WebGL1 status: ' + "Green".fontcolor("green").bold();
      }

  }

  checkWebGl2 = () => {

      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) {
          if (typeof WebGL2RenderingContext !== 'undefined') {
            console.log('WebGL2 may be disabled. Please try updating video card drivers');
            document.getElementById("results").innerHTML = 'WebGL2 status: ' + "Disabled".fontcolor("red").bold() + '<br> Try updating video card driver';
          } else {
            console.log('WebGL2 is not supported'); 
            document.getElementById("results").innerHTML = 'WebGL2 status: ' + "Red".fontcolor("red").bold() + '<br> Not supported';
          }

         checkWebGl1(); 
      } else {
        console.log('WebGl2 is enabled');
        document.getElementById("results").innerHTML = 'WebGL2 status: ' + "Green".fontcolor("green").bold();
      }


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

              tf.engine().startScope()

              console.log("Batch size: ", batchSize);
              console.log("Num of Channels: ", numOfChan);

              // Propose subvolume size as needed by inference model input e.g. 38x38x38
              let batch_D = 38;
              let batch_H = 38;
              let batch_W = 38;
              
              let slice_width = niftiHeader.dims[1];
              let slice_height = niftiHeader.dims[2];
              let num_of_slices = niftiHeader.dims[3];

              let isBatchOverlapEnable =  document.getElementById("batchOverlapId").checked;



              // let input_shape = [batchSize, 38, 38, 38, numOfChan];
              let input_shape = [batchSize, batch_D, batch_H, batch_W, numOfChan];              


              let allSlices = getAllSlicesData1D(num_of_slices);

              let allSlices_2D = getAllSlices2D(allSlices, slice_height, slice_width);
              // get slices_3d tensor
              let slices_3d = getSlices3D(allSlices_2D);
              tf.dispose(allSlices_2D);               
              // nomalize MRI data to be from 0 to 1
              slices_3d = normalizeVolumeData(slices_3d);
              
              let allBatches = [];
              let headSubCubesCoords = [];


              if(isBatchOverlapEnable) {
                  // number of additional batches focus on the brain/head volume
                  let num_of_Overlap_batches = parseInt(document.getElementById("numOverlapBatchesId").value);
                  console.log(" num of overlapped batches: ", num_of_Overlap_batches);

                  // Find the centroid of 3D head volume  
                  // const headCentroid = findHeadCentroid(slices_3d, num_of_slices, slice_height, slice_width);

                  // Find the centroid of 3D head volume  and the variance                  
                  let cent_var = cubeMoments(slices_3d, 0.5);
                  // Mean or centroid
                  const headCentroid = cent_var[0];
                  console.log(" Head 3D Centroid : ", headCentroid);                  
                  // Variance 
                  const sigma = cent_var[1];
                  console.log(" Head 3D Variance : ", sigma);                  
                  

                  headSubCubesCoords = findCoordsOfAddBrainBatches(num_of_Overlap_batches, 
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
              console.log(" sample of a batch for inference : ", Array.from(allBatches[0].data.dataSync())) 

              console.log(tf.getBackend());
              checkWebGl2();  


              fetch('./mnm_tfjs_me_test/model.json')
              .then(response => {
                 return response.json();
              })
              .then(data => console.log("fetch results: ", data)); 
                                        

              let allPredictions = [];
              console.log("predictOnBatch enabled");

              model.then(function (res) {

                   try {
                       let startTime = performance.now();
                       // maxLabelPredicted in whole volume of the brain
                       let maxLabelPredicted = 0;
                       
                       let j = 0;
                       let timer = window.setInterval(function() {

                          let curTensor = tf.tensor(allBatches[j].data.dataSync(), input_shape);
                          // let prediction = res.predict( curTensor );
                          let prediction = res.predictOnBatch( curTensor );
                          tf.dispose(curTensor);
                          let axis = -1; //4;
                          let prediction_argmax = tf.argMax(prediction, axis);
                          tf.dispose(prediction);                          
                          allPredictions.push({"id": allBatches[j].id, "coordinates": allBatches[j].coordinates, "data": Array.from(prediction_argmax.dataSync()) }) 
                          let curBatchMaxLabel =  Math.max(...Array.from(prediction_argmax.dataSync()));

                          if( maxLabelPredicted < curBatchMaxLabel ) {
                                maxLabelPredicted = curBatchMaxLabel;
                          } 
                          
                          tf.dispose(prediction_argmax); 
          

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

                             let numSegClasses = maxLabelPredicted + 1;
                             // Generate output volume or slices                             
                             generateOutputSlicesV2(allPredictions, num_of_slices, numSegClasses, slice_height, slice_width, batch_D, batch_H, batch_W);

                             tf.engine().endScope();

                             let stopTime = performance.now();
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
   }// end of runInference


  // Load tfjs json model
  const model =  load_model();


})();
