Task
====

1. Render the mandlebrot set. Black in set, white not in set.
2. Use requestAnimationFrame to smoothly rotate and zoom between two mini mandlebrots (-1.75, 0) & (-.1592, -1.0317)
3. Render the mandlebrot dwell as depth on a tilted square. THIS IS HARD - gl_pos.z comes from vertex shader. Dwell calced in frag shader. Need double post processing of texture?
4. Render the complex analysis of the function f(x) = (x^2 − 1)(x − 2 − i)^2 / (x^2 + 2 + 2i). Hue represented by the function argument, and brightness represented by the magnitude.
5. Render a reflective sphere by ray tracing in the fragment shader. Extend to multiple objects - transparent & reflective.

6. Read the non-geometric way of ray trace intersection

https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf
http://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-sphere-intersection

http://math.hws.edu/graphicsbook/c8/s1.html
http://math.hws.edu/graphicsbook/c8/s2.html