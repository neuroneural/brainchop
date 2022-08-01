/*
=========================================================
* Brainchop - v1.3.0
=========================================================

* Discription:  A user interface for whole brain 3D segmentation
*               Input shape : [1, D, H, W, 1] e.g. [1, 256, 256, 256, 1] 
*               Model : Meshnet or similar     
*
* Author:  Mohamed Masoud (2022)
=========================================================



=========================================================
               Brain 3D (ThreeJS)
=========================================================*/  


/**
* Init threeJS for drawing the brain  3D
* 
* @since 1.3.0
* @param {Array} labelVol3dArr- Brain 3D values
* @param {object} colorLutObj- e.g. {"0": "rgb(0,0,0)", "1": "rgb(245,245,245)", "2": "rgb(196,58,250)", "3": "rgb(220,248,164)", ... }
* @param {object} labelsObj- { "0": "BG",  "1": "Cerebral-White-Matter",  "2": "Ventricle",  "3": "Cerebellum-WM",  "4": "Cerebellum",..}
* @example
*
*    init  (     [[[0.,0.,1.,0.,0.],
                   [1.,1.,1.,1.,1.],
                   [1.,1.,2.,2.,1.],
                   [1.,1.,1.,0.,2.],
                   [1.,1.,0.,0.,1.]], 
                  
                  [[0.,0.,1.,0.,0.],
                   [1.,1.,1.,1.,3.],
                   [1.,0.,0.,0.,1.],
                   [1.,1.,1.,0.,3.],
                   [0.,1.,0.,0.,1.]]], {"0": "rgb(0,0,0)", "1": "rgb(245,245,245)", "2": "rgb(196,58,250)", "3": "rgb(220,248,164)"} )

*
*
*/ 

