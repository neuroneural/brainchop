/*
=========================================================
* Brainchop - v2.0.1
=========================================================

* Discription:  A user interface for whole brain 3D segmentation
*               Input shape : [1, D, H, W, 1] e.g. [1, 256, 256, 256, 1] 
*               Model : Meshnet or similar     
*
* Author:  Mohamed Masoud (2022)
=========================================================



=========================================================
               Brain 3D (ThreeJS)
=========================================================*/  

/**
* create ThreeJS Renderer
* 
* @since 1.4.0
* @param {string} webixWinId
* @param {string} containerId
* @return {Object} renderer
*/ 

getRenderer = (webixWinId, containerId) => {
    let container = document.getElementById(containerId); 
    const renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize($$(webixWinId).config.width, $$(webixWinId).config.height);
    renderer.antialias = true;   
    
    container.appendChild(renderer.domElement);

    return renderer;

}


/**
* Get input volume dim
* 
* @since 1.4.0
* @param {Array} vol3dValuesArr, 3D array 
* @return {object}
* @example
*
* getVol3dDim(  tf.tensor( [1,2,3,4,5,6,7,8], [2, 2, 2] ).arraySync() )
*
* // =>object  { "height": 2, "width": 2, "depth": 2 }
*  
*/ 

getVol3dDim = (vol3dValuesArr) => {
    return tf.tidy(() => {
        // Convert to tensor
        let vol3dTensor = tf.tensor(vol3dValuesArr);
        let height = vol3dTensor.shape[1],  width = vol3dTensor.shape[2],  depth = vol3dTensor.shape[0];      
        vol3dTensor.dispose();

        return { "height": height, "width": width, "depth": depth };    
    });
}

/**
* Create ThreeJS camera
* 
* @since 1.4.0
* @param {string} webixWinId
* @parm {number} fovVal
* @parm {number} zDim, distance of Object from camera
* @return {object} camera
*  
*/ 

createCamera = (webixWinId, fovVal = 50, zDim = 600) => {
    // Create camera
    const fov = fovVal;
    const aspect = $$(webixWinId).config.width/$$(webixWinId).config.height;
    const camera = new THREE.PerspectiveCamera( fov, aspect );
    camera.position.z = zDim;   

    return camera;
}


/**
* Create scene
* 
* @since 1.4.0
* @param {string/hex} bgColor e.g: 0x050505, "rgb(255, 0, 0)"
* @return {Object} scene
*/ 

createScene = (bgColor = 0x050505) => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color( bgColor );
    scene.fog = new THREE.Fog( bgColor, 2000, 3500 );  
    return scene;
}

/**
* create Oribit Controls
* 
* @since 1.4.0
* @param {object} vol3dDim - e.g. { "height": 256, "width": 256, "depth": 256 }; 
* @param {object} camera
* @param {string} renderer
* @param {number} minDist
* @param {number} maxDist
* @return {Object} controls
*/  

createOrbitControls = (vol3dDim, camera, renderer, minDist = 200, maxDist = 1000 ) => {
    const controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.target.set( vol3dDim.height / 2, vol3dDim.width / 3, vol3dDim.depth / 2 );
    controls.update();              
    controls.minDistance = minDist;
    controls.maxDistance = maxDist;

    return controls

}


/**
* Init threeJS for drawing the brain  3D
* 
* @since 1.3.0
* @param {Array} vol3dValuesArr- Brain 3D values
* @param {string} webixWinId
* @param {string} containerId
* @param {string} guiContainerId
* @param {string} iconId
* @param {ArrayBuffer} rawNiftiData 
* @param {ArrayBuffer} niftiImage
* @param {object} colorLutObj- e.g. {"0": "rgb(0,0,0)", "1": "rgb(245,245,245)", "2": "rgb(196,58,250)", "3": "rgb(220,248,164)", ... }
* @param {object} labelsObj- { "0": "BG",  "1": "Cerebral-White-Matter",  "2": "Ventricle",  "3": "Cerebellum-WM",  "4": "Cerebellum",..}
*
*/ 




