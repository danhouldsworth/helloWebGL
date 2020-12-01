"use strict";
/* jshint
browser:true
*/


const canvas  = document.createElement("canvas"); document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gl = canvas.getContext("webgl2");

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, document.getElementById("x-vertex").text);        // Easier than fetch for now
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, document.getElementById("x-fragment").text);    // Easier than fetch for now
gl.compileShader(fragmentShader);

const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

const uniform = (uniformType, uniformName, valueObj) => gl["uniform" + uniformType](gl.getUniformLocation(shaderProgram, uniformName), valueObj);
const uniform1f     = (uniformName, valueObj) => uniform("1f", uniformName, valueObj);
const uniform3fv    = (uniformName, valueObj) => uniform("3fv", uniformName, valueObj);
const uniform4fv    = (uniformName, valueObj) => uniform("4fv", uniformName, valueObj);

gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "a_label"), 1, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "a_label"));
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1,2,3,4]), gl.STATIC_DRAW);
uniform1f("u_ratio", (canvas.width / canvas.height));

const sin   = Math.sin;
const cos   = Math.cos;
const PI    = Math.PI;
const max   = Math.max;
const min   = Math.min;

let ambience                = 0.0;
let incidentIllumination    = 0.35;
let polish                  = 300.0;
let lampBrightness          = 2.0;
const cameraPostion         = {r:65, theta:PI, height:25, aimHeight:0};

const keyState = [];
// [http://keycode.info/ to get keycodes]
window.addEventListener('keydown',  function(e){keyState[e.key] = true;});
window.addEventListener('keyup',    function(e){keyState[e.key] = false;});

