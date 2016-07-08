# helloWebGL
A specific extension that is beyond the scope of helloParallelism, to explore the opportunities with WebGL for parallel general purpose programming, SIMD, and rendering techniques.

# Tutorial sources :
https://webglfundamentals.org/
http://www.tutorialspoint.com/webgl/webgl_tutorial.pdf
http://learningwebgl.com/blog/?page_id=1217
http://www.lighthouse3d.com/tutorials/glsl-tutorial/inter-shader-communication/

# Approach
Set some increasingly less trivial tasks / challenges to take us towards more relevant topics
- Particle sim (http://learningwebgl.com/lessons/example03/particles-03.html)
- Fluids
- Page turning transform effects
- Handwriting anaylsis / rendering

# Learnings
1. while(){} loops not allowed. for(){} loops only allowed under much stricter index conditions
	*No LOOPS at all on iOS - they crash that instance of the frag shader* (The loops for banding on complex lolipop seemed to work on even / odd iterations??)
2. Array indexing NOT allowed for anything other than a constant at compile time in WebGL/GLES2
3. Safari & iOS doesn't support 'const' declarations
4. iOS needs highp for raytrace
5. Smaller GPU's limit the number / size of varyings bandwidth between shaders. Circa 28 floats. But doesn't exactly tally when as vec3. Sure enough the standard minimum for gl_MaxVaryingVectors is only 8.
6. Calcing direct in the fragshader & unrolling loops enables impressive disaply on iOS
- Very useful summary of OpenGL ES2.0 issues vs OpenGL 3+ : http://www.atmind.nl/?p=623

https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf

https://www.shadertoy.com/