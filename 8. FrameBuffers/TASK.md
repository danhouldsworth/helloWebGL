TASK
====

1. Render the fragment shader to a texture.
1a. Move the texture into an HTML image

2. Reuse the texture iteratively to augment a gausian filter.

3. Store seperate data to that being rendered in frame buffers. Store in a 10x10 RGBA texture, the x,y,vx,vy state of 100 particles
3a. Can we use the float values of gl.FragColour before it's coded into 32bit RGBA? What about gl.LUMINESENCE/gl.LUMINESENCE_ALPHA to store 24/32bit values?

http://learningwebgl.com/blog/?p=1786

http://math.hws.edu/graphicsbook/c7/s4.html
http://math.hws.edu/graphicsbook/c7/s5.html
