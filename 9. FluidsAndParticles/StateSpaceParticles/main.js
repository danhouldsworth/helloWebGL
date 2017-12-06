//used a lot of ideas from https://bl.ocks.org/robinhouston/ed597847175cf692ecce to clean this code up
// "use strict"; /* jshint
// browser : true
// */
const canvas        = document.getElementById("glcanvas");
const gl            = canvas.getContext("webgl", {antialias:false});
const n             = 1000; // particles = n*n
const width         = canvas.width  = canvas.clientWidth = 1000;
const height        = canvas.height = canvas.clientHeight= 1000;
const programs      = {};
const frameBuffers  = {};
const textures      = {};
gl.disable(gl.DEPTH_TEST);
gl.getExtension("OES_texture_float");
console.log("GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS = " + gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS));
console.log("maxTexturesInFragmentShader = " + gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));

const createProgram = function(programName, vertexShaderID, fragmentShaderID, vertexList){

    function createShaderFromScript(scriptId, shaderType) {
        const shader = gl.createShader(shaderType);
        gl.shaderSource( shader, document.getElementById(scriptId).text);
        gl.compileShader(shader);                                       if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {throw "could not compile shader:" + gl.getShaderInfoLog(shader);}
        return shader;
    }

    const program = gl.createProgram();
    gl.attachShader(program, createShaderFromScript(vertexShaderID,     gl.VERTEX_SHADER));
    gl.attachShader(program, createShaderFromScript(fragmentShaderID,   gl.FRAGMENT_SHADER));
    gl.linkProgram( program);                                           if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {throw ("program filed to link:" + gl.getProgramInfoLog (program));}
    gl.useProgram(  program);

    const vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexList, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    programs[programName] = {
        program : program,
        vBuffer : vBuffer
    };

    return program;
};

const initTextureFromData = function(name, width, height, data){
    const texture = gl.createTexture();
    gl.bindTexture(  gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,  gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,  gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,      gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,      gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, data); //

    textures[name] = texture;
};

const initFrameBufferForTexture = function(textureName){
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures[textureName], 0);

    frameBuffers[textureName] = framebuffer;
};

const setUniformForProgram = function(programName, name, val){
    const program = programs[programName].program;
    gl.useProgram(program);
    gl.uniform2f(gl.getUniformLocation(program, name), val[0], val[1]);
};

const calc = function(programName, inputTexture, outputTexture, n){
    const program = programs[programName].program;
    const vBuffer = programs[programName].vBuffer;
    const input   = textures[inputTexture];
    const output  = frameBuffers[outputTexture];

    gl.disable(gl.BLEND);
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    let location = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray( location);
    gl.vertexAttribPointer(     location, 2, gl.FLOAT, false, 4 * 4, 0);     // size / stride / offset
        location = gl.getAttribLocation(program, "aUv");
    gl.enableVertexAttribArray( location);
    gl.vertexAttribPointer(     location, 2, gl.FLOAT, false, 4 * 4, 2 * 4); // size / stride / offset
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, input);

    gl.bindFramebuffer(gl.FRAMEBUFFER, output);

    gl.viewport(0, 0, n, n);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);//draw to framebuffer
};

const viewTexture = function(programName, inputTexture, outputTexture, width, height){
    const program = programs[programName].program;
    const vBuffer = programs[programName].vBuffer;
    const input   = textures[inputTexture];

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    let location = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray( location);
    gl.vertexAttribPointer(     location, 2, gl.FLOAT, false, 4 * 4, 0);     // size / stride / offset
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, input);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.viewport(0, 0, width, height);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);//draw to framebuffer
};

const pressure = function(programName, inputTexture, outputTexture, n, width, height){
    const program = programs[programName].program;
    const vBuffer = programs[programName].vBuffer;
    const stateSpace = textures[inputTexture];
    const output  = frameBuffers[outputTexture];

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    const location = gl.getAttribLocation(program, "aIndex");
    gl.enableVertexAttribArray( location);
    gl.vertexAttribPointer(     location, 1, gl.FLOAT, false, 1 * 4, 0);     // size / stride / offset
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, stateSpace);
    gl.activeTexture(gl.TEXTURE0 + 1);
    gl.bindTexture(gl.TEXTURE_2D, textures.pressureMap);

    gl.bindFramebuffer(gl.FRAMEBUFFER, output);
    // gl.clearColor(0, 0, 0, 0);
    // gl.clear(gl.COLOR_BUFFER_BIT);

    gl.viewport(0, 0, width, height);

    gl.drawArrays(gl.POINTS, 0, n * n); // draw to framebuffer
};

