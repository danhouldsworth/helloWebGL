Task
====

1. Compile a Vertex Shader, and Fragment shader. Use script tags to store the shader source. Where do we need to put these tags?
2. Passing it a buffer, render a red triangle.
3. What about passing the same triangle as *5* vertices in 3D coords and only taking the middle 3 (from an array padded with meta data)?
4. Use the .xyzw and .rgba methods of accesing the vec4 shader ouputs.
5. Use the .drawElements method to draw a rectangle specified as just 4 coords
6. Use the various GPU elements / drawModes to render the 5 vertex points
7. Assign Red, Green, Blue, Yellow to each vertex of a square

Q. How does the stride argument work in passing data to vertex attributes?
