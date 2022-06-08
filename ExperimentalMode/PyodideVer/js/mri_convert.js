/*
=========================================================
* Brainchop - v1.0.0
=========================================================

* Discription:  A user interface for whole brain segmentation
*               Input shape : [1, D, H, W, 1] e.g. [1, 38, 38, 38, 1]
*               Model : Meshnet or similar
*
* Authors:  Mohamed Masoud
*
* Credit: Martin Reuter (https://github.com/m-reuter)
*         for originally coding conform.py in https://github.com/Deep-MI/FastSurfer
=========================================================



=========================================================
                   mri_convert.js
=========================================================*/
//--------------------------------------------------------------------------------//
//-- Inspired from NIFTI-Reader-JS  https://github.com/rii-mango/NIFTI-Reader-JS--//
//------------ Credit: Michael Martinez  https://github.com/martinezmj------------//
//--------------------------------------------------------------------------------//


//--https://nifti.nimh.nih.gov/pub/dist/src/niftilib/nifti1.h
/*! \struct nifti_1_header
    \brief Data structure defining the fields in the nifti1 header.
           This binary header should be found at the beginning of a valid
           NIFTI-1 header file.
           sizeof(int) = sizeof(float) = 4 ;  sizeof(short) = 2
 */
                        /*************************/  /************************/
//struct nifti_1_header { /* NIFTI-1 usage         */  /* ANALYZE 7.5 field(s) */
                        /*************************/  /************************/

                                           /*--- was header_key substruct ---*/
// int   sizeof_hdr;    /*!< MUST be 348           */  /* int sizeof_hdr;      */
// char  data_type[10]; /*!< ++UNUSED++            */  /* char data_type[10];  */
// char  db_name[18];   /*!< ++UNUSED++            */  /* char db_name[18];    */
// int   extents;       /*!< ++UNUSED++            */  /* int extents;         */
// short session_error; /*!< ++UNUSED++            */  /* short session_error; */
// char  regular;       /*!< ++UNUSED++            */  /* char regular;        */
// char  dim_info;      /*!< MRI slice ordering.   */  /* char hkey_un0;       */

                                      /*--- was image_dimension substruct ---*/
// short dim[8];        /*!< Data array dimensions.*/  /* short dim[8];        */
// float intent_p1 ;    /*!< 1st intent parameter. */  /* short unused8;       */
                                                     /* short unused9;       */
// float intent_p2 ;    /*!< 2nd intent parameter. */  /* short unused10;      */
                                                     /* short unused11;      */
// float intent_p3 ;    /*!< 3rd intent parameter. */  /* short unused12;      */
                                                     /* short unused13;      */
// short intent_code ;  /*!< NIFTI_INTENT_* code.  */  /* short unused14;      */
// short datatype;      /*!< Defines data type!    */  /* short datatype;      */
// short bitpix;        /*!< Number bits/voxel.    */  /* short bitpix;        */
// short slice_start;   /*!< First slice index.    */  /* short dim_un0;       */
// float pixdim[8];     /*!< Grid spacings.        */  /* float pixdim[8];     */
// float vox_offset;    /*!< Offset into .nii file */  /* float vox_offset;    */
// float scl_slope ;    /*!< Data scaling: slope.  */  /* float funused1;      */
// float scl_inter ;    /*!< Data scaling: offset. */  /* float funused2;      */
// short slice_end;     /*!< Last slice index.     */  /* float funused3;      */
// char  slice_code ;   /*!< Slice timing order.   */
// char  xyzt_units ;   /*!< Units of pixdim[1..4] */
// float cal_max;       /*!< Max display intensity */  /* float cal_max;       */
// float cal_min;       /*!< Min display intensity */  /* float cal_min;       */
// float slice_duration;/*!< Time for 1 slice.     */  /* float compressed;    */
// float toffset;       /*!< Time axis shift.      */  /* float verified;      */
// int   glmax;         /*!< ++UNUSED++            */  /* int glmax;           */
// int   glmin;         /*!< ++UNUSED++            */  /* int glmin;           */

                                         /*--- was data_history substruct ---*/
