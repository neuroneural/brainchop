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

// (function(){
    //---------- initialize Globals-------//  

    var   allOutputSlices = [];
    var   maxLabel ;
    var   allOutputSlices2DCC = [];
    var   allOutputSlices3DCC = [];  
    var   allOutputSlices3DCC1DimArray = [];
    var   maxLabelPredicted ;   


    var opts = {
            // General  settings
            bgLabelValue:                         0,
            processingFlag:                       true,  
            batchSize:                            1,
            numOfChan:                            1, 
            isBatchOverlapEnable:                 true,

            batchDim:                             38, 
            num_of_Overlap_batches:               200

     }



   // Model
   ModelsList = [
                    {id: "1", type: "Segmenter",  description: ""},
                    {id: "2", type: "Segmenter",  description: ""}
                ];   


  
   var HeatmapRange = [
                       "#330000", "#FF0000", "#FF3333", "#FF6666", 
                       "#FF9999", "#FFB266", "#FFE5CC", "#FFFF66",
                       "#FFFFCC", "#FFFFFF", "#CCE5FF", "#99CCFF", 
                       "#66B2FF", "#3399FF", "#0080FF", "#0066CC", "#004C99"
                      ]  



   


// })();  