initInput = (vol3dValuesArr,  webixWinId , containerId , guiContainerId, iconId,  rawNiftiData, niftiImage,  colorLutObj = null, labelsObj = null) => {

    // Create renderer and append it to parent body.  
    const renderer = getRenderer(webixWinId, containerId);
    
    // Get volumen Dim
    const vol3dDim = getVol3dDim(vol3dValuesArr);
    
    // Get camera 
    const camera =  createCamera(webixWinId, 50,  600);


    // Create Scene
    inputScene = createScene(0xefeaea);

    // For camera to orbit around a brain target
    // let orbitControls call for renderer.domElement  to prevent gui dropdown list inactive bug.
    const controls  = createOrbitControls(vol3dDim, camera, renderer,  200,  1000 );


    //-- Get all labels 
    let allLabelsTxtArr = ["All"], swapNumAndLabels = {};

    if( labelsObj != null) {
            swapNumAndLabels = Object.fromEntries(Object.entries(labelsObj).map(([k, v]) => [v, k]));
            Object.keys(labelsObj).forEach((labelNum, idx) => {
                 if(parseInt(labelNum) != 0) {
                    allLabelsTxtArr.push(labelsObj[labelNum]);
                 }
            })
    }





    changeVoxelsOpacity = (opacityVal) => {
        // show all voxels
        inputScene.traverse(function(child) { 
              if(parseInt(child.name) > 0 || child.type === "Points") {
                child.material.opacity = opacityVal; 
              } 
        });
    } 

    // Any value less than or equal threVal will be zero
    applyThreshold = (vol3dArr, threVal, height, width, depth) => {
        return tf.tidy(() => {
            let tsr = tf.tensor1d( tf.util.flatten(vol3dArr));
            //-- tsr = tsr.sub(threVal); // to make any noisy voxel < threVal negative
            //-- tsr = tsr.prelu(0);  // to make all voxels below 0  = 0
            let mask = tf.greater(tsr,  tf.onesLike(tsr).mul(threVal));
            tsr = tf.mul(tsr, tf.cast(mask, tsr.dtype));
            mask.dispose();

            let thresholdTsr3D =tf.reshape(tsr, [ vol3dDim.depth, vol3dDim.height, vol3dDim.width]);
            tsr.dispose();

            return thresholdTsr3D;
        });    

    } 


    applyNoiseRemoveByCC = (thresholdTsr3D, height, width, depth) => {

        return tf.tidy(() => {

            let unstackThresholdTsr3D = tf.unstack(thresholdTsr3D);
            let thresholdArrSlices3DCC = [];

            // dataSync() using to flatten array. Takes around 1.5 s 
            for(let sliceTensorIdx = 0; sliceTensorIdx < unstackThresholdTsr3D.length; sliceTensorIdx++ ) {
                  thresholdArrSlices3DCC[sliceTensorIdx] = Array.from(unstackThresholdTsr3D[sliceTensorIdx].dataSync());
            }


            thresholdArrSlices3DCC = tf.tidy(() => {  
                  // Remove noisy regions using 3d CC   
                  return postProcessSlices3D(thresholdArrSlices3DCC, vol3dDim.height, vol3dDim.width ); 
            })  

            return tf.reshape(thresholdArrSlices3DCC, thresholdTsr3D.shape);

            
        }); 
    }    


    applyHistoEq = (thresholdTsr3D) => {

        return tf.tidy(() => {
                let imageFlattened = tf.util.flatten(thresholdTsr3D.arraySync());
                //-- e.g. imageFlattened = [1, 1, 1, 4, 1, 4, 4, 1, 4, 0, 1, 4, 1, 4, 0, 0, 0, 1, 0, 0, 0, 4, 4, 1, 0, 1, 1]

                // Desired Max voxel intensity value 
                let outMaxIntensityVal = 255;

                let imgMaxVal = findArrayMax(imageFlattened);

                let histNumBins = imgMaxVal + 1;
                //-- e.g histNumBins = 5

                let imageHist = new Array(histNumBins).fill(0);
                

                // frequency count of each pixel
                imageFlattened.forEach(voxelVal => {
                    imageHist[voxelVal] += 1;
                })

                // Convert to tensor math ( tf.min.js )
                let imageHistTensor = array2Tensor(imageHist);
                let histCumSum = imageHistTensor.cumsum();   
               
                let norm = histCumSum.sub(histCumSum.min()).mul(outMaxIntensityVal);

                // normalize the voxel values
                let uniformNorm = norm.div(histCumSum.max().sub( histCumSum.min() ) ); 
                uniformNorm = uniformNorm.floor();
                //--e.g uniformNorm.print() -> [0, 147, 147, 147, 255]

                // Create mapping function between old and new values
                let mapObj = {};
                for(let i = 0; i <= imgMaxVal; i++) {
                   mapObj[i] = uniformNorm.arraySync()[i]; 
                }
                //-- mapObj: Object { 0: 0, 1: 147, 2: 147, 3: 147, 4: 255 }

                // flat histogram
                let imageEq = [];
                imageFlattened.forEach((voxelVal, idx) => {
                    imageEq[idx] =  mapObj[voxelVal];
                })    

                return  tf.tensor(imageEq, thresholdTsr3D.shape )

        });  
 
    };


  
  
    /****************************************************************/
    /****************************************************************/

    //-- Init the gui  
    let gui_controls = new function () {
      this.bg_color = 0xefeaea;
      this.height = vol3dDim.height;
      this.width = vol3dDim.width;
      this.depth = vol3dDim.depth;      
      this.opacity = 0.5;
      this.thresholding = 0;  
      this.lrg_con_comp = false;      
      this.histogram_eq = false; 
    };


    initGUI = () => {

        //-- gui = new dat.GUI();
        input_gui = new dat.GUI({ autoPlace: false });
        input_gui.domElement.id = 'input_gui';
        guiContainer = document.getElementById(guiContainerId);
        guiContainer.appendChild(input_gui.domElement);   

        let height = vol3dDim.height, width = vol3dDim.width, depth = vol3dDim.depth; 
        let thresholdTsr3D = tf.clone(vol3dValuesArr);         
        let enahncedArr3D = Array.from( thresholdTsr3D.arraySync() ); // thresholdTsr3D cloned vol3dValuesArr


        let heightSlider = input_gui.add( gui_controls, 'height', 0, vol3dDim.height, 1 ).onChange( function ( value ) {
            height = parseInt( value );

            showLoadingIcon(iconId).then(res => {  
                let pointsObj = getAllPoints(height, width, depth, inputScene, Array.from( thresholdTsr3D.arraySync() ),  colorLutObj);
                clearScene(inputScene);
                inputScene.add( pointsObj.points );
                disposeHierarchy (pointsObj.points , disposeNode);
                document.getElementById(iconId).style.display = "none";
                changeVoxelsOpacity(opacitySlider.getValue());
            });

            //-- if(value != this.initialValue) {
            //--    FOR FUTURE USE    
            //-- } 

        } );

        let widthSlider =  input_gui.add( gui_controls, 'width', 0, vol3dDim.width, 1 ).onChange( function ( value ) {
            width = parseInt( value );
   
            showLoadingIcon(iconId).then(res => {  
                let pointsObj = getAllPoints(height, width, depth, inputScene, Array.from( thresholdTsr3D.arraySync() ), colorLutObj);
                clearScene(inputScene);
                inputScene.add( pointsObj.points );
                disposeHierarchy (pointsObj.points , disposeNode);
                document.getElementById(iconId).style.display = "none";
                changeVoxelsOpacity(opacitySlider.getValue());
            });


        } );

        let depthSlider = input_gui.add( gui_controls, 'depth', 0, vol3dDim.depth, 1 ).onChange( function ( value ) {
            depth = parseInt( value );

            showLoadingIcon(iconId).then(res => {  
                let pointsObj = getAllPoints(height, width, depth, inputScene, Array.from( thresholdTsr3D.arraySync() ), colorLutObj);
                clearScene(inputScene);
                inputScene.add( pointsObj.points );
                disposeHierarchy (pointsObj.points , disposeNode);
                document.getElementById(iconId).style.display = "none";
                changeVoxelsOpacity(opacitySlider.getValue());
            });


        } );             

        let sceneColor = input_gui.addColor(gui_controls, "bg_color").onChange(function( value ) {
                inputScene.background.set( value );
        });

        let opacitySlider = input_gui.add( gui_controls, 'opacity', 0, 0.9, 0.1 ).onChange( function ( value ) {
                changeVoxelsOpacity(value);
        } );    


        const noiseRemovefolder = input_gui.addFolder( '3D Noise Remove' );

        let thresholdSlider = noiseRemovefolder.add( gui_controls, 'thresholding', 0, 50, 5  ).onChange( function ( value ) {
             showLoadingIcon(iconId).then(res => {  
                thresholdTsr3D = applyThreshold( enahncedArr3D, value, height, width, depth);

                let pointsObj = getAllPoints(height, width, depth, inputScene, Array.from( thresholdTsr3D.arraySync() ), colorLutObj );
                clearScene(inputScene);
                inputScene.add( pointsObj.points );
                disposeHierarchy (pointsObj.points , disposeNode);

                $$("inputApplyId").enable();
                $$("inputSaveId").enable();
                document.getElementById(iconId).style.display = "none";
                changeVoxelsOpacity(opacitySlider.getValue());
             });   
        } );  

        let connectCompCheck = noiseRemovefolder.add( gui_controls, 'lrg_con_comp' ).onChange( function ( value ) {
              showLoadingIcon(iconId).then(res => {  
                if(value) {
                    thresholdTsr3D = applyNoiseRemoveByCC(thresholdTsr3D, height, width, depth);
                    enahncedArr3D = Array.from( thresholdTsr3D.arraySync() ); 
                } else {
                    thresholdTsr3D = applyThreshold(vol3dValuesArr, thresholdSlider.getValue(), height, width, depth);
                    // Restore prev state
                    if(histoEqCheck.getValue()) {
                       thresholdTsr3D = applyHistoEq(thresholdTsr3D);
                       enahncedArr3D = Array.from( thresholdTsr3D.arraySync() ); 
                    } else {
                       enahncedArr3D = Array.from( tf.clone(vol3dValuesArr).arraySync() ); 
                    }

                }

                let pointsObj = getAllPoints(height, width, depth, inputScene, Array.from( thresholdTsr3D.arraySync() ), colorLutObj );
                clearScene(inputScene);
                inputScene.add( pointsObj.points );
                disposeHierarchy (pointsObj.points , disposeNode);                 

                $$("inputApplyId").enable();
                $$("inputSaveId").enable();
                document.getElementById(iconId).style.display = "none";
                changeVoxelsOpacity(opacitySlider.getValue());
             });                
        } );

        noiseRemovefolder.open();

        const enhancementfolder = input_gui.addFolder( '3D Enhancement' );

        let histoEqCheck = enhancementfolder.add( gui_controls, 'histogram_eq' ).onChange( function ( value ) {
              showLoadingIcon(iconId).then(res => {  
                 if(value) {
                    thresholdTsr3D = applyHistoEq(thresholdTsr3D);
                    enahncedArr3D = Array.from( thresholdTsr3D.arraySync() ); 
                 } else {
                    thresholdTsr3D = applyThreshold(vol3dValuesArr, thresholdSlider.getValue(), height, width, depth);
                    // Restore prev state
                    if(connectCompCheck.getValue()) {
                       thresholdTsr3D = applyNoiseRemoveByCC(thresholdTsr3D, height, width, depth);
                       enahncedArr3D = Array.from( thresholdTsr3D.arraySync() ); 
                    } else {
                       enahncedArr3D = Array.from( tf.clone(vol3dValuesArr).arraySync() ); 
                    }
                 }

                let pointsObj = getAllPoints(height, width, depth, inputScene, Array.from( thresholdTsr3D.arraySync() ), colorLutObj );
                clearScene(inputScene);
                inputScene.add( pointsObj.points );
                disposeHierarchy (pointsObj.points , disposeNode);

                $$("inputApplyId").enable();
                $$("inputSaveId").enable();
                document.getElementById(iconId).style.display = "none";
                changeVoxelsOpacity(opacitySlider.getValue());
             });                
        } );

        enhancementfolder.open();

        //-- if(allLabelsTxtArr.length <= 1) { // if no labels.json
        //-- }    


        $$("inputApplyId").attachEvent("onItemClick", function() {

                $$("inputApplyId").disable();

                let inputBrainEnhanced = tf.util.flatten( thresholdTsr3D.reverse(1).arraySync() );
                //-- Array(16777216) [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, … ]
                // thresholdTsr3D.dispose();
                
                let newArrayBuffer = createNiftiOutArrayBuffer(rawNiftiData, inputBrainEnhanced);
                //-- ArrayBuffer { byteLength: 16777568 }

                $$("inputThreejsWinId").hide();

                let blob = new Blob([newArrayBuffer], {type: "application/octet-binary;charset=utf-8"});
                let file = new File([blob], "temp.nii");
                let params_mri_enhanced = [];
                params_mri_enhanced["files"] = [file];
                params_mri_enhanced[file["name"]] = {lut: "Grayscale", interpolation: false};

                niftiImage = inputBrainEnhanced;

                // Reset main parameters and clear output threejs win
                newRunInferencePrepare().then(res => { 
                    $$("segmentBtn").enable();
                    // reset viewer should come after  
                    papaya.Container.resetViewer(0, params_mri_enhanced); 
                })  

                // -- numOfOverlays = 0;  
                

        }); 

        $$("inputSaveId").attachEvent("onItemClick", function() {
                 $$("inputSaveId").disable(); 
                 let fileName = refFileName == "" ? opts.uiSampleName: refFileName;
                 let dataArr1D = tensor2FlattenArray(  thresholdTsr3D.reverse(1) );
                 if(fileName.search(".nii") < 0) { 
                      // if nii extension doesn't exist, then search will return -1
                      fileName = fileName + ".nii";
                 }                 
                 downloadNifti(dataArr1D, rawNiftiData, "enhanced_" + fileName);
        });         


    }





    function animate() {
        requestAnimationFrame( animate );
        render()
    }

    function render() {
        // render using requestAnimationFrame
        requestAnimationFrame(render);        
        renderer.render( inputScene, camera );

    }


    $$(webixWinId).attachEvent( 'onViewResize', onWindowResize );

    function onWindowResize() {        
        camera.aspect = $$(webixWinId).config.width/$$(webixWinId).config.height;
        camera.updateProjectionMatrix();
        renderer.setSize( $$(webixWinId).config.width, $$(webixWinId).config.height);        
    }   


     //-- Create points group for each label
    let totalLabelsNum = Object.keys(colorLutObj).length;
    // label index initiation
    let idx = 0;

    let timer =  window.setInterval(function() { 
        let labelNum = Object.keys(colorLutObj)[idx];

        if(parseInt(labelNum) != 0) {
            let points = getPointsByLabel(vol3dDim.height, vol3dDim.width, vol3dDim.depth, inputScene, vol3dValuesArr, labelNum, colorLutObj);      
            points.name = labelNum;
            inputScene.add( points );
            disposeHierarchy (points, disposeNode);
        }        

        document.getElementById("progressLine").style.width = (idx * 100 / totalLabelsNum) + "%";
       
        if(idx == (totalLabelsNum -1) ){
            window.clearInterval(timer);
            document.getElementById("progressLine").style.width = "0%";               
            render();
            initGUI();
            changeVoxelsOpacity(0.5);     
            document.getElementById("inputLoadingIconDiv").style.display = "none"; 

            $$("modelTooltip").show();
            let info = "To fast remove noisy regions around the brain, try first with thresholding slide."
            document.getElementById("tooltipDiv").innerHTML = 
            "<i style='font-size:1.4vw'  class='fa fa-info-circle' ></i> <font style='font-size:0.77vw' >&nbsp&nbsp"+ info +" </font>"            

        }
  
       idx++;

    }, 10);


}




