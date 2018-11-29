//used a lot of ideas from https://bl.ocks.org/robinhouston/ed597847175cf692ecce to clean this code up
// "use strict"; jshint
// browser : true


let width, height;
let actualWidth, actualHeight;
let body;

let obstaclePosition    = [0,0];
let obstacleRad         = 50;//25;
let movingObstacle      = false;

let lastMouseCoordinates= [0,0];
let mouseCoordinates    = [0,0];
let mouseEnable         = false;

let paused = false; // while window is resizing

const CanvasTexture = null; // if bindFrameBuffer = null, then outputs to HTML Canvas

const dt = 1;
const dx = 1;
// var nu = 1;//viscosity
// var rho = 1;//density

let GPU;

window.onload = initGL;

function initGL() {

    canvas  = document.getElementById("glcanvas");
    body    = document.body;

    canvas.onmousemove  = onMouseMove;
    canvas.ontouchmove  = onTouchMove;
    canvas.onmousedown  = onMouseDown;
    canvas.ontouchstart = onMouseDown;
    canvas.onmouseup    = onMouseUp;
    canvas.ontouchend   = onMouseUp;
    canvas.onmouseout   = onMouseUp;
    canvas.ontouchcancel= onMouseUp;

    window.onresize = onResize;

    GPU = initGPUMath();

    // setup a GLSL programs
    GPU.createProgram("advectVel", "2d-vertex-shader", "advectShaderVel");
    GPU.setUniformForProgram("advectVel", "u_dt",       dt, "1f");
    GPU.setUniformForProgram("advectVel", "u_velocity", 0,  "1i");
    GPU.setUniformForProgram("advectVel", "u_material", 1,  "1i");

    GPU.createProgram("advectMat", "2d-vertex-shader", "advectShaderMat");
    GPU.setUniformForProgram("advectMat", "u_dt",       dt, "1f");
    GPU.setUniformForProgram("advectMat", "u_velocity", 0,  "1i");
    GPU.setUniformForProgram("advectMat", "u_material", 1,  "1i");

    GPU.createProgram("gradientSubtraction", "2d-vertex-shader", "gradientSubtractionShader");
    GPU.setUniformForProgram("gradientSubtraction", "u_const",      0.5 / dx,   "1f"); //dt/(2*rho*dx)
    GPU.setUniformForProgram("gradientSubtraction", "u_velocity",   0,          "1i");
    GPU.setUniformForProgram("gradientSubtraction", "u_pressure",   1,          "1i");

    GPU.createProgram("diverge", "2d-vertex-shader", "divergenceShader");
    GPU.setUniformForProgram("diverge", "u_const",      0.5 / dx,   "1f");//-2*dx*rho/dt
    GPU.setUniformForProgram("diverge", "u_velocity",   0,          "1i");

    GPU.createProgram("force", "2d-vertex-shader", "forceShader");
    GPU.setUniformForProgram("force", "u_dt",           dt, "1f");
    GPU.setUniformForProgram("force", "u_velocity",     0,  "1i");

    GPU.createProgram("jacobi", "2d-vertex-shader", "jacobiShader");
    GPU.setUniformForProgram("jacobi", "u_b",           0, "1i");
    GPU.setUniformForProgram("jacobi", "u_x",           1, "1i");

    GPU.createProgram("render", "2d-vertex-shader", "2d-render-shader");
    GPU.setUniformForProgram("render", "u_material",    0, "1i");

    GPU.createProgram("boundary", "2d-vertex-shader", "boundaryConditionsShader");
    GPU.setUniformForProgram("boundary", "u_texture",   0, "1i");

    resetWindow();

    render();
}

