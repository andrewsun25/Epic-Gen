const PD = require("probability-distributions");
const DAT = require('dat.gui');

if (!Detector.webgl) Detector.addGetWebGLMessage();
// Globals
var gCamera, gOrbitControls, gScene, gRenderer;

// Objects
var gObjects = []; // Room meshes

// Raycasting
var gRaycaster = new THREE.Raycaster();
var gMouse = new THREE.Vector2();

// Settings
var gParams = { // Maps the values of the GUI gParams to our variables
    NUM_FLOORS: 8,
    MEAN_VERTS_PERFLOOR: 9,
    MEAN_FLOOR_HEIGHT: 10,
    MEAN_FLOOR_SIZE: 20
};

// Kick it off
init();
animate();

// Sets gScene, background color, and fog
function initScene() {
    gScene = new THREE.Scene();
    gScene.background = new THREE.Color(0xcccccc);
    gScene.fog = new THREE.FogExp2(0xcccccc, 0.002);
}

// Sets gRenderer, its pixel ratio, size, and appends it to the doc body
function initRenderer() {
    gRenderer = new THREE.WebGLRenderer({
        antialias: true
    });
    gRenderer.setPixelRatio(window.devicePixelRatio);
    gRenderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(gRenderer.domElement);
}

// Sets gCamera as a perspective camera and its position
function initCamera() {
    gCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    gCamera.position.set(50, 100, 50); // y==200, z==200
}

// Sets gOrbitControls and its settings
function initOrbitControls() {
    gOrbitControls = new THREE.OrbitControls(gCamera, gRenderer.domElement); // we are controlling the global gCamera and listening for orbit events from the canvas 
    gOrbitControls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    gOrbitControls.dampingFactor = 0.3;
    gOrbitControls.screenSpacePanning = true;
    gOrbitControls.minDistance = 1; // closest we can dolly in to origin. 
    gOrbitControls.maxDistance = 500; // furtherest out we can get
    gOrbitControls.maxPolarAngle = 2 * Math.PI; // angle by which we can deviate from y axis(in radians). Defines a cone.
}

// Adds a grid to gScene
function initHelpers() {
    var gridHelper = new THREE.GridHelper(100, 100, 0x0000ff, 0x808080);
    gScene.add(gridHelper);
}

// Adds ambient and directional lighting to gScene
function initLights() {
    var light = new THREE.PointLight(0xffffff);
    light.position.set(25, 50, 25); // position is a Vector3 with default value (0, 1, 0)    gScene.add(light);
    gScene.add(light);
    var light = new THREE.DirectionalLight(0x002288);
    light.position.set(-10, -10, -10);
    gScene.add(light);
    // var light = new THREE.AmbientLight(0x222222, 0.9);
    // gScene.add(light);
    var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.5 );
    gScene.add( light );
    // var gLight = new THREE.DirectionalLight(0xfffbd1);
    // gLight.position.set(30, 30, 30);
    // gLight.castShadow = true;
    // var sphere = new THREE.SphereBufferGeometry(5, 16, 8);
    // var lightMesh = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xfffbd1 }));
    // gLight.add(lightMesh);
    // gScene.add(gLight);
    // gObjects.push(lightMesh);
    // gObjects.push(gLight);
}

function initDragControls() {
    var dragOrbitControls = new THREE.DragControls(gObjects, gCamera, gRenderer.domElement);
    dragOrbitControls.addEventListener('dragstart', function(event) { gOrbitControls.enabled = false; });
    dragOrbitControls.addEventListener('dragend', function(event) { gOrbitControls.enabled = true; });
}

function initEventListeners() {
    window.addEventListener('resize', onWindowResize, false); // false means event won't be executed in capturing phase
    window.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener("keydown", onDocumentKeyDown, false);
}