init = (vol3dValuesArr, webixWinId , containerId , guiContainerId, colorLutObj = null, labelsObj = null) => {

    // Create renderer and append it to parent body.  
    const renderer = getRenderer(webixWinId, containerId);
    
    // Get volumen Dim
    const vol3dDim = getVol3dDim(vol3dValuesArr);
    
    // Get camera 
    const camera =  createCamera(webixWinId, 50,  400);


    // Create Scene
    outputScene = createScene();

    // For camera to orbit around a brain target
    // let orbitControls call for renderer.domElement  to prevent gui dropdown list inactive bug.
    const controls  = createOrbitControls(vol3dDim, camera, renderer,  200,  1000 );


    // let stats = initStats();

    // For future use
    //-- var light = new THREE.SpotLight( 0xffffff );
    //-- light.position.set( 1, 1, 1 );
    //-- outputScene.add( light );

    //-- Get all labels 
    let allLabelsTxtArr = ["All"], swapNumAndLabels = {};

    if( labelsObj != null) {
            swapNumAndLabels = Object.fromEntries(Object.entries(labelsObj).map(([k, v]) => [v, k]));
            Object.keys(labelsObj).forEach((labelNum, idx) => {
                 if(parseInt(labelNum) != 0) {
                    allLabelsTxtArr.push(labelsObj[labelNum]);
                 }
            })
    }


    //-- Create points group for each label
    Object.keys(colorLutObj).forEach(labelNum => {
        if(parseInt(labelNum) != 0) {
            let points = getPointsByLabel(vol3dDim.height, vol3dDim.width, vol3dDim.depth, outputScene, vol3dValuesArr, labelNum, colorLutObj);      
            points.name = labelNum;
            outputScene.add( points );
            disposeHierarchy (points, disposeNode);
        }
    })



    changeVoxelsOpacity = (opacityVal) => {
        // show all voxels
        outputScene.traverse(function(child) { 
              if(parseInt(child.name) > 0 || child.type === "Points") {
                child.material.opacity = opacityVal; 
              } 
        });
    } 



    filterVoxelsByLabel = (roiLabel) => {
        if(roiLabel === "All") {
            // show all voxels
            outputScene.traverse(function(child){ child.visible = true; } );

        } else { 
                outputScene.traverse(function(child) {
                    if(parseInt(child.name) > 0 || child.type === "Points"){
                        if( parseInt(child.name) == parseInt(swapNumAndLabels[roiLabel]) ) {
                            child.visible = true;
                        } else {
                            child.visible = false;
                        }
                    }
                }); 
        }      
    }  


    filterVoxelsByMultiLabel = (roiLabelArr) => {

            let selectedRoiNumArr = [];
            roiLabelArr.forEach(roiLabel => {
                selectedRoiNumArr.push(parseInt( swapNumAndLabels[roiLabel]) );
            })  

            outputScene.traverse(function(child) {
                if(parseInt(child.name) > 0 || child.type === "Points"){
                    if( selectedRoiNumArr.indexOf( parseInt(child.name) ) != -1 ) { // -1 means not exist
                        child.visible = true;
                    } else {
                        child.visible = false;
                    }
                }
            }); 
                  
            
    }     

    /****************************************************************/
    /************************ Roi CheckList Ext *********************/
    /****************************************************************/

    let roiSelectionArr = [];      
    let roiList = document.getElementById('roiList');
    let roiItems = document.getElementById('roiItems');
    roiItems.innerHTML = '';

    roiList.getElementsByClassName('anchor')[0].onclick = function (evt) {
        if (roiItems.classList.contains('visible')){
            roiItems.classList.remove('visible');
            roiItems.style.display = "none";
        }
        else{
            roiItems.classList.add('visible');
            roiItems.style.display = "block";
        }
    }

    roiItems.onblur = function(evt) {
        roiItems.classList.remove('visible');
    }

    removeArrayItem = (arr, item) => {
        let index = arr.indexOf(item);

        if (index > -1) {
            arr.splice(index, 1);
        }
        
        return arr;
    } 

    preSelectRoi = (roi) => {
       roiSelectionArr.push(roi);
       document.getElementById(roi).checked = true;
    }

    updateRoiSelectArr = (inputElem) => {

        if(inputElem.checked) {
            roiSelectionArr.push(inputElem.id);
        } else {
           removeArrayItem(roiSelectionArr, inputElem.id)
        }

        filterVoxelsByMultiLabel(roiSelectionArr);
    }

    creatRoiList = (roiLabelArray) => {
       let nodes = "";        
       roiSelectionArr = []; 

       roiLabelArray.forEach (roi => {
          if(roi !== "All") {
             nodes += '<li><input id="' + roi + '"  type="checkbox" onclick = "updateRoiSelectArr(this) "/><label for="checkbox"> ' + roi + '</label></li>'
          }
       })
       return nodes;
    }    

    /****************************************************************/
    /****************************************************************/

    //-- Init the gui  
    let gui_controls = new function () {
      this.opacity = 0.5;
      this.roi_label = "All";
      this.multi_roi = false;
    };


    initGUI = () => {

        //-- gui = new dat.GUI();
        output_gui = new dat.GUI({ autoPlace: false });
        output_gui.domElement.id = 'gui';
        guiContainer = document.getElementById(guiContainerId);
        guiContainer.appendChild(output_gui.domElement);        

        let opacitySlider = output_gui.add( gui_controls, 'opacity', 0, 0.9, 0.1 ).onChange( function ( value ) {
                changeVoxelsOpacity(value);
        } );             

        let roiSelector = output_gui.add( gui_controls, 'roi_label', allLabelsTxtArr).onChange(function (value) {
               filterVoxelsByLabel(value);
        })

        let multiRoi = output_gui.add( gui_controls, 'multi_roi').onChange(function (value) {
 
               roiItems.innerHTML =  creatRoiList(allLabelsTxtArr);
               
               if(value == true) {
                        if(roiSelector.getValue() !== "All") {
                           preSelectRoi(roiSelector.getValue());
                        }

                        roiList.style.display = "inline-block";
                        roiSelector.domElement.style.pointerEvents = "none";
                        roiSelector.domElement.style.opacity = .5;                    
               } else {
                        filterVoxelsByLabel(roiSelector.getValue());
                        roiList.style.display = "none"; 
                        roiSelector.domElement.style.pointerEvents = "";
                        roiSelector.domElement.style.opacity = 1;   
               }    
                          
        }) 

        if(allLabelsTxtArr.length <= 1) { // if no labels.json
             roiSelector.domElement.style.pointerEvents = "none";
             roiSelector.domElement.style.opacity = .5;  
             multiRoi.remove();
        }       
    }


    render();
    initGUI();
    changeVoxelsOpacity(0.5);

    function animate() {

        requestAnimationFrame( animate );
        render()
    }

    function render() {
        // render using requestAnimationFrame
        requestAnimationFrame(render);        
        renderer.render( outputScene, camera );

    }


    $$(webixWinId).attachEvent( 'onViewResize', onWindowResize );

    function onWindowResize() {        
        camera.aspect = $$(webixWinId).config.width/$$(webixWinId).config.height;
        camera.updateProjectionMatrix();
        renderer.setSize( $$(webixWinId).config.width, $$(webixWinId).config.height);        
    }    


}


