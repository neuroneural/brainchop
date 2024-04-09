/*
=========================================================
* Brainchop - v2.0.1
=========================================================

* Discription:  Pure Javascript code for 3D and 2D connected components
*
*
*
* Authors:  Mohamed Masoud  and Sergey Plis  - 2022
=========================================================



=========================================================
                3D/2D Connected Components
=========================================================*/

    /**
    * Get binary mask of slice data
    *
    * @since 1.0.0
    * @param {Array} sliceData- The array represents slice pixel values in 1D
    * @returns {Array} Returns binary mask in 1D
    * @example
    *
    * getBinaryMaskData1D([0,100,100, 0,255,255, .. ])
    * // => [0,1,1, 0,1,1, .. ]
    *
    */

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



    /**
    * Convert 1D binary data to 2D
    *
    * @since 1.0.0
    * @param {Array} binaryData1D- The array represents slice binary mask values in 1D
    * @param {number} imgHeight- Slice Height
    * @param {number} imgWidth - Slice Width
    * @returns {Array} Returns binary mask in 2D
    * @example
    *
    * convertBinaryDataTo2D([0,1,1, 0,0,1 ], 2, 3)
    *
    * // => [ [0,1,1],
    *         [0,0,1],
    *       ]
    *
    */

    function convertBinaryDataTo2D(binaryData1D, imgHeight, imgWidth) {
        let arr2D = [];
        for (let i = 0; i < binaryData1D.length; i += imgWidth) {
            let row = binaryData1D.slice(i, i + imgWidth);
            arr2D.push(row);
        }
        return arr2D;
    }

    /**
    * Add zero padding to 2D array e.g label2D
    * pad([[1,1],[1,1]]) means: 1 row of zeros befor, 1 row of zeros after,
    *                           1 col of zeros befor, 1 col of zeros after,
    * Ref: https://js.tensorflow.org/api/3.6.0/#pad
    *
    * @since 1.0.0
    * @param {Array} arr2d- The array can represents slice binary mask values in 2D
    * @returns {Array} Returns same input array with zero padding edges
    * @example
    *
    * addZeroPaddingTo2dArray( [ [1,0,1],
    *                            [0,0,1] ])
    *
    * // => [ [0,0,0,0,0],
    *         [0,1,0,1,0],
    *         [0,0,0,1,0],
    *         [0,0,0,0,0],
    *       ]
    *
    */

        function addZeroPaddingTo2dArray(arr2d) {
            let paddedArray = [];
            let width = arr2d[0].length;

            // Add a row of zeros at the top
            paddedArray.push(new Array(width + 2).fill(0));

            // Add a column of zeros at the start and end of each row
            for (let row of arr2d) {
                paddedArray.push([0, ...row, 0]);
            }

            // Add a row of zeros at the bottom
            paddedArray.push(new Array(width + 2).fill(0));

            return paddedArray;
        }


    /**
    * remove zero padding from 2D array e.g label2D
    * pad([[1,1],[1,1]]) means: 1 row of zeros befor, 1 row of zeros after,
    *                           1 col of zeros befor, 1 col of zeros after,
    *
    * @since 1.0.0
    * @param {Array} arr2d- The array can represents slice binary mask values in 2D
    * @returns {Array} Returns same input array without zero padding edges
    * @example
    *
    * removeZeroPaddingFrom2dArray( [ [0,0,0,0,0],
    *                                 [0,1,0,1,0],
    *                                 [0,0,0,1,0],
    *                                 [0,0,0,0,0],
    *                                             ])
    *
    * // => [ [1,0,1],
    *         [0,0,1],
    *       ]
    *
    */

    function removeZeroPaddingFrom2dArray(arr2d) {
        // Slice the array to remove the first and last rows and columns
        let unPaddedArray = arr2d.slice(1, arr2d.length - 1).map(row => {
            return row.slice(1, row.length - 1);
        });
        return unPaddedArray;
    }

  //////////////////////////////////////////////////////////////////////////////////////////////////
 /////////////                   2D Connected Components                          /////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

 // class ConnectCompFor2D extends basicImageProcessing {
 class ConnectCompFor2D {
     constructor () {
      this._equivalenceTabel = [];
      this._equivalenceTabel[0] = 0;
      this._maxLabel = 0;
     }

    _updateEquivalenceTable = (label, newLabel) => {
        this._equivalenceTabel[label] = newLabel;
    }

    _resetEquivalenceTable = () => {
       this._equivalenceTabel = [];
       this._equivalenceTabel[0] = 0;
    }


    /**
    * Adjust equivalence table for connected components finding. Recursive call  -- (refine)
    * adjust Equivalence table labels such that if eqvTabel[3] = 2 && eqvTabel[2] = 1 then eqvTabel[3] = 1
    *
    * @since 1.0.0
    * @param {number} labelIdx
    *
    */

    _adjustEquivalenceTable = (labelIdx) => {

        if(this._equivalenceTabel[labelIdx] != labelIdx) {
            this._equivalenceTabel[labelIdx] = this._adjustEquivalenceTable(this._equivalenceTabel[labelIdx]);
        }

        return this._equivalenceTabel[labelIdx];
    }


    /**
    *  Check neighbors of each pixel to assign proper label to current pixel in 2D slice  --(refine)
    *
    * @since 1.0.0
    * @param {Array} label- The 2D array represents slice labels, e.g label[row][col]
    * @param {number} row- Slice Height
    * @param {number} col - Slice Width
    * @param {number} maxLabel - Max label assginged to connected components task till this call
    * @returns {number} Returns smallest neighbor label or new incremental label if there is no neighbors with label
    * @example
    *
    * _checkNeighbors2D( [ [0,0,0,0],
    *                      [0,0,4,0],
    *                      [0,5,0,0],
    *                      [0,0,0,0] ], 2, 2, 5)
    * // => 4
    *
    */

    _checkNeighbors2D = (label, row, col, maxLabel) => {

        if ( label[row][col - 1] && label[row - 1][col]) {

              if(label[row][col - 1] == label[row - 1][col]) {
                 return label[row ][col - 1];

              } else {

                 let smallerLabel = ( label[row][col - 1] < label[row - 1][col] ) ? label[row][col - 1] : label[row - 1][col];
                 let largerLabel = ( label[row][col - 1] > label[row - 1][col] ) ? label[row][col - 1] : label[row - 1][col];
                 this._updateEquivalenceTable(largerLabel, smallerLabel);
                 return smallerLabel;
              }

        } else if ( label[row ][col - 1] ) {
            return label[row ][col - 1] ;
        } else if ( label[row - 1][col] ) {
            return label[row - 1][col];
        } else {
            this._updateEquivalenceTable(maxLabel+1, maxLabel+1);
            return maxLabel+1 ;
        }

    }



    /**
    * Get connected components For 2D slice -- (refine)
    *
    * @since 1.0.0
    * @param {Array} binaryMaskData2D- The array represents slice binary mask values in 2D, zero padding is needed.
    * @param {number} imgHeight- Slice Height
    * @param {number} imgWidth - Slice Width
    * @returns {Array} Returns Connected Components labels in 2D
    * @example
    *
    * getConComponentsFor2D( [ [0,0,0,0,0],[0,1,0,1,0],[0,0,0,0,0] ], 3, 5)
    *
    * // => [ [0,0,0,0,0],
    *         [0,1,0,2,0],
    *         [0,0,0,0,0]
    *       ]
    *
    */

    getConComponentsFor2D = (binaryMaskData2D, imgHeight, imgWidth) => {
        // initiat label
        let label1D = [];
        this._resetEquivalenceTable();
        for(let idx = 0; idx < imgHeight * imgWidth; idx++) {
                 label1D[idx] = 0;
        }

        let label2D = convertBinaryDataTo2D(label1D, imgHeight, imgWidth);

        let label2DwithPad = addZeroPaddingTo2dArray(label2D);
        let binaryMaskData2DwithPad = addZeroPaddingTo2dArray(binaryMaskData2D);


        // maxLabel initiation to zero, starting label for 2d and 3d labeling
        this._maxLabel = 0;

        // 1st pass
        for(let row = 1; row <= imgHeight; row++) {
            for(let col = 1; col <= imgWidth; col++) {

               if( binaryMaskData2DwithPad[row][col] != 0) {
                  label2DwithPad[row][col] = this._checkNeighbors2D(label2DwithPad, row, col, this._maxLabel)
                  if(this._maxLabel < label2DwithPad[row][col]) {
                     this._maxLabel = label2DwithPad[row][col];
                  }

               }
            }
        }


        label2D = removeZeroPaddingFrom2dArray(label2DwithPad);

        // adjust Equivalence table labels such that  eqvTabel[3] = 2 && eqvTabel[2] = 1 => eqvTabel[3] = 1
        for(let labelIdx = this._equivalenceTabel.length - 1; labelIdx > 0; labelIdx = labelIdx-1 ) {
            this._adjustEquivalenceTable (labelIdx);
        }

        // 2nd pass : relabeling the slice after eqvTable adjustment
        for(let row = 0; row < imgHeight; row++) {
            for(let col = 0; col < imgWidth; col++) {

               if( label2D[row][col] != 0) {
                    label2D[row][col] = this._equivalenceTabel[label2D[row][col]];
               }
            }
        }

        return   label2D;
    }




}



  //////////////////////////////////////////////////////////////////////////////////////////////////
 /////////////                   3D Connected Components                          /////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