const render = function(programName, inputTexture, outputTexture, n, width, height){
    const program = programs[programName].program;
    const vBuffer = programs[programName].vBuffer;
    const stateSpace = textures[inputTexture];
    const output  = frameBuffers[outputTexture];

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    const location = gl.getAttribLocation(program, "aIndex");
    gl.enableVertexAttribArray( location);
    gl.vertexAttribPointer(     location, 1, gl.FLOAT, false, 1 * 4, 0);     // size / stride / offset
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.uniform1i(gl.getUniformLocation(program, "stateSpaceTexture"),   0);  // gl.TEXTURE0
    gl.uniform1i(gl.getUniformLocation(program, "pressureMap"),         1);  // gl.TEXTURE1

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, stateSpace);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures.pressureMap);

    gl.bindFramebuffer(gl.FRAMEBUFFER, output);

    gl.viewport(0, 0, width, height);

    gl.drawArrays(gl.POINTS, 0, n * n); // draw to framebuffer
};

const swapTextures = function(texture1Name, texture2Name){
    let temp = textures[texture1Name];
    textures[texture1Name] = textures[texture2Name];
    textures[texture2Name] = temp;
    temp = frameBuffers[texture1Name];
    frameBuffers[texture1Name] = frameBuffers[texture2Name];
    frameBuffers[texture2Name] = temp;
};

const compileSystemPrograms = function(){
    // <-- Compile programs / Set constant global uniforms
    const vertexListRaster = new Float32Array([
        -1, +1, 0, 0,
        +1, +1, 1, 0,
        -1, -1, 0, 1,
        +1, -1, 1, 1
    ]);
    const vertexListParticles = new Float32Array(n * n);
    for (let i = 0; i < n*n; i++) vertexListParticles[i] = i;


    let stateSpacePhysics = createProgram("stateSpacePhysics",  "vs_calc",  "fs_calc",      vertexListRaster);
    gl.uniform2f(gl.getUniformLocation(stateSpacePhysics,"canvasSize"), width, height);

    let pressureCalc      = createProgram("pressureCalc",       "vs_draw",  "fs_pressure",  vertexListParticles);
    gl.uniform2f(gl.getUniformLocation(pressureCalc,     "canvasSize"), width, height);
    gl.uniform1f(gl.getUniformLocation(pressureCalc,     "n"), n);

    let mapAndRender      = createProgram("mapAndRender",       "vs_draw",  "fs_draw",      vertexListParticles);
    gl.uniform2f(gl.getUniformLocation(mapAndRender,     "canvasSize"), width, height);
    gl.uniform1f(gl.getUniformLocation(mapAndRender,     "n"), n);

    let viewTexture      = createProgram("viewTexture",         "vs_view",  "fs_view",      vertexListRaster);
};

const initialiseStateSpace = function(){
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
    initTextureFromData("stateSpace1", n, n, stateSpace);   initFrameBufferForTexture("stateSpace1");
    initTextureFromData("stateSpace2", n, n, null);         initFrameBufferForTexture("stateSpace2");
    initTextureFromData("pressureMap", n, n, null);         initFrameBufferForTexture("pressureMap");
};

// <-- Runtime
let frameCount = 0;
let mouseCoordinates = [0,0];
glcanvas.onmousemove= (e) => mouseCoordinates = [e.clientX, height-e.clientY];
const animate = function (){
    setUniformForProgram("stateSpacePhysics", "u_mouseCoord", mouseCoordinates);

    // StateSpace --> StateSpace overwriting calcs
    calc("stateSpacePhysics",   "stateSpace1", "stateSpace2",   n);

    // gl.bindTexture(  gl.TEXTURE_2D, textures.pressureMap);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,  gl.NEAREST);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,  gl.NEAREST);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,      gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,      gl.CLAMP_TO_EDGE);
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null); //
    // gl.bindTexture( gl.TEXTURE_2D, null);
    // List of particles --> Physical space
    // pressure("pressureCalc",    "stateSpace2", "pressureMap",   n, width, height);
    render("mapAndRender",      "stateSpace2", null,            n, width, height);

    // calc("viewTexture",         "pressureMap", null,            n, width, height);

    swapTextures("stateSpace1", "stateSpace2");

    window.requestAnimationFrame(animate);
    frameCount++;
};
setInterval(function(){
    document.getElementById("display").innerHTML = Math.round(n*n/1000)/1000 + "million particles @ " + 2*frameCount + "hz";
    frameCount = 0;
}, 500);
compileSystemPrograms();
initialiseStateSpace();
animate();
// -->

// <-- Read, stateSpace, write to physicalSpace, output to textureBuffer
const heatMap = new Float32Array(n * n * 4);
// gl.readPixels(0, 0, n, n, gl.RGBA, gl.FLOAT, heatMap);
let maxVal  = 0;
let maxIndex= 0;
for (let i = 0; i < n; i++){
    for (let j = 0; j < n; j++){
        const index     = 4 * (i * n + j) +3;
        const density   = heatMap[index];
        if (density > maxVal){
            maxVal = density;
            maxIndex = index;
        }
    }
}
console.log(maxIndex);
console.log(maxVal);
console.log(heatMap[maxIndex]);