function render(){

    if (!paused) {

        const scalerAoArads = (document.getElementById("angleAttack").value / 360.0)*2.0*Math.PI;
        GPU.setUniformForProgram("render" ,"u_angleAttack", scalerAoArads, "1f");GPU.setUniformForProgram("boundary" ,"u_angleAttack", scalerAoArads, "1f");
        switch (document.querySelector('input[name="obstacleShape"]:checked').value){
            case "square"       :   GPU.setUniformForProgram("render" ,"u_obstacleShape",     1.0, "1f");GPU.setUniformForProgram("boundary" ,"u_obstacleShape",     1.0, "1f");    break;
            case "circle"       :   GPU.setUniformForProgram("render" ,"u_obstacleShape",     2.0, "1f");GPU.setUniformForProgram("boundary" ,"u_obstacleShape",     2.0, "1f");    break;
            case "airfoil"      :   GPU.setUniformForProgram("render" ,"u_obstacleShape",     3.0, "1f");GPU.setUniformForProgram("boundary" ,"u_obstacleShape",     3.0, "1f");    break;
        }

        // Advect velocity
        GPU.setSize(width, height);
        GPU.step("advectVel", ["velocity", "velocity"], "nextVelocity");

        GPU.setUniformForProgram("boundary" ,"u_obstaclePosition", [obstaclePosition[0] * width / actualWidth, obstaclePosition[1] * height / actualHeight], "2f");
        GPU.setUniformForProgram("boundary", "u_scale", -1, "1f");
        GPU.step("boundary", ["nextVelocity"], "velocity");

        //apply force
        if (mouseEnable){
            GPU.setUniformForProgram("force", "u_mouseCoord",   [mouseCoordinates[0] * width / actualWidth, mouseCoordinates[1] * height / actualHeight], "2f");
            GPU.setUniformForProgram("force", "u_mouseDir",     [mouseCoordinates[0] - lastMouseCoordinates[0], mouseCoordinates[1] - lastMouseCoordinates[1]], "2f");
            GPU.step("force", ["velocity"], "nextVelocity");

            GPU.setUniformForProgram("boundary", "u_scale", -1, "1f");
            GPU.step("boundary", ["nextVelocity"], "velocity");
        }

        // compute pressure
        GPU.step("diverge", ["velocity"], "velocityDivergence");//calc velocity divergence

        // <-- Diffuse velocity
        GPU.setUniformForProgram("jacobi", "u_alpha", -dx*dx, "1f");
        GPU.setUniformForProgram("jacobi", "u_reciprocalBeta", 1/4, "1f");
        for (let i = 0; i < 2; i++){
            GPU.step("jacobi", ["velocityDivergence", "pressure"],      "nextPressure");
            GPU.step("jacobi", ["velocityDivergence", "nextPressure"],  "pressure");
        }
        // -->

        GPU.setUniformForProgram("boundary", "u_scale", 1, "1f");
        GPU.step("boundary", ["pressure"], "nextPressure");
        GPU.swapTextures("nextPressure", "pressure");

        // subtract pressure gradient
        GPU.step("gradientSubtraction", ["velocity", "pressure"], "nextVelocity");

        GPU.setUniformForProgram("boundary", "u_scale", -1, "1f");
        GPU.step("boundary", ["nextVelocity"], "velocity");

        // move material
        GPU.setSize(actualWidth, actualHeight);
        GPU.step("advectMat", ["velocity", "material"], "nextMaterial");

        GPU.setUniformForProgram("render" ,"u_obstaclePosition", [obstaclePosition[0], obstaclePosition[1]], "2f");
        const scalerP = document.getElementById("scalerP").value;
        const scalerD = document.getElementById("scalerD").value;
        switch (document.querySelector('input[name="visualisation"]:checked').value){
            case "divergence"   :   GPU.setUniformForProgram("render" ,"u_colourScaler",     scalerD, "1f");      GPU.step("render", ["velocityDivergence"],CanvasTexture);         break;
            case "material"     :   GPU.setUniformForProgram("render" ,"u_colourScaler",     1.0, "1f");          GPU.step("render", ["nextMaterial"],      CanvasTexture);         break;
            case "velocity"     :   GPU.setUniformForProgram("render" ,"u_colourScaler",     1.0, "1f");          GPU.step("render", ["velocity"],          CanvasTexture);         break;
            case "pressure"     :   GPU.setUniformForProgram("render" ,"u_colourScaler",     scalerP, "1f");      GPU.step("render", ["pressure"],          CanvasTexture);         break;
        }

        GPU.swapTextures("nextMaterial", "material");

    }
    // else resetWindow();

    window.requestAnimationFrame(render);
}

function onResize(){
    // paused = true;
}