/**
* Show loading icon
* 
* @since 1.4.0
* @param {String} iconId
* @return {Object} defer
*
*/

 showLoadingIcon = (iconId) => {
    let defer = $.Deferred();
    document.getElementById(iconId).style.display = "";

    setTimeout(function() {
        defer.resolve(); // When this fires, the code in a().then(/..../); is executed.
    }, 100);  

    return defer;         
 }

/**
* Create THREE.points for all voxels 
* 
* @since 1.3.0
* @param {number} height
* @param {number} width
* @param {number} depth
* @param {Object} scene, threejs scene. 
* @param {Array} voxelsVal, 3D array
* @param {Object} colorLutObj e.g. {"0": "rgb(0,0,0)", "1": "rgb(245,245,245)", "2": "rgb(196,58,250)", "3": "rgb(220,248,164)", ... }
* @return {Object} points, THREE.Points.
*
*/

 getAllPoints = (height, width, depth, scene, voxelsVal,  colorLutObj) => {
     
    

    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    let max_x = 0, max_y = 0, max_z = 0;
    let min_x = Infinity, min_y = Infinity, min_z = Infinity;

    for (let x = 0; x < depth; x+=1) {
        for (let y = 0; y < height; y+=1) {
          for (let z = 0; z < width; z+=1) {
             if(voxelsVal[x][y][z] != 0) {

                  positions.push( x, y, z );
                  let labelColor = getRgbObject(colorLutObj[voxelsVal[x][y][z]]);
                  colors.push(labelColor.r/255, labelColor.g/255, labelColor.b/255 );  
              

                  if(max_x > x) max_x = x;
                  if(max_y > y) max_y = y;
                  if(max_z > z) max_z = z;   

                  if(min_x < x) min_x = x;
                  if(min_y < y) min_y = y;
                  if(min_z < z) min_z = z;  

              
             }
          }
        }
    }

    geometry.addAttribute( 'position', new THREE.Uint16BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ));

    const material = new THREE.PointsMaterial( { size: 5, vertexColors: true, transparent: true } );

    let points =  new THREE.Points( geometry, material );

    geometry.dispose();
    material.dispose();

    

    return {"points": points} ;

}


