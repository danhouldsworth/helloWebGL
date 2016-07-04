Task
====

1. Render the mandlebrot set. Black in set, white not in set.
2. Use requestAnimationFrame to smoothly rotate and zoom between two mini mandlebrots (-1.75, 0) & (-.1592, -1.0317)
3. Render the mandlebrot dwell as depth on a tilted square. THIS IS HARD - gl_pos.z comes from vertex shader. Dwell calced in frag shader. Need double post processing of texture?
4. Render the complex analysis of the function f(x) = (x^2 − 1)(x − 2 − i)^2 / (x^2 + 2 + 2i). Hue represented by the function argument, and brightness represented by the magnitude.

Notes:
- Very useful summary of OpenGL ES2.0 issues vs OpenGL 3+ : http://www.atmind.nl/?p=623
eg. while(){} loops not allowed. for(){} loops only allowed under much stricter index conditions
[https://en.wikipedia.org/wiki/Complex_analysis#/media/File:Color_complex_plot.jpg]

Q. It constrasting ES2.0 & ESSL vs OpenGL & GLSL - is it just that :
 - a subset of the system calls & syntax is allowable OR
 - that it is slower on the same hardware?