// char  descrip[80];   /*!< any text you like.    */  /* char descrip[80];    */
// char  aux_file[24];  /*!< auxiliary filename.   */  /* char aux_file[24];   */

// short qform_code ;   /*!< NIFTI_XFORM_* code.   */  /*-- all ANALYZE 7.5 ---*/
// short sform_code ;   /*!< NIFTI_XFORM_* code.   */  /*   fields below here  */
                                                     /*   are replaced       */
// float quatern_b ;    /*!< Quaternion b param.   */
// float quatern_c ;    /*!< Quaternion c param.   */
// float quatern_d ;    /*!< Quaternion d param.   */
// float qoffset_x ;    /*!< Quaternion x shift.   */
// float qoffset_y ;    /*!< Quaternion y shift.   */
// float qoffset_z ;    /*!< Quaternion z shift.   */

// float srow_x[4] ;    /*!< 1st row affine transform.   */
// float srow_y[4] ;    /*!< 2nd row affine transform.   */
// float srow_z[4] ;    /*!< 3rd row affine transform.   */

// char intent_name[16];/*!< 'name' or meaning of data.  */

// char magic[4] ;      /*!< MUST be "ni1\0" or "n+1\0". */

//} ;                   /**** 348 bytes total ****/



/*---------------------------------------------------------------------------*/
//--Source: https://nifti.nimh.nih.gov/pub/dist/doc/nifti2.h
/* Changes to the header from NIFTI-1 to NIFTI-2 are intended to allow for
   larger and more accurate fields.  The changes are as follows:

      - short dim[8]         -> int64_t dim[8]
      - float intent_p1,2,3  -> double intent_p1,2,3    (3 fields)
      - float pixdim[8]      -> double pixdim[8]
      - float vox_offset     -> int64_t vox_offset
      - float scl_slope      -> double scl_slope
      - float scl_inter      -> double scl_inter
      - float cal_max        -> double cal_max
      - float cal_min        -> double cal_min
      - float slice_duration -> double slice_duration
      - float toffset        -> double toffset
      - short slice_start    -> int64_t slice_start
      - short slice_end      -> int64_t slice_end
      - char slice_code      -> int32_t slice_code
      - char xyzt_units      -> int32_t xyzt_units
      - short intent_code    -> int32_t intent_code
      - short qform_code     -> int32_t qform_code
      - short sform_code     -> int32_t sform_code
      - float quatern_b,c,d  -> double quatern_b,c,d    (3 fields)
      - float srow_x,y,z[4]  -> double srow_x,y,z[4]    (3 fields)
      - char magic[4]        -> char magic[8]
      - char unused_str[15]  -> padding added at the end of the header

      - previously unused fields have been removed:
           data_type, db_name, extents, session_error, regular, glmax, glmin

      - the field ordering has been changed
-----------------------------------------------------------------------------*/

//-- littleEndian : true or false

setByteAt =  (dataView, start, value, littleEndian)  => {
     dataView.setInt8(start, value, littleEndian);
};

setShortAt =  (dataview, start, value, littleEndian)  => {
    dataView.setInt16(start, value, littleEndian);
};

setIntAt =  (dataview, start, value, littleEndian)  => {
    dataView.setInt32(start, value, littleEndian);
};


setFloatAt =  (dataview, start, value, littleEndian)  => {
    dataView.setFloat32(start, value, littleEndian);
};


setDoubleAt =  (dataview, start, value, littleEndian)  => {
    dataView.setFloat64(start, value, littleEndian);
};




/**
 * modify Nifti-1 header data.
 * @param {ArrayBuffer} ArrBuf e.g. rawNiftiData
 * @param {object} newHdrObj e.g. {'dim_info': 0, 'dims': [..], ..}
 * @return {ArrayBuffer}
 */

