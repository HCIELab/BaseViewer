//JS for 3D BaseViewer


function dragOverHandler(ev) {
	console.log('File(s) in drop zone'); 

	// Prevent default behavior (Prevent file from being opened)
	ev.preventDefault();
}





if ( WEBGL.isWebGLAvailable() === false ) {

	document.body.appendChild( WEBGL.getWebGLErrorMessage() );

}

var camera, controls, scene, renderer;

init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();

function addObj(pathToLoad) {
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
	} );
	animate();
}

function init() {

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xcccccc );
// 				scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set( 400, 200, 0 );

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


	for ( var i = 0; i < 500; i ++ ) {

		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.x = Math.random() * 1600 - 800;
		mesh.position.y = 0;
		mesh.position.z = Math.random() * 1600 - 800;
		mesh.updateMatrix();
		mesh.matrixAutoUpdate = false;
		scene.add( mesh );

	}
	

	
	
	// var loader = new THREE.STLLoader();
	// loader.load( './example.stl', function ( geometry ) {
	// 	var mesh = new THREE.Mesh( geometry, material );
	// 	mesh.position.set( 0, - 0.37, - 0.6 );
	// 	mesh.rotation.set( - Math.PI / 2, 0, 0 );
	// 	mesh.scale.set( 2, 2, 2 );
	// 	mesh.castShadow = true;
	// 	mesh.receiveShadow = true;
	// 	scene.add( mesh );
	// } );
	
	
	

	// lights

	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1, 1, 1 );
	scene.add( light );

	var light = new THREE.DirectionalLight( 0x002288 );
	light.position.set( - 1, - 1, - 1 );
	scene.add( light );

	var light = new THREE.AmbientLight( 0x222222 );
	scene.add( light );

	//

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );

	controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

	render();

}

function render() {

	renderer.render( scene, camera );

}

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
				console.log("kind is file");
				var file = ev.dataTransfer.items[i].getAsFile();
				var reader = new FileReader();
				reader.readAsDataURL(file);
				var bs = reader.result;
				console.log(reader);
				console.log(bs);
				dropped_file_as_uri = reader.result;
				//console.log('... file[' + i + '].name = ' + file.name);
				console.log(dropped_file_as_uri);
				addObj(dropped_file_as_uri);
			}
		}
	}
}
