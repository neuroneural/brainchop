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

  drawOutputCanvas = (canvas, sliceIdx, niftiHeader, niftiImage, outputSlices) => {

      let n_classes = parseInt(document.getElementById("numOfClassesId").value);
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

      for (let pixelIdx = 0; pixelIdx < outputSlices[sliceIdx].length; pixelIdx++) {

      	      let color = { r: 0, g: 0, b: 0 };
      	      if(outputSlices[sliceIdx][pixelIdx]) {
                 color =  getRgbObject(hslToRgb(colors[outputSlices[sliceIdx][pixelIdx]]));
      	      } 
              // let value = Math.ceil(outputSlices[sliceIdx][pixelIdx]*255/(n_classes - 1));

              // canvasImageData.data[pixelIdx * 4] = value & 0xFF;
              // canvasImageData.data[pixelIdx * 4 + 1] = value & 0xFF;
              // canvasImageData.data[pixelIdx * 4 + 2] = value & 0xFF;
              // canvasImageData.data[pixelIdx * 4 + 3] = 0xFF;

              canvasImageData.data[pixelIdx * 4] = color.r & 0xFF;
              canvasImageData.data[pixelIdx * 4 + 1] = color.g & 0xFF;
              canvasImageData.data[pixelIdx * 4 + 2] = color.b & 0xFF;
              canvasImageData.data[pixelIdx * 4 + 3] = 0xFF;              

      }      

      ctx.putImageData(canvasImageData, 0, 0);
  } 

  drawOutputCanvas_old = (canvas, sliceIdx, niftiHeader, niftiImage, outputSlices) => {

      let n_classes = parseInt(document.getElementById("numOfClassesId").value);
      // get nifti dimensions
      let cols = niftiHeader.dims[1];
      let rows = niftiHeader.dims[2];

      // set canvas dimensions to nifti slice dimensions
      canvas.width = cols;
      canvas.height = rows;

      // make canvas image data
      let ctx = canvas.getContext("2d");
      let canvasImageData = ctx.createImageData(canvas.width, canvas.height); 

      for (let pixelIdx = 0; pixelIdx < outputSlices[sliceIdx].length; pixelIdx++) {
              let value = Math.ceil(outputSlices[sliceIdx][pixelIdx]*255/(n_classes - 1));
              canvasImageData.data[pixelIdx * 4] = value & 0xFF;
              canvasImageData.data[pixelIdx * 4 + 1] = value & 0xFF;
              canvasImageData.data[pixelIdx * 4 + 2] = value & 0xFF;
              canvasImageData.data[pixelIdx * 4 + 3] = 0xFF;
      }      

      ctx.putImageData(canvasImageData, 0, 0);
  } 




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
	                // batch.print();

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
	        // console.log(" slice" + (sliceIdx + 1) + " 2D : ")
	        allSlices_2D.push(tf.tensor(allSlices[sliceIdx], [slice_height, slice_width]));
	        // allSlices_2D[sliceIdx].print()
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

	    // let modelUrl = './tfjs71Entropy/model.json';
	    // let modelUrl = './tfjs21normEntropy/model.json';	  
	    // let modelUrl = './mnm/model.json';		
	    let modelUrl = './mnm_tfjs_filters21/model.json';		 
	    // let modelUrl = './mnm_large/model.json';		 	    	          
	    // let modelUrl = './tfjs_graph_model/model.json';	    
	    
	    const Model = await tf.loadLayersModel(modelUrl);
	    // const Model = await tf.loadGraphModel(modelUrl);	    
	    return Model;
	}

	generateOutputSlices = (allPredictions, num_of_slices, slice_height, slice_width, batch_D, batch_H, batch_W) => {
	      // buffer set ( depth, H, W) in order
	      let outVolumeBuffer =  tf.buffer([num_of_slices, slice_height, slice_width], dtype=tf.float32) 

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
	      }
	  
	      // draw output canvas
	      let outCanvas = document.getElementById('outputCanvas');      
	      let slider = document.getElementById('sliceNav');
	      drawOutputCanvas(outCanvas, slider.value, niftiHeader, niftiImage, allOutputSlices);

	}


	inputVolumeChange = (val) => {
	    document.getElementById("inputVolumeId").innerHTML = "Input Volume Dim : " + "[" + document.getElementById("batchSizeId").value + ", 38, 38, 38, " +
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

	                        // console.table(tf.memory())
	                        // let memStatusColor = "green";
	                        // if(tf.memory().unreliable) {
	                        // 	memStatusColor = "red";
	                        // } 
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
	                           // console.log(" Show output of batch ", j+1);
	                           // prediction.print();

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
