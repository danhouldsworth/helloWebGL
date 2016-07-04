Task
====

1. Instead of colour blending, render an image as a texture on a face.
1a. What happens on just a triangle? Can we choose an appropriate triangle from the texture? [Yes - vertex shader is passed tex coords as attributes, then interpolotes and passes varying text coord to frag shader. This in turn has the full texture as a uniform and now a varying coord as lookup]
1b. Can you align correctly with only 4 vertices using TRIANGLE_STRIP? Yes
2. Process the image in the fragment shader by swapping the red and blue channels.
2b. Blur the image by doing a guasuan sum.

3. Manually create a checker board texture, and render on a square
3b. Angle the square into the distance and use GPU to create an antialiased chequred floor. Q! - WHY DO THE TWO TRIANGLES APPEAR TO ANGLE SEPERATELY?

4. Take a texture information as an input. Write it to a buffer texture. Who does this - the vertex shader or frag shader? Is the whole texture being copied per pixel rendered..?

Q. Now do in 3D.

Note : /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --allow-file-access-from-files -->