const updateCameraFromKeys = () => {
    if (keyState.ArrowLeft) {cameraPostion.theta += 0.02;}
    if (keyState.ArrowRight){cameraPostion.theta -= 0.02;}
    if (keyState.ArrowUp)   {cameraPostion.height++;}
    if (keyState.ArrowDown) {cameraPostion.height--;}
    if (keyState.w)         {players[0].vel.z += 0.01 * players[0].size;}
    if (keyState.s)         {players[0].vel.z -= 0.01 * players[0].size;}
    if (keyState.d)         {players[0].vel.x += 0.01 * players[0].size;}
    if (keyState.a)         {players[0].vel.x -= 0.01 * players[0].size;}
    if (keyState.l)         {players[1].vel.z += 0.01 * players[1].size;}
    if (keyState.p)         {players[1].vel.z -= 0.01 * players[1].size;}
    if (keyState.i)         {players[1].vel.x += 0.01 * players[1].size;}
    if (keyState.o)         {players[1].vel.x -= 0.01 * players[1].size;}

    // if (keyState.s)         {cameraPostion.r++;}
    // if (keyState.w)         {cameraPostion.r--;}
    if (keyState.e)         {cameraPostion.aimHeight += 0.1;}
    // if (keyState.d)         {cameraPostion.aimHeight -= 0.1;}
    if (keyState.r)         {ambience += 0.01;}
    if (keyState.f)         {ambience = max(0,ambience - 0.01);}
    if (keyState.t)         {incidentIllumination += 0.01;}
    if (keyState.g)         {incidentIllumination = max(0,incidentIllumination - 0.01);}
    if (keyState.y)         {polish *= 1.1;}
    if (keyState.h)         {polish = max(1,polish /= 1.1);}
    if (keyState.u)         {lampBrightness *= 1.1;}
    if (keyState.j)         {lampBrightness = max(1,lampBrightness /= 1.1);}
};
const players = [{
    vel : {
        x:0,
        y:0,
        z:0
    },
    pos : {
        x:5,
        y:2,
        z:0
    },
    // Not clear these are proper Euler angles? Rather just successive rotations about each of the 3 axis
    orientation : { // https://en.wikipedia.org/wiki/Euler_angles#:~:text=The%20Euler%20angles%20are%20three,in%203%2Ddimensional%20linear%20algebra.
        x:0,
        y:0,
        z:PI/2
    },
    size : 2,
    tagged : true,
    colour : [0,0,0]
},{
    vel : {
        x:0,
        y:0,
        z:0
    },
    pos : {
        x:0,
        y:2,
        z:0
    },
    orientation : {
        x:0,
        y:0,
        z:0
    },
    size : 2,
    tagged : false,
    colour : [0,0,0]
}];
let arena = 30;
let t = 0, deltaT = 0.01;
function mat3x3(matA, matB){
    const i = (i,j)=>3*j+i;
    return [
        matA[i(0,0)] * matB[i(0,0)] + matA[i(1,0)] * matB[i(0,1)] + matA[i(2,0)] * matB[i(0,2)],
            matA[i(0,0)] * matB[i(1,0)] + matA[i(1,0)] * matB[i(1,1)] + matA[i(2,0)] * matB[i(1,2)],
                matA[i(0,0)] * matB[i(2,0)] + matA[i(1,0)] * matB[i(2,1)] + matA[i(2,0)] * matB[i(2,2)],

        matA[i(0,1)] * matB[i(0,0)] + matA[i(1,1)] * matB[i(0,1)] + matA[i(2,1)] * matB[i(0,2)],
            matA[i(0,1)] * matB[i(1,0)] + matA[i(1,1)] * matB[i(1,1)] + matA[i(2,1)] * matB[i(1,2)],
                matA[i(0,1)] * matB[i(2,0)] + matA[i(1,1)] * matB[i(2,1)] + matA[i(2,1)] * matB[i(2,2)],

        matA[i(0,2)] * matB[i(0,0)] + matA[i(1,2)] * matB[i(0,1)] + matA[i(2,2)] * matB[i(0,2)],
            matA[i(0,2)] * matB[i(1,0)] + matA[i(1,2)] * matB[i(1,1)] + matA[i(2,2)] * matB[i(1,2)],
                matA[i(0,2)] * matB[i(2,0)] + matA[i(1,2)] * matB[i(2,1)] + matA[i(2,2)] * matB[i(2,2)],

    ];
}
function mat3xv3(matA, vec){
    const i = (i,j)=>3*j+i;
    return {
        x : matA[i(0,0)] * vec.x + matA[i(1,0)] * vec.y + matA[i(2,0)] * vec.z,
        y : matA[i(0,1)] * vec.x + matA[i(1,1)] * vec.y + matA[i(2,1)] * vec.z,
        z : matA[i(0,2)] * vec.x + matA[i(1,2)] * vec.y + matA[i(2,2)] * vec.z
    };
}
function addv3(vecA, vecB){
    return {
        x : vecA.x + vecB.x,
        y : vecA.y + vecB.y,
        z : vecA.z + vecB.z
    };
}
function rotation(orientation){
    const mRx = [
        +1.0,                   +0.0,                   +0.0,
        +0.0,                   +cos(orientation.x),    -sin(orientation.x),
        +0.0,                   +sin(orientation.x),    +cos(orientation.x)
    ];
    const mRy = [
        +cos(orientation.y),    +0.0,                   -sin(orientation.y),
        +0.0,                   +1.0,                   +0.0,
        +sin(orientation.y),    +0.0,                   +cos(orientation.y)
    ];
    const mRz = [
        +cos(orientation.z),    -sin(orientation.z),    +0.0,
        +sin(orientation.z),    +cos(orientation.z),    +0.0,
        +0.0,                   +0.0,                   +1.0
    ];
    return mat3x3(mRx , mat3x3(mRy , mRz));
}

