let frameCount = 0;
let mouseCoordinates = [0,0];
let gl;
// --
const Context       = wgl.Context;

const t             = function() {
    this._update = () => {
        window.requestAnimationFrame(this._update);
        this._back     = this._front;
        this._front    = 3 - this._front;
        this._calc();
        this._draw();
        frameCount++;
    };
    gl = this._context = new Context(document.getElementById("wgl"));
};
t.prototype._initWebGL = function() {
    this._front         = 1;
    this._back          = 2;
    this._program = this._context.createProgram();
    this._program.addVertexShaderScript("vs_common");
    this._program.addVertexShaderScript("vs_draw");

    this._program.addFragmentShaderScript("fs_setup");
    this._program.addFragmentShaderScript("fs_calc");
    this._program.addFragmentShaderScript("fs_draw");

    this._program.addProgram("setup",   "vs_common",    "fs_setup");
    this._program.addProgram("calc",    "vs_common",    "fs_calc");
    this._program.addProgram("draw",    "vs_draw",      "fs_draw");

    this._uniform       = this._context.createUniform();
    this._vertexBuffer  = this._context.createVertexBuffer();
    this._initVertex();
    this._texture       = this._context.createTexture();
    this._frameBuffer   = this._context.createFrameBuffer();
    this._initTexture();
};
t.prototype._initVertex = function() {
    const vertexListCalc = new Float32Array([
        -1, +1, 0, 0,
        +1, +1, 1, 0,
        -1, -1, 0, 1,
        +1, -1, 1, 1
    ]);
    this._vertexBuffer.add("vertexCalc", vertexListCalc, gl.STATIC_DRAW);

    const vertexListDraw = new Float32Array(main_num)
    for (let i = 0; i < main_num; i++){
        vertexListDraw[i] = i;
    }
    this._vertexBuffer.add("vertexDraw", vertexListDraw, gl.STATIC_DRAW);
};
t.prototype._setVertexCommon = function() {
    this._vertexBuffer.setAttribPointer("vertexCalc", this._program.getAttribLocation("aPosition"), 2, gl.FLOAT, false, 4 * 4, 0);     // Take 2 floats from offset = 0
    this._vertexBuffer.setAttribPointer("vertexCalc", this._program.getAttribLocation("aUv"),       2, gl.FLOAT, false, 4 * 4, 2 * 4); // then 2 floats from offset = 2
};
t.prototype._setVertexDraw = function() {
    this._vertexBuffer.setAttribPointer("vertexDraw", this._program.getAttribLocation("aIndex"),    1, gl.FLOAT, false, 1 * 4, 0);
};
t.prototype._initTexture = function() {
    const stateSpace1   = new Float32Array(main_size * main_size * 4);
    for (let i = 0; i < main_size; i++){
        for (let j = 0; j < main_size; j++){
            const index = 4 * (i * main_size + j);
            stateSpace1[index + 0] = Math.random();//* 1000;
            stateSpace1[index + 1] = Math.random();// * 1000;
            // stateSpace1[index + 2] = Math.random() - 0.5;
            // stateSpace1[index + 3] = Math.random() - 0.5;
        }
    }

    this._texture.create2D("calc1", main_size, main_size, stateSpace1);
    this._texture.create2D("calc2", main_size, main_size, stateSpace1);
    this._frameBuffer.add("calc1", this._texture.get2D("calc1"));
    this._frameBuffer.add("calc2", this._texture.get2D("calc2"));
};
t.prototype._setUniformSetup = function() {
    this._uniform.setFloat(this._program.getUniformLocation("ran"), Math.random());
    this._uniform.setFloat(this._program.getUniformLocation("size"), main_size);
};
t.prototype._setUniformCalc = function() {
    this._uniform.setFloat(this._program.getUniformLocation("u_mouseCoord"), mouseCoordinates[0], mouseCoordinates[1]);
    this._texture.uniformTexture2D("calc" + this._back, 0, this._program.getUniformLocation("texture"));
    this._texture.bind("calc" + this._back);
};
t.prototype._setup = function() {
    const gl = this._context.context;
    gl.disable(gl.BLEND);
    this._frameBuffer.bind("calc" + this._front);
    gl.viewport(0, 0, main_size, main_size);
    this._program.useProgram("setup");
    this._setUniformSetup();
    this._setVertexCommon();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // gl.flush();
};
t.prototype._calc = function() {
    const gl = this._context.context;
    gl.disable(gl.BLEND);
    this._frameBuffer.bind("calc" + this._front);
    gl.viewport(0, 0, main_size, main_size);
    this._program.useProgram("calc");
    this._setUniformCalc();
    this._setVertexCommon();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // gl.flush();
};
t.prototype._draw = function() {
    const gl = this._context.context;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    this._program.useProgram("draw");
    gl.viewport(0, 0, 1000, 1000);

    this._frameBuffer.unbind(); // gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    this._uniform.setFloat(this._program.getUniformLocation("size"), main_size);
    this._texture.uniformTexture2D("calc" + this._front, 0, this._program.getUniformLocation("texture"));
    this._texture.bind("calc" + this._front);

    this._setVertexDraw(); // Loads the full index buffer

    gl.drawArrays(gl.POINTS, 0, main_num);
    // gl.flush();
};
const main = new t();
console.log("wgl.context.isSupported: " + main._context.isSupported);
console.log("wgl.context.isSupportedTextureFloat: " + main._context.isSupportedTextureFloat);
main_size             = 1000;
main_num              = main_size * main_size;
main._initWebGL();
main._setup();
main._update();
// --
document.getElementById("wgl").onmousemove = (e) => mouseCoordinates = [(e.clientX || 0) - 500,(1000 - e.clientY || 0) - 500];
setInterval(function(){
    document.getElementById("display").innerHTML = Math.round(main_num/1000)/1000 + "million particles @ " + 2 * frameCount + "hz";
    frameCount = 0;
}, 500);