modifyNifti1_Header = (ArrBuf, newHdrObj) =>  {

    dataView = new DataView(ArrBuf);
    //--dataView:  DataView { buffer: ArrayBuffer, byteLength: xx, byteOffset: 0 }

    let littleEndian = false;

    let magicCookieVal = nifti.Utils.getIntAt(dataView, 0, littleEndian);

    if (magicCookieVal !== nifti.NIFTI1.MAGIC_COOKIE) {  // try as little endian
        littleEndian = true;
        magicCookieVal = nifti.Utils.getIntAt(dataView, 0, littleEndian);
    }

    if (magicCookieVal !== nifti.NIFTI1.MAGIC_COOKIE) {
        throw new Error("This does not appear to be a NIFTI file!");
    }

    setByteAt(dataView, 39, newHdrObj['dim_info'], littleEndian);

    for (let ctr = 0; ctr < 8; ctr += 1) {
        let index = 40 + (ctr * 2);
        setShortAt(dataView, index, newHdrObj.dims[ctr], littleEndian);
    }


    setShortAt(dataView, 68, newHdrObj['intent_code'], littleEndian);

    setShortAt(dataView, 70, newHdrObj['datatypeCode'], littleEndian);

    setShortAt(dataView, 72, newHdrObj['numBitsPerVoxel'], littleEndian);

    for (let ctr = 0; ctr < 8; ctr += 1) {
        let index = 76 + (ctr * 4);
        setFloatAt(dataView, index, newHdrObj.pixDims[ctr], littleEndian);
    }


    setByteAt(dataView, 123, newHdrObj['xyzt_units'], littleEndian);

    setShortAt(dataView, 252, newHdrObj['qform_code'], littleEndian);
    setShortAt(dataView, 254, newHdrObj['sform_code'], littleEndian);

    setFloatAt(dataView, 256, newHdrObj['quatern_b'], littleEndian);
    setFloatAt(dataView, 260, newHdrObj['quatern_c'], littleEndian);
    setFloatAt(dataView, 264, newHdrObj['quatern_d'], littleEndian);
    setFloatAt(dataView, 268, newHdrObj['qoffset_x'], littleEndian);
    setFloatAt(dataView, 272, newHdrObj['qoffset_y'], littleEndian);
    setFloatAt(dataView, 276, newHdrObj['qoffset_z'], littleEndian);

    for (let ctrOut = 0; ctrOut < 4; ctrOut += 1) {  //<< --------- changed ctrOut to < 4
        for (let ctrIn = 0; ctrIn < 4; ctrIn += 1) {
            let index = 280 + (((ctrOut * 4) + ctrIn) * 4);
            setFloatAt(dataView, index, newHdrObj.affine[ctrOut][ctrIn], littleEndian);
        }
    }


    return dataView.buffer;
};



/**
 * modify Nifti-2 header data.
 * @param {ArrayBuffer} ArrBuf e.g. rawNiftiData
 * @param {object} newHdrObj e.g. {'dim_info': 0, 'dims': [..], ..}
 * @return {ArrayBuffer}
 */

