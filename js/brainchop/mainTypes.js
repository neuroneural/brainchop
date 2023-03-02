/*
=========================================================
* Brainchop - v2.0.1
=========================================================

* Discription:  A user interface for whole brain segmentation
*               Input shape : [1, D, H, W, 1] e.g. [1, 38, 38, 38, 1]                
*               Model : Meshnet or similar     
*
* Authors:  Mohamed Masoud  and Sergey Plis  - 2022
=========================================================



=========================================================
           Brainchop for 3D Brain Segmentation
=========================================================*/  

/**
* Source:  https://github.com/petamoriken/float16
*
* @since 1.3.0
* @example
*
* arr = new Float16Array([1.0, 1.1, 1.2, 1.3]) 
*
* arr[1]
* // => 1.099
*
* arr.byteLength
* // => 8
*
* arr.buffer 
* // => ArrayBuffer { byteLength: 8 }
*
*
* @example
* isFloat16Array(new Float16Array(buffer)); 
* // => true
*/ 

  const {
    Float16Array, isFloat16Array, isTypedArray,
    getFloat16, setFloat16,
    hfround,
  } = float16;





/**
* Create buffer of type 'uint8'|'int8'|'uint16'|'int16'| 'float16'
*
* @since 1.3.0
* @param {Array} shape e.g. [2, 3, 4, 5] // 2 batches, each batch has 3 slices, each slice has 4 rows, each row has 5 columns 
* @param {string} dtype e.g. 'uint8'
* @param {Array} dataSync e.g. [1, 1, 0, 1] , must be 1D array
* @returns {TypedArray / tf.Tensor} Returns 
* @example
*
*
* b = new Buffer( [2,2,2,2], 'uint8',  Array.from({ length: 16 }, (v, i) => i)  )
*
* b.toTensor().print()
* // => Tensor
*    [[[[0 , 1 ],
*       [2 , 3 ]],
*
*      [[4 , 5 ],
*       [6 , 7 ]]],
*
*
*     [[[8 , 9 ],
*       [10, 11]],
*
*      [[12, 13],
*       [14, 15]]]]
*
*
* b = new Buffer( [2,2,2,2], 'float16',  Array.from({ length: 16 }, (v, i) => i).map((value) => value * 0.01)  )
* // => Tensor
*    [[[[0        , 0.0099945],
*       [0.019989 , 0.0299988]],
*
*      [[0.039978 , 0.0499878],
*       [0.0599976, 0.0699463]]],
*
*
*     [[[0.0799561, 0.0899658],
*       [0.0999756, 0.1099854]],
*
*      [[0.1199951, 0.1298828],
*       [0.1398926, 0.1499023]]]]
*
*/ 




class Buffer {
    constructor(shape, dtype = 'uint8', dataSync = [] ) {
        this.shape = shape; // buffer shape

        if(this.shape.length != 4) {
           throw "Shape Must be 4D";
        } 

        if( ! ( dtype === 'uint8' || dtype === 'int8' || dtype === 'uint16' || dtype === 'int16' || dtype === 'float16') ){
           throw "dtype not supported, must be 'uint8'|'int8'|'uint16'|'int16'| 'float16' ";
        }  

        if( ! Array.isArray(dataSync) ) {
           throw "Data Must be array";
        }                   

        if( Array.isArray(dataSync[0]) ) {
           throw "Data array Must be 1D";
        }

       this.numOfBatchs = this.shape[0]; // Total num of batches
       this.numOfSlices = this.shape[1]; // Num of slices per batch 
       this.numOfRows = this.shape[2]; //  Num of Rows per batch
       this.numOfCols = this.shape[3]; // Num of cols per batch

       this.dtype = dtype;

       if (dtype === 'uint8') {
           this.bytePerElement = Uint8Array.BYTES_PER_ELEMENT;
       } else if (dtype === 'int8') {
           this.bytePerElement = Int8Array.BYTES_PER_ELEMENT;
       } else if (dtype === 'uint16') {
           this.bytePerElement = Uint16Array.BYTES_PER_ELEMENT;
       } else if (dtype === 'int16') {
           this.bytePerElement = Int16Array.BYTES_PER_ELEMENT;
       } else if (dtype === 'float16') {
           this.bytePerElement = Float16Array.BYTES_PER_ELEMENT;
       }        

       this.bufferSizeBytes = this.shape[0] * this.shape[1] * this.shape[2] * this.shape[3] * this.bytePerElement;
       this.bufferSizeGigaBytes = this.bufferSizeBytes/(1024*1024*1024);
       // Strides  
       this.batchSize = this.numOfSlices  * this.numOfRows * this.numOfCols;
       this.sliceSize =  this.numOfRows * this.numOfCols;



       if( dataSync.length == 0) { // Uint16Array:  0 to 65535,  Uint8Array:  0 to 255

          this.buffer = new ArrayBuffer( this.bufferSizeBytes );

          if (dtype === 'uint8') {
              this.typedArrObj = new Uint8Array(this.buffer);
          } else if (dtype === 'int8') {
              this.typedArrObj = new Int8Array(this.buffer);
          } else if (dtype === 'uint16') {
              this.typedArrObj = new Uint16Array(this.buffer);
          } else if (dtype === 'int16') {
              this.typedArrObj = new Int16Array(this.buffer);
          } else if (dtype === 'float16') {
              this.typedArrObj = new Float16Array(this.buffer);
          }     

       } else {

          if (dtype === 'uint8') {
              this.typedArrObj =  Uint8Array.from(dataSync);
          } else if (dtype === 'int8') {
              this.typedArrObj =  Int8Array.from(dataSync);
          } else if (dtype === 'uint16') {
              this.typedArrObj =  Uint16Array.from(dataSync);
          } else if (dtype === 'int16') {
              this.typedArrObj =  Int16Array.from(dataSync);
          } else if (dtype === 'float16') {
              this.typedArrObj = new Float16Array(dataSync);
          }

       }

    }
 

   // batchIdx is index of batch, sliceIdx, rowIdx, colIdx for  the batch Dim. 
   // function map 4D dim to dataSync 1D dim 
   getVoxelOffset = (batchIdx, sliceIdx, rowIdx, colIdx) => { 
      let batchOffset =  batchIdx * this.batchSize;

      let sliceOffset =  sliceIdx * this.sliceSize;

      let rowOffset  = rowIdx * this.numOfCols;

      let offset = batchOffset + sliceOffset + rowOffset + colIdx;

      return offset;

   }

   set = (value, batchIdx, sliceIdx, rowIdx, colIdx) => { // N is number of batches, D,H,W are the batch Dim. 
      let offset  =  this.getVoxelOffset(batchIdx, sliceIdx, rowIdx, colIdx);
      this.typedArrObj[offset] = value;
   }


   get = (batchIdx, sliceIdx, rowIdx, colIdx) => { // N is number of batches, D,H,W are the batch Dim. 
      let offset  =  this.getVoxelOffset(batchIdx, sliceIdx, rowIdx, colIdx);
      return this.typedArrObj[offset];
   }


   toTensor = () => {
       return tf.tensor([...this.typedArrObj], this.shape);
    } 

 }