/**
* Create THREE.points for each group of voxels with same label
* 
* @since 1.3.0
* @param {number} height
* @param {number} width
* @param {number} depth
* @param {Object} scene, threejs scene. 
* @param {Array} voxelsVal, 3D array
* @param {number} labelNum, Segmenation label number 
* @param {Object} colorLutObj e.g. {"0": "rgb(0,0,0)", "1": "rgb(245,245,245)", "2": "rgb(196,58,250)", "3": "rgb(220,248,164)", ... }
* @return {Object} points, THREE.Points.
*
*/

getPointsByLabel = (height, width, depth, scene, voxelsVal, labelNum, colorLutObj) => {

    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    for (let x = 0; x < depth; x+=1) {
        for (let y = 0; y < height; y+=1) {
          for (let z = 0; z < width; z+=1) {
             if(voxelsVal[x][y][z] == labelNum) {
                  positions.push( x, y, z );
                  let labelColor = getRgbObject(colorLutObj[labelNum]);
                  colors.push(labelColor.r/255, labelColor.g/255, labelColor.b/255 );
             }
          }
        }
    }

    geometry.addAttribute( 'position', new THREE.Uint16BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ));

    const material = new THREE.PointsMaterial( { size: 5, vertexColors: true, transparent: true } );

    let points =  new THREE.Points( geometry, material );

    geometry.dispose();
    material.dispose();

    return points;

}