function drawScene() {
    /*
    NOTES - rotation in the THIRD axis is HARD!!
    Consider roting an object in first, and then ITS second axis. Trivial / predictable in terms of tilt/elevate - as tilt is still about an (identical) vertical axis,
    and elevate about a (albeit tilted) still horizontal axis
    However, the third, say roll, is about neither a horizontal nor vertial axis.

    SECOND - proper euler angles are not necessarily the same as a rotation matrix made of RxRyRz

    Conclusion :
    We likely need to rebuild the R3 rotations used in i)ellipsoid detection, ii)ellipsoid normal, iii) object colouring
    To use proper Euler angles. Or lay out a way to break a compound R3 into it's angles ** (why)
    eg an orientation which seems obvious to describe, can be impossibly hard to inntuitively describe as 3 rotations around the xyz axis. (Rather you get xy then x again say)
    ie ordering of component rations MATTER

    Summary : A rotation in 3D can be represented as three angles that specify three rotations applied *successively* to the X, Y and Z axes

    Euler can be ZXZ
    https://www.learnopencv.com/rotation-matrix-to-euler-angles/
    https://www.gregslabaugh.net/publications/euler.pdf
    */
    t += deltaT;
    arena -= 0.001;
    players[0].pos.x += (players[0].vel.x *= 0.98);
    players[0].pos.y += (players[0].vel.y *= 0.98);
    players[0].pos.z += (players[0].vel.z *= 0.98);
    players[1].pos.x += (players[1].vel.x *= 0.98);
    players[1].pos.y += (players[1].vel.y *= 0.98);
    players[1].pos.z += (players[1].vel.z *= 0.98);

    if ( (players[1].pos.x - players[0].pos.x)*(players[1].pos.x - players[0].pos.x) + (players[1].pos.y - players[0].pos.y)*(players[1].pos.y - players[0].pos.y) + (players[1].pos.z - players[0].pos.z)*(players[1].pos.z - players[0].pos.z) <= (players[0].size+players[1].size)*(players[0].size+players[1].size))  {
        players[0].tagged = !players[0].tagged;
        players[1].tagged = !players[1].tagged;
    }
    if ( players[0].pos.x * players[0].pos.x + players[0].pos.z * players[0].pos.z > (arena-players[0].size)*(arena-players[0].size)){
        players[0].tagged = true;
        players[1].tagged = false;
    }
    if ( players[1].pos.x * players[1].pos.x + players[1].pos.z * players[1].pos.z > (arena-players[1].size)*(arena-players[1].size)){
        players[1].tagged = true;
        players[0].tagged = false;
    }
    if (players[0].tagged) players[0].size *= 0.999; else players[0].size *= 1.001;
    if (players[1].tagged) players[1].size *= 0.999; else players[1].size *= 1.001;

    // Here we set orientation as function (position)
    // players[0].orientation.x =  players[0].pos.z / players[0].size;
    // players[0].orientation.z = -players[0].pos.x / players[0].size;
    // players[1].orientation.x =  players[1].pos.z / players[1].size;
    // players[1].orientation.z = -players[1].pos.x / players[1].size;
    //
    // INSTEAD - want to INCREMENT orientation from PAST based on SPEED
    let dx = players[0].vel.z / players[0].size; // radians = distance/2PIsize
    let dy = 0;
    let dz = players[0].vel.x / players[0].size;
    let deltaO = {
        x : players[0].vel.z / players[0].size,
        y : 0,
        z : -players[0].vel.x / players[0].size
    };
    let a = players[0].orientation.x;
    let b = players[0].orientation.y;
    let c = -players[0].orientation.z;

    // players[0].orientation = mat3xv3(mat3x3(rotation(players[0].orientation), rotation(deltaO) ), players[0].orientation);
    // players[0].orientation = mat3xv3(rotation(deltaO) , players[0].orientation);


    players[0].orientation = addv3(players[0].orientation, mat3xv3(rotation(players[0].orientation), deltaO));

    // players[0].orientation.x +=  dx*cos(a)*cos(b)   + dy*(cos(a)*sin(b)*sin(c)-sin(a)*cos(c))   + dz*(cos(a)*sin(b)*cos(c)-sin(a)*sin(c));
    // players[0].orientation.y +=  dx*sin(a)*cos(b)   + dy*(sin(a)*sin(b)*sin(c)+cos(a)*cos(c))   + dz*(sin(a)*sin(b)*cos(c)-cos(a)*sin(c));
    // players[0].orientation.z -= -dx*sin(b)          + dy*cos(b)*sin(c)                          + dz*cos(b)*cos(c);

    // players[0].pos.y += 0.01;
    // players[0].orientation.x +=  dy*sin(players[0].orientation.y) + dz*cos(players[0].orientation.z);
    // players[0].orientation.y +=  dz*sin(players[0].orientation.z) + dx*sin(players[0].orientation.x);
    // players[0].orientation.z += -dx*cos(players[0].orientation.x) + dy*sin(players[0].orientation.y);

    dx =  players[1].vel.x / players[1].size;
    dz =  players[1].vel.z / players[1].size;
    players[1].orientation.x +=  dz;
    players[1].orientation.z += -dx;


    // players[0].orientation.x +=  players[0].vel.z / players[0].size;
    // players[0].orientation.z += -players[0].vel.x / players[0].size;
    // players[1].orientation.x +=  players[1].vel.z / players[1].size;
    // players[1].orientation.z += -players[1].vel.x / players[1].size;

    players[0].pos.y = players[0].size;
    players[1].pos.y = players[1].size;

    updateCameraFromKeys();
    uniform1f("u_time", t);

    uniform3fv("cameraPostion", [cameraPostion.r * Math.sin(cameraPostion.theta), cameraPostion.height, cameraPostion.r * Math.cos(cameraPostion.theta)]);
    uniform3fv("cameraTo", [0, cameraPostion.aimHeight, 0]);
    uniform1f("ambience", ambience);
    uniform1f("arena", arena);
    uniform1f("incidentIllumination", incidentIllumination);
    uniform1f("polish", polish);
    uniform1f("lampBrightness", lampBrightness);
    // let rollingT = t*3;
    uniform3fv("sphereCol", [ // Although size is more of a permenent attribute, it's convenient to pass around as one var for collision detection
        players[0].tagged? 1.0 : 0.0,  players[0].tagged? 0.0 : 1.0,  0.0,
        players[1].tagged? 1.0 : 0.0,  0.0,  players[1].tagged? 0.0 : 1.0,
        1.0,  0.0,  1.0,
        0.0,  1.0,  1.0,
        0.0,  1.0,  0.0
    ]);
    // players[0].pos.x = 2*PI*(5/6)*cos(9*t);
    // players[1].pos.z = 2*PI*(5/6)*sin(9*t);
    uniform4fv("spherePos", [ // Although size is more of a permenent attribute, it's convenient to pass around as one var for collision detection
        players[0].pos.x,                   players[0].pos.y,           players[0].pos.z,               players[0].size,
        players[1].pos.x,                   players[1].pos.y,           players[1].pos.z,               players[1].size,
        // 10.0*cos(rollingT+4*PI/3),          3.0,                        -10.0*sin(rollingT+4*PI/3),     3,
        // 10.0*cos(rollingT+2*PI/3),          3.0,                        -10.0*sin(rollingT+2*PI/3),     3,
        // 10.0*cos(rollingT+0*PI/3),          3.0,                        -10.0*sin(rollingT+0*PI/3),     3
    ]);
    uniform3fv("sphereOrientations", [
        players[0].orientation.x,               players[0].orientation.y,                       players[0].orientation.z,
        players[1].orientation.x,               players[1].orientation.y,                       players[1].orientation.z,
        // (10/3)*(rollingT+4*PI/3),               PI-(rollingT+4*PI/3),                           0,
        // (10/3)*(rollingT+2*PI/3),               PI-(rollingT+2*PI/3),                           0,
        // (10/3)*(rollingT+0*PI/3),               PI-(rollingT+0*PI/3),                           0
    ]);

    uniform3fv("ellipsoidCentres",      [
        25.0*cos(t+4*PI/3),     5,    25.0*sin(t+4*PI/3),
        // 10.0*cos(t+4*PI/3),     (2*3)+1,    10.0*sin(t+4*PI/3),
        // 15.0*cos(t+2*PI/3),     2,          15.0*sin(t+2*PI/3),
        // 20.0*cos(t+0*PI/3),     5,          20.0*sin(t+0*PI/3)
    ]);
    uniform3fv("ellipsoidSizes",        [
        1,  5,  5,
        // 5,  3,  2,
        // 5,  1,  5
    ]);
    uniform3fv("ellipsoidColours",        [
        1.0,  0.0,  0.0,
        // 0.0,  1.0,  0.0,
        // 0.0,  0.0,  1.0
    ]);
    let ang = 0.1*PI/4;
    // NOT just 3rd axis, but Z axis particularly. Suggesting it's the ordering of the way I'm compounding rotations
    // Particularly the rotation used for ellipsoidIntersectDetection which is Z first
    // Actually No - (20/4)*t,t,0 works and 0,(20/4)*t,t maintains axial spin but t,(20/4)t,0 and 0,t,20.4t don't
    // Suggesting ordering by size..?!!
    // NOTICE - zx appears opposite right hand rule
    // vs       y correct right hand rule`
    uniform3fv("ellipsoidOrientations", [ // NOT WORLD FRAME / PILOT* perspective / Yaw / Pitch / Roll (Z then Y then X - with each subsequent axis effected by the former)
        /* NOTE - wathing an animation, won't seem like pilot FLYING, but would be described by :
        1 Start with object frame aligned to world frame
        2 Rotate about Z axis
        3 THEN rotate about new object Y axis
        4 THEN rotate about new object X axis
        * Animation conuses this as doesn't APPEAR TO start from world frame each instruction
        eg. Becomes a challenge of QUESTION ARTICULATION :
        If we want a penny wheel rolling around, AND tilting towards middle
        */
        2*6*t+PI/2,             t+4*PI/3,           0,
        // 0,                      (1-6)*t + PI/6,     0,
        // (20/4)*t,                  t,               0
        // t,0,PI/2 // Z first, but rotates frame too, so Y 2nd in new frame, then X last
        // (20/4)*t,t,0,
        // 0,10*t,(PI/4)
    // 0,t*2,t
    // t,0,0
    ]);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    window.requestAnimationFrame(drawScene);
}
drawScene();