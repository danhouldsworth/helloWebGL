#version 300 es

precision mediump float;

uniform     float   u_ratio;
uniform     vec3    cameraPostion;
uniform     vec3    cameraTo;

in          float   a_label;
out         vec3    vPosition;

void main(void) {
    // <-- Calculate the corners of our view port based on camera, and rasterise into frag shader
    vec3 up         = vec3(0.0, 1.0, 0.0);
    float cameraPersp = 5.0;
    vec3 cameraDir  = normalize(cameraTo - cameraPostion);
    vec3 cameraLeft = normalize(cross(cameraDir, up));
    vec3 cameraUp   = normalize(cross(cameraLeft, cameraDir));
    vec3 cameraCenter= cameraPostion + cameraDir * cameraPersp;
    vec3 cameraTopLeft  = cameraCenter + cameraUp + cameraLeft * u_ratio;
    vec3 cameraBotLeft  = cameraCenter - cameraUp + cameraLeft * u_ratio;
    vec3 cameraTopRight = cameraCenter + cameraUp - cameraLeft * u_ratio;
    vec3 cameraBotRight = cameraCenter - cameraUp - cameraLeft * u_ratio;

    if      (a_label == 1.0) {gl_Position = vec4(+1.0, +1.0, 0.0, 1.0); vPosition = cameraTopRight;}
    else if (a_label == 2.0) {gl_Position = vec4(-1.0, +1.0, 0.0, 1.0); vPosition = cameraTopLeft;}
    else if (a_label == 3.0) {gl_Position = vec4(+1.0, -1.0, 0.0, 1.0); vPosition = cameraBotRight;}
    else if (a_label == 4.0) {gl_Position = vec4(-1.0, -1.0, 0.0, 1.0); vPosition = cameraBotLeft;}
    // -->
}