init = (labelVol3dArr, colorLutObj = null, labelsObj = null) => {

    var container = document.getElementById('threejs-container');   

    const renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize($$("threejsWinId").config.width, $$("threejsWinId").config.height);
    renderer.antialias = true;    
    container.appendChild(renderer.domElement);        

    // Convert to tensor
    const labelVol3dTsr = tf.tensor(labelVol3dArr);
    var height = labelVol3dTsr.shape[0],  width = labelVol3dTsr.shape[1],  depth = labelVol3dTsr.shape[2];      
    const sceneParams = { "height": height, "width": width, "depth": depth };
    labelVol3dTsr.dispose();

    // Create Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x050505 );
    scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );      

    // Create Camera
    const fov = 50;
    const aspect = $$("threejsWinId").config.width/$$("threejsWinId").config.height;
    const camera = new THREE.PerspectiveCamera( fov, aspect );
    camera.position.z = 200;


    //For camera to orbit around a brain target
    //-- let orbitControls call for renderer.domElement  to prevent gui dropdown list inactive bug.
    const controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.target.set(height / 2, width / 3, depth / 2);
    controls.update();              
    controls.minDistance = 200;
    controls.maxDistance = 1000;


    // let stats = initStats();

    // For future use
    //-- var light = new THREE.SpotLight( 0xffffff );
    //-- light.position.set( 1, 1, 1 );
    //-- scene.add( light );

    //-- Get all labels 
    let allLabelsTxtArr = ["All"], swapNumAndLabels = {};

    if( labelsObj != null) {
            swapNumAndLabels = Object.fromEntries(Object.entries(labelsObj).map(([k, v]) => [v, k]));
            Object.keys(labelsObj).forEach((labelNum, idx) => {
                 if(parseInt(labelNum) != 0) {
                    allLabelsTxtArr.push(labelsObj[labelNum]);
                 }
            })
    }


    //-- Create points group for each label
    Object.keys(colorLutObj).forEach(labelNum => {
        if(parseInt(labelNum) != 0) {
            let points = getPointsByLabel(height, width, depth, scene, labelVol3dArr, labelNum, colorLutObj);      
            points.name = labelNum;
            scene.add( points );
            disposeHierarchy (points, disposeNode);
        }
    })



    changeVoxelsOpacity = (opacityVal) => {
        // show all voxels
        scene.traverse(function(child) { 
              if(parseInt(child.name) > 0 || child.type === "Points") {
                child.material.opacity = opacityVal; 
              } 
        });
    } 



    filterVoxelsByLabel = (roiLabel) => {
        if(roiLabel === "All") {
            // show all voxels
            scene.traverse(function(child){ child.visible = true; } );

        } else { 
                scene.traverse(function(child) {
                    if(parseInt(child.name) > 0 || child.type === "Points"){
                        if( parseInt(child.name) == parseInt(swapNumAndLabels[roiLabel]) ) {
                            child.visible = true;
                        } else {
                            child.visible = false;
                        }
                    }
                }); 
        }      
    }  



    let gui_controls = new function () {
      this.opacity = 0.5;
      this.roi_label = "All";
    };


    initGUI = () => {

        // gui = new dat.GUI();
        gui = new dat.GUI({ autoPlace: false });
        gui.domElement.id = 'gui';
        guiContainer = document.getElementById("gui_container");
        guiContainer.appendChild(gui.domElement);        

        let opacitySlider = gui.add( gui_controls, 'opacity', 0, 0.9, 0.1 ).onChange( function ( value ) {
                changeVoxelsOpacity(value);
        } );             

        let roiSelector = gui.add( gui_controls, 'roi_label', allLabelsTxtArr).onChange(function (value) {
               filterVoxelsByLabel(value);
        })
    }


    render();
    initGUI();
    changeVoxelsOpacity(0.5);

    function animate() {

        requestAnimationFrame( animate );
        render()
    }

    function render() {
        // render using requestAnimationFrame
        requestAnimationFrame(render);        
        renderer.render( scene, camera );

    }


    $$("threejsWinId").attachEvent( 'onViewResize', onWindowResize );

    function onWindowResize() {        
        camera.aspect = $$("threejsWinId").config.width/$$("threejsWinId").config.height;
        camera.updateProjectionMatrix();
        renderer.setSize( $$("threejsWinId").config.width, $$("threejsWinId").config.height);        
    }    


}


/**
* Create THREE.points for each group of voxels with same label
* 
* @since 1.3.0
* @param {number} height
* @param {number} width
* @param {number} depth
* @param {Object} scene, threejs scene. 
* @param {Array} voxelsVal, 3D array
* @param {number} labelNum, Segmenation label number 
* @param {Object} colorLutObj e.g. {"0": "rgb(0,0,0)", "1": "rgb(245,245,245)", "2": "rgb(196,58,250)", "3": "rgb(220,248,164)", ... }
* @return {Object} points, THREE.Points.
*
*/

getPointsByLabel = (height, width, depth, scene, voxelsVal, labelNum, colorLutObj) => {

    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    for (let x = 0; x < height; x+=1) {
        for (let y = 0; y < width; y+=1) {
          for (let z = 0; z < depth; z+=1) {
             if(voxelsVal[x][y][z] == labelNum) {
                  positions.push( x, y, z );
                  let labelColor = getRgbObject(colorLutObj[labelNum]);
                  colors.push(labelColor.r/255, labelColor.g/255, labelColor.b/255 );
             }
          }
        }
    }

    geometry.addAttribute( 'position', new THREE.Uint16BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ));

    const material = new THREE.PointsMaterial( { size: 5, vertexColors: true, transparent: true } );

    let points =  new THREE.Points( geometry, material );

    geometry.dispose();
    material.dispose();

    return points;

}


/**
* Clear threejs scene
* @since 1.3.0
* @param {Object} scene, threejs scene. 
*
*/

clearScene = (scene) => {
      while(scene.children.length > 0) { 
          //-- disposeHierarchy (scene, disposeNode);
          let node = scene.children[0];
          disposeNode(node);          
          scene.remove(node); 
      }
 }


