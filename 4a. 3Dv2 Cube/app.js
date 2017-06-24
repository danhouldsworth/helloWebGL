let canvas 	= document.createElement("canvas");
canvas.width = canvas.height = 1000;
document.body.appendChild(canvas);
let gl 		= canvas.getContext("webgl");

gl.clearColor(0.75, 0.85, 0.8, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.frontFace(gl.CCW);
gl.cullFace(gl.BACK);

let vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, document.getElementById("x-vertex").text);
gl.compileShader(vertexShader);

let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, document.getElementById("x-fragment").text);
gl.compileShader(fragmentShader);

let shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
	// X, Y, Z           R, G, B
	// Top
	-1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
	-1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
	1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
	1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

	// Left
	-1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
	-1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
	-1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
	-1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

	// Right
	1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
	1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
	1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
	1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

	// Front
	1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
	1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
	-1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
	-1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

	// Back
	1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
	1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
	-1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
	-1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

	// Bottom
	-1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
	-1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
	1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
	1.0, -1.0, -1.0,    0.5, 0.5, 1.0,
]), gl.STATIC_DRAW);

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([
	0, 1, 2, 0, 2, 3,			// Top
	5, 4, 6, 6, 4, 7,			// Left
	8, 9, 10, 8, 10, 11,		// Right
	13, 12, 14, 15, 14, 12,		// Front
	16, 17, 18, 16, 18, 19,		// Back
	21, 20, 22, 22, 20, 23		// Bottom
]), gl.STATIC_DRAW);

gl.vertexAttribPointer(
	gl.getAttribLocation(shaderProgram, 'vertPosition'), // Attribute location
	3, 									// Number of elements per attribute
	gl.FLOAT, 							// Type of elements
	false,
	6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
	0 									// Offset from the beginning of a single vertex to this attribute
);
gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, 'vertPosition'));

gl.vertexAttribPointer(
	gl.getAttribLocation(shaderProgram, 'vertColor'), // Attribute location
	3, 									// Number of elements per attribute
	gl.FLOAT, 							// Type of elements
	false,
	6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
	3 * Float32Array.BYTES_PER_ELEMENT 	// Offset from the beginning of a single vertex to this attribute
);
gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, 'vertColor'));

var angle;
var loop = function () {
	angle = performance.now() / 2000 * 2 * Math.PI;

	gl.uniform1f(gl.getUniformLocation(shaderProgram, "uA"), angle);

	gl.clearColor(0.5, 0.5, 0.5, 0.5);
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
	gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

	requestAnimationFrame(loop);
};
requestAnimationFrame(loop);
