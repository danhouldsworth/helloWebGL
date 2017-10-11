//used a lot of ideas from https://bl.ocks.org/robinhouston/ed597847175cf692ecce to clean this code up
// "use strict"; jshint
// browser : true

let lastTime;
let frameCount = 0;

let lastMouseCoordinates= [0,0];
let mouseCoordinates    = [0,0];

const GPU       = initGPUMath();
const glcanvas  = document.getElementById("glcanvas");
const display   = document.getElementById("display");
const n         = 317; // particles = n*n
glcanvas.width  = glcanvas.clientWidth = 1000;
glcanvas.height = glcanvas.clientHeight= 1000;
glcanvas.onmousemove  = onMouseMove;

GPU.createProgram("particlePhysics",        "2d-vertex-shader", "particlePhysics");
GPU.createProgram("renderParticles",        "2d-vertex-shader", "renderParticles");

GPU.setUniformForProgram("particlePhysics",     "u_textureSizeState", [n, n], "2f");
GPU.setUniformForProgram("renderParticles",     "u_textureSizePhysical", [1000,1000], "2f");
GPU.setUniformForProgram("particlePhysics",     "u_mouseCoord",   [mouseCoordinates[0], mouseCoordinates[1]], "2f");

const stateSpace1   = new Float32Array(n * n * 4);
const stateSpace2   = new Float32Array(n * n * 4);
for (let i = 0; i < n; i++){
    for (let j = 0; j < n; j++){
        const index = 4 * (i * n + j);
        stateSpace1[index + 0] = Math.random() * 1000;
        stateSpace1[index + 1] = Math.random() * 1000;
        stateSpace1[index + 2] = Math.random() - 0.5;
        stateSpace1[index + 3] = Math.random() - 0.5;
    }
}
GPU.initTextureFromData("stateSpace1", n, n,            "FLOAT", stateSpace1);  GPU.initFrameBufferForTexture("stateSpace1");
GPU.initTextureFromData("stateSpace2", n, n,            "FLOAT", stateSpace2);  GPU.initFrameBufferForTexture("stateSpace2");
const physicalSpace = new Float32Array(1000 * 1000 * 4);
GPU.initTextureFromData("physicalSpace", 1000, 1000,    "FLOAT", physicalSpace);GPU.initFrameBufferForTexture("physicalSpace");

function render(){

    GPU.setSize(n, n);
    GPU.step("particlePhysics", ["stateSpace1"], "stateSpace2");
    GPU.swapTextures("stateSpace1", "stateSpace2");

    // <-- Read, stateSpace, write to physicalSpace, output to textureBuffer
    GPU.readPixels(n, stateSpace1);
    physicalSpace.fill(0);
    for (let i = 0; i < n; i++){
        for (let j = 0; j < n; j++){
            const indexParticle = 4 * (i * n + j);
            const x = stateSpace1[indexParticle]    | 0;
            const y = stateSpace1[indexParticle + 1]| 0;
            const indexPhysical = 4 * (x + y * 1000);
            physicalSpace[indexPhysical]        += 0.5;
        }
    }
    GPU.initTextureFromData("physicalSpace", 1000, 1000,    "FLOAT", physicalSpace);//GPU.initFrameBufferForTexture("physicalSpace");
    // -->

    GPU.setSize(1000, 1000);
    GPU.step("renderParticles", ["physicalSpace"], null);

    frameCount++;
    window.requestAnimationFrame(render);
}
setInterval(function(){
    display.innerHTML = n*n + " particles @ " + 2*frameCount + "hz";
    // lastTime = Date.now();
    frameCount = 0;
}, 500);

function onMouseMove(e){
    lastMouseCoordinates = mouseCoordinates;
    mouseCoordinates = [e.clientX, 1000 - e.clientY];
    GPU.setUniformForProgram("particlePhysics",     "u_mouseCoord",   [mouseCoordinates[0], mouseCoordinates[1]], "2f");
}

render();
