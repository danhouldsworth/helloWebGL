//used a lot of ideas from https://bl.ocks.org/robinhouston/ed597847175cf692ecce to clean this code up
// "use strict"; /* jshint
// browser : true
// */

let frameCount = 0;
let mouseCoordinates = [0,0];
const GPU       = initGPUMath();
const gl        = GPU.gl;
const glcanvas  = document.getElementById("glcanvas");
const display   = document.getElementById("display");
const n         = 2000; // particles = n*n
const width = glcanvas.width  = glcanvas.clientWidth = 1500;
const height= glcanvas.height = glcanvas.clientHeight= 1000;
glcanvas.onmousemove = (e) => mouseCoordinates = [e.clientX, height-e.clientY];

const vertexListRaster = new Float32Array([
    -1, +1, 0, 0,
    +1, +1, 1, 0,
    -1, -1, 0, 1,
    +1, -1, 1, 1
]);
const vertexListParticles = new Float32Array(n * n);
for (let i = 0; i < n*n; i++) vertexListParticles[i] = i;


let stateSpacePhysics = GPU.createProgram("stateSpacePhysics",  "vs_calc",  "fs_calc", vertexListRaster);
gl.uniform2f(gl.getUniformLocation(stateSpacePhysics,"canvasSize"), width, height);

let mapAndRender      = GPU.createProgram("mapAndRender",       "vs_draw",  "fs_draw", vertexListParticles);
gl.uniform2f(gl.getUniformLocation(mapAndRender,     "canvasSize"), width, height);
gl.uniform1f(gl.getUniformLocation(mapAndRender,     "n"), n);

const stateSpace   = new Float32Array(n * n * 4);
for (let i = 0; i < n; i++){
    for (let j = 0; j < n; j++){
        const index = 4 * (i * n + j);
        const x = (stateSpace[index + 0] = Math.random() * width) - width/2;
        const y = (stateSpace[index + 1] = Math.random() * height)- height/2;
        const ang = Math.atan2(y, x);
        const rad2 = x*x+y*y;
        stateSpace[index + 2] = Math.random() - 0.5;// + 10000*Math.sin(ang) / rad2;
        stateSpace[index + 3] = Math.random() - 0.5;// - 10000*Math.cos(ang) / rad2;
    }
}
GPU.initTextureFromData("stateSpace1", n, n, "FLOAT", stateSpace);   GPU.initFrameBufferForTexture("stateSpace1");
GPU.initTextureFromData("stateSpace2", n, n, "FLOAT", null);         GPU.initFrameBufferForTexture("stateSpace2");

function render(){
    const state_t1 = "stateSpace" + ((frameCount+0)%2 + 1);
    const state_t2 = "stateSpace" + ((frameCount+1)%2 + 1);
    GPU.setUniformForProgram("stateSpacePhysics", "u_mouseCoord", mouseCoordinates);
    GPU.calc("stateSpacePhysics",   state_t1, state_t2,   n);
    GPU.render("mapAndRender",      state_t2, null, n, width, height);
    window.requestAnimationFrame(render);
    frameCount++;
}

setInterval(function(){
    display.innerHTML = Math.round(n*n/1000)/1000 + "million particles @ " + 2*frameCount + "hz";
    frameCount = 0;
}, 500);

render();