function initGUI() {
    var gui = new DAT.GUI({
        height: 5 * 32 - 1
    });

    gui.add(gParams, 'NUM_FLOORS').onChange(function() {
        clearMeshes();
        generateRooms(gParams.NUM_FLOORS, gParams.MEAN_VERTS_PERFLOOR, gParams.MEAN_FLOOR_HEIGHT, gParams.MEAN_FLOOR_SIZE);
    });

    gui.add(gParams, 'MEAN_VERTS_PERFLOOR').onChange(function() {
        clearMeshes();
        generateRooms(gParams.NUM_FLOORS, gParams.MEAN_VERTS_PERFLOOR, gParams.MEAN_FLOOR_HEIGHT, gParams.MEAN_FLOOR_SIZE);
    });

    gui.add(gParams, 'MEAN_FLOOR_HEIGHT').onChange(function() {
        clearMeshes();
        generateRooms(gParams.NUM_FLOORS, gParams.MEAN_VERTS_PERFLOOR, gParams.MEAN_FLOOR_HEIGHT, gParams.MEAN_FLOOR_SIZE);

    });

    gui.add(gParams, 'MEAN_FLOOR_SIZE').onChange(function() {
        clearMeshes();
        generateRooms(gParams.NUM_FLOORS, gParams.MEAN_VERTS_PERFLOOR, gParams.MEAN_FLOOR_HEIGHT, gParams.MEAN_FLOOR_SIZE);

    });

    var buttons = {
        refresh: function() {
            clearMeshes();
            generateRooms(gParams.NUM_FLOORS, gParams.MEAN_VERTS_PERFLOOR, gParams.MEAN_FLOOR_HEIGHT, gParams.MEAN_FLOOR_SIZE);
        },
        addPerson: function() {
            generatePeople();
        }
    };
    gui.add(buttons, 'refresh');
    gui.add(buttons, 'addPerson');

    // var addButton = {
    //     addModel: function() {
    //         gScene.children.forEach(function(child) {
    //             if (child.userData.new) {
    //                 var newChild = new THREE.Mesh(child.geometry, child.material);
    //                 newChild.userData.new = true;
    //                 newChild.position.x = newChild.position.x + 150;
    //                 newChild.visible = true;
    //                 gScene.add(newChild);
    //                 child.userData.new = false;
    //                 gObjects.push(newChild);
    //             }
    //         });
    //         console.log(gScene.children);
    //     }
    // };
    // gui.add(addButton, 'addModel');
}

function init() {

    initScene();
    initRenderer();
    initCamera();
    initLights();
    initHelpers();

    initOrbitControls();
    initDragControls();

    initEventListeners();

    initGUI();

    generateRooms(gParams.NUM_FLOORS, gParams.MEAN_VERTS_PERFLOOR, gParams.MEAN_FLOOR_HEIGHT, gParams.MEAN_FLOOR_SIZE);

}

function generateAlphabet() {
    var shapeSet = {};

}

function clearMeshes() {
    for (let i = 0; i < gObjects.length; i++) {
        gScene.remove(gObjects[i]);
    }
}


function generatePeople() {
    var personGeometry = new THREE.BoxBufferGeometry(1, 3, 1);

    for (var i = 0; i < 10; i++) {
        var person = new THREE.Mesh(personGeometry, new THREE.MeshLambertMaterial({ color: 0.5 * Math.random() * 0x96e4ff }));
        person.position.x = THREE.Math.randInt(-50, 50);
        person.position.z = THREE.Math.randInt(-50, 50);
        person.position.y = 3;
        gScene.add(person);
    }
}

