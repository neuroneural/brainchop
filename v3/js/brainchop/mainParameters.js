/*
=========================================================
* Brainchop - v3.4.0
=========================================================

* Discription:  A user interface for whole brain segmentation
*               Input shape : [1, D, H, W, 1] e.g. [1, 38, 38, 38, 1]
*               Model : Meshnet or similar
*
* Authors:  Mohamed Masoud  and Sergey Plis  - 2024
=========================================================



=========================================================
           Brainchop for 3D Brain Segmentation
=========================================================*/



    //---------- initialize Globals-------//


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


    // Parameters  change with each inference
    var  allOutputSlices3DCC1DimArray = [];

    var outputSceneRendered = false, inputSceneRendered = false;
    var output_gui = {}, input_gui = {};




    var opts = {
            // General  settings for input shape  [batchSize, batch_D, batch_H, batch_W, numOfChan];
            batchSize:                            1, //How many batches are used during each inference iteration
            numOfChan:                            1, // num of channel of the input shape

            isColorEnable:                        true, // If false, grey scale will enabled
            isAutoColors:                         true, // If false, manualColorsRange will be in use
            bgLabelValue:                         0, // Semenatic Segmentation background label value

            drawBoundingVolume:                   false, // plot bounding volume used to crop the brain
            isBrainCropMaskBased:                 true, // Check if brain masking will be used for cropping & optional show or brain tissue will be used
            showPhase1Output:                     false, // This will load to papaya the output of phase-1 (ie. brain mask or brain tissue)

            isPostProcessEnable:                  true,  // If true 3D Connected Components filter will apply

            isContoursViewEnable:                 false, // If true 3D contours of the labeled regions will apply

            browserArrayBufferMaxZDim:            30, // This value depends on Memory available

            telemetryFlag:                        false, // Ethical and transparent collection of browser usage while adhering to security and privacy standards

            chartXaxisStepPercent:                10, // percent from total labels on Xaxis

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
                    GPU_Card: null, GPU_Card_Full:null, Status: null, CPU_Cores: null, Error_Type: null, Extra_Err_Info: null, Extra_Info: null, Which_Brainchop: null, Seq_Conv: null };



   // Inference Models, the ids must start from 1 in sequence
   var inferenceModelsList = [
                                  {
                                       id: 1,
                                       type: "Segmentation",
                                       path: "./models/model5_gw_ae/model.json",
                                       modelName: "\u26A1 Tissue GWM (light)",
                                       labelsPath: "./models/model5_gw_ae/labels.json",
                                       colorsPath: "./models/model5_gw_ae/colorLUT.json",
                                       preModelId: null, // Model run first e.g.  crop the brain   { null, 1, 2, ..  }
                                       preModelPostProcess: false, // If true, perform postprocessing to remove noisy regions after preModel inference generate output.
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference
                                       numOverlapBatches: 0, //Number of extra overlap batches for inference
                                       enableTranspose : true, // Keras and tfjs input orientation may need a tranposing step to be matched
                                       enableCrop: true, // For speed-up inference, crop brain from background before feeding to inference model to lower memory use.
                                       cropPadding: 2, // Padding size add to cropped brain
                                       autoThreshold: 0, // Threshold between 0 and 1, given no preModel and tensor is normalized either min-max or by quantiles. Will remove noisy voxels around brain
                                       enableQuantileNorm:  false, // Some models needs Quantile Normaliztion.
                                       filterOutWithPreMask: false, // Can be used to multiply final output with premodel output mask to crean noisy areas
                                       enableSeqConv: false, // For low memory system and low configuration, enable sequential convolution instead of last layer
                                       textureSize:  0, // Requested Texture size for the model, if unknown can be 0.
                                       warning: null, // Warning message to show when select the model.
                                       inferenceDelay: 100, // Delay in ms time while looping layers applying.
                                       description: "Gray and white matter segmentation model. Operates on full T1 image in a single pass, but uses only 5 filters per layer. Can work on integrated graphics cards but is barely large enough to provide good accuracy. Still more accurate than the subvolume model."
                                  }

                                 ,{
                                       id: 2,
                                       type: "Segmentation",
                                       path:"./models/model20chan3cls/model.json",
                                       modelName:"\u{1F52A} Tissue GWM (High Acc)",
                                       labelsPath: "./models/model20chan3cls/labels.json",
                                       colorsPath: "./models/model20chan3cls/colorLUT.json",
                                       preModelId: null, // Model run first e.g.  crop the brain   { null, 1, 2, ..  }
                                       preModelPostProcess: false, // If true, perform postprocessing to remove noisy regions after preModel inference generate output.
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference
                                       numOverlapBatches: 0, //Number of extra overlap batches for inference
                                       enableTranspose : true, // Keras and tfjs input orientation may need a tranposing step to be matched
                                       enableCrop: true, // For speed-up inference, crop brain from background before feeding to inference model to lower memory use.
                                       cropPadding: 0, // Padding size add to cropped brain
                                       autoThreshold: 0.2, // Threshold between 0 and 1, given no preModel and tensor is normalized either min-max or by quantiles. Will remove noisy voxels around brain
                                       enableQuantileNorm:  true, // Some models needs Quantile Normaliztion.
                                       filterOutWithPreMask: false, // Can be used to multiply final output with premodel output mask to crean noisy areas
                                       enableSeqConv: false, // For low memory system and low configuration, enable sequential convolution instead of last layer
                                       textureSize:  0, // Requested Texture size for the model, if unknown can be 0.
                                       warning: "This model may need dedicated graphics card.  For more info please check with Browser Resources <i class='fa fa-cogs'></i>.",
                                       inferenceDelay: 100, // Delay in ms time while looping layers applying.
                                       description: "Gray and white matter segmentation model. Operates on full T1 image in a single pass but needs a dedicated graphics card to operate. Provides the best accuracy with hard cropping for better speed"
                                  }

                                 ,{
                                       id: 3,
                                       type: "Segmentation",
                                       path:"./models/model20chan3cls/model.json",
                                       modelName:"\u{1F52A} Tissue GWM (High Acc, Low Mem)",
                                       labelsPath: "./models/model20chan3cls/labels.json",
                                       colorsPath: "./models/model20chan3cls/colorLUT.json",
                                       preModelId: null, // Model run first e.g.  crop the brain   { null, 1, 2, ..  }
                                       preModelPostProcess: false, // If true, perform postprocessing to remove noisy regions after preModel inference generate output.
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference
                                       numOverlapBatches: 0, //Number of extra overlap batches for inference
                                       enableTranspose : true, // Keras and tfjs input orientation may need a tranposing step to be matched
                                       enableCrop: true, // For speed-up inference, crop brain from background before feeding to inference model to lower memory use.
                                       cropPadding: 0, // Padding size add to cropped brain
                                       autoThreshold: 0.2, // Threshold between 0 and 1, given no preModel and tensor is normalized either min-max or by quantiles. Will remove noisy voxels around brain
                                       enableQuantileNorm:  true, // Some models needs Quantile Normaliztion.
                                       filterOutWithPreMask: false, // Can be used to multiply final output with premodel output mask to crean noisy areas
                                       enableSeqConv: true, // For low memory system and low configuration, enable sequential convolution instead of last layer
                                       textureSize:  0, // Requested Texture size for the model, if unknown can be 0.
                                       warning: "This model may need dedicated graphics card.  For more info please check with Browser Resources <i class='fa fa-cogs'></i>.",
                                       inferenceDelay: 100, // Delay in ms time while looping layers applying.
                                       description: "Gray and white matter segmentation model. Operates on full T1 image in a single pass but needs a dedicated graphics card to operate. Provides high accuracy and fit low memory available but slower"
                                  }



                                 ,{
                                       id: 4,
                                       type: "Atlas",
                                       path:"./models/model30chan18cls/model.json",
                                       modelName:"\u{1FA93} Subcortical + GWM (High Mem, Fast)",
                                       labelsPath: "./models/model30chan18cls/labels.json",
                                       colorsPath: "./models/model30chan18cls/colorLUT.json",
                                       preModelId: null,// Model run first e.g.  crop the brain  { null, 1, 2, ..  }
                                       preModelPostProcess: false, // If true, perform postprocessing to remove noisy regions after preModel inference generate output.
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference
                                       numOverlapBatches: 200, //Number of extra overlap batches for inference
                                       enableTranspose : true, // Keras and tfjs input orientation may need a tranposing step to be matched
                                       enableCrop: true, // For speed-up inference, crop brain from background before feeding to inference model to lower memory use.
                                       cropPadding: 0, // Padding size add to cropped brain
                                       autoThreshold: 0.2, // Threshold between 0 and 1, given no preModel and tensor is normalized either min-max or by quantiles. Will remove noisy voxels around brain
                                       enableQuantileNorm:  false, // Some models needs Quantile Normaliztion.
                                       filterOutWithPreMask: false, // Can be used to multiply final output with premodel output mask to crean noisy areas
                                       enableSeqConv: false, // For low memory system and low configuration, enable sequential convolution instead of last layer
                                       textureSize:  0, // Requested Texture size for the model, if unknown can be 0.
                                       warning: "This model may need dedicated graphics card.  For more info please check with Browser Resources <i class='fa fa-cogs'></i>.",  // Warning message to show when select the model.
                                       inferenceDelay: 100, // Delay in ms time while looping layers applying.
                                       description: "Parcellation of the brain into 17 regions: gray and white matter plus subcortical areas. This is a robust model able to handle range of data quality, including varying saturation, and even clinical scans. It may work on infant brains, but your mileage may vary."
                                  }

                                 ,{
                                       id: 5,
                                       type: "Atlas",
                                       path:"./models/model30chan18cls/model.json",
                                       modelName:"\u{1FA93} Subcortical + GWM (Low Mem, Slow)",
                                       labelsPath: "./models/model30chan18cls/labels.json",
                                       colorsPath: "./models/model30chan18cls/colorLUT.json",
                                       preModelId: null,// Model run first e.g.  crop the brain  { null, 1, 2, ..  }
                                       preModelPostProcess: false, // If true, perform postprocessing to remove noisy regions after preModel inference generate output.
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference
                                       numOverlapBatches: 200, //Number of extra overlap batches for inference
                                       enableTranspose : true, // Keras and tfjs input orientation may need a tranposing step to be matched
                                       enableCrop: true, // For speed-up inference, crop brain from background before feeding to inference model to lower memory use.
                                       cropPadding: 0, // Padding size add to cropped brain
                                       autoThreshold: 0.2, // Threshold between 0 and 1, given no preModel and tensor is normalized either min-max or by quantiles. Will remove noisy voxels around brain
                                       enableQuantileNorm:  false, // Some models needs Quantile Normaliztion.
                                       filterOutWithPreMask: false, // Can be used to multiply final output with premodel output mask to crean noisy areas
                                       enableSeqConv: true, // For low memory system and low configuration, enable sequential convolution instead of last layer
                                       textureSize:  0, // Requested Texture size for the model, if unknown can be 0.
                                       warning: "This model may need dedicated graphics card.  For more info please check with Browser Resources <i class='fa fa-cogs'></i>.",  // Warning message to show when select the model.
                                       inferenceDelay: 100, // Delay in ms time while looping layers applying.
                                       description: "Parcellation of the brain into 17 regions: gray and white matter plus subcortical areas. This is a robust model able to handle range of data quality, including varying saturation, and even clinical scans. It may work on infant brains, but your mileage may vary."
                                 }
       
                                 ,{
                                       id: 6,
                                       type: "Atlas",
                                       path:"./models/model18cls/model.json",
                                       modelName:"\u{1FA93} Subcortical + GWM (Low Mem, Faster)",
                                       labelsPath: "./models/model18cls/labels.json",
                                       colorsPath: "./models/model18cls/colorLUT.json",
                                       preModelId: null,  // model run first e.g.  Brain_Extraction  { null, 1, 2, ..  }
                                       preModelPostProcess: false, // If true, perform postprocessing to remove noisy regions after preModel inference generate output.
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference
                                       numOverlapBatches: 200, //Number of extra overlap batches for inference
                                       enableTranspose : true, // Keras and tfjs input orientation may need a tranposing step to be matched
                                       enableCrop: true, // For speed-up inference, crop brain from background before feeding to inference model to lower memory use.
                                       cropPadding: 0, // Padding size add to cropped brain
                                       autoThreshold: 0.2, // Threshold between 0 and 1, given no preModel and tensor is normalized either min-max or by quantiles. Will remove noisy voxels around brain
                                       enableQuantileNorm:  false, // Some models needs Quantile Normaliztion.
                                       filterOutWithPreMask: false, // Can be used to multiply final output with premodel output mask to crean noisy areas
                                       enableSeqConv: true, // For low memory system and low configuration, enable sequential convolution instead of last layer
                                       textureSize:  0, // Requested Texture size for the model, if unknown can be 0.
                                       warning: "This model may need dedicated graphics card.  For more info please check with Browser Resources <i class='fa fa-cogs'></i>.",  // Warning message to show when select the model.
                                       inferenceDelay: 100, // Delay in ms time while looping layers applying.
                                       description: "Parcellation of the brain into 17 regions: gray and white matter plus subcortical areas. This is a robust model able to handle range of data quality, including varying saturation, and even clinical scans. It may work on infant brains, but your mileage may vary."
                                 }

                                 ,{
                                       id: 7,
                                       type: "Atlas",
                                       path:"./models/model30chan18cls/model.json",
                                       modelName:"\u{1F52A}\u{1FA93} Subcortical + GWM (Failsafe, Less Acc)",
                                       labelsPath: "./models/model30chan18cls/labels.json",
                                       colorsPath: "./models/model30chan18cls/colorLUT.json",
                                       preModelId: 1,  // model run first e.g.  Brain_Extraction  { null, 1, 2, ..  }
                                       preModelPostProcess: false, // If true, perform postprocessing to remove noisy regions after preModel inference generate output.
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference
                                       numOverlapBatches: 200, //Number of extra overlap batches for inference
                                       enableTranspose : true, // Keras and tfjs input orientation may need a tranposing step to be matched
                                       enableCrop: true, // For speed-up inference, crop brain from background before feeding to inference model to lower memory use.
                                       cropPadding: 0, // Padding size add to cropped brain
                                       autoThreshold: 0, // Threshold between 0 and 1, given no preModel and tensor is normalized either min-max or by quantiles. Will remove noisy voxels around brain
                                       enableQuantileNorm:  false, // Some models needs Quantile Normaliztion.
                                       filterOutWithPreMask: false, // Can be used to multiply final output with premodel output mask to crean noisy areas
                                       enableSeqConv: false, // For low memory system and low configuration, enable sequential convolution instead of last layer
                                       textureSize:  0, // Requested Texture size for the model, if unknown can be 0.
                                       warning: "This model may need dedicated graphics card.  For more info please check with Browser Resources <i class='fa fa-cogs'></i>.",  // Warning message to show when select the model.
                                       inferenceDelay: 100, // Delay in ms time while looping layers applying.
                                       description: "Parcellation of the brain into 17 regions: gray and white matter plus subcortical areas. This is not a robust model, it may work on low data quality, including varying saturation, and even clinical scans. It may work also on infant brains, but your mileage may vary."
                                 }

                                 ,{
                                       id: 8,
                                       type: "Atlas",
                                       path:"./models/model30chan50cls/model.json",
                                       modelName:"\u{1F52A} Aparc+Aseg 50 (High Mem, Fast)",
                                       labelsPath: "./models/model30chan50cls/labels.json",
                                       colorsPath: "./models/model30chan50cls/colorLUT.json",
                                       preModelId: 1,// Model run first e.g.  crop the brain  { null, 1, 2, ..  }
                                       preModelPostProcess: false, // If true, perform postprocessing to remove noisy regions after preModel inference generate output.
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference
                                       numOverlapBatches: 200, //Number of extra overlap batches for inference
                                       enableTranspose : true, // Keras and tfjs input orientation may need a tranposing step to be matched
                                       enableCrop: true, // For speed-up inference, crop brain from background before feeding to inference model to lower memory use.
                                       cropPadding: 0, // Padding size add to cropped brain
                                       autoThreshold: 0, // Threshold between 0 and 1, given no preModel and tensor is normalized either min-max or by quantiles. Will remove noisy voxels around brain
                                       enableQuantileNorm:  true, // Some models needs Quantile Normaliztion.
                                       filterOutWithPreMask: false, // Can be used to multiply final output with premodel output mask to crean noisy areas
                                       enableSeqConv: false, // For low memory system and low configuration, enable sequential convolution instead of last layer
                                       textureSize:  0, // Requested Texture size for the model, if unknown can be 0.
                                       warning: "This model may need dedicated graphics card.  For more info please check with Browser Resources <i class='fa fa-cogs'></i>.",  // Warning message to show when select the model.
                                       inferenceDelay: 100, // Delay in ms time while looping layers applying.
                                       description: "This is a 50-class model, that segments the brain into the Aparc+Aseg Freesurfer Atlas but one where cortical homologues are merged into a single class."
                                  }

                                 ,{
                                       id: 9,
                                       type: "Atlas",
                                       path:"./models/model30chan50cls/model.json",
                                       modelName:"\u{1F52A} Aparc+Aseg 50 (Low Mem, Slow)",
                                       labelsPath: "./models/model30chan50cls/labels.json",
                                       colorsPath: "./models/model30chan50cls/colorLUT.json",
                                       preModelId: 1,// Model run first e.g.  crop the brain  { null, 1, 2, ..  }
                                       preModelPostProcess: false, // If true, perform postprocessing to remove noisy regions after preModel inference generate output.
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference
                                       numOverlapBatches: 200, //Number of extra overlap batches for inference
                                       enableTranspose : true, // Keras and tfjs input orientation may need a tranposing step to be matched
                                       enableCrop: true, // For speed-up inference, crop brain from background before feeding to inference model to lower memory use.
                                       cropPadding: 0, // Padding size add to cropped brain
                                       autoThreshold: 0, // Threshold between 0 and 1, given no preModel and tensor is normalized either min-max or by quantiles. Will remove noisy voxels around brain
                                       enableQuantileNorm:  true, // Some models needs Quantile Normaliztion.
                                       filterOutWithPreMask: false, // Can be used to multiply final output with premodel output mask to crean noisy areas
                                       enableSeqConv: true, // For low memory system and low configuration, enable sequential convolution instead of last laye
                                       textureSize:  0, // Requested Texture size for the model, if unknown can be 0.
                                       warning: "This model may need dedicated graphics card.  For more info please check with Browser Resources <i class='fa fa-cogs'></i>.",  // Warning message to show when select the model.
                                       inferenceDelay: 100, // Delay in ms time while looping layers applying.
                                       description: "This is a 50-class model, that segments the brain into the Aparc+Aseg Freesurfer Atlas but one where cortical homologues are merged into a single class. The model use sequential convolution for inference to overcome browser memory limitations but leads to longer computation time."
                                  }


                                 ,{
                                       id: 10,
                                       type: "Brain_Extraction",
                                       path: "./models/model5_gw_ae/model.json",
                                       modelName:"\u26A1 Extract the Brain (FAST)",
                                       labelsPath: null,
                                       colorsPath: null,
                                       preModelId: null, // Model run first e.g.  crop the brain  { null, 1, 2, ..  }
                                       preModelPostProcess: false, // If true, perform postprocessing to remove noisy regions after preModel inference generate output.
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference
                                       numOverlapBatches: 0, //Number of extra overlap batches for inference
                                       enableTranspose : true, // Keras and tfjs input orientation may need a tranposing step to be matched
                                       enableCrop: true, // For speed-up inference, crop brain from background before feeding to inference model to lower memory use.
                                       cropPadding: 2, // Padding size add to cropped brain
                                       autoThreshold: 0, // Threshold between 0 and 1, given no preModel and tensor is normalized either min-max or by quantiles. Will remove noisy voxels around brain
                                       enableQuantileNorm:  false, // Some models needs Quantile Normaliztion.
                                       filterOutWithPreMask: false, // Can be used to multiply final output with premodel output mask to crean noisy areas
                                       enableSeqConv: false, // For low memory system and low configuration, enable sequential convolution instead of last layer
                                       textureSize:  0,  // Requested Texture size for the model, if unknown can be 0.
                                       warning: null, // Warning message to show when select the model.
                                       inferenceDelay: 100, // Delay in ms time while looping layers applying.
                                       description: "Extract the brain fast model operates on full T1 image in a single pass, but uses only 5 filters per layer. Can work on integrated graphics cards but is barely large enough to provide good accuracy. Still more accurate than the failsafe version."
                                  }

                                 ,{
                                       id: 11,
                                       type: "Brain_Extraction",
                                       path: "./models/model11_gw_ae/model.json",
                                       modelName:"\u{1F52A} Extract the Brain (High Acc, Slow)",
                                       labelsPath: null,
                                       colorsPath: null,
                                       preModelId: 1, // Model run first e.g.  crop the brain  { null, 1, 2, ..  }
                                       preModelPostProcess: false, // If true, perform postprocessing to remove noisy regions after preModel inference generate output.
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference
                                       numOverlapBatches: 0, //Number of extra overlap batches for inference
                                       enableTranspose : true, // Keras and tfjs input orientation may need a tranposing step to be matched
                                       enableCrop: true, // For speed-up inference, crop brain from background before feeding to inference model to lower memory use.
                                       cropPadding: 2, // Padding size add to cropped brain
                                       autoThreshold: 0, // Threshold between 0 and 1, given no preModel and tensor is normalized either min-max or by quantiles. Will remove noisy voxels around brain
                                       enableQuantileNorm:  false, // Some models needs Quantile Normaliztion.
                                       filterOutWithPreMask: false, // Can be used to multiply final output with premodel output mask to crean noisy areas
                                       enableSeqConv: true, // For low memory system and low configuration, enable sequential convolution instead of last layer
                                       textureSize:  0,  // Requested Texture size for the model, if unknown can be 0.
                                       warning: "This model may need dedicated graphics card.  For more info please check with Browser Resources <i class='fa fa-cogs'></i>.",
                                       inferenceDelay: 100, // Delay in ms time while looping layers applying.
                                       description: "Extract the brain high accuracy model operates on full T1 image in a single pass, but uses only 11 filters per layer. Can work on dedicated graphics cards. Still more accurate than the fast version."
                                  }

                                 ,{
                                       id: 12,
                                       type: "Brain_Masking",
                                       path: "./models/model5_gw_ae/model.json",
                                       modelName:"\u26A1 Brain Mask (FAST)",
                                       labelsPath: null,
                                       colorsPath: null,
                                       preModelId: null,// Model run first e.g.  crop the brain  { null, 1, 2, ..  }
                                       preModelPostProcess: false, // If true, perform postprocessing to remove noisy regions after preModel inference generate output.
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference
                                       numOverlapBatches: 0, //Number of extra overlap batches for inference
                                       enableTranspose : true, // Keras and tfjs input orientation may need a tranposing step to be matched
                                       enableCrop: true, // For speed-up inference, crop brain from background before feeding to inference model to lower memory use.
                                       cropPadding: 2, // Padding size add to cropped brain
                                       autoThreshold: 0, // Threshold between 0 and 1, given no preModel and tensor is normalized either min-max or by quantiles. Will remove noisy voxels around brain
                                       enableQuantileNorm:  false, // Some models needs Quantile Normaliztion.
                                       filterOutWithPreMask: false, // Can be used to multiply final output with premodel output mask to crean noisy areas
                                       enableSeqConv: false, // For low memory system and low configuration, enable sequential convolution instead of last layer
                                       textureSize:  0, // Requested Texture size for the model, if unknown can be 0.
                                       warning: null, // Warning message to show when select the model.
                                       inferenceDelay: 100, // Delay in ms time while looping layers applying.
                                       description: "This fast masking model operates on full T1 image in a single pass, but uses only 5 filters per layer. Can work on integrated graphics cards but is barely large enough to provide good accuracy. Still more accurate than failsafe version."
                                  }

                                  ,{
                                       id: 13,
                                       type: "Brain_Masking",
                                       path: "./models/model11_gw_ae/model.json",
                                       modelName:"\u{1F52A} Brain Mask (High Acc, Low Mem)",
                                       labelsPath: null,
                                       colorsPath: null,
                                       preModelId: 1,// Model run first e.g.  crop the brain  { null, 1, 2, ..  }
                                       preModelPostProcess: false, // If true, perform postprocessing to remove noisy regions after preModel inference generate output.
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference
                                       numOverlapBatches: 0, //Number of extra overlap batches for inference
                                       enableTranspose : true, // Keras and tfjs input orientation may need a tranposing step to be matched
                                       enableCrop: true, // For speed-up inference, crop brain from background before feeding to inference model to lower memory use.
                                       cropPadding: 2, // Padding size add to cropped brain
                                       autoThreshold: 0, // Threshold between 0 and 1, given no preModel and tensor is normalized either min-max or by quantiles. Will remove noisy voxels around brain
                                       enableQuantileNorm:  false, // Some models needs Quantile Normaliztion.
                                       filterOutWithPreMask: false, // Can be used to multiply final output with premodel output mask to crean noisy areas
                                       enableSeqConv: true, // For low memory system and low configuration, enable sequential convolution instead of last layer
                                       textureSize:  0, // Requested Texture size for the model, if unknown can be 0.
                                       warning: "This model may need dedicated graphics card.  For more info please check with Browser Resources <i class='fa fa-cogs'></i>.",
                                       inferenceDelay: 100, // Delay in ms time while looping layers applying.
                                       description: "This masking model operates on full T1 image in a single pass, but uses 11 filters per layer. Can work on dedicated graphics cards. Still more accurate than fast version."
                                  }

                                 ,{
                                       id: 14,
                                       type: "Atlas",
                                       path:"./models/model21_104class/model.json",
                                       modelName:"\u{1F52A} Aparc+Aseg 104 (High Mem, Fast)",
                                       labelsPath: "./models/model21_104class/labels.json",
                                       colorsPath: "./models/model21_104class/colorLUT.json",
                                       preModelId: 1,  // model run first e.g.  Brain_Extraction  { null, 1, 2, ..  }
                                       preModelPostProcess: false, // If true, perform postprocessing to remove noisy regions after preModel inference generate output.
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference
                                       numOverlapBatches: 200, //Number of extra overlap batches for inference
                                       enableTranspose : true, // Keras and tfjs input orientation may need a tranposing step to be matched
                                       enableCrop: true, // For speed-up inference, crop brain from background before feeding to inference model to lower memory use.
                                       cropPadding: 0, // Padding size add to cropped brain
                                       autoThreshold: 0, // Threshold between 0 and 1, given no preModel and tensor is normalized either min-max or by quantiles. Will remove noisy voxels around brain
                                       enableQuantileNorm:  false, // Some models needs Quantile Normaliztion.
                                       filterOutWithPreMask: false, // Can be used to multiply final output with premodel output mask to crean noisy areas
                                       enableSeqConv: false, // For low memory system and low configuration, enable sequential convolution instead of last layer
                                       textureSize:  0, // Requested Texture size for the model, if unknown can be 0.
                                       warning: "This model may need dedicated graphics card.  For more info please check with Browser Resources <i class='fa fa-cogs'></i>.",  // Warning message to show when select the model.
                                       inferenceDelay: 100, // Delay in ms time while looping layers applying.
                                       description: "FreeSurfer aparc+aseg atlas 104 parcellate brain areas into 104 regions. It contains a combination of the Desikan-Killiany atlas for cortical area and also segmentation of subcortical regions."
                                  }

                                 ,{
                                       id: 15,
                                       type: "Atlas",
                                       path:"./models/model21_104class/model.json",
                                       modelName:"\u{1F52A} Aparc+Aseg 104 (Low Mem, Slow)",
                                       labelsPath: "./models/model21_104class/labels.json",
                                       colorsPath: "./models/model21_104class/colorLUT.json",
                                       preModelId: 1,  // model run first e.g.  Brain_Extraction  { null, 1, 2, ..  }
                                       preModelPostProcess: false, // If true, perform postprocessing to remove noisy regions after preModel inference generate output.
                                       isBatchOverlapEnable: false, //create extra overlap batches for inference
                                       numOverlapBatches: 200, //Number of extra overlap batches for inference
                                       enableTranspose : true, // Keras and tfjs input orientation may need a tranposing step to be matched
                                       enableCrop: true, // For speed-up inference, crop brain from background before feeding to inference model to lower memory use.
                                       cropPadding: 0, // Padding size add to cropped brain
                                       autoThreshold: 0, // Threshold between 0 and 1, given no preModel and tensor is normalized either min-max or by quantiles. Will remove noisy voxels around brain
                                       enableQuantileNorm:  false, // Some models needs Quantile Normaliztion.
                                       filterOutWithPreMask: false, // Can be used to multiply final output with premodel output mask to crean noisy areas
                                       enableSeqConv: true, // For low memory system and low configuration, enable sequential convolution instead of last layer
                                       textureSize:  0, // Requested Texture size for the model, if unknown can be 0.
                                       warning: "This model may need dedicated graphics card.  For more info please check with Browser Resources <i class='fa fa-cogs'></i>.",  // Warning message to show when select the model.
                                       inferenceDelay: 100, // Delay in ms time while looping layers applying.
                                       description: "FreeSurfer aparc+aseg atlas 104 parcellate brain areas into 104 regions. It contains a combination of the Desikan-Killiany atlas for cortical area and also segmentation of subcortical regions. The model use sequential convolution for inference to overcome browser memory limitations but leads to longer computation time. "
                                 }       


                            ];


   //--For use with three.js
   var outVolumeStatus = { out3DArr: null, totalVolume: 0, labelsHistoObj: null, colorLutObj: null, labelsObj: null};

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