function resetWindow(){
    // const canvas    = document.getElementById("glcanvas");
    const display = document.getElementById("display");

    actualWidth     = 1000;//body.clientWidth;
    actualHeight    = 0.5 * actualWidth;

    width   = actualWidth;//500;
    height  = Math.floor(width * actualHeight / actualWidth);
    obstaclePosition = [actualWidth * 0.25, actualHeight / 2];

    display.innerHTML = "screen=" + actualWidth + " x " + actualHeight + " , mesh=" + width + " x " + height;
    const scale     = actualWidth / width;

    canvas.width        = canvas.clientWidth = actualWidth;
    canvas.height       = canvas.clientHeight= actualHeight;

    GPU.setProgram("advectVel");
    GPU.setUniformForProgram("advectVel" ,"u_textureSize", [width, height], "2f");
    GPU.setUniformForProgram("advectVel" ,"u_scale", 1, "1f");

    GPU.setProgram("advectMat");
    GPU.setUniformForProgram("advectMat" ,"u_textureSize", [actualWidth, actualHeight], "2f");
    GPU.setUniformForProgram("advectMat" ,"u_scale", width/actualWidth, "1f");

    GPU.setProgram("gradientSubtraction");
    GPU.setUniformForProgram("gradientSubtraction" ,"u_textureSize", [width, height], "2f");

    GPU.setProgram("diverge");
    GPU.setUniformForProgram("diverge" ,"u_textureSize", [width, height], "2f");

    GPU.setProgram("force");
    GPU.setUniformForProgram("force", "u_reciprocalRadius", 0.1 * scale, "1f");
    GPU.setUniformForProgram("force" ,"u_textureSize", [width, height], "2f");

    GPU.setProgram("jacobi");
    GPU.setUniformForProgram("jacobi" ,"u_textureSize", [width, height], "2f");

    GPU.setProgram("render");
    GPU.setUniformForProgram("render" ,"u_obstaclePosition", [obstaclePosition[0], obstaclePosition[1]], "2f");
    GPU.setUniformForProgram("render" ,"u_textureSize", [actualWidth, actualHeight], "2f");
    GPU.setUniformForProgram("render" ,"u_obstacleRad", obstacleRad, "1f");

    GPU.setProgram("boundary");
    GPU.setUniformForProgram("boundary" ,"u_textureSize", [width, height], "2f");
    GPU.setUniformForProgram("boundary" ,"u_obstaclePosition", [obstaclePosition[0] * width / actualWidth, obstaclePosition[1] * height / actualHeight], "2f");
    GPU.setUniformForProgram("boundary" ,"u_obstacleRad", obstacleRad * width / actualWidth, "1f");

    const fieldSize = width * height * 4;
    const velocity  = new Float32Array(fieldSize);
    const pressure  = new Float32Array(fieldSize);
    const divergence= new Float32Array(fieldSize);
    for (let i = 0; i < height; i++){
        for (let j = 0; j < width; j++){
            const index = 4 * (i * width + j);
            velocity[index] = 1.0; // in advectShaderVel on left edge BC
        }
    }
    GPU.initTextureFromData("velocity",             width, height, "FLOAT", velocity);  GPU.initFrameBufferForTexture("velocity");
    GPU.initTextureFromData("nextVelocity",         width, height, "FLOAT", velocity);  GPU.initFrameBufferForTexture("nextVelocity");
    GPU.initTextureFromData("velocityDivergence",   width, height, "FLOAT", divergence);GPU.initFrameBufferForTexture("velocityDivergence");
    GPU.initTextureFromData("pressure",             width, height, "FLOAT", pressure);  GPU.initFrameBufferForTexture("pressure");
    GPU.initTextureFromData("nextPressure",         width, height, "FLOAT", pressure);  GPU.initFrameBufferForTexture("nextPressure");

    let numCols = 100;
    if (numCols%2 === 1) numCols--;
    const numPx = actualHeight / numCols;

    const material = new Float32Array(actualWidth * actualHeight * 4);
    for (let i = 0; i < actualHeight; i++){
        for (let j = 0; j < actualWidth; j++){
            const index = 4 * (i * actualWidth + j);
            // if (Math.floor((i - 2) / numPx)%5 === 0) material[index] = 1.0;
            if (i%20 < 3) material[index] = 1.0;
        }
    }
    GPU.initTextureFromData("material",     actualWidth, actualHeight, "FLOAT", material);  GPU.initFrameBufferForTexture("material");
    GPU.initTextureFromData("nextMaterial", actualWidth, actualHeight, "FLOAT", material);  GPU.initFrameBufferForTexture("nextMaterial");

    // paused = false;
}

function onMouseMove(e){
    lastMouseCoordinates = mouseCoordinates;
    mouseCoordinates = [e.clientX, actualHeight-e.clientY];
    updateObstaclePosition();
}
function onTouchMove(e){
    e.preventDefault();
    var touch = e.touches[0];
    lastMouseCoordinates = mouseCoordinates;
    mouseCoordinates = [touch.pageX, actualHeight-touch.pageY];
    updateObstaclePosition();
}

function updateObstaclePosition(){
    if (movingObstacle) obstaclePosition = mouseCoordinates;
}

function onMouseDown(){
    const distToObstacle = [mouseCoordinates[0] - obstaclePosition[0], mouseCoordinates[1] - obstaclePosition[1]];
    if (distToObstacle[0] * distToObstacle[0] + distToObstacle[1] * distToObstacle[1] < obstacleRad * obstacleRad){
        movingObstacle  = true;
        mouseEnable     = false;
    } else {
        mouseEnable     = true;
        movingObstacle  = false;
    }
}

function onMouseUp(){
    movingObstacle  = false;
    mouseEnable     = false;
}