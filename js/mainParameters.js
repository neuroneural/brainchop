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

            isPostProcessEnable:                  true,  // If true 3D Connected Components filter will apply  

            isContoursViewEnable:                 false, // If true 3D contours of the labeled regions will apply

            browserArrayBufferMaxZDim:            30, // This value depends on Memory available

            telemetryFlag:                        true, // Ethical and transparent collection of browser usage while adhering to security and privacy standards

            // enableTranpose:                       true, // Keras and tfjs input orientation may need a tranposing step to be matched

            atlasSelectedColorTable:              "Fire" // Select from ["Hot-and-Cold", "Fire", "Grayscale", "Gold", "Spectrum"]    
    }

   // Statistical data to analysis client performance
   var statData = { Brainchop_Ver: null, Country: null, State: null,  City: null, Date: null, Time: null,  
                    Img_Size: null, Input_Shape: null, Output_Shape: null, Channel_Last: null, Model_Param: Infinity, Model_Layers: Infinity, 
                    No_SubVolumes: null, Actual_Labels: Infinity, Expect_Labels: Infinity,  NumLabels_Match: null, 
                    Data_Load: null, Preprocess_t: null, Inference_t: null, Postprocess_t: null, 
                    Model: null, Browser: null, Browser_Ver: null, OS: null, Texture_Size: null, Heap_Size_MB: Infinity, Used_Heap_MB: Infinity, Heap_Limit_MB: Infinity,
                    WebGL1: null, WebGL2: null, TF_Backend: null, GPU_Vendor: null, GPU_Vendor_Full: null, 
                    GPU_Card: null, GPU_Card_Full:null, Status: null, Error_Type: null };



   // Inference Models
   var inferenceModelsList = [
                                  {
                                       id: "1", 
                                       type: "Segmentation", 
                                       path: "./ModelToLoad/model21_3class/model.json", 
                                       modelName: "Subvolume GWM (failsafe)",  
                                       labelsPath: "./ModelToLoad/model21_3class/labels.json", 
                                       colorsPath: "./ModelToLoad/model21_3class/colorLUT.json",                                        
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference 
                                       numOverlapBatches: 200, //Number of extra overlap batches for inference  
                                       enableTranpose : true, // Keras and tfjs input orientation may need a tranposing step to be matched                                          
                                       textureSize:  null, // Requested Texture size for the model, if unknown can be null.
                                       warning: null, // Warning message to show when select the model.       
                                       description: "Gray and white matter segmentation model. This model partitions T1 image into cubes of smaller 64x64x64 size and processes one at a time. This helps to overcome browser limitations but leads to longer computation and lower accuracy."
                                  },

                                  {
                                       id: "2", 
                                       type: "Segmentation", 
                                       path: "./ModelToLoad/model5_gw_ae/model.json", 
                                       modelName: "Full Brain GWM (light)",  
                                       labelsPath: "./ModelToLoad/model5_gw_ae/labels.json", 
                                       colorsPath: "./ModelToLoad/model5_gw_ae/colorLUT.json",                                       
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference 
                                       numOverlapBatches: 0, //Number of extra overlap batches for inference  
                                       enableTranpose : true, // Keras and tfjs input orientation may need a tranposing step to be matched                                        
                                       textureSize:  9159, // Requested Texture size for the model, if unknown can be null.      
                                       warning: null, // Warning message to show when select the model.       
                                       description: "Gray and white matter segmentation model. Operates on full T1 image in a single pass, but uses only 5 filters per layer. Can work on integrated graphics cards but is barely large enough to provide good accuracy. Still more accurate than the subvolume model."
                                  },

                                  {
                                       id: "3", 
                                       type: "Segmentation", 
                                       path:"./ModelToLoad/model11_gw_ae/model.json", 
                                       modelName:"Full Brain GWM (large)", 
                                       labelsPath: "./ModelToLoad/model11_gw_ae/labels.json",
                                       colorsPath: "./ModelToLoad/model11_gw_ae/colorLUT.json",                                      
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference 
                                       numOverlapBatches: 0, //Number of extra overlap batches for inference 
                                       enableTranpose : true, // Keras and tfjs input orientation may need a tranposing step to be matched                                                                    
                                       textureSize:  13585, // Requested Texture size for the model, if unknown can be null.  
                                       warning: "This model needs dedicated graphics card.",           
                                       description: "Gray and white matter segmentation model. Operates on full T1 image in a single pass but needs a dedicated graphics card to operate. Provides the best accuracy among the provided models."
                                  }, 

                                  {
                                       id: "4", 
                                       type: "Brain_Extraction", 
                                       path:"./ModelToLoad/mnm_tfjs_me_test/model.json", 
                                       modelName:"Extract the Brain", 
                                       labelsPath: null, 
                                       colorsPath: null,                                        
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference 
                                       numOverlapBatches: 200, //Number of extra overlap batches for inference 
                                       enableTranpose : true, // Keras and tfjs input orientation may need a tranposing step to be matched                                                                                                              
                                       textureSize:  null,  // Requested Texture size for the model, if unknown can be null. 
                                       warning: null, // Warning message to show when select the model.                                      
                                       description: null
                                  },

                                  {
                                       id: "5", 
                                       type: "Brain_Masking", 
                                       path:"./ModelToLoad/mnm_tfjs_me_test/model.json", 
                                       modelName:"Compute Brain Mask", 
                                       labelsPath: null, 
                                       colorsPath: null,                                         
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference 
                                       numOverlapBatches: 200, //Number of extra overlap batches for inference  
                                       enableTranpose : true, // Keras and tfjs input orientation may need a tranposing step to be matched                                                                                                           
                                       textureSize:  null, // Requested Texture size for the model, if unknown can be null.     
                                       warning: null, // Warning message to show when select the model.                                     
                                       description: null
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
   


