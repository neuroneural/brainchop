/*
=========================================================
* Brainchop - v1.4.0 - ((------Testing-------))
=========================================================
* Discription:  A user interface for whole brain segmentation
*               Input shape : [1, D, H, W, 1] e.g. [1, 256, 256, 256, 1]                
*               Model : Meshnet or similar     
*
* Authors:  Mohamed Masoud  and Sergey Plis  - 2023
=========================================================
=========================================================
         Main MeshNet Functions Unit Test (Mocha)
=========================================================*/ 


describe("Main Brainchop Functions", function () {
  describe('#generateColors()', function () {
    it('return  colors array of string', function () {
       expect(generateColors(100, 50,  3)).to.eql([ "hsla(0,100%,50%)", "hsla(120,100%,50%)", "hsla(240,100%,50%)" ]);
    });
  });

  describe('#getRgbObject()', function () {
    it('return RGB string as object', function () {
       expect(getRgbObject( "rgb(255,0,0)" )).to.eql({ r: 255, g: 0, b: 0 });
    });
  });

  describe('#hslToRgb()', function () {
    it('return HSL conversion to RGB as string', function () {
       expect(hslToRgb( "hsla(0,100%,50%)" )).to.equal("rgb(255,0,0)");
    });
  });

  describe('#rgbToHex()', function () {
    it('return RGB conversion to HEX as string', function () {
       expect(rgbToHex( { r: 255, g: 0, b: 0 } )).to.equal("#ff0000");
    });
  });

  describe('#intersect()', function () {
    it('return intersection 1D array ', function () {
       expect(intersect([0,1,1], [0,2,2])).to.eql([0]);
    });
  });

  describe('#diceCoefficient()', function () {
    it('return dice Coefficient number', function () {
       expect(diceCoefficient([0,1,1], [0,2,2]).toFixed(1)).to.equal('0.3');
    });
  });

  describe('#intersect()', function () {
    it('return intersection 1D array ', function () {
       expect(intersect([0,1,1], [0,2,2])).to.eql([0]);
    });
  });

  describe('#getMaxRegionMaskByContour()', function () {
    it('return  contour pixels value as Uint8Array ', function () {
       expect(getMaxRegionMaskByContour({ width: 1, height: 1, data:[0, 0, 0, 0]}) ).to.be.an('Uint8Array');
    });
  });  

  describe('#postProcessSlices3D()', function () {
    it('return 2D labels array outputSlices after filtering noisy 3d regions ', function () {
       expect(postProcessSlices3D( [ [0,0,0,0,  0,1,1,0,  0,0,0,0],
                       [0,0,0,0,  0,0,1,1,  0,0,0,0],
                       [0,0,0,0,  0,0,0,1,  0,1,1,0] ], 3, 4)).to.eql([ [0,0,0,0,  0,1,1,0,  0,0,0,0],
                                                                        [0,0,0,0,  0,0,1,1,  0,0,0,0],
                                                                        [0,0,0,0,  0,0,0,1,  0,0,0,0] 
                                                                      ]);
    });
  });

  describe('#randn_bm()', function () {
    it('return Standard Normal variate using Box-Muller transformation ', function () {
       expect(randn_bm()).to.be.a('number') ;
    });
  });


  describe('#checkInside()', function () {
    it('return true or false  ', function () {
       expect( checkInside([100,150,100], [256,256,256], [38,38,38]) ).to.be.true;
    });
  });

  describe('#findCoordsOfAddBrainBatches()', function () {
    it('return all generated coords ', function () {
       expect(findCoordsOfAddBrainBatches(200, [ 123, 145, 127 ], 
                                               [ 1454.45, 1099.23, 1178.78 ],  
                                               [256,256,256], [38,38,38])).to.be.an('array');
    });
  });  

  describe('#binarizeVolumeDataTensor()', function () {
    it('return binary value tensor {0,1} ', function () {
        expect( binarizeVolumeDataTensor(tf.tensor1d([0, 2, -1, -3])).arraySync() ).to.eql([0, 1, 0, 0]);
    });
  });

  describe('#tensor2Buffer()', function () {
    it('return mutable tf.buffer object ', function () {
       expect(tensor2Buffer(  tf.tensor1d( [0, 2, -1, -3] ) )).to.be.an('object');
    });
  }); 

  describe('#tensor2Array()', function () {
    it('return mutable  single/multi dimensional array ', function () {
       expect( tensor2Array(  tf.tensor( [1,2,3,4,5,6,7,8], [2, 2, 2] ) ) ).to.eql([ [ [1,2],   [3,4] ],  [ [5,6],    [7,8] ]   ]);
    });
  });

  describe('#tensor2FlattenArray()', function () {
    it('return mutable  flatten 1D dimensional array ', function () {
       expect(  tensor2FlattenArray(  tf.tensor( [1,2,3,4,5,6,7,8], [2, 2, 2] ) ) ).to.eql([ 1, 2, 3, 4, 5, 6, 7, 8 ]);
    });
  }); 
 
  describe('#cubeMoments()', function () {
    it('return [meanArray, varArray] ', function () {
       expect( cubeMoments(  tf.tensor( [1,2,3,4,5,6,7,8], [2, 2, 2] ) , 0.5) ).to.eql([[0, 0, 0],[0.25, 0.25, 0.25]]);
    });
  });  

  describe('#findHeadCentroid()', function () {
    it('return  centroid voxel Array [d, h, w] ', function () {
       expect( findHeadCentroid(  tf.tensor( Array.from({length: 27}, (x, i) => i) , [3, 3, 3] ), 3, 3, 3 ) ).to.eql([ 1, 1, 1 ]);
    });
  });

  describe('#sliceVolumeIntoOverlappedBatches()', function () {
    it('return array of objects for all overlap batches ', function () {
       expect( sliceVolumeIntoOverlappedBatches(  tf.tensor( Array.from({length: 27}, (x, i) => i) , [3, 3, 3] ), 3, 3, 3, 2, 2, 2, [] ) ).to.be.an('array');
    });
  }); 

  describe('#sliceVolumeIntoBatches()', function () {
    it('return array of objects for all slices batch ', function () {
       expect( sliceVolumeIntoBatches(  tf.tensor( Array.from({length: 27}, (x, i) => i) , [3, 3, 3] ), 3, 3, 3, 2, 2, 2, [] ) ).to.be.an('array');
    });
  });  

  describe('#getAllSlices2D()', function () {
    it('return all slices data where each slice data is tensor2d', function () {
       expect( getAllSlices2D([ [0,0,0,255,255,255,255,255,255,0,0,0], 
                                [0,0,0,255,255,255,255,255,255,0,0,0] ], 4, 3)[0].arraySync() ).to.eql(
                                                                                              [[0  , 0  , 0  ],
                                                                                               [255, 255, 255],
                                                                                               [255, 255, 255],
                                                                                               [0  , 0  , 0  ]] );
    });
  }); 

  describe('#getSlices3D()', function () {
    it('return Tensor of all slices data in 3D ', function () {
       expect( getSlices3D([ tf.tensor( Array.from({length: 4}, (x, i) => i) , [2, 2]),  
                                tf.tensor( Array.from({length: 4}, (x, i) => i) , [2, 2]) ]).arraySync() ).to.eql( [[[0, 1],[2, 3]],[[0, 1],[2, 3]]] );
    });
  }); 

  describe('#normalizeVolumeData()', function () {
    it('return a tensor of all normalized data  ', function () {
       expect( normalizeVolumeData (  tf.tensor( Array.from({length: 8}, (x, i) => i) , [2, 2, 2]) ).arraySync()[0][0][1].toFixed(5) ).to.equal('0.14286');      
    });
  }); 

  describe('#findBufferThreBinIdx()', function () {
    it('return buffer index that has label value ', function () {
       expect( findBufferThreBinIdx( [3, 6], 3)  ).to.equal(1);
    });
  });

  describe('#isLetter()', function () {
    it('return true or false ', function () {
       expect( isLetter("A") ).to.be.true;
    });
  });  

  describe('#findArrayMax()', function () {
    it('return max array value ', function () {
       expect( findArrayMax([3, 0, 2]) ).to.equal(3);
    });
  });

  describe('#checkZero()', function () {
    it('return time value as one digit or two ', function () {
       expect(  checkZero( 2 ) ).to.equal(2);
    });
  });      

  describe('#accumulateArrBufSizes()', function () {
    it('return accumulated 1D array ', function () {
       expect( accumulateArrBufSizes( [ 100, 100, 100, 99] ) ).to.eql([ 100, 200, 300, 399 ]);
    });
  });      

  describe('#removeZeroPaddingFrom3dTensor()', function () {
    it('return same input tensor without zero padding margins ', function () {
       expect( removeZeroPaddingFrom3dTensor( array2Tensor( [[[0, 0, 0, 0],
                                                              [0, 0, 0, 0],
                                                              [0, 0, 0, 0],
                                                              [0, 0, 0, 0]],

                                                             [[0, 0, 0, 0],
                                                              [0, 0, 1, 0],
                                                              [0, 2, 3, 0],
                                                              [0, 0, 0, 0]],

                                                             [[0, 0, 0, 0],
                                                              [0, 4, 5, 0],
                                                              [0, 6, 7, 0],
                                                              [0, 0, 0, 0]],

                                                             [[0, 0, 0, 0],
                                                              [0, 0, 0, 0],
                                                              [0, 0, 0, 0],
                                                              [0, 0, 0, 0]]] )).arraySync()).to.eql(  [[[0, 1], [2, 3]], [[4, 5], [6, 7]]] );
    });
  });

  describe('#addZeroPaddingTo3dTensor()', function () {
    it('return same input tensor with zero padding margins ', function () {
       expect( addZeroPaddingTo3dTensor (   tf.tensor([0, 1, 2, 3, 4, 5, 6, 7, ], [2,2,2]) ).arraySync() ).to.eql(
                                                                                                        [[[0, 0, 0, 0],
                                                                                                          [0, 0, 0, 0],
                                                                                                          [0, 0, 0, 0],
                                                                                                          [0, 0, 0, 0]],

                                                                                                         [[0, 0, 0, 0],
                                                                                                          [0, 0, 1, 0],
                                                                                                          [0, 2, 3, 0],
                                                                                                          [0, 0, 0, 0]],

                                                                                                         [[0, 0, 0, 0],
                                                                                                          [0, 4, 5, 0],
                                                                                                          [0, 6, 7, 0],
                                                                                                          [0, 0, 0, 0]],

                                                                                                         [[0, 0, 0, 0],
                                                                                                          [0, 0, 0, 0],
                                                                                                          [0, 0, 0, 0],
                                                                                                          [0, 0, 0, 0]]]  
        );
    });
  });  
  
  describe('#resizeWithZeroPadding()', function () {
    it('return resized cropped 3d tensor to original size with  zero padding filling ', function () {
      expect(resizeWithZeroPadding(tf.tensor([0, 1, 2, 3, 4, 5, 6, 7, ], 
                                             [2,2,2]), 4, 4, 4, [1, 1, 1], [2, 2, 2]).arraySync() ).to.eql(
                                                                                                        [[[0, 0, 0, 0],
                                                                                                          [0, 0, 0, 0],
                                                                                                          [0, 0, 0, 0],
                                                                                                          [0, 0, 0, 0]],

                                                                                                         [[0, 0, 0, 0],
                                                                                                          [0, 0, 1, 0],
                                                                                                          [0, 2, 3, 0],
                                                                                                          [0, 0, 0, 0]],

                                                                                                         [[0, 0, 0, 0],
                                                                                                          [0, 4, 5, 0],
                                                                                                          [0, 6, 7, 0],
                                                                                                          [0, 0, 0, 0]],

                                                                                                         [[0, 0, 0, 0],
                                                                                                          [0, 0, 0, 0],
                                                                                                          [0, 0, 0, 0],
                                                                                                          [0, 0, 0, 0]]]  
        );
    });
  });

  describe('#get3dObjectBoundingVolume()', function () {
    it('return promise with result has minVoxelCoord Array, maxVoxelCoord Array , boundVolSize Array. ', function () {
      expect( get3dObjectBoundingVolume(  array2Tensor (  [[[0, 0, 0, 0],
                                                            [0, 0, 0, 0],
                                                            [0, 0, 0, 0],
                                                            [0, 0, 0, 0]],

                                                           [[0, 0, 0, 0],
                                                            [0, 0, 1, 0],
                                                            [0, 2, 3, 0],
                                                            [0, 0, 0, 0]],

                                                           [[0, 0, 0, 0],
                                                            [0, 4, 5, 0],
                                                            [0, 6, 7, 0],
                                                            [0, 0, 0, 0]],

                                                           [[0, 0, 0, 0],
                                                            [0, 0, 0, 0],
                                                            [0, 0, 0, 0],
                                                            [0, 0, 0, 0]]]  ))).to.be.a('promise')
        
    });
  });    

});