// Adds room to scene
function generateRooms(numRooms, meanVertsPerFloor, meanFloorHeight, meanFloorSize) {
    var floorYPos = 0;
    for (let i = 0; i < numRooms; i++) { // generate 5 floors
        let color = Math.round(THREE.Math.lerp(0x07609b, 0xffc70f, i / numRooms));
        let roomMaterial = new THREE.MeshPhongMaterial({
            color: color,
            specular: 0xffffff,
            shininess: 250,
        });
        if (i == 2 || i == 5) {
            let glassMaterial = new THREE.MeshPhysicalMaterial({
                map: null,
                color: 0xddeaff,
                metalness: 0.0,
                roughness: 0,
                opacity: 0.7,
                side: THREE.FrontSide,
                transparent: true,
                envMapIntensity: 10,
                premultipliedAlpha: false
            });
            roomMaterial = glassMaterial;
        }
        let numVerts = PD.rlaplace(1, meanVertsPerFloor, meanVertsPerFloor / 8)[0];
        let floorHeight = PD.rlaplace(1, meanFloorHeight, meanFloorHeight / 3)[0];
        let floorSize = Math.round(THREE.Math.lerp(meanFloorSize, meanFloorSize / 3, i / numRooms));
        new Room(numVerts, floorYPos, floorHeight, floorSize, roomMaterial);
        floorYPos += (floorHeight / 1);
    }
}

function Room(numVertsPerFloor, floorYPos, floorHeight, floorSize, material) {
    this.numVertsPerFloor = numVertsPerFloor;
    this.floorYPos = floorYPos;
    this.floorHeight = floorHeight;
    this.floorSize = floorSize;
    this.material = material;

    this._generateFloor = function() {
        var floor = this._generateFloorPoints(this.floorYPos); // takes numVerteices, floor height, return array of vector3s
        var ceiling = this._generateFloorPoints(this.floorYPos + this.floorHeight);
        var room = floor.concat(ceiling);
        var roomGeometry = new THREE.ConvexBufferGeometry(room);
        var roomMesh = new THREE.Mesh(roomGeometry, this.material);
        roomMesh.rotateY(2 * Math.PI * Math.random());
        gObjects.push(roomMesh);
        gScene.add(roomMesh);
    }

    this._generateFloorPoints = function(floorYPos) {
        var shape = new THREE.Shape();
        shape.moveTo(0, 0);
        for (let i = 0; i < numVertsPerFloor; i++) {
            let randomAngle = 2 * Math.PI * Math.random(); // [0, 2pi]
            let randomRadius = PD.rlaplace(1, this.floorSize, this.floorSize / 5)[0]; //1 sample,  mean == 10
            let x = randomRadius * Math.cos(randomAngle); // cos -> -1 to 1
            let y = randomRadius * Math.sin(randomAngle);
            shape.lineTo(x, y);
        }
        var points = shape.getPoints();
        for (let i = 0; i < points.length; i++) {
            points[i] = new THREE.Vector3(points[i].x, floorYPos, points[i].y);
        }
        return points;
    }

    this._generateFloor();
}


// Graphics

function animate() {
    requestAnimationFrame(animate); // Asynchronously calls animate function when the next repaint can happen IE when call stack is clear. 
    gOrbitControls.update(); // only required if gOrbitControls.enableDamping = true, or if gOrbitControls.autoRotate = true
    render();
}

function render() {
    gRenderer.render(gScene, gCamera);
}


// Doc event listeners

function onWindowResize() {
    gCamera.aspect = window.innerWidth / window.innerHeight; // update aspect ratio for perspective gCamera
    gCamera.updateProjectionMatrix(); // update the gCamera's internal proj matrix
    gRenderer.setSize(window.innerWidth, window.innerHeight); // resize gRenderer
}

function onMouseMove(event) {
    gMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    gMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    gRaycaster.setFromCamera(gMouse, gCamera);
    // update the picking ray with the gCamera and gMouse position
}

function onDocumentKeyDown(event) {
    // update the picking ray with the gCamera and gMouse position

    var intersects = gRaycaster.intersectObjects(gScene.children);
    var keyCode = event.which;
    // Toggle rotation bool for meshes that we clicked
    if (keyCode == 68) {
        if (intersects.length > 0) {
            console.log("asds");
            intersects.forEach(function(intersect) {
                if (intersect.object.type == 'Mesh') {
                    intersect.object.rotateY(Math.PI / 3);

                }
            });
        }
    }
}