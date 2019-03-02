//JS for 3D BaseViewer
//Written by Kenny Friedman January 2019

// this confirms that WebGL needs to be available
if ( WEBGL.isWebGLAvailable() === false ) {
	document.body.appendChild( WEBGL.getWebGLErrorMessage() );
}

//global vars
var camera, controls, scene, renderer;
const sideBarWidth = document.getElementById("sidebar").offsetWidth;

var globalPlane; 			// this is the clipping plane (currently used for GCode objects)
var globalPlanes;			// this is the array containing the clipping plane above it.
var heightOfCurrentObject;	// this is the height of the object, to know what the max clipping plane should be

var gcodeObject;

//init the scene and request it to be animated
init();
animate();

//this function loads an STL object. Pass it the URL of the STL file, or a URI of the STL as data.
function addSTLObj(pathToLoad) {
	var material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );
	var loader = new THREE.STLLoader();
	loader.load( pathToLoad, function ( geometry ) {
		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.set( 0, - 0.37, - 0.6 );
		mesh.rotation.set( - Math.PI / 2, 0, 0 );
		mesh.scale.set( 2, 2, 2 );
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		scene.add( mesh );
		console.log('Added the STL object to the scene');
	} );
	animate();
}

function addObjFile(pathToLoad) {
    console.log('Loaded the file');
	var loader = new THREE.OBJLoader();
	loader.load(pathToLoad, function(object) {
		scene.add(object);
		console.log('Added the OBJ object to the scene');
	});
	animate();
}

function addGCodeFile(pathToLoad) {
	var loader = new THREE.GCodeLoader();
	
	console.log('Loaded the file');
	loader.load(pathToLoad, function(object) {
		gcodeObject = object;
		scene.add(object);
		console.log('Added the GCODE object to the scene');
		//to get the max and min sizes for the clipping plane
/*
		var box = new THREE.Box3().setFromObject( object );
		minLayerLocation = box.min.y;
		maxLayerLocation = box.max.y;
		console.log("BOX min: "+minLayerLocation);
		console.log("BOXmax: "+maxLayerLocation);
		
*/
		numberOfLayersInObject = object.children.length;
		var sidebar = document.getElementById("sidebar");
		var slider = document.createElement("input");
		slider.setAttribute("type", "range");
		slider.setAttribute("oninput", "updateSlider(this.value)");
		var minS = Math.ceil(0/* minLayerLocation */);
		var maxS = Math.ceil(numberOfLayersInObject/* maxLayerLocation */);
		slider.setAttribute("min", minS);
		slider.setAttribute("max", maxS);

		slider.setAttribute("value", maxS); //set default value to max (full view)
		globalPlane.constant = maxS; //set default plane constant to max (full view)
		slider.id = "gcodeSlider";
		sidebar.appendChild(slider);
		//add the global planes array as the rendering clipping plane.
		//renderer.clippingPlanes = globalPlanes;
	});
	animate();
}

var globalPlane;

function updateSlider(sliderValue) {
	//globalPlane.constant = sliderValue;
	console.log(gcodeObject.children.length)
	for (var i=0; i<gcodeObject.children.length; i++) {
		partialLayer = gcodeObject.children[i];
		layerNumber = parseInt(partialLayer.name);
		if (layerNumber > sliderValue) {
			partialLayer.visible = false;
		}
		
		if (layerNumber + 3 > sliderValue) {
			partialLayer.material.color.setHex( 0xffffff );	
		} else {
			partialLayer.material.color.setHex( 0x8B0000 );
		}
		
		if (layerNumber <= sliderValue) {
			
			partialLayer.visible = true;
		}
	}
}

//this function inits the entire scene
function init() {

	//new ThreeJS scene created
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xcccccc );
	
	var widthWithoutSideBar = window.innerWidth - sideBarWidth;

	//new ThreeJS renderer
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( widthWithoutSideBar, window.innerHeight );
	document.getElementById("canvasWrapper").appendChild( renderer.domElement );

	//Clipping Planes
	globalPlane = new THREE.Plane( new THREE.Vector3( 0, - 1, 0 ), 0.8 );
	globalPlanes = [ globalPlane ],
					Empty = Object.freeze( [] );
	renderer.clippingPlanes = Empty;
	renderer.localClippingEnabled = true;


	//document.body.appendChild( renderer.domElement );

	//new camera
	camera = new THREE.PerspectiveCamera( 60, widthWithoutSideBar / window.innerHeight, 1, 1000 );
	camera.position.set( 400, 200, 100 );

	// controls

	controls = new THREE.OrbitControls( camera, renderer.domElement );

	//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

	controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	controls.dampingFactor = 0.25;

	controls.screenSpacePanning = false;

	controls.minDistance = 100;
	controls.maxDistance = 500;

	//don't show under side under here
	//controls.maxPolarAngle = Math.PI / 2;

	// world

	var geometry = new THREE.CylinderBufferGeometry( 0, 10, 30, 4, 1 );
	var material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );
	
	var light = new THREE.PointLight( 0xff0000, 1, 0, 1 );
	light.position.set( 50, 50, 50 );
	scene.add( light );
	
	// lights (these are distinct so that we can test rotation, but it could easy be uniform to look nicer)
	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1, 1, 1 );
	scene.add( light );

	var light = new THREE.DirectionalLight( 0x002288 );
	light.position.set( - 1, - 1, - 1 );
	scene.add( light );

	var light = new THREE.AmbientLight( 0x222222 );
	scene.add( light );

	window.addEventListener( 'resize', onWindowResize, false );

	//var axesHelper = new THREE.AxesHelper( 100);
	//scene.add( axesHelper );

}

//change view size when the window resizes
function onWindowResize() {

	var widthWithoutSideBar = window.innerWidth - sideBarWidth;

	camera.aspect = widthWithoutSideBar / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( widthWithoutSideBar, window.innerHeight );

}

//animation
function animate() {

	requestAnimationFrame( animate );

	controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

	render();
}

//renders the scene
function render() {
	renderer.render( scene, camera );
}

//This function runs when a file is dragged into view. Prevents it from replacing the website.
function dragOverHandler(ev) {
	console.log('File(s) in drop zone'); 

	// Prevent default behavior (Prevent file from being opened)
	ev.preventDefault();
}

//occurs when a file is dropped into the scene
function dropHandler(ev) {
	console.log('File(s) dropped');

	// Prevent default behavior (Prevent file from being opened)
	ev.preventDefault();

	dropped_file_as_uri = ""

	if (ev.dataTransfer.items) {
		console.log("data transfer items");
		// Use DataTransferItemList interface to access the file(s)
		for (var i = 0; i < ev.dataTransfer.items.length; i++) {
			console.log("data transfer item #"+i);
			// If dropped items aren't files, reject them
			if (ev.dataTransfer.items[i].kind === 'file') {
				//Get the file
				var file = ev.dataTransfer.items[i].getAsFile();
				
				//Get the filename
				var fileName = file.name;
				document.getElementById("filename").innerHTML = fileName;

				var reader = new FileReader();
				reader.onloadend = function() {
					if(fileName.substr(fileName.length - 3) === "stl") {
						addSTLObj(this.result);
					} else if(fileName.substr(fileName.length - 3) === "obj") {
						addObjFile(this.result);
					} else if(fileName.substr(fileName.length - 5) === "gcode") {
						addGCodeFile(this.result);
					}
				}
				reader.readAsDataURL(file);
			}
		}
	}
}