class ConnectCompFor3D extends ConnectCompFor2D {

    /**
    * Find Max label resulted from applying 3D connected components.
    *
    * @since 1.0.0
    * @param {Array} label3D- The 3D array represents slices labels, e.g label3D[sliceIdx][row][col]
    * @param {number} sliceHeight- Slice Height
    * @param {number} sliceWidth - Slice Width
    * @param {number} numSlices - Total Number of slices (a.k.a z-dim)
    * @returns {number} Returns Maximum label found
    * @example
    *
    * getMaxLabelFor3D( [ [[0,0,0],[0,1,0]],[[0,2,0],[0,0,3]] ], 2, 3, 2)
    * // => 3
    *
    */

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


    /**
    * Find largest volume region with the label that has the maximum number of voxels resulted from applying 3D connected components.
    *
    * @since 1.0.0
    * @param {Array} label3D- The 3D array represents slices labels, e.g label3D[sliceIdx][row][col]
    * @param {number} sliceHeight- Slice Height
    * @param {number} sliceWidth - Slice Width
    * @param {number} numSlices - Total Number of slices aka z-dim
    * @returns {number} Returns Volume label that has maximum number of voxels
    * @example
    *
    * getMostFreqVolumeLabel3D( [ [[0,1,0],[0,1,0]],[[0,2,0],[0,0,3]] ], 2, 3, 2)
    * // => 1
    *
    */

