if (!Detector.webgl) Detector.addGetWebGLMessage();
// Globals
var gCamera, gControls, gScene, gRenderer;

// Objects
var gHelper, gObjects = [];

// Raycasting
var gRaycaster = new THREE.Raycaster();
var gMouse = new THREE.Vector2();

const CUBE_SIZE = 10;

// Kick it off
init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();

function init() {

    // Scene, Renderer, Camera, Controls

    gScene = new THREE.Scene();
    gScene.background = new THREE.Color(0xcccccc);
    gScene.fog = new THREE.FogExp2(0xcccccc, 0.002);

    var gridHelper = new THREE.GridHelper(100, 100, 0x0000ff, 0x808080);
    gScene.add(gridHelper);

    gRenderer = new THREE.WebGLRenderer({
        antialias: true
    });
    gRenderer.setPixelRatio(window.devicePixelRatio);
    gRenderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(gRenderer.domElement);

    gCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    gCamera.position.set(0, 100, 50); // y==200, z==200
    // gControls
    gControls = new THREE.OrbitControls(gCamera, gRenderer.domElement); // we are controlling the global gCamera and listening for orbit events from the canvas 
    gControls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    gControls.dampingFactor = 0.15;
    gControls.screenSpacePanning = false;
    gControls.minDistance = 1; // closest we can dolly in to origin. 
    gControls.maxDistance = 500; // furtherest out we can get
    gControls.maxPolarAngle = 2 * Math.PI; // angle by which we can deviate from y axis(in radians). Defines a cone.


    // Cubes

    var cubeGeometry = new THREE.BoxBufferGeometry(20, 10, 10);
    // var cubeGeometry = new THREE.DodecahedronBufferGeometry(20);
    var columns = [];
    const NUM_COLUMNS = 5;
    for (var i = 0; i < NUM_COLUMNS; i++) {
        var column = new THREE.Group();
        var currentColumnHeight = -10;
        var numCubes = Math.round( Math.random() * 3 + 7 );
        for (var j = 0; j < numCubes; j++) {
            var cube = new THREE.Mesh(cubeGeometry, new THREE.MeshLambertMaterial({ color: 0.5 * Math.random() * 0x96e4ff }));
            // randomly scale individual cubes
            // var randomScale = Math.random() + 1; // [1, 2]
            // cube.scale = cube.scale.multiplyScalar(randomScale);

            currentColumnHeight += 10;
            cube.position.y = currentColumnHeight + 5;
            cube.position.x = 5 * Math.random();
            cube.position.z = 5 * Math.random();

            cube.castShadow = true;
            cube.receiveShadow = true;
            column.add(cube);
        }
        gScene.add(column);
        columns.push(column);
    }

    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    var prevX = 0;
    var prevZ = 0;
    for (var i = 0; i < NUM_COLUMNS - 2; i++) {
        var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
        var dx = plusOrMinus * 15 * Math.random();
        var dz = plusOrMinus * 15 * Math.random();
        shape.lineTo(prevX += dx, prevZ += dz);
    }
    shape.lineTo(0, 0);
    var points = shape.getPoints(); // shape.getPoints() -> array of Vect2 
    console.log(points.length);
    for (var i = 0; i < points.length; i++) {
        columns[i].position.x = points[i].x;
        columns[i].position.z = points[i].y;
        columns[i].position.y = 0.7 * Math.abs(points[i].y);
        columns[i].rotateY(2 * Math.PI * Math.random());
    }
    // var columns2 = columns;
    // for(var i = 0; i < columns2.length; i++)
    // {
    //     columns2[i].rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI / 3);
    //     gScene.add(columns2[i]);
    // }
    
    
    // var boundRadius = 15;
    // var boundGeometry = new THREE.DodecahedronGeometry(boundRadius); // radius == 30
    // // var boundWire = new THREE.WireframeGeometry( boundGeometry );
    // var boundObject = new THREE.Mesh(boundGeometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff, wireframe: true }));
    // boundObject.position.y = boundRadius;
    // gScene.add(boundObject);
    // Lights

    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1); // position is a Vector3 with default value (0, 1, 0)
    gScene.add(light);
    var light = new THREE.DirectionalLight(0x002288);
    light.position.set(-1, -1, -1);
    gScene.add(light);
    var light = new THREE.AmbientLight(0x222222);
    gScene.add(light);

    // Event listeners

    window.addEventListener('resize', onWindowResize, false); // false means event won't be executed in capturing phase
    // window.addEventListener('mousemove', onMouseMove, false);
}



// Graphics

function animate() {
    requestAnimationFrame(animate); // Asynchronously calls animate function when the next repaint can happen IE when call stack is clear. 
    gControls.update(); // only required if gControls.enableDamping = true, or if gControls.autoRotate = true
    render();
}

function render() {
    gRenderer.render(gScene, gCamera); // renders to the canvas
}


// Doc event listeners

function onWindowResize() {
    gCamera.aspect = window.innerWidth / window.innerHeight; // update aspect ratio for perspective gCamera
    gCamera.updateProjectionMatrix(); // update the gCamera's internal proj matrix
    gRenderer.setSize(window.innerWidth, window.innerHeight); // resize gRenderer
}