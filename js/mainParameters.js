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



    //---------- initialize Globals-------//  

    // var model;
    // var modelObject;

    var  allOutputSlices3DCC1DimArray = [];

    //Raw Nifti Data and header
    var  rawNiftiData = [];
    //Object    
    var  niftiHeader = [];
    //ArrayBuffer
    var  niftiImage = [];
    //Object
    var  labelNiftiHeader = [];
    //ArrayBuffer
    var  labelNiftiImage = [];  
    //Flag for futur use
    var  gtLabelLoaded = false; 

    // Nifti file to load *.nii
    var refFileName = '';

    // When browsing to tfjs model with browse window
    var modelFile;
    var weightFile;
    var labelFile;
    // Models loaded from browsing window 
    var browserModelList = [];

    // Number of overlay added to MRI viewer
    var numOfOverlays;

    var numOfModelsWithoutBrowse;


    var opts = {
            // General  settings for input shape  [batchSize, batch_D, batch_H, batch_W, numOfChan]; 
            batchSize:                            1, //How many batches are used during each inference iteration
            numOfChan:                            1, // num of channel of the input shape

            isColorEnable:                        true, // If false, grey scale will enabled
            isAutoColors:                         true, // If false, manualColorsRange will be in use
            bgLabelValue:                         0, // Semenatic Segmentation background label value  
             
            enableMriVolumeCrop:                  true, // For Full volume inference, crop brain from zero background before feeding to inference model to lower memory use.
            minSegLabels2enableCrop:              1, // Minimum number of segmenations resulted from the model must meet to run the two phases pipeline
            fullVolCropPad:                       2, // Padding size add to cropped brain 
            drawBoundingVolume:                   false, // plot bounding volume used to crop the brain    
            isBrainCropMaskBased:                 true, // Check if brain masking will be used for cropping & optional show or brain tissue will be used
            multFinalOutWithMask:                 false, // Can be used to multiply final output with premodel output mask to crean noisy areas
            showPhase1Output:                     false, // This will load to papaya the output of phase-1 (ie. brain mask or brain tissue)

            isPostProcessEnable:                  true,  // If true 3D Connected Components filter will apply  

            isContoursViewEnable:                 false, // If true 3D contours of the labeled regions will apply

            browserArrayBufferMaxZDim:            30, // This value depends on Memory available

            telemetryFlag:                        true, // Ethical and transparent collection of browser usage while adhering to security and privacy standards

            uiSampleName:                         "BC_UI_Sample", // Sample name used by interface

            atlasSelectedColorTable:              "Fire" // Select from ["Hot-and-Cold", "Fire", "Grayscale", "Gold", "Spectrum"]    
    }

   // Statistical data to analysis client performance
   var statData = { Brainchop_Ver: null, Country: null, State: null,  City: null, Date: null, Time: null, 
                    File_Name: null, Img_Size: null, Num_Bits_Per_Voxel: null, Data_Type_Code: null, Vox_Offset: null, Vox_1mm: null, Resampled: null, File_Verified: null,
                    Input_Shape: null, Output_Shape: null, Channel_Last: null, Model_Param: Infinity, Model_Layers: Infinity, 
                    No_SubVolumes: null, Actual_Labels: Infinity, Expect_Labels: Infinity,  NumLabels_Match: null, 
                    Data_Load: null, Preprocess_t: null, Inference_t: null, Merge_t: null,  Postprocess_t: null, 
                    Model: null, Browser: null, Browser_Ver: null, OS: null, Texture_Size: null, Heap_Size_MB: Infinity, Used_Heap_MB: Infinity, Heap_Limit_MB: Infinity,
                    WebGL1: null, WebGL2: null, TF_Backend: null, GPU_Vendor: null, GPU_Vendor_Full: null, 
                    GPU_Card: null, GPU_Card_Full:null, Status: null, CPU_Cores: null, Error_Type: null, Extra_Err_Info: null, Extra_Info: null };



   // Inference Models, the ids must start from 1 in sequence
   var inferenceModelsList = [
                                  {
                                       id: 1,  // Must start from 1
                                       type: "Segmentation", 
                                       path: "./ModelToLoad/model21_3class/model.json", 
                                       modelName: "Subvolume GWM (failsafe)",  
                                       labelsPath: "./ModelToLoad/model21_3class/labels.json", 
                                       colorsPath: "./ModelToLoad/model21_3class/colorLUT.json",  
                                       preModelId: null, // Model run first e.g.  crop the brain  {null, 1, 2, ..  }                                                                         
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference 
                                       numOverlapBatches: 200, //Number of extra overlap batches for inference  
                                       enableTranpose : true, // Keras and tfjs input orientation may need a tranposing step to be matched                                          
                                       textureSize:  0, // Requested Texture size for the model, if unknown can be 0.
                                       warning: null, // Warning message to show when select the model.      
                                       inferenceDelay: 0, // Delay in ms time while looping layers applying.
                                       description: "Gray and white matter segmentation model. This model partitions T1 image into cubes of smaller 64x64x64 size and processes one at a time. This helps to overcome browser limitations but leads to longer computation and lower accuracy."
                                  },

                                  {
                                       id: 2, 
                                       type: "Segmentation", 
                                       path: "./ModelToLoad/model5_gw_ae/model.json", 
                                       modelName: "Full Brain GWM (light)",  
                                       labelsPath: "./ModelToLoad/model5_gw_ae/labels.json", 
                                       colorsPath: "./ModelToLoad/model5_gw_ae/colorLUT.json",      
                                       preModelId: null, // Model run first e.g.  crop the brain   { null, 1, 2, ..  }                                                                          
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference 
                                       numOverlapBatches: 0, //Number of extra overlap batches for inference  
                                       enableTranpose : true, // Keras and tfjs input orientation may need a tranposing step to be matched                                        
                                       textureSize:  9159, // Requested Texture size for the model, if unknown can be 0.      
                                       warning: null, // Warning message to show when select the model.       
                                       inferenceDelay: 100, // Delay in ms time while looping layers applying.
                                       description: "Gray and white matter segmentation model. Operates on full T1 image in a single pass, but uses only 5 filters per layer. Can work on integrated graphics cards but is barely large enough to provide good accuracy. Still more accurate than the subvolume model."
                                  },

                                  {
                                       id: 3, 
                                       type: "Segmentation", 
                                       path:"./ModelToLoad/model11_gw_ae/model.json", 
                                       modelName:"Full Brain GWM (large)", 
                                       labelsPath: "./ModelToLoad/model11_gw_ae/labels.json",
                                       colorsPath: "./ModelToLoad/model11_gw_ae/colorLUT.json",  
                                       preModelId: null, // Model run first e.g.  crop the brain   { null, 1, 2, ..  }                                                                          
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference 
                                       numOverlapBatches: 0, //Number of extra overlap batches for inference 
                                       enableTranpose : true, // Keras and tfjs input orientation may need a tranposing step to be matched                                                                    
                                       textureSize:  13585, // Requested Texture size for the model, if unknown can be 0.  
                                       warning: "This model needs dedicated graphics card.",           
                                       inferenceDelay: 100, // Delay in ms time while looping layers applying.
                                       description: "Gray and white matter segmentation model. Operates on full T1 image in a single pass but needs a dedicated graphics card to operate. Provides the best accuracy among the provided models."
                                  }, 

                                  {
                                       id: 4, 
                                       type: "Brain_Extraction", 
                                       path: "./ModelToLoad/model5_gw_ae/model.json", 
                                       modelName:"Extract the Brain (FAST)", 
                                       labelsPath: null, 
                                       colorsPath: null,              
                                       preModelId: null, // Model run first e.g.  crop the brain  { null, 1, 2, ..  }                                                                            
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference 
                                       numOverlapBatches: 0, //Number of extra overlap batches for inference 
                                       enableTranpose : true, // Keras and tfjs input orientation may need a tranposing step to be matched                                                                                                              
                                       textureSize:  9159,  // Requested Texture size for the model, if unknown can be 0. 
                                       warning: null, // Warning message to show when select the model.    
                                       inferenceDelay: 0, // Delay in ms time while looping layers applying.                                  
                                       description: "Extract the brain fast model operates on full T1 image in a single pass, but uses only 5 filters per layer. Can work on integrated graphics cards but is barely large enough to provide good accuracy. Still more accurate than the failsafe version."
                                  }, 

                                  {
                                       id: 5, 
                                       type: "Brain_Extraction", 
                                       path:"./ModelToLoad/mnm_tfjs_me_test/model.json", 
                                       modelName:"Extract the Brain (failsafe)", 
                                       labelsPath: null, 
                                       colorsPath: null,         
                                       preModelId: null,// Model run first e.g.  crop the brain  { null, 1, 2, ..  } 
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference 
                                       numOverlapBatches: 200, //Number of extra overlap batches for inference 
                                       enableTranpose : true, // Keras and tfjs input orientation may need a tranposing step to be matched                                                                                                              
                                       textureSize:  0,  // Requested Texture size for the model, if unknown can be 0. 
                                       warning: null, // Warning message to show when select the model.    
                                       inferenceDelay: 0, // Delay in ms time while looping layers applying.                                  
                                       description: "This model partitions T1 image into cubes of smaller 64x64x64 size and processes one at a time. This helps to overcome browser limitations but leads to longer computation and lower accuracy."
                                  },
                                  {
                                       id: 6, 
                                       type: "Brain_Masking", 
                                       path: "./ModelToLoad/model5_gw_ae/model.json", 
                                       modelName:"Compute Brain Mask (FAST)", 
                                       labelsPath: null, 
                                       colorsPath: null,        
                                       preModelId: null,// Model run first e.g.  crop the brain  { null, 1, 2, ..  } 
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference 
                                       numOverlapBatches: 0, //Number of extra overlap batches for inference  
                                       enableTranpose : true, // Keras and tfjs input orientation may need a tranposing step to be matched                                                                                                           
                                       textureSize:  9159, // Requested Texture size for the model, if unknown can be 0.     
                                       warning: null, // Warning message to show when select the model.   
                                       inferenceDelay: 0, // Delay in ms time while looping layers applying.                                  
                                       description: "This fast masking model operates on full T1 image in a single pass, but uses only 5 filters per layer. Can work on integrated graphics cards but is barely large enough to provide good accuracy. Still more accurate than failsafe version."
                                  },                                  

                                  {
                                       id: 7, 
                                       type: "Brain_Masking", 
                                       path:"./ModelToLoad/mnm_tfjs_me_test/model.json", 
                                       modelName:"Compute Brain Mask (failsafe)", 
                                       labelsPath: null, 
                                       colorsPath: null,       
                                       preModelId: null,// Model run first e.g.  crop the brain  { null, 1, 2, ..  } 
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference 
                                       numOverlapBatches: 200, //Number of extra overlap batches for inference  
                                       enableTranpose : true, // Keras and tfjs input orientation may need a tranposing step to be matched                                                                                                           
                                       textureSize:  0, // Requested Texture size for the model, if unknown can be 0.     
                                       warning: null, // Warning message to show when select the model.   
                                       inferenceDelay: 0, // Delay in ms time while looping layers applying.                                  
                                       description: "This masking version partitions T1 image into cubes of smaller 64x64x64 size and processes one at a time. This helps to overcome browser limitations but leads to longer computation and lower accuracy."
                                  },
                                 
                                  {
                                       id: 8, 
                                       type: "Atlas", 
                                       path:"./ModelToLoad/model11_50class/model.json", 
                                       modelName:"Cortical Atlas 50", 
                                       labelsPath: "./ModelToLoad/model11_50class/labels.json", 
                                       colorsPath: "./ModelToLoad/model11_50class/colorLUT.json",       
                                       preModelId: 6,// Model run first e.g.  crop the brain  { null, 1, 2, ..  } 
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference 
                                       numOverlapBatches: 200, //Number of extra overlap batches for inference  
                                       enableTranpose : true, // Keras and tfjs input orientation may need a tranposing step to be matched                                                                                                           
                                       textureSize:  0, // Requested Texture size for the model, if unknown can be 0.     
                                       warning: "This model needs dedicated graphics card", // Warning message to show when select the model.  
                                       inferenceDelay: 100, // Delay in ms time while looping layers applying.                                   
                                       description: "Parcellate cortical areas into 50 regions."
                                  }  
                                  ,{
                                       id: 9, 
                                       type: "Atlas", 
                                       path:"./ModelToLoad/model21_104class/model.json", 
                                       modelName:"FS aparc+aseg Atlas 104", 
                                       labelsPath: "./ModelToLoad/model21_104class/labels.json", 
                                       colorsPath: "./ModelToLoad/model21_104class/colorLUT.json",     
                                       preModelId: 6,  // model run first e.g.  Brain_Extraction  { null, 1, 2, ..  } 
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference 
                                       numOverlapBatches: 200, //Number of extra overlap batches for inference  
                                       enableTranpose : true, // Keras and tfjs input orientation may need a tranposing step to be matched                                                                                                           
                                       textureSize:  18121, // Requested Texture size for the model, if unknown can be 0.     
                                       warning: "This model may need dedicated graphics card", // Warning message to show when select the model.  
                                       inferenceDelay: 100, // Delay in ms time while looping layers applying.                                   
                                       description: "FreeSurfer aparc+aseg atlas 104 parcellate brain areas into 104 regions. It contains a combination of the Desikan-Killiany atlas for cortical area and also segmentation of subcortical regions"
                                  }  
                                  ,{
                                       id: 10, 
                                       type: "Atlas", 
                                       path:"./ModelToLoad/model21_104class/model_D95.json", 
                                       modelName:"FS aparc+aseg Atlas 104 (failsafe)", 
                                       labelsPath: "./ModelToLoad/model21_104class/labels.json", 
                                       colorsPath: "./ModelToLoad/model21_104class/colorLUT.json",     
                                       preModelId: 6,  // model run first e.g.  Brain_Extraction { null, 1, 2, ..  } 
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference 
                                       numOverlapBatches: 200, //Number of extra overlap batches for inference  
                                       enableTranpose : true, // Keras and tfjs input orientation may need a tranposing step to be matched                                                                                                           
                                       textureSize:  16384, // Requested Texture size for the model, if unknown can be 0.     
                                       warning: "This model may need dedicated graphics card", // Warning message to show when select the model.  
                                       inferenceDelay: 100, // Delay in ms time while looping layers applying.                                   
                                       description: "FreeSurfer aparc+aseg atlas 104 parcellate brain areas into 104 regions. It contains a combination of the Desikan-Killiany atlas for cortical area and also segmentation of subcortical regions. This model partitions T1 image into cubes of smaller size for inference to helps overcoming browser limitations but leads to longer computation and lower accuracy."
                                  }                                                                                                        
                                 
                            ];   


   //Heatmap colors, for reproduce:  https://www.w3schools.com/colors/colors_hsl.asp
   var manualColorsRange = [/*Red*/ "hsla(0,100%,50%)", /*Vermillion*/ "hsla(30,100%,50%)", /*Orange*/ "hsla(60,100%,50%)",
                            /*Amber*/ "hsla(90,100%,50%)", /*Yellow*/ "hsla(120,100%,50%)", /*Chartreuse*/ "hsla(150,100%,50%)",
                            /*Green*/ "hsla(180,100%,50%)", /*Aquamanrine*/ "hsla(210,100%,50%)", /*Blue*/ "hsla(240,100%,50%)",
                            /*Indiago*/ "hsla(270,100%,50%)", /*Purple*/ "hsla(300,100%,50%)", /*Magenta*/ "hsla(330,100%,50%)"
    ] 

   // For futur use
   var manualColorsRangeHex = [
                               "#330000", "#FF0000", "#FF3333", "#FF6666", 
                               "#FF9999", "#FFB266", "#FFE5CC", "#FFFF66",
                               "#FFFFCC", "#FFFFFF", "#CCE5FF", "#99CCFF", 
                               "#66B2FF", "#3399FF", "#0080FF", "#0066CC", "#004C99"
                              ]  




    //--https://github.com/rii-mango/Papaya/wiki/Configuration
    // MRI Viewer settings
    var params_mri = [];
    params_mri["worldSpace"] = false;
    params_mri["expandable"] = true;
    // To hide the toolbar
    params_mri["kioskMode"] = false;
    params_mri["noNewFiles"] = true;

    papaya.Container.syncViewers = true;

    // Labels Viewer settings
    var params_label = [];
    params_label["worldSpace"] = false;
    params_label["expandable"] = true;
    // To hide the toolbar
    params_label["kioskMode"] = false;            
    params_label["noNewFiles"] = true;
    params_label["smoothDisplay"] = false;
   