modifyNifti2_Header = (ArrBuf, newHdrObj) =>  {

    dataView = new DataView(ArrBuf);
    //--dataView:  DataView { buffer: ArrayBuffer, byteLength: xx, byteOffset: 0 }

    let littleEndian = false;

    let magicCookieVal = nifti.Utils.getIntAt(dataView, 0, littleEndian);

    if (magicCookieVal !== nifti.NIFTI2.MAGIC_COOKIE) {  // try as little endian
        littleEndian = true;
        magicCookieVal = nifti.Utils.getIntAt(dataView, 0, littleEndian);
    }

    if (magicCookieVal !== nifti.NIFTI2.MAGIC_COOKIE) {
        throw new Error("This does not appear to be a NIFTI file!");
    }

    setShortAt(dataView, 12, newHdrObj['datatypeCode'], littleEndian);
    setShortAt(dataView, 14, newHdrObj['numBitsPerVoxel'], littleEndian);

    for (let ctr = 0; ctr < 8; ctr += 1) {
        let index = 16 + (ctr * 8);
        setLongAt(dataView, index, newHdrObj.dims[ctr], littleEndian);
    }


    for (let ctr = 0; ctr < 8; ctr += 1) {
        let index = 104 + (ctr * 8);
        setDoubleAt(dataView, index, newHdrObj.pixDims[ctr], littleEndian);
    }



    setIntAt(dataView, 344, newHdrObj['qform_code'], littleEndian);
    setIntAt(dataView, 348, newHdrObj['sform_code'], littleEndian);

    setDoubleAt(dataView, 352, newHdrObj['quatern_b'], littleEndian);
    setDoubleAt(dataView, 360, newHdrObj['quatern_c'], littleEndian);
    setDoubleAt(dataView, 368, newHdrObj['quatern_d'], littleEndian);
    setDoubleAt(dataView, 376, newHdrObj['qoffset_x'], littleEndian);
    setDoubleAt(dataView, 384, newHdrObj['qoffset_y'], littleEndian);
    setDoubleAt(dataView, 392, newHdrObj['qoffset_z'], littleEndian);

    for (let ctrOut = 0; ctrOut < 4; ctrOut += 1) {  //<< --------- changed ctrOut to < 4
        for (let ctrIn = 0; ctrIn < 4; ctrIn += 1) {
            let index = 400 + (((ctrOut * 4) + ctrIn) * 8);
            setDoubleAt(dataView, index, newHdrObj.affine[ctrOut][ctrIn], littleEndian);
        }
    }


    setIntAt(dataView, 500, newHdrObj['xyzt_units'], littleEndian);

    setIntAt(dataView, 504, newHdrObj['intent_code'], littleEndian);

    setByteAt(dataView, 524, newHdrObj['dim_info'], littleEndian);


    return dataView.buffer;
};


/**
 * mri convert function to normalize the input nifti file
 * @param {String} fileUrl
 * @param {number} ver
 */


