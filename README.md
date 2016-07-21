# helloWebGL
Following the theme of helloLanguages, this is a specific extension that is beyond the scope of helloParallelism, to explore the opportunities with WebGL for parallel general purpose programming, SIMD, and rendering techniques.
In particular to explore both real time, and 'long burn' problems.

# Approach
Set some increasingly less-trivial challenges that ultimately take me towards relevant topics :
- Particle sim (always my benchmark of how useful a tool I can create!)
- Fluid dynamics sim (how big Reynolds number can I model with fidelity)
- Ray tracing (no real use for this, its just been on my intellectual bucket list for decades...)
- Handwriting anaylsis / rendering (strikes me as something very parallelisable that I do indeed have a need for)

# Learnings so far
1. Very limited use of conditional branching.
	while(){} loops not allowed at all.
	for(){} loops only allowed under much stricter index conditions
	*No LOOPS at all on iOS - they crash that instance of the frag shader* (The loops for banding on complex lolipop seemed to work on even / odd iterations??)
2. Array indexing NOT allowed for anything other than a constant at compile time in WebGL/GLES2
3. Safari & iOS doesn't support 'const' declarations
4. iOS needs highp for raytrace - what are the implications for float precision then?
5. Smaller GPU's limit the number / size of varyings bandwidth between shaders. Circa 28 floats. But doesn't exactly tally when as vec3. Sure enough the standard minimum for gl_MaxVaryingVectors is only 8. This has been the biggest hurdle yet for writing cross device apps.
6. Calcing direct in the fragshader & unrolling loops enables impressive disaply on iOS
7. gl_FragCoord gives viewport / canvas coords. eg [0-1000,0-1000].
8. If using readPixel / ArrayBuffer / Texture - then we shouldn't invert our y coords, as of course all of our array indices (both in shaders and JS) will be orientated the same. Unlike images and canvas coords which need inverted y.

# Helpful links :
http://www.atmind.nl/?p=623 (A very useful summary of OpenGL ES2.0 issues vs OpenGL 3+)
https://webglfundamentals.org/
http://www.tutorialspoint.com/webgl/webgl_tutorial.pdf
http://learningwebgl.com/blog/?page_id=1217
http://learningwebgl.com/lessons/example03/particles-03.html
http://www.lighthouse3d.com/tutorials/glsl-tutorial/inter-shader-communication/
https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf
https://www.shadertoy.com/