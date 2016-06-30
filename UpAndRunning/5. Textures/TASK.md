Task
====

1. Instead of colour blending, render an image as a texture on a face.
1a. What happens on just a triangle? Can we choose an appropriate triangle from the texture?
1b. Can you align correctly with only 4 vertices using TRIANGLE_STRIP?
2. Process the image in the fragment shader by swapping the red and blue channels.
3. Manually create a checker board texture, and render on a square
(https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D)
(Use a Uint8Array)
Q. Now do in 3D.
Q. What about on a triangle?

Note : /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --allow-file-access-from-files -->

Note : Texture coords are like images / canvas. VS WebGL vertices which are like cartesians. Ie. Have to invert to get standard image