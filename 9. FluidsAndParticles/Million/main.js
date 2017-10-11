let frameCount = 0;
// let mouseCoordinates    = [0,0];
// --
const Context       = wgl.Context;
const Program       = wgl.Program;
const VertexBuffer  = wgl.VertexBuffer;
const IndexBuffer   = wgl.IndexBuffer;
const Texture       = wgl.Texture;
const Uniform       = wgl.Uniform;
const WGLMath       = wgl.utils.WGLMath;
const t             = function() {
    this._mouseX = 0;
    this._mouseY = 0;
    this._mouseDown = 0;
    this._update = () => {
        window.requestAnimationFrame(this._update);
        this._back     = this._front;
        this._front    = 3 - this._front;
        this._calc();
        this._draw();
        frameCount++;
    };
    this._objSpeed = {};
    this._objArea = {};
    this._objScrew = {};
    this._onResize = () => {
        const t = 1000;//document.body.clientWidth;
        const i = 1000;//document.body.clientHeight;
        this._context.setCanvasSize(t, i);
        this._canvasWidth = t;
        this._canvasHeight = i;
        this._canvasRate = t / i;
    };
    this._context = new Context(document.getElementById("wgl"));
};
t.prototype._initWebGL = function() {
    this._canvasRate    = 1;
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
    this._indexBuffer   = this._context.createIndexBuffer();
    this._indexBuffer.add( "index", new Uint16Array([0, 1, 2, 2, 1, 3]), this._context.STATIC_DRAW);
    this._indexBuffer.bind("index");
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
    this._vertexBuffer.add("vertexCalc", vertexListCalc, this._context.STATIC_DRAW);

    const vertexListDraw = new Float32Array(t._num)
    for (let i = 0; i < t._num; i++){
        vertexListDraw[i] = i;
    }
    this._vertexBuffer.add("vertexDraw", vertexListDraw, this._context.STATIC_DRAW);
};
t.prototype._setVertexCommon = function() {
    // void gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
    this._vertexBuffer.setAttribPointer("vertexCalc", this._program.getAttribLocation("aPosition"), 2, this._context.FLOAT, !1, 4 * 4, 0);     // Take 2 floats from offset = 0
    this._vertexBuffer.setAttribPointer("vertexCalc", this._program.getAttribLocation("aUv"),       2, this._context.FLOAT, !1, 4 * 4, 2 * 4); // then 2 floats from offset = 2
};
t.prototype._setVertexDraw = function() {
    this._vertexBuffer.setAttribPointer("vertexDraw", this._program.getAttribLocation("aIndex"),    1, this._context.FLOAT, !1, 1 * 4, 0);
};
t.prototype._initTexture = function() {
    this._texture.create2D("calc1", t._size, t._size, !0);
    this._texture.create2D("calc2", t._size, t._size, !0);
    this._frameBuffer.add("calc1", this._texture.get2D("calc1"));
    this._frameBuffer.add("calc2", this._texture.get2D("calc2"));
};
t.prototype._setUniformSetup = function() {
    this._uniform.setFloat(this._program.getUniformLocation("canvasSize"), this._canvasWidth / 2, this._canvasHeight / 2);
    this._uniform.setFloat(this._program.getUniformLocation("ran"), Math.random());
    this._uniform.setFloat(this._program.getUniformLocation("size"), t._size);
};
t.prototype._setUniformCalc = function() {
    // this._uniform.setFloat(this._program.getUniformLocation("ran"), Math.random());
    this._uniform.setFloat(this._program.getUniformLocation("canvasSize"), this._canvasWidth / 2, this._canvasHeight / 2);
    this._uniform.setFloat(this._program.getUniformLocation("u_mouseCoord"), this._mouseX, this._mouseY);
    console.log(this._mouseX + " " + this._mouseY);
    // this._uniform.setInt(this._program.getUniformLocation("mouseDown"), this._objArea.hold || this._mouseDown);
    // this._uniform.setFloat(this._program.getUniformLocation("maxSpeed"), this._objSpeed.max);
    // this._uniform.setFloat(this._program.getUniformLocation("reduceSpeed"), this._objSpeed.reduce);
    // this._uniform.setInt(this._program.getUniformLocation("isProp"), "none" != this._objArea.propToDist ? 1 : 0);
    // this._uniform.setInt(this._program.getUniformLocation("isInverse"), "inverse" == this._objArea.propToDist ? 1 : 0);
    // this._uniform.setFloat(this._program.getUniformLocation("radius"), this._objArea.radius);
    // this._uniform.setFloat(this._program.getUniformLocation("strength"), this._objArea.strength);
    // this._uniform.setFloat(this._program.getUniformLocation("areaVariable"), this._objArea.variable);
    // this._uniform.setFloat(this._program.getUniformLocation("screw"), this._objScrew.rotation * t._DEGREES_TO_RADIANS);
    // this._uniform.setInt(this._program.getUniformLocation("bothSides"), this._objScrew.bothSides ? 1 : 0);
    // this._uniform.setFloat(this._program.getUniformLocation("screwVariable"), this._objScrew.variable);
    this._texture.uniformTexture2D("calc" + this._back, 0, this._program.getUniformLocation("texture"));
    this._texture.bind("calc" + this._back);
};
t.prototype._setUniformDraw = function() {
    this._uniform.setFloat(this._program.getUniformLocation("canvasSize"), this._canvasWidth / 2, this._canvasHeight / 2);
    this._uniform.setFloat(this._program.getUniformLocation("size"), t._size);
    this._texture.uniformTexture2D("calc" + this._front, 0, this._program.getUniformLocation("texture"));
    this._texture.bind("calc" + this._front);
};
t.prototype._setup = function() {
    this._context.blendMode(!1);
    this._frameBuffer.bind("calc" + this._front);
    this._context.setWebGLViewport(0, 0, t._size, t._size);
    this._program.useProgram("setup");
    this._setUniformSetup();
    this._setVertexCommon();
    this._context.clearColorBuffer(0, 0);
    this._context.context.drawElements(this._context.context.TRIANGLES, 6, this._context.UNSIGNED_SHORT, 0);
    this._context.context.flush();
};
t.prototype._calc = function() {
    this._context.blendMode(!1);
    this._frameBuffer.bind("calc" + this._front);
    this._context.setWebGLViewport(0, 0, t._size, t._size);
    this._program.useProgram("calc");
    this._setUniformCalc();
    this._setVertexCommon();
    this._context.clearColorBuffer(0, 0);
    this._context.context.drawElements(this._context.context.TRIANGLES, 6, this._context.UNSIGNED_SHORT, 0);
    this._context.context.flush();
};
t.prototype._draw = function() {
    this._context.blendMode(!0);
    this._context.blendAdd();
    this._frameBuffer.unbind();
    this._context.setWebGLViewport(0, 0, this._canvasWidth, this._canvasHeight);
    this._program.useProgram("draw");
    this._setUniformDraw();
    this._setVertexDraw();
    this._context.clearColorBuffer(0, 0);
    this._context.context.drawArrays(this._context.context.POINTS, 0, t._num);
    this._context.context.flush();
};
t._size             = 1000;
t._num              = t._size * t._size;
t._DEGREES_TO_RADIANS = Math.PI / 180;
const main = new t();
console.log("wgl.context.isSupported: " + main._context.isSupported);
console.log("wgl.context.isSupportedTextureFloat: " + main._context.isSupportedTextureFloat);
main._initWebGL();
main._onResize();
main._setup();
main._update();
// --
document.getElementById("wgl").onmousemove = (e) => {
    main._mouseX = (e.clientX || 0) - 500;
    main._mouseY = (1000 - e.clientY || 0) - 500;
    // console.log(t._mouseX + " " + t._mouseY);
    // GPU.setUniformForProgram("particlePhysics",     "u_mouseCoord",   [mouseCoordinates[0], mouseCoordinates[1]], "2f");
};
const display   = document.getElementById("display");
setInterval(function(){
    display.innerHTML = Math.round(t._num/1000)/1000 + "million particles @ " + 2*frameCount + "hz";
    // lastTime = Date.now();
    frameCount = 0;
}, 500);
