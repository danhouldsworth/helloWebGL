"use strict"; /* jshint
browser : true
*/

const initGPUMath = () => {
    const glcanvas        = document.getElementById("glcanvas");
    const gl              = glcanvas.getContext("webgl", {antialias:false});
    gl.getExtension("OES_texture_float");
    console.log("maxTexturesInFragmentShader = " + gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));
    gl.disable(gl.DEPTH_TEST);

    const GPUMath = function(){
        this.programs       = {};
        this.frameBuffers   = {};
        this.textures       = {};
        this.gl = gl;
    };

    GPUMath.prototype.createProgram = function(programName, vertexShaderID, fragmentShaderID, vertexList){

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

        this.programs[programName] = {
            program : program,
            vBuffer : vBuffer
        };

        return program;
    };

    GPUMath.prototype.initTextureFromData = function(name, width, height, typeName, data){
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl[typeName], data); //

        this.textures[name] = texture;
    };

    GPUMath.prototype.initFrameBufferForTexture = function(textureName){
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textures[textureName], 0);

        this.frameBuffers[textureName] = framebuffer;
    };

    GPUMath.prototype.setUniformForProgram = function(programName, name, val){
        const program = this.programs[programName].program;
        gl.useProgram(program);
        gl.uniform2f(gl.getUniformLocation(program, name), val[0], val[1]);
    };

    GPUMath.prototype.calc = function(programName, inputTexture, outputTexture, n){
        const program = this.programs[programName].program;
        const vBuffer = this.programs[programName].vBuffer;
        const input   = this.textures[inputTexture];
        const output  = this.frameBuffers[outputTexture];

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

    GPUMath.prototype.render = function(programName, inputTexture, outputTexture, n, width, height){
        const program = this.programs[programName].program;
        const vBuffer = this.programs[programName].vBuffer;
        const input   = this.textures[inputTexture];
        const output  = this.frameBuffers[outputTexture];

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.useProgram(program);

        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        const location = gl.getAttribLocation(program, "aIndex");
        gl.enableVertexAttribArray( location);
        gl.vertexAttribPointer(     location, 1, gl.FLOAT, false, 1 * 4, 0);     // size / stride / offset
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, input);

        gl.bindFramebuffer(gl.FRAMEBUFFER, output);

        gl.viewport(0, 0, width, height);

        gl.drawArrays(gl.POINTS, 0, n * n);//draw to framebuffer
    };

    GPUMath.prototype.swapTextures = function(texture1Name, texture2Name){
        let temp = this.textures[texture1Name];
        this.textures[texture1Name] = this.textures[texture2Name];
        this.textures[texture2Name] = temp;
        temp = this.frameBuffers[texture1Name];
        this.frameBuffers[texture1Name] = this.frameBuffers[texture2Name];
        this.frameBuffers[texture2Name] = temp;
    };

    return new GPUMath();
}