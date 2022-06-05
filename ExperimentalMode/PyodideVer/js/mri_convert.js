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
               import nibabel.processing

               import js
               from js import document, Blob, window, fetch, File

               import sys 
               import os
               import numpy
               import scipy
               from scipy.ndimage import affine_transform
               from numpy.linalg import inv        
               from pyodide.http import pyfetch
               from nibabel.freesurfer.mghformat import MGHHeader



               #--Source: https://github.com/Deep-MI/FastSurfer/blob/stable/FastSurferCNN/data_loader/conform.py

               def getscale(data, dst_min, dst_max, f_low=0.0, f_high=0.999):
                   """
                   Original Author: Martin Reuter (https://github.com/m-reuter)
                   Function to get offset and scale of image intensities to robustly rescale to range dst_min..dst_max.
                   Equivalent to how mri_convert conforms images.
                   :param numpy.ndarray data: image data (intensity values)
                   :param float dst_min: future minimal intensity value
                   :param float dst_max: future maximal intensity value
                   :param f_low: robust cropping at low end (0.0 no cropping)
                   :param f_high: robust cropping at higher end (0.999 crop one thousandths of high intensity voxels)
                   :return: float src_min: (adjusted) offset
                   :return: float scale: scale factor
                   """
                   # get min and max from source
                   src_min = numpy.min(data)
                   src_max = numpy.max(data)

                   if src_min < 0.0:
                       sys.exit('ERROR: Min value in input is below 0.0!')

                   print("Input:    min: " + format(src_min) + "  max: " + format(src_max))

                   if f_low == 0.0 and f_high == 1.0:
                       return src_min, 1.0

                   # compute non-zeros and total vox num
                   nz = (numpy.abs(data) >= 1e-15).sum()
                   voxnum = data.shape[0] * data.shape[1] * data.shape[2]

                   # compute histogram
                   histosize = 1000
                   bin_size = (src_max - src_min) / histosize
                   hist, bin_edges = numpy.histogram(data, histosize)

                   # compute cummulative sum
                   cs = numpy.concatenate(([0], numpy.cumsum(hist)))

                   # get lower limit
                   nth = int(f_low * voxnum)
                   idx = numpy.where(cs < nth)

                   if len(idx[0]) > 0:
                       idx = idx[0][-1] + 1

                   else:
                       idx = 0

                   src_min = idx * bin_size + src_min

                   # get upper limit
                   nth = voxnum - int((1.0 - f_high) * nz)
                   idx = numpy.where(cs >= nth)                           

                   if len(idx[0]) > 0:
                       idx = idx[0][0] - 2

                   else:
                       print('ERROR: rescale upper bound not found')

                   src_max = idx * bin_size + src_min

                   # scale
                   if src_min == src_max:
                       scale = 1.0

                   else:
                       scale = (dst_max - dst_min) / (src_max - src_min)

                   print("rescale:  min: " + format(src_min) + "  max: " + format(src_max) + "  scale: " + format(scale))

                   return src_min, scale




               def map_image(img, out_affine, out_shape, ras2ras=numpy.array([[1.0, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]),
                             order=1):
                   """
                   Original Author: Martin Reuter (https://github.com/m-reuter)
                   Function to map image to new voxel space (RAS orientation)
                   :param nibabel.MGHImage img: the src 3D image with data and affine set
                   :param numpy.ndarray out_affine: trg image affine
                   :param numpy.ndarray out_shape: the trg shape information
                   :param numpy.ndarray ras2ras: ras2ras an additional maping that should be applied (default=id to just reslice)
                   :param int order: order of interpolation (0=nearest,1=linear(default),2=quadratic,3=cubic)
                   :return: numpy.ndarray new_data: mapped image data array
                   """


                   # compute vox2vox from src to trg
                   vox2vox = inv(out_affine) @ ras2ras @ img.affine

                   # here we apply the inverse vox2vox (to pull back the src info to the target image)
                   image_data = numpy.asanyarray(img.dataobj)

                   # convert frames to single image
                   if len(image_data.shape) > 3:
                       if any(s != 1 for s in image_data.shape[3:]):
                           raise ValueError(f'Multiple input frames {tuple(image_data.shape)} not supported!')
                       image_data = numpy.squeeze(image_data, axis=tuple(range(3,len(image_data.shape))))

                   new_data = affine_transform(image_data, inv(vox2vox), output_shape=out_shape, order=order)

                   return new_data



               def scalecrop(data, dst_min, dst_max, src_min, scale):
                   """
                   Original Author: Martin Reuter (https://github.com/m-reuter)
                   Function to crop the intensity ranges to specific min and max values
                   :param numpy.ndarray data: Image data (intensity values)
                   :param float dst_min: future minimal intensity value
                   :param float dst_max: future maximal intensity value
                   :param float src_min: minimal value to consider from source (crops below)
                   :param float scale: scale value by which source will be shifted
                   :return: numpy.ndarray data_new: scaled image data
                   """
                   data_new = dst_min + scale * (data - src_min)

                   # clip
                   data_new = numpy.clip(data_new, dst_min, dst_max)
                   print("Output:   min: " + format(data_new.min()) + "  max: " + format(data_new.max()))

                   return data_new


               async def js_fetch(url):
                   response = await fetch(url)
                   js_arr_buffer = await response.arrayBuffer()

                   return js_arr_buffer


               #--------------------main------------------------#
               print("mriTempUrl:  " + format(js.mriTempUrl))
               
               document.getElementById("mriConvertProgBar").style.width=   "75%";
                
               # fetch original MRI file from JS 
               response = await pyfetch(js.mriTempUrl)

               if response.status == 200:
                   with open("inputFile.nii.gz", "wb") as f:
                       f.write(await response.bytes())     
                          
               input_img = nibabel.load("inputFile.nii.gz")


               # Input shape
               print("Original MRI shape:  " + format(input_img.shape))
               
               
               # Input image Orientation e.g. LIA ,  RAS or RPS
               print("Input MRI Orientation :  " + format(nibabel.aff2axcodes(input_img.affine)))


               cwidth = 256
               csize = 1
               h1 = MGHHeader.from_header(input_img.header)  # may copy some parameters if input was MGH format

               h1.set_data_shape([cwidth, cwidth, cwidth, 1])
               h1.set_zooms([csize, csize, csize])
               h1['Mdc'] = [[-1, 0, 0], [0, 0, -1], [0, 1, 0]]
               h1['fov'] = cwidth
               h1['Pxyz_c'] = input_img.affine.dot(numpy.hstack((numpy.array(input_img.shape[:3]) / 2.0, [1])))[:3]   


               
               # get scale for conversion on original input before mapping to be more similar to mri_convert
               src_min, scale = getscale(numpy.asanyarray(input_img.dataobj), 0, 255)  
               

               mapped_data = map_image(input_img, h1.get_affine(), h1.get_data_shape())


               if not input_img.get_data_dtype() == numpy.dtype(numpy.uint8):

                   if numpy.max(mapped_data) > 255:
                       mapped_data = scalecrop(mapped_data, 0, 255, src_min, scale)


               new_data = numpy.uint8(numpy.rint(mapped_data))

               new_img = nibabel.MGHImage(new_data, h1.get_affine(), h1)

               #if js.niftiVer == 1:
                  #new_img = nibabel.Nifti1Image(new_data, h1.get_affine(), h1)
                  #new_img = nibabel.Nifti1Image(new_data, input_img.affine, h1)
               #else :
                  #new_img = nibabel.Nifti2Image(new_data, h1.get_affine(), h1)


               # Save MGH as Nifti
               nibabel.save(new_img,  'outNifti.nii.gz')
              
               # Load  Nifti file
               new_img = nibabel.load("outNifti.nii.gz")


               #new_img = nibabel.processing.conform(new_img, (256, 256, 256), (1.0, 1.0, 1.0), 3, 0.0, 'RPS'  ) 
               
               # Test image Orientation e.g. LIA or RAS
               print("Output MRI Orientation :  " + format(nibabel.aff2axcodes(new_img.affine)))


               # Make sure we store uchar
               new_img.set_data_dtype(numpy.uint8)
               print("Output MRI shape:  " + format(new_img.shape))

               # Globals  
               data = numpy.array(new_img.get_fdata(), dtype=numpy.uint8)
               hdr = new_img.header  
               
               hdr.structarr['vox_offset'] = 352

               dim_info = int(hdr.structarr['dim_info'])
               dims = hdr.structarr['dim']
               intent_code = int(hdr.structarr['intent_code'])
               datatypeCode = 2
               numBitsPerVoxel = 8
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
               affine =  h1.get_affine() # should be float type 

               print(hdr)                                              
              
               document.getElementById("mriConvertProgBar").style.width=   "95%";
               
               print("----------Mri Convert: Done ------------")

      `);


      //-----------------New Nifti Data ------------------//

      
      console.log("Get New Nifti Data")
      let js_data = pyodide.globals.get('data').toJs()

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


} //-- End of mri_convert function