/**
* Clear threejs material. 
* Credit: trusktr (https://discourse.threejs.org/u/trusktr)
* @since 1.3.0
* @param {Object} material, e.g. THREE.PointsMaterial. 
*
*/

cleanMaterial = (material) => {
    material.dispose();
    // dispose textures
    for (const key of Object.keys(material)) {
        const value = material[key];
        if (value && typeof value === 'object' && 'minFilter' in value) {
            value.dispose();
        }
    }
}



/**
* Dispose all scene childrens.
* Credit: https://stackoverflow.com/users/1980846/gaitat
* @since 1.3.0
* @param {Object} node, e.g. THREE.Points. 
* @example
*
*  disposeNode (scene.children[0])
*/

disposeNode = (node) => {
    if (node instanceof THREE.Mesh || node instanceof THREE.Points)
    {
        if (node.geometry)
        {
            node.geometry.dispose();
        }

        if (node.material)
        {
            if (node.material instanceof THREE.MeshFaceMaterial)
            {
                $.each (node.material.materials, function (idx, mtrl)
                {
                    if (mtrl.map)               mtrl.map.dispose ();
                    if (mtrl.lightMap)          mtrl.lightMap.dispose ();
                    if (mtrl.bumpMap)           mtrl.bumpMap.dispose ();
                    if (mtrl.normalMap)         mtrl.normalMap.dispose ();
                    if (mtrl.specularMap)       mtrl.specularMap.dispose ();
                    if (mtrl.envMap)            mtrl.envMap.dispose ();
                    if (mtrl.alphaMap)          mtrl.alphaMap.dispose();
                    if (mtrl.aoMap)             mtrl.aoMap.dispose();
                    if (mtrl.displacementMap)   mtrl.displacementMap.dispose();
                    if (mtrl.emissiveMap)       mtrl.emissiveMap.dispose();
                    if (mtrl.gradientMap)       mtrl.gradientMap.dispose();
                    if (mtrl.metalnessMap)      mtrl.metalnessMap.dispose();
                    if (mtrl.roughnessMap)      mtrl.roughnessMap.dispose();

                    mtrl.dispose ();    // disposes any programs associated with the material
                });
            }
            else if(node.material instanceof THREE.PointsMaterial)
            {
                // disposes any programs associated with the material 
                if (node.material.map)              node.material.map.dispose();
                cleanMaterial(node.material);
                  
            }            
            else
            {
                if (node.material.map)              node.material.map.dispose ();
                if (node.material.lightMap)         node.material.lightMap.dispose ();
                if (node.material.bumpMap)          node.material.bumpMap.dispose ();
                if (node.material.normalMap)        node.material.normalMap.dispose ();
                if (node.material.specularMap)      node.material.specularMap.dispose ();
                if (node.material.envMap)           node.material.envMap.dispose ();
                if (node.material.alphaMap)         node.material.alphaMap.dispose();
                if (node.material.aoMap)            node.material.aoMap.dispose();
                if (node.material.displacementMap)  node.material.displacementMap.dispose();
                if (node.material.emissiveMap)      node.material.emissiveMap.dispose();
                if (node.material.gradientMap)      node.material.gradientMap.dispose();
                if (node.material.metalnessMap)     node.material.metalnessMap.dispose();
                if (node.material.roughnessMap)     node.material.roughnessMap.dispose();

                node.material.dispose ();   // disposes any programs associated with the material
            }
        }
    }
}   

/**
* Dispose all scene childrens.
* Credit: https://stackoverflow.com/users/1980846/gaitat
* @since 1.3.0
* @param {Object} node, e.g. THREE.scene. 
* @example
*
*  disposeHierarchy (scene, disposeNode)
*/ 
disposeHierarchy =  (node, callback) => {
    for (let i = node.children.length - 1; i >= 0; i--) {
        let child = node.children[i];
        disposeHierarchy (child, callback);
        callback (child);
    }
} 










		



