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


    //---------- initialize Globals-------//  

    var model;

    var  allOutputSlices = [];
    var  allOutputSlices2DCC = [];
    var  allOutputSlices3DCC = [];  
    var  allOutputSlices3DCC1DimArray = [];

    //Find max label while processing connect components
    var  maxLabel;  
    //Find max label in the output segmentation  
    var  maxLabelPredicted;  

    var  rawNiftiData = [];
    var  niftiHeader = [];
    //ArrayBuffer
    var  niftiImage = [];
    //Object
    var  labelNiftiHeader = [];
    //ArrayBuffer
    var  labelNiftiImage = [];  
    //Flag for futur use
    var  gtLabelLoaded = false; 

    var refFileName = '';


    var opts = {
            // General  settings for input shape  [batchSize, batch_D, batch_H, batch_W, numOfChan]; 
            batchSize:                            1, //How many batches are used during each inference iteration
            numOfChan:                            1, // num of channel of the input shape
            batchDim:                             38,  //subvolume dim used for batch_D, batch_H, batch_W       

            isBatchOverlapEnable:                 true, //create extra overlap batches for inference 
            numOverlapBatches:                    200, //Number of extra overlap batches for inference            

            isColorEnable:                        true, // If false, grey scale will enabled
            isAutoColors:                         true, // If false, manualColorsRange will be in use
            bgLabelValue:                         0, // Semenatic Segmentation background label value   

            isPostProcessEnable:                  true  // If true 3D Connected Components filter will apply       

    }



   // Inference Models
   var inferenceModelsList = [
                                  {
                                       id: "1", 
                                       type: "Segmentation", 
                                       path:"./ModelToLoad/mnm_tfjs_me_test/model.json", 
                                       modelName:"MeshNet GMWM",  
                                       description: ""
                                  },
                                  {
                                       id: "2", 
                                       type: "Segmentation", 
                                       path:"./ModelToLoad/meshnet_dropout/mnm_dropout/model2.json", 
                                       modelName:"MeshNet Dropout GMWM",  
                                       description: ""
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




    //https://github.com/rii-mango/Papaya/wiki/Configuration
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
   