async function mri_convert(fileUrl, ver) {

         //-- To be accessed from python using js from import js, it should be global
         mriTempUrl =   fileUrl;
         niftiVer = ver;

         let pyodide = await loadPyodide();
         console.log("load pyodide")

         $$("mriConvPrgBarWin").show();

         document.getElementById("mriConvertProgBar").style.width=   "10%";

         await pyodide.loadPackage("micropip");
         await pyodide.loadPackage("scipy");
         await pyodide.loadPackage("matplotlib");

         document.getElementById("mriConvertProgBar").style.width=   "50%";

         await pyodide.runPythonAsync(`

               import micropip

               await micropip.install('nibabel')

               import nibabel
               from nibabel.processing import conform
               import js
               from js import document
               import numpy
               from pyodide.http import pyfetch

               def preprocess_image(img):
                   """Unit interval preprocessing"""
                   img =  (img - img.min()) / (img.max() - img.min())
                   return img

               #--------------------main------------------------#
               print("mriTempUrl:  " + format(js.mriTempUrl))

               document.getElementById("mriConvertProgBar").style.width=   "75%";

               # fetch original MRI file from JS
               response = await pyfetch(js.mriTempUrl)

               if response.status == 200:
                   with open("inputFile.nii.gz", "wb") as f:
                       f.write(await response.bytes())

               input_img = nibabel.load("inputFile.nii.gz")

               # Input MRI shape
               print("Original MRI shape:  " + format(input_img.shape))

               # Input MRI Orientation e.g. LIA ,  RAS or RPS
               print("Input MRI Orientation :  " + format(nibabel.aff2axcodes(input_img.affine)))

               new_img = conform(input_img)

               # Output MRI shape
               print("Output MRI shape:  " + format(new_img.shape))

               # Output MRI Orientation e.g. RAS
               print("Output MRI Orientation :  " + format(nibabel.aff2axcodes(new_img.affine)))

               print("-----------------------------------------------")


               data = preprocess_image(new_img.get_fdata().T)
               data = data.astype(numpy.float32)

               # Globals
               hdr = new_img.header

               print(hdr)

               hdr.structarr['vox_offset'] = 352
               dim_info = int(hdr.structarr['dim_info'])
               dims = hdr.structarr['dim']
               intent_code = int(hdr.structarr['intent_code'])
               datatypeCode = 16 # 2 - uint8
               numBitsPerVoxel = 32
               pixDims = hdr.structarr['pixdim']
               xyzt_units = int(hdr.structarr['xyzt_units'])
               qform_code = 0
               sform_code = 2
               quatern_b = float(hdr.structarr['quatern_b'])
               quatern_c = float(hdr.structarr['quatern_c'])
               quatern_d = float(hdr.structarr['quatern_d'])
               qoffset_x = float(hdr.structarr['qoffset_x'])
               qoffset_y = float(hdr.structarr['qoffset_y'])
               qoffset_z = float(hdr.structarr['qoffset_z'])
               affine =  new_img.affine # should be float type




               document.getElementById("mriConvertProgBar").style.width=   "95%";

               print("----------Mri Convert: Done ------------")
        

      `);


      //-----------------New Nifti Data ------------------//


      console.log("Get New Nifti Data")
      let js_data = pyodide.globals.get('data').toJs()

      //-- To avoid possible mem leak
      pyodide.globals.get('data').destroy();

      console.log("Convert data array to tensor")
      let data3DTensor = array2Tensor(js_data)
      let dataArr1D = tensor2FlattenArray(  data3DTensor );




      //-----------------New Nifti header ------------------//
      let js_dim_info = pyodide.globals.get('dim_info');
      //-- dims is array
      let js_dims = pyodide.globals.get('dims').toJs();
      let js_intent_code = pyodide.globals.get('intent_code');
      let js_datatypeCode = pyodide.globals.get('datatypeCode');
      let js_numBitsPerVoxel = pyodide.globals.get('numBitsPerVoxel');
      //-- pixDims is array
      let js_pixDims = pyodide.globals.get('pixDims').toJs();
      let js_xyzt_units = pyodide.globals.get('xyzt_units');
      let js_qform_code = pyodide.globals.get('qform_code');
      let js_sform_code = pyodide.globals.get('sform_code');
      let js_quatern_b = pyodide.globals.get('quatern_b');
      let js_quatern_c = pyodide.globals.get('quatern_c');
      let js_quatern_d = pyodide.globals.get('quatern_d');
      let js_qoffset_x = pyodide.globals.get('qoffset_x');
      let js_qoffset_y = pyodide.globals.get('qoffset_y');
      let js_qoffset_z = pyodide.globals.get('qoffset_z');
      //-- affine is array
      let js_affine = pyodide.globals.get('affine').toJs();

      //-- To avoid possible mem leak
      pyodide.globals.get('dims').destroy();
      pyodide.globals.get('pixDims').destroy();
      pyodide.globals.get('affine').destroy();


      new_hdr_values = {'dim_info': js_dim_info,
                               'dims': js_dims,
                               'intent_code': js_intent_code,
                               'datatypeCode': js_datatypeCode,
                               'numBitsPerVoxel': js_numBitsPerVoxel,
                               'pixDims': js_pixDims,
                               'xyzt_units': js_xyzt_units,
                               'qform_code': js_qform_code,
                               'sform_code': js_sform_code,
                               'quatern_b': js_quatern_b,
                               'quatern_c': js_quatern_c,
                               'quatern_d': js_quatern_d,
                               'qoffset_x': js_qoffset_x,
                               'qoffset_y': js_qoffset_y,
                               'qoffset_z': js_qoffset_z,
                               'affine': js_affine
                             }

      console.log("new_hdr_values :", new_hdr_values)

      if(niftiVer == 1) {
          rawNiftiData = modifyNifti1_Header(rawNiftiData, new_hdr_values);

      } else {
          rawNiftiData = modifyNifti2_Header(rawNiftiData, new_hdr_values);
      }


      //-- Get new image header
      niftiHeader = readNiftiHeader(rawNiftiData);



      let newMRIArrayBuffer = createNiftiOutArrayBuffer(rawNiftiData, dataArr1D);

      params_mri["binaryImages"] = [newMRIArrayBuffer];
      papaya.Container.resetViewer(0, params_mri);

      //-- Get new image data
      niftiImage = readNiftiImageData(niftiHeader, rawNiftiData);

      document.getElementById("mriConvertProgBar").style.width=   "0%";

      $$("mriConvPrgBarWin").hide();

      downloadNifti(dataArr1D, rawNiftiData, "converted_" + refFileName);
} //-- End of mri_convert function
