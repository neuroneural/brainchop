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
         Util Functions Unit Test (Mocha)
=========================================================*/ 


describe("Main Util Functions", function () {

  describe('#labelMax()', function () {
    it('return max', function () {
       expect( labelMax( [1,2,3]) ).to.equal(3);
    });
  });

  describe('#arrValuesFreq()', function () {
    it('return frequence of  array unique values', function () {
       expect( arrValuesFreq( [2, 2, 2, 2, 3]) ).to.be.a('map');
    });
  });  

  describe('#map2Object()', function () {
    it('convert map to  JSON object, and it needs JS ES6', function () {
       expect( map2Object(  new Map().set('a', 1).set('b', 2) ) ).to.eql({ a: 1, b: 2 });
    });
  });   

});  