    getMostFreqVolumeLabel3D = (label3D, sliceHeight, sliceWidth, numSlices) => {

        // Initiat connected component volumes to zeros
        let ccVolume = [];
        let maxCCLabel3D = this.getMaxLabelFor3D(label3D, sliceHeight, sliceWidth, numSlices)

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



    /**
    *  Check neighbors of each voxel to assign proper label to current voxel in two consecutive slices -- (refine)
    *
    * @since 1.0.0
    * @param {Array} label- The 2D array represents slice labels, e.g label[row][col]
    * @param {number} z_1PixelLabel- Previous slice pixel label value at same row and col
    * @param {number} row- Slice Height
    * @param {number} col - Slice Width
    * @param {number} maxLabel - Max label assginged to connected components task till this call
    * @returns {number} Returns smallest neighbor label or new incremental label if there is no neighbors with label
    * @example
    *
    * _checkNeighbors3D( [  [0,0, 0,0],
    *                      [0,0,17,0],
    *                      [0,18,0,0],
    *                      [0,0 ,0,0] ], 16 , 2, 2, 18)
    * // => 16
    *
    */


    _checkNeighbors3D = (label, z_1PixelLabel, row, col, maxLabel) => { //z_1PixelLabel same x,y pixel label of z-1 prev slice
          if ( label[row][col - 1] && label[row - 1][col] && z_1PixelLabel) {

                if( (label[row][col - 1] == label[row - 1][col]) && (label[row][col - 1] == z_1PixelLabel) ) {
                   return z_1PixelLabel;

                } else {

                   let smallLabel = ( label[row][col - 1] < label[row - 1][col] ) ? label[row][col - 1] : label[row - 1][col];
                   let smallestLabel = ( z_1PixelLabel < smallLabel ) ? z_1PixelLabel : smallLabel;
                   let largerLabel = ( label[row][col - 1] > label[row - 1][col] ) ? label[row][col - 1] : label[row - 1][col];
                   this._updateEquivalenceTable(largerLabel, smallestLabel);
                   this._updateEquivalenceTable(smallLabel, smallestLabel);
                   return smallestLabel;
                }

          } else if ( label[row][col - 1] && label[row - 1][col] ) {

              if(label[row][col - 1] == label[row - 1][col]) {
                 return label[row ][col - 1];

              } else {

                 let smallerLabel = ( label[row][col - 1] < label[row - 1][col] ) ? label[row][col - 1] : label[row - 1][col];
                 let largerLabel = ( label[row][col - 1] > label[row - 1][col] ) ? label[row][col - 1] : label[row - 1][col];
                 this._updateEquivalenceTable(largerLabel, smallerLabel);
                 return smallerLabel;
              }


          } else if ( label[row - 1][col] && z_1PixelLabel ) {

              if(label[row - 1][col] == z_1PixelLabel) {
                 return z_1PixelLabel;

              } else {

                 let smallerLabel = ( z_1PixelLabel < label[row - 1][col] ) ? z_1PixelLabel : label[row - 1][col];
                 let largerLabel = ( z_1PixelLabel > label[row - 1][col] ) ? z_1PixelLabel : label[row - 1][col];
                 this._updateEquivalenceTable(largerLabel, smallerLabel);
                 return smallerLabel;
              }

          } else if ( label[row][col - 1] && z_1PixelLabel ) {

              if( label[row][col - 1] == z_1PixelLabel ) {
                 return z_1PixelLabel;

              } else {

                 let smallerLabel = ( label[row][col - 1] < z_1PixelLabel ) ? label[row][col - 1] : z_1PixelLabel;
                 let largerLabel = ( label[row][col - 1] > z_1PixelLabel ) ? label[row][col - 1] : z_1PixelLabel;
                 this._updateEquivalenceTable(largerLabel, smallerLabel);
                 return smallerLabel;
              }

          } else if ( label[row ][col - 1] ) {
              return label[row ][col - 1] ;
          } else if ( label[row - 1][col] ) {
              return label[row - 1][col];
          } else if ( z_1PixelLabel) {
              return z_1PixelLabel;
          } else {
              this._updateEquivalenceTable(maxLabel+1, maxLabel+1);
              return maxLabel+1 ;
          }
    }


    /**
    * Get connected components For 3D Volume  --(refine)
    *
    * @since 1.0.0
    * @param {Array} volumeSlices- 2D array[sliceIdx][sliceHeight*sliceWidth] such that volumeSlices[i] gives slice data as 1d Array
    * @param {number} sliceHeight- Slice Height
    * @param {number} sliceWidth - Slice Width
    * @returns {Array} Returns 3D labels e.g. label3D[sliceIdx][row][col]
    * @example
    *
    * getConComponentsFor3DVolume( [ [0,0,0,0,0,128, 50 , 0 ,0,0,0,0],
    *                                [0,0,0,0,0, 0 , 90 , 0 ,0,0,0,0],
    *                                [0,0,0,0,0, 0 , 240,100,0,100,0,0] ], 3, 4)
    *
    * // => [ [ [0,0,0,0],
    *           [0,1,1,0],
    *           [0,0,0,0]],
    *
    *         [ [0,0,0,0],
    *           [0,0,1,0],
    *           [0,0,0,0]],
    *
    *         [ [0,0,0,0],
    *           [0,0,1,1],
    *           [0,2,0,0]],
    *       ]
    *
    */
    getConComponentsFor3DVolume = (volumeSlices, sliceHeight, sliceWidth) => {

          let binaryMaskData1D = [];
          let binaryMaskData2D = [];
          let label3D = [];

          for(let sliceIdx = 0; sliceIdx < volumeSlices.length; sliceIdx++) {

                binaryMaskData1D[sliceIdx] = getBinaryMaskData1D(volumeSlices[sliceIdx]); // binaryMaskData1D has values 0 or 1

                binaryMaskData2D[sliceIdx] = convertBinaryDataTo2D(binaryMaskData1D[sliceIdx], sliceHeight, sliceWidth);

                if(sliceIdx == 0) {
                    //Only called for once at begining with first slice
                    label3D[sliceIdx] = this.getConComponentsFor2D(binaryMaskData2D[sliceIdx], sliceHeight, sliceWidth);

                } else {
                    label3D[sliceIdx] = this._getConComponentsFor2Slices(binaryMaskData2D[sliceIdx], label3D[sliceIdx - 1], sliceHeight, sliceWidth);
                }

          }

          // 3d connected components third pass
          for(let sliceIdx = 0; sliceIdx < volumeSlices.length; sliceIdx++) {
              let row, col;
              for(row = 0; row < sliceHeight; row++) {
                  for(col = 0; col < sliceWidth; col++) {

                     if( label3D[sliceIdx][row][col] != 0) {
                          label3D[sliceIdx][row][col] = this._equivalenceTabel[label3D[sliceIdx][row][col]];
                     }
                  }
              }
          }

          return  label3D;
    }

    // For future use

    getConComponentsFor3DVolumeWithTimer = async(volumeSlices, sliceHeight, sliceWidth) => {

        const self = this;

        return new Promise((resolve, reject) => {
              document.getElementById("progressBarChild").parentElement.style.visibility = "visible";
              document.getElementById("progressBarChild").style.width = 0;

              let binaryMaskData1D = [];
              let binaryMaskData2D = [];
              let label3D = [];

              let sliceIdx = 0;

              let ccTimer = window.setInterval(function() {

                  binaryMaskData1D[sliceIdx] = getBinaryMaskData1D(volumeSlices[sliceIdx]); // binaryMaskData1D has values 0 or 1
                  binaryMaskData2D[sliceIdx] = convertBinaryDataTo2D(binaryMaskData1D[sliceIdx], sliceHeight, sliceWidth);

                  if(sliceIdx == 0) {
                        //Only called for once at begining with first slice
                      label3D[sliceIdx] = self.getConComponentsFor2D(binaryMaskData2D[sliceIdx], sliceHeight, sliceWidth);

                  } else {
                      label3D[sliceIdx] = self._getConComponentsFor2Slices(binaryMaskData2D[sliceIdx], label3D[sliceIdx - 1], sliceHeight, sliceWidth);
                  }


                  if(sliceIdx == (volumeSlices.length -1)) {
                      document.getElementById("progressBarChild").style.width = 0;
                      window.clearInterval( ccTimer );

                      // 3d connected components third pass
                      for(let sliceIdx = 0; sliceIdx < volumeSlices.length; sliceIdx++) {
                          let row, col;
                          for(row = 0; row < sliceHeight; row++) {
                              for(col = 0; col < sliceWidth; col++) {

                                 if( label3D[sliceIdx][row][col] != 0) {
                                      label3D[sliceIdx][row][col] = self._equivalenceTabel[label3D[sliceIdx][row][col]];
                                 }
                              }
                          }
                      }

                      resolve(label3D);
                  }

                  sliceIdx++;
                  document.getElementById("progressBarChild").style.width = (sliceIdx + 1)*100/volumeSlices.length + "%";

              }, 10); // timer delay

        })
    }



    /**
    * Get connected components For a Volume of 2 slices, current slice and previous slice.-- (refine)
    *
    * @since 1.0.0
    * @param {Array} binaryMaskData2D- 2D array[row][col] has the mask {0,1} values of the current selected slice
    * @param {Array} preSliceLabels- 2D array[row][col] has the previous slice labels
    * @param {number} imgHeight- Slice Height
    * @param {number} imgWidth - Slice Width
    * @returns {Array} Returns 2D labels e.g. label2D[row][col] of the current slice
    * @example
    *
    * equivalenceTabel = [];
    * equivalenceTabel[1] = 1;
    * _getConComponentsFor2Slices(  [[0,0,0,0,0],
    *                               [0,1,0,1,0],
    *                               [0,0,0,0,0]] , [[0,0,0,0,0],
    *                                               [0,0,0,1,0],
    *                                               [0,0,0,0,0]] , 3, 5);
    *
    * // => [ [0,0,0,0,0],
    *         [0,2,0,1,0],
    *         [0,0,0,0,0]
    *       ]
    *
    */


    _getConComponentsFor2Slices = (binaryMaskData2D, preSliceLabels, imgHeight, imgWidth) => {
        let label1D = [];
        // resetEquivalenceTable();
        for(let idx = 0; idx < imgHeight * imgWidth; idx++) {
             label1D[idx] = 0;
        }

        let label2D =   convertBinaryDataTo2D(label1D, imgHeight, imgWidth);

        // Add zero padding for cases where image has pixel value > 0  on borders
        // e.g. MRI is touching borders or there is noisy pixel with value > 0 at row 0 or column 0

        let label2DwithPad = addZeroPaddingTo2dArray(label2D);
        let binaryMaskData2DwithPad = addZeroPaddingTo2dArray(binaryMaskData2D);
        let preSliceLabelsWithPad = addZeroPaddingTo2dArray(preSliceLabels);

        for(let row = 1; row <= imgHeight; row++) {
            for(let col = 1; col <= imgWidth; col++) {

               if( binaryMaskData2DwithPad[row][col] != 0) {
                  label2DwithPad[row][col] = this._checkNeighbors3D(label2DwithPad, preSliceLabelsWithPad[row][col], row, col, this._maxLabel)
                  if(this._maxLabel < label2DwithPad[row][col]) {
                     this._maxLabel = label2DwithPad[row][col];
                  }

               }
            }
        }

        label2D = removeZeroPaddingFrom2dArray(label2DwithPad);

        // console.log("First pass label2D :", label2D);
        for(let labelIdx = this._equivalenceTabel.length - 1; labelIdx > 0; labelIdx = labelIdx-1 ) {
            this._adjustEquivalenceTable (labelIdx);
        }

        for(let row = 0; row < imgHeight; row++) {
            for(let col = 0; col < imgWidth; col++) {

               if( label2D[row][col] != 0) {
                    label2D[row][col] = this._equivalenceTabel[label2D[row][col]];
               }
            }
        }

        return   label2D;
    }


    /**
    * Find largest 3d region
    * Can be used for post processing the resulted labels from the inference model by removing noisy 3D regions, and keep only
    *
    * @since 1.0.0
    * @param {Array} volumeSlices- 2D array[sliceIdx][sliceHeight*sliceWidth] such that volumeSlices[i] gives slice data as 1d Array
    * @param {number} sliceHeight- Slice Height
    * @param {number} sliceWidth - Slice Width
    * @returns {Array} Returns 2D labels array volumeSlices[sliceIdx][sliceHeight*sliceWidth] after filtering noisy 3d regions
    * @example
    *
    * findLargest3dRegion( [ [0,0,0,0,  0,1,1,0,  0,0,0,0],
    *                        [0,0,0,0,  0,0,1,1,  0,0,0,0],
    *                        [0,0,0,0,  0,0,0,1,  0,1,1,0] ], 3, 4)
    *
    * // =>  [ [0,0,0,0,  0,1,1,0,  0,0,0,0],
    *          [0,0,0,0,  0,0,1,1,  0,0,0,0],
    *          [0,0,0,0,  0,0,0,1,  0,0,0,0]
    *        ]
    *
    */

     findLargest3dRegion = (volumeSlices, sliceHeight, sliceWidth) => {

          let label3D = [];

          label3D = this.getConComponentsFor3DVolume(volumeSlices, sliceHeight, sliceWidth);
          //-- label3D = await this.getConComponentsFor3DVolumeWithTimer(volumeSlices, sliceHeight, sliceWidth);

          // Filter only largest volumetric 3d region with the most voxels of same label and remove noisy smaller 3d regions
          let maxVolumeLabel =  this.getMostFreqVolumeLabel3D(label3D, sliceHeight, sliceWidth, volumeSlices.length);

          for(let sliceIdx = 0; sliceIdx < volumeSlices.length; sliceIdx++) {
                  //Get max volume mask
                  let row, col;
                  for(row = 0; row < sliceHeight; row++) {
                      for(col = 0; col < sliceWidth; col++) {
                         // remove nosiy smaller regions
                         if(label3D[sliceIdx][row][col] != maxVolumeLabel) {
                             label3D[sliceIdx][row][col] = 0;
                         } else {
                             //mask largest 3d volumatic region
                             label3D[sliceIdx][row][col] = 255;
                         }
                      }
                  }

                  let pixelIdx;

                  for(row = 0, pixelIdx = 0; row < sliceHeight; row++) {
                      for(col = 0; col < sliceWidth; col++, pixelIdx++) {
                         //Filter smaller regions original MRI data
                         if(label3D[sliceIdx][row][col] == 0) {
                            volumeSlices[sliceIdx][pixelIdx] = 0;
                         }

                      }
                  }
         }

         //-- Postprocess volumeSlices after remove noisy regions or smaller regions
         return volumeSlices;
     }

}
