"use strict"; /* jshint
browser : true
*/

const initGPUMath = () => {
    const glcanvas        = document.getElementById("glcanvas");
    const gl              = glcanvas.getContext("webgl", {antialias:false});
    // const gl              = glcanvas.getContext("webgl2");
    gl.getExtension("OES_texture_float");
    console.log("maxTexturesInFragmentShader = " + gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));
    gl.disable(gl.DEPTH_TEST);

    const GPUMath = function(){
        this.programs       = {};
        this.frameBuffers   = {};
        this.textures       = {};
    };

    GPUMath.prototype.createProgram = function(programName, vertexShaderID, fragmentShaderID){

        function createShaderFromScript(scriptId, shaderType) {
            const shader = gl.createShader(shaderType);
            gl.shaderSource( shader, document.getElementById(scriptId).text);
            gl.compileShader(shader);                                       if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {throw "could not compile shader:" + gl.getShaderInfoLog(shader);}
            return shader;
        }

        // const programs = this.programs;
        const program = gl.createProgram();
        gl.attachShader(program, createShaderFromScript(vertexShaderID,     gl.VERTEX_SHADER));
        gl.attachShader(program, createShaderFromScript(fragmentShaderID,   gl.FRAGMENT_SHADER));
        gl.linkProgram( program);                                           if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {throw ("program filed to link:" + gl.getProgramInfoLog (program));}
        gl.useProgram(  program);

        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray( gl.getAttribLocation(program, "a_position"));
        gl.vertexAttribPointer(     gl.getAttribLocation(program, "a_position"), 2, gl.FLOAT, false, 0, 0);

        this.programs[programName] = {
            program: program,
            uniforms: {}
        };
    };

    GPUMath.prototype.initTextureFromData = function(name, width, height, typeName, data){
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // Set the parameters so we can render any size image
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // -->

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl[typeName], data); //
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl[typeName], data);

        this.textures[name] = texture;
    };

    GPUMath.prototype.initFrameBufferForTexture = function(textureName){
        const texture     = this.textures[textureName];
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        this.frameBuffers[textureName] = framebuffer;
    };

    GPUMath.prototype.setUniformForProgram = function(programName, name, val, type){
        gl.useProgram(this.programs[programName].program);
        const uniforms = this.programs[programName].uniforms;
        let location = uniforms[name];
        if (!location) {
            location = gl.getUniformLocation(this.programs[programName].program, name);
            uniforms[name] = location;
        }
        if      (type == "1f") gl.uniform1f(location, val);
        else if (type == "2f") gl.uniform2f(location, val[0], val[1]);
        else if (type == "3f") gl.uniform3f(location, val[0], val[1], val[2]);
        else if (type == "1i") gl.uniform1i(location, val);
    };

    GPUMath.prototype.setSize = function(width, height){
        gl.viewport(0, 0, width, height);
    };

    GPUMath.prototype.setProgram = function(programName){
        gl.useProgram(this.programs[programName].program);
    };

    GPUMath.prototype.step = function(programName, inputTextures, outputTexture){
        // If outputTexture === null, then output FrameBuffer is actually the Canvas!
        gl.useProgram(this.programs[programName].program);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffers[outputTexture]);
        for (let i = 0; i < inputTextures.length; i++){
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, this.textures[inputTextures[i]]);
        }
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);//draw to framebuffer
    };

    GPUMath.prototype.swapTextures = function(texture1Name, texture2Name){
        let temp = this.textures[texture1Name];
        this.textures[texture1Name] = this.textures[texture2Name];
        this.textures[texture2Name] = temp;
        temp = this.frameBuffers[texture1Name];
        this.frameBuffers[texture1Name] = this.frameBuffers[texture2Name];
        this.frameBuffers[texture2Name] = temp;
    };
    GPUMath.prototype.readPixels = function(n, readArray){
        gl.readPixels(0,0,n, n, gl.RGBA, gl.FLOAT, readArray);
    };

    return new GPUMath();
}