/**
* Clear threejs scene
* @since 1.3.0
* @param {Object} scene, threejs scene. 
*
*/

clearScene = (scene) => {
      while(scene.children.length > 0) { 
          //-- disposeHierarchy (scene, disposeNode);
          let node = scene.children[0];
          disposeNode(node);          
          scene.remove(node); 
      }
 }


/**
* Clear threejs material. 
* Credit: trusktr (https://discourse.threejs.org/u/trusktr)
* @since 1.3.0
* @param {Object} material, e.g. THREE.PointsMaterial. 
*
*/

cleanMaterial = (material) => {
    material.dispose();
    // dispose textures
    for (const key of Object.keys(material)) {
        const value = material[key];
        if (value && typeof value === 'object' && 'minFilter' in value) {
            value.dispose();
        }
    }
}



/**
* Dispose all scene childrens.
* Credit: https://stackoverflow.com/users/1980846/gaitat
* @since 1.3.0
* @param {Object} node, e.g. THREE.Points. 
* @example
*
*  disposeNode (scene.children[0])
*/

disposeNode = (node) => {
    if (node instanceof THREE.Mesh || node instanceof THREE.Points)
    {
        if (node.geometry)
        {
            node.geometry.dispose();
        }

        if (node.material)
        {
            if (node.material instanceof THREE.MeshFaceMaterial)
            {
                $.each (node.material.materials, function (idx, mtrl)
                {
                    if (mtrl.map)               mtrl.map.dispose ();
                    if (mtrl.lightMap)          mtrl.lightMap.dispose ();
                    if (mtrl.bumpMap)           mtrl.bumpMap.dispose ();
                    if (mtrl.normalMap)         mtrl.normalMap.dispose ();
                    if (mtrl.specularMap)       mtrl.specularMap.dispose ();
                    if (mtrl.envMap)            mtrl.envMap.dispose ();
                    if (mtrl.alphaMap)          mtrl.alphaMap.dispose();
                    if (mtrl.aoMap)             mtrl.aoMap.dispose();
                    if (mtrl.displacementMap)   mtrl.displacementMap.dispose();
                    if (mtrl.emissiveMap)       mtrl.emissiveMap.dispose();
                    if (mtrl.gradientMap)       mtrl.gradientMap.dispose();
                    if (mtrl.metalnessMap)      mtrl.metalnessMap.dispose();
                    if (mtrl.roughnessMap)      mtrl.roughnessMap.dispose();

                    mtrl.dispose ();    // disposes any programs associated with the material
                });
            }
            else if(node.material instanceof THREE.PointsMaterial)
            {
                // disposes any programs associated with the material 
                if (node.material.map)              node.material.map.dispose();
                cleanMaterial(node.material);
                  
            }            
            else
            {
                if (node.material.map)              node.material.map.dispose ();
                if (node.material.lightMap)         node.material.lightMap.dispose ();
                if (node.material.bumpMap)          node.material.bumpMap.dispose ();
                if (node.material.normalMap)        node.material.normalMap.dispose ();
                if (node.material.specularMap)      node.material.specularMap.dispose ();
                if (node.material.envMap)           node.material.envMap.dispose ();
                if (node.material.alphaMap)         node.material.alphaMap.dispose();
                if (node.material.aoMap)            node.material.aoMap.dispose();
                if (node.material.displacementMap)  node.material.displacementMap.dispose();
                if (node.material.emissiveMap)      node.material.emissiveMap.dispose();
                if (node.material.gradientMap)      node.material.gradientMap.dispose();
                if (node.material.metalnessMap)     node.material.metalnessMap.dispose();
                if (node.material.roughnessMap)     node.material.roughnessMap.dispose();

                node.material.dispose ();   // disposes any programs associated with the material
            }
        }
    }
}   

/**
* Dispose all scene childrens.
* Credit: https://stackoverflow.com/users/1980846/gaitat
* @since 1.3.0
* @param {Object} node, e.g. THREE.scene. 
* @example
*
*  disposeHierarchy (scene, disposeNode)
*/ 
disposeHierarchy =  (node, callback) => {
    for (let i = node.children.length - 1; i >= 0; i--) {
        let child = node.children[i];
        disposeHierarchy (child, callback);
        callback (child);
    }
} 










		



