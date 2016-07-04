Task
====

1a. Can we print a triangle passing *nothing* but the attributes 1,2,3 to a gl.DRAW_TRIANGLE command? YES
1b. Can we do a square with just 1,2,3,4?
1c. Can we colour blend the square?
2. Can we draw a circle passing just the floats 0, 1, 2 to the vertex shade? And blend shade along the curve?
NO - it only invokes the vertex shader once per attribute set. Takes the values gl_Position, then LINEAR interpolates between them. It will ALWAYS be a straight line or triangle.
Varyings to fragment shader WILL ALSO BE STRAIGHT LINEAR INTERPOLATIONS. Anything non linear, needs to be calculated by the frag_shader using these linear interpolated inputs as feeds for the calc.
3. Can we draw a bezier curve, passing nothing but the 4 vector control points? NO
Bonus : Do we now have a more concise way of coding up a square for GPU processing?

Why all this?
To demonstrate there is nothing special about the vertex attributes passed to the 'vertex' shader.
To show that gl.DRAWLINE just means linear interpolate the attributes between 2 sets of attributes; and gl.DRAWTRIANGLE just means bilerp between 3 sets of attributes.

To start to explore with what can we do at vertex shader, what CANT we do and NEEDS to be done at fragment shader (non-linear?). Which is faster?
