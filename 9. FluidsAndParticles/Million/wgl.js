var wgl = {};
(function(t) {
    !function(t) {
        var e = function() {
            function t(t, e, r, n) {
                this.r = void 0 != t ? t : 0,
                this.g = void 0 != e ? e : 0,
                this.b = void 0 != r ? r : 0,
                this.a = void 0 != n ? n : 0
            }
            return t.fromHex = function(e, r) {
                var n;
                return n = new t,
                n.a = void 0 != r ? r : 1,
                n.r = ((16711680 & e) >> 16) / 255,
                n.g = ((65280 & e) >> 8) / 255,
                n.b = (255 & e) / 255,
                n
            }
            ,
            t
        }();
        t.RGBA = e
    }(t.utils || (t.utils = {}));
    t.utils
})(wgl);
(function(t) {
    var e = function() {
        function t(t) {
            this._context = t,
            this._vertexShaderList = {},
            this._fragmentShaderList = {},
            this._programList = {}
        }
        return Object.defineProperty(t.prototype, "context", {
            get: function() {
                return this._context
            },
            enumerable: !0,
            configurable: !0
        }),
        t.prototype.addVertexShaderScript = function(e) {
            var r;
            r = t.getScript(e),
            null != r && this.addVertexShader(e, r)
        }
        ,
        t.prototype.addVertexShader = function(t, e) {
            var r, n;
            r = this.context,
            n = this._vertexShaderList[t],
            null != n && r.deleteShader(n),
            n = r.createShader(r.VERTEX_SHADER),
            r.shaderSource(n, e),
            r.compileShader(n),
            r.getShaderParameter(n, r.COMPILE_STATUS) ? this._vertexShaderList[t] = n : console.log("can not compile vertex shader. InfoLog: " + r.getShaderInfoLog(n))
        }
        ,
        t.prototype.removeVertexShader = function(t) {
            var e;
            e = this._vertexShaderList[t],
            null != e && this._context.deleteShader(e)
        }
        ,
        t.prototype.addFragmentShaderScript = function(e) {
            var r;
            r = t.getScript(e),
            null != r && this.addFragmentShader(e, r)
        }
        ,
        t.prototype.addFragmentShader = function(t, e) {
            var r, n;
            r = this.context,
            n = this._vertexShaderList[t],
            null != n && r.deleteShader(n),
            n = r.createShader(r.FRAGMENT_SHADER),
            r.shaderSource(n, e),
            r.compileShader(n),
            r.getShaderParameter(n, r.COMPILE_STATUS) ? this._fragmentShaderList[t] = n : console.log("can not compile fragment shader. InfoLog: " + r.getShaderInfoLog(n))
        }
        ,
        t.prototype.removeFragmentShader = function(t) {
            var e;
            e = this._fragmentShaderList[t],
            null != e && this._context.deleteShader(e)
        }
        ,
        t.prototype.addProgram = function(t, e, r) {
            var n, o, i, u, c;
            n = this._context,
            o = n.createProgram(),
            u = this._vertexShaderList[e],
            c = this._fragmentShaderList[r],
            null == u && console.log("vertextx shader is not found. id: " + e),
            null == c && console.log("fragment shader is not found. id: " + r),
            null != u && null != c && (n.attachShader(o, u),
            n.attachShader(o, c),
            n.linkProgram(o),
            n.getProgramParameter(o, n.LINK_STATUS) ? (i = this._programList[t],
            null != i && n.deleteProgram(i),
            this._programList[t] = o) : console.log("can not link program. InfoLog: " + n.getProgramInfoLog(o)))
        }
        ,
        t.prototype.removeProgram = function(t) {
            var e;
            e = this._programList[t],
            null != e && this._context.deleteProgram(e)
        }
        ,
        t.prototype.useProgram = function(t) {
            var e;
            e = this._programList[t],
            null != e && (this._program = e,
            this._context.useProgram(e))
        }
        ,
        t.prototype.setProgram = function(t, e) {
            var r, n, o, i;
            r = this._context,
            n = r.createProgram(),
            o = this._vertexShaderList[t],
            i = this._fragmentShaderList[e],
            null == o && console.log("vertextx shader is not found. id: " + t),
            null == i && console.log("fragment shader is not found. id: " + e),
            null != o && null != i && (r.attachShader(n, o),
            r.attachShader(n, i),
            r.linkProgram(n),
            r.getProgramParameter(n, r.LINK_STATUS) ? (r.useProgram(n),
            this._program = n) : console.log("can not link program. InfoLog: " + r.getProgramInfoLog(n)))
        }
        ,
        t.prototype.getAttribLocation = function(t) {
            return null == this._program ? -1 : this.context.getAttribLocation(this._program, t)
        }
        ,
        t.prototype.getUniformLocation = function(t) {
            return null == this._program ? null : this.context.getUniformLocation(this._program, t)
        }
        ,
        t.getScript = function(t) {
            var e;
            return e = document.getElementById(t),
            null == e ? (console.log("script is not found. id: " + t),
            null) : e.text
        }
        ,
        t
    }();
    t.Program = e
})(wgl);
(function(t) {
    var e = function() {
        function t(t) {
            this._context = t
        }
        return Object.defineProperty(t.prototype, "context", {
            get: function() {
                return this._context
            },
            enumerable: !0,
            configurable: !0
        }),
        t.prototype.setMatrix = function(t, e, r) {
            var n;
            switch (n = this._context,
            e) {
            case 2:
                n.uniformMatrix2fv(t, !1, r);
                break;
            case 3:
                n.uniformMatrix3fv(t, !1, r);
                break;
            default:
                n.uniformMatrix4fv(t, !1, r)
            }
        }
        ,
        t.prototype.setInt = function(t, e, r, n, o) {
            var i;
            i = this._context,
            void 0 == r ? i.uniform1i(t, e) : void 0 == n ? i.uniform2i(t, e, r) : void 0 == o ? i.uniform3i(t, e, r, n) : i.uniform4i(t, e, r, n, o)
        }
        ,
        t.prototype.setFloat = function(t, e, r, n, o) {
            var i;
            i = this._context,
            void 0 == r ? i.uniform1f(t, e) : void 0 == n ? i.uniform2f(t, e, r) : void 0 == o ? i.uniform3f(t, e, r, n) : i.uniform4f(t, e, r, n, o)
        }
        ,
        t
    }();
    t.Uniform = e
})(wgl);
(function(t) {
    var e = function() {
        function t(t) {
            this._context = t,
            this._bufferList = {}
        }
        return Object.defineProperty(t.prototype, "context", {
            get: function() {
                return this._context
            },
            enumerable: !0,
            configurable: !0
        }),
        t.prototype.add = function(t, e, r) {
            var n, o;
            n = this._context,
            o = this._bufferList[t],
            null != o && n.deleteBuffer(o),
            o = n.createBuffer(),
            r != n.STREAM_DRAW && r != n.DYNAMIC_DRAW && (r = n.STATIC_DRAW),
            n.bindBuffer(n.ARRAY_BUFFER, o),
            n.bufferData(n.ARRAY_BUFFER, e, r),
            n.bindBuffer(n.ARRAY_BUFFER, null),
            this._bufferList[t] = o
        }
        ,
        t.prototype.remove = function(t) {
            var e, r;
            e = this._context,
            r = this._bufferList[t],
            null != r && (e.deleteBuffer(r),
            delete this._bufferList[t])
        }
        ,
        t.prototype.setData = function(t, e, r) {
            var n, o;
            n = this._context,
            o = this._bufferList[t],
            null != o && (r != n.STREAM_DRAW && r != n.DYNAMIC_DRAW && (r = n.STATIC_DRAW),
            n.bindBuffer(n.ARRAY_BUFFER, o),
            n.bufferData(n.ARRAY_BUFFER, e, r),
            n.bindBuffer(n.ARRAY_BUFFER, null))
        }
        ,
        t.prototype.setAttribPointer = function(t, e, r, n, o, i, u) {
            var c, a;
            c = this._context,
            a = this._bufferList[t],
            null != a && (c = this._context,
            c.bindBuffer(c.ARRAY_BUFFER, a),
            c.enableVertexAttribArray(e),
            c.vertexAttribPointer(e, r, c.FLOAT, o, i, u),
            c.bindBuffer(c.ARRAY_BUFFER, null))
        }
        ,
        t
    }();
    t.VertexBuffer = e
})(wgl);
(function(t) {
    var e = function() {
        function t(t) {
            this._context = t,
            this._bufferList = {}
        }
        return Object.defineProperty(t.prototype, "FLOAT", {
            get: function() {
                return this._context.FLOAT
            },
            enumerable: !0,
            configurable: !0
        }),
        Object.defineProperty(t.prototype, "BYTE", {
            get: function() {
                return this._context.BYTE
            },
            enumerable: !0,
            configurable: !0
        }),
        Object.defineProperty(t.prototype, "UNSIGNED_BYTE", {
            get: function() {
                return this._context.UNSIGNED_BYTE
            },
            enumerable: !0,
            configurable: !0
        }),
        Object.defineProperty(t.prototype, "SHORT", {
            get: function() {
                return this._context.SHORT
            },
            enumerable: !0,
            configurable: !0
        }),
        Object.defineProperty(t.prototype, "UNSIGNED_SHORT", {
            get: function() {
                return this._context.UNSIGNED_SHORT
            },
            enumerable: !0,
            configurable: !0
        }),
        Object.defineProperty(t.prototype, "context", {
            get: function() {
                return this._context
            },
            enumerable: !0,
            configurable: !0
        }),
        t.prototype.add = function(t, e, r) {
            var n, o;
            n = this._context,
            o = this._bufferList[t],
            null != o && n.deleteBuffer(o),
            o = n.createBuffer(),
            r != n.STREAM_DRAW && r != n.DYNAMIC_DRAW && (r = n.STATIC_DRAW),
            n.bindBuffer(n.ELEMENT_ARRAY_BUFFER, o),
            n.bufferData(n.ELEMENT_ARRAY_BUFFER, e, r),
            n.bindBuffer(n.ELEMENT_ARRAY_BUFFER, null),
            this._bufferList[t] = o
        }
        ,
        t.prototype.removeVertexBuffer = function(t) {
            var e, r;
            e = this._context,
            r = this._bufferList[t],
            null != r && (e.deleteBuffer(r),
            delete this._bufferList[t])
        }
        ,
        t.prototype.setVertexBufferData = function(t, e, r) {
            var n, o;
            n = this._context,
            o = this._bufferList[t],
            null != o && (r != n.STREAM_DRAW && r != n.DYNAMIC_DRAW && (r = n.STATIC_DRAW),
            n.bindBuffer(n.ELEMENT_ARRAY_BUFFER, o),
            n.bufferData(n.ELEMENT_ARRAY_BUFFER, e, r),
            n.bindBuffer(n.ELEMENT_ARRAY_BUFFER, null))
        }
        ,
        t.prototype.bind = function(t) {
            var e, r;
            e = this._context,
            r = this._bufferList[t],
            null != r && e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, r)
        }
        ,
        t.prototype.unbind = function() {
            var t;
            t = this._context,
            this._context.bindBuffer(t.ELEMENT_ARRAY_BUFFER, null)
        }
        ,
        t
    }();
    t.IndexBuffer = e
})(wgl);
(function(t) {
    var e = function() {
        function t(t) {
            this._context = t,
            this._bufferList = {}
        }
        return Object.defineProperty(t.prototype, "context", {
            get: function() {
                return this._context
            },
            enumerable: !0,
            configurable: !0
        }),
        t.prototype.add = function(t, e) {
            var r, n;
            r = this._context,
            n = this._bufferList[t],
            null != n && r.deleteFramebuffer(n),
            n = r.createFramebuffer(),
            null != e && (r.bindFramebuffer(r.FRAMEBUFFER, n),
            r.framebufferTexture2D(r.FRAMEBUFFER, r.COLOR_ATTACHMENT0, r.TEXTURE_2D, e, 0),
            r.bindFramebuffer(r.FRAMEBUFFER, null)),
            this._bufferList[t] = n
        }
        ,
        t.prototype.remove = function(t) {
            var e, r;
            e = this._context,
            r = this._bufferList[t],
            null != r && (e.deleteFramebuffer(r),
            delete this._bufferList[t])
        }
        ,
        t.prototype.setTexture = function(t, e) {
            var r, n;
            r = this._context,
            n = this._bufferList[t],
            null != n && (r.bindFramebuffer(r.FRAMEBUFFER, n),
            r.framebufferTexture2D(r.FRAMEBUFFER, r.COLOR_ATTACHMENT0, r.TEXTURE_2D, e, 0),
            r.bindFramebuffer(r.FRAMEBUFFER, null))
        }
        ,
        t.prototype.bind = function(t) {
            var e, r;
            e = this._context,
            r = this._bufferList[t],
            null != r && e.bindFramebuffer(e.FRAMEBUFFER, r)
        }
        ,
        t.prototype.unbind = function() {
            var t;
            t = this._context,
            this._context.bindFramebuffer(t.FRAMEBUFFER, null)
        }
        ,
        t
    }();
    t.FrameBuffer = e
})(wgl);
(function(t) {
    !function(t) {
        var e = function() {
            function t() {}
            return t.isPowerOfTwo = function(t) {
                return t > 0 && 0 == (t & t - 1)
            }
            ,
            t.getNextPowerOfTwo = function(t) {
                var e;
                if (t > 0 && 0 == (t & t - 1))
                    return t;
                for (e = 1; t > e; )
                    e <<= 1;
                return e
            }
            ,
            t.getPrevPowerOfTwo = function(e) {
                var r;
                return r = t.getNextPowerOfTwo(e),
                1 === r ? 1 : r >> 1
            }
            ,
            t
        }();
        t.WGLMath = e
    }(t.utils || (t.utils = {}));
    t.utils
})(wgl);
(function(t) {
    var e = function() {
        function e(t) {
            this._context = t,
            this._textureList = {}
        }
        return Object.defineProperty(e.prototype, "context", {
            get: function() {
                return this._context
            },
            enumerable: !0,
            configurable: !0
        }),
        e.prototype.add2D = function(t, e) {
            var r, n;
            r = this._context,
            n = this._textureList[t],
            null != n && r.deleteTexture(n),
            this._textureList[t] = r.createTexture(),
            this.set2D(t, e)
        }
        ,
        e.prototype.set2D = function(e, r) {
            var n, o, i, u;
            n = this._context,
            o = this._textureList[e],
            null != o && (r instanceof HTMLImageElement ? (i = r.width,
            u = r.height) : (i = r.videoWidth,
            u = r.videoHeight),
            n.bindTexture(n.TEXTURE_2D, o),
            n.texImage2D(n.TEXTURE_2D, 0, n.RGBA, n.RGBA, n.UNSIGNED_BYTE, r),
            t.utils.WGLMath.isPowerOfTwo(i) && t.utils.WGLMath.isPowerOfTwo(u) ? (n.generateMipmap(n.TEXTURE_2D),
            n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MAG_FILTER, n.LINEAR),
            n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MIN_FILTER, n.LINEAR_MIPMAP_LINEAR)) : (n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MIN_FILTER, n.LINEAR),
            n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_S, n.CLAMP_TO_EDGE),
            n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_T, n.CLAMP_TO_EDGE)),
            n.bindTexture(n.TEXTURE_2D, null))
        }
        ,
        e.prototype.create2D = function(e, r, n, o) {
            "undefined" == typeof o && (o = !1);
            var i, u;
            i = this._context,
            u = this._textureList[e],
            null != u && i.deleteTexture(u),
            u = this._textureList[e] = i.createTexture(),
            i.bindTexture(i.TEXTURE_2D, u),
            i.texImage2D(i.TEXTURE_2D, 0, i.RGBA, r, n, 0, i.RGBA, o ? i.FLOAT : i.UNSIGNED_BYTE, null),
            o ? (i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MAG_FILTER, i.NEAREST),
            i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, i.NEAREST),
            i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_S, i.CLAMP_TO_EDGE),
            i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_T, i.CLAMP_TO_EDGE)) : t.utils.WGLMath.isPowerOfTwo(r) && t.utils.WGLMath.isPowerOfTwo(n) ? (i.generateMipmap(i.TEXTURE_2D),
            i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MAG_FILTER, i.LINEAR),
            i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, i.LINEAR_MIPMAP_LINEAR)) : (i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, i.LINEAR),
            i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_S, i.CLAMP_TO_EDGE),
            i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_T, i.CLAMP_TO_EDGE)),
            i.bindTexture(i.TEXTURE_2D, null)
        }
        ,
        e.prototype.remove = function(t) {
            var e, r;
            e = this._context,
            r = this._textureList[t],
            null != r && (e.deleteTexture(r),
            delete this._textureList[t])
        }
        ,
        e.prototype.uniformTexture2D = function(t, e, r) {
            var n, o;
            n = this._context,
            o = this._textureList[t],
            null != o && (n.bindTexture(n.TEXTURE_2D, o),
            n.uniform1i(r, e),
            n.bindTexture(n.TEXTURE_2D, null))
        }
        ,
        e.prototype.bind = function(t) {
            var e, r;
            e = this._context,
            r = this._textureList[t],
            null != r && e.bindTexture(e.TEXTURE_2D, r)
        }
        ,
        e.prototype.active = function(t) {
            this._context.activeTexture(this._getIndex(t))
        }
        ,
        e.prototype.get2D = function(t) {
            return this._textureList[t]
        }
        ,
        e.prototype.setParameterMagFilter = function(t, e) {
            var r, n;
            r = this._context,
            n = this._textureList[t],
            null != n && (r.bindTexture(r.TEXTURE_2D, n),
            r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MAG_FILTER, e),
            r.bindTexture(r.TEXTURE_2D, null))
        }
        ,
        e.prototype.setParameterMinFilter = function(t, e) {
            var r, n;
            r = this._context,
            n = this._textureList[t],
            null != n && (r.bindTexture(r.TEXTURE_2D, n),
            r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MIN_FILTER, e),
            r.bindTexture(r.TEXTURE_2D, null))
        }
        ,
        e.prototype.setParameterWrapS = function(t, e) {
            var r, n;
            r = this._context,
            n = this._textureList[t],
            null != n && (r.bindTexture(r.TEXTURE_2D, n),
            r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_S, e),
            r.bindTexture(r.TEXTURE_2D, null))
        }
        ,
        e.prototype.setParameterWrapT = function(t, e) {
            var r, n;
            r = this._context,
            n = this._textureList[t],
            null != n && (r.bindTexture(r.TEXTURE_2D, n),
            r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_T, e),
            r.bindTexture(r.TEXTURE_2D, null))
        }
        ,
        e.prototype.setParameterWrapST = function(t, e) {
            var r, n;
            r = this._context,
            n = this._textureList[t],
            null != n && (r.bindTexture(r.TEXTURE_2D, n),
            r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_S, e),
            r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_T, e),
            r.bindTexture(r.TEXTURE_2D, null))
        }
        ,
        e.prototype._getIndex = function(t) {
            switch (t) {
            case 0:
                return this._context.TEXTURE0;
            case 1:
                return this._context.TEXTURE1;
            case 2:
                return this._context.TEXTURE2;
            case 3:
                return this._context.TEXTURE3;
            case 4:
                return this._context.TEXTURE4;
            case 5:
                return this._context.TEXTURE5;
            case 6:
                return this._context.TEXTURE6;
            case 7:
                return this._context.TEXTURE7;
            case 8:
                return this._context.TEXTURE8;
            case 9:
                return this._context.TEXTURE9;
            case 10:
                return this._context.TEXTURE10;
            case 11:
                return this._context.TEXTURE11;
            case 12:
                return this._context.TEXTURE12;
            case 13:
                return this._context.TEXTURE13;
            case 14:
                return this._context.TEXTURE14;
            case 15:
                return this._context.TEXTURE15;
            case 16:
                return this._context.TEXTURE16;
            case 17:
                return this._context.TEXTURE17;
            case 18:
                return this._context.TEXTURE18;
            case 19:
                return this._context.TEXTURE19;
            case 20:
                return this._context.TEXTURE20;
            case 21:
                return this._context.TEXTURE21;
            case 22:
                return this._context.TEXTURE22;
            case 23:
                return this._context.TEXTURE23;
            case 24:
                return this._context.TEXTURE24;
            case 25:
                return this._context.TEXTURE25;
            case 26:
                return this._context.TEXTURE26;
            case 27:
                return this._context.TEXTURE27;
            case 28:
                return this._context.TEXTURE28;
            case 29:
                return this._context.TEXTURE29;
            case 30:
                return this._context.TEXTURE30;
            case 31:
                return this._context.TEXTURE31;
            default:
                return -1
            }
        }
        ,
        e
    }();
    t.Texture = e
})(wgl);
(function(t) {
    var e = function() {
        function e(t) {
            this._isSupported = !1,
            this._canvas = t,
            null != t && (this._context = this._canvas.getContext("experimental-webgl") || this._canvas.getContext("webgl"),
            null != this._context && (this._isSupported = !0))
        }
        return Object.defineProperty(e.prototype, "canvas", {
            get: function() {
                return this._canvas
            },
            enumerable: !0,
            configurable: !0
        }),
        Object.defineProperty(e.prototype, "context", {
            get: function() {
                return this._context
            },
            enumerable: !0,
            configurable: !0
        }),
        Object.defineProperty(e.prototype, "isSupported", {
            get: function() {
                return this._isSupported
            },
            enumerable: !0,
            configurable: !0
        }),
        Object.defineProperty(e.prototype, "isSupportedTextureFloat", {
            get: function() {
                return this._isSupported ? null != this._context.getExtension("OES_texture_float") : !1
            },
            enumerable: !0,
            configurable: !0
        }),
        e.prototype.setCanvasSize = function(t, e) {
            this._canvas.width = t,
            this._canvas.height = e
        }
        ,
        e.prototype.setWebGLViewport = function(t, e, r, n) {
            this._context.viewport(t, e, r, n)
        }
        ,
        e.prototype.setSize = function(t, e) {
            this._canvas.width = t,
            this._canvas.height = e,
            this._context.viewport(0, 0, t, e)
        }
        ,
        e.prototype.clearColorBuffer = function(e, r, n, o) {
            var i;
            void 0 != e && (void 0 != r ? void 0 != n ? this._context.clearColor(e, r, n, o) : (i = t.utils.RGBA.fromHex(e, r),
            this._context.clearColor(i.r, i.g, i.b, i.a)) : (i = t.utils.RGBA.fromHex(e),
            this._context.clearColor(i.r, i.g, i.b, i.a))),
            this._context.clear(this._context.COLOR_BUFFER_BIT)
        }
        ,
        e.prototype.clearDepthBuffer = function(t) {
            void 0 != t && this._context.clearDepth(t),
            this._context.clear(this._context.DEPTH_BUFFER_BIT)
        }
        ,
        e.prototype.clearStencilBuffer = function(t) {
            void 0 != t && this._context.clearStencil(t),
            this._context.clear(this._context.STENCIL_BUFFER_BIT)
        }
        ,
        e.prototype.setClearColor = function(t, e, r, n) {
            this._context.clearColor(t, e, r, n)
        }
        ,
        e.prototype.setClearDepth = function(t) {
            this._context.clearDepth(t)
        }
        ,
        e.prototype.setClearStencil = function(t) {
            this._context.clearStencil(t)
        }
        ,
        e.prototype.createProgram = function() {
            return new t.Program(this._context)
        }
        ,
        e.prototype.createVertexBuffer = function() {
            return new t.VertexBuffer(this._context)
        }
        ,
        e.prototype.createIndexBuffer = function() {
            return new t.IndexBuffer(this._context)
        }
        ,
        e.prototype.createFrameBuffer = function() {
            return new t.FrameBuffer(this._context)
        }
        ,
        e.prototype.createTexture = function() {
            return new t.Texture(this._context)
        }
        ,
        e.prototype.createUniform = function() {
            return new t.Uniform(this._context)
        }
        ,
        e.prototype.blendMode = function(t) {
            t ? this._context.enable(this._context.BLEND) : this._context.disable(this._context.BLEND)
        }
        ,
        e.prototype.blendNone = function() {
            this._context.blendFunc(this._context.ONE, this._context.ZERO)
        }
        ,
        e.prototype.blendAlpha = function() {
            this._context.blendFunc(this._context.SRC_ALPHA, this._context.ONE_MINUS_SRC_ALPHA)
        }
        ,
        e.prototype.blendAdd = function() {
            this._context.blendFunc(this._context.SRC_ALPHA, this._context.ONE)
        }
        ,
        e.prototype.blendMultiply = function() {
            this._context.blendFunc(this._context.DST_COLOR, this._context.ZERO)
        }
        ,
        e.prototype.blendScreen = function() {
            this._context.blendFunc(this._context.ONE, this._context.ONE_MINUS_SRC_COLOR)
        }
        ,
        Object.defineProperty(e.prototype, "FLOAT", {
            get: function() {
                return this._context.FLOAT
            },
            enumerable: !0,
            configurable: !0
        }),
        Object.defineProperty(e.prototype, "BYTE", {
            get: function() {
                return this._context.BYTE
            },
            enumerable: !0,
            configurable: !0
        }),
        Object.defineProperty(e.prototype, "UNSIGNED_BYTE", {
            get: function() {
                return this._context.UNSIGNED_BYTE
            },
            enumerable: !0,
            configurable: !0
        }),
        Object.defineProperty(e.prototype, "SHORT", {
            get: function() {
                return this._context.SHORT
            },
            enumerable: !0,
            configurable: !0
        }),
        Object.defineProperty(e.prototype, "UNSIGNED_SHORT", {
            get: function() {
                return this._context.UNSIGNED_SHORT
            },
            enumerable: !0,
            configurable: !0
        }),
        Object.defineProperty(e.prototype, "STATIC_DRAW", {
            get: function() {
                return this._context.STATIC_DRAW
            },
            enumerable: !0,
            configurable: !0
        }),
        Object.defineProperty(e.prototype, "STREAM_DRAW", {
            get: function() {
                return this._context.STREAM_DRAW
            },
            enumerable: !0,
            configurable: !0
        }),
        Object.defineProperty(e.prototype, "DYNAMIC_DRAW", {
            get: function() {
                return this._context.DYNAMIC_DRAW
            },
            enumerable: !0,
            configurable: !0
        }),
        e
    }();
    t.Context = e
})(wgl);
