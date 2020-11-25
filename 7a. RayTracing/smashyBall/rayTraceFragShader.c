#version 300 es

// KNOWN bug in array initialisation at global scope
precision mediump float;
const   vec3    blandColour         = normalize(vec3(1.0, 1.0, 1.0)); // White
const   int     num_Lights          = 2;
const   int     num_Spheres         = 2;//5;
const   int     num_Ellipses        = 1;//3;
const   int     maxReflections      = 4;

const   float   PI                  = 3.141;//3.14159265359;
const   float   eppsilon            = 0.1;                     // Prevents noise from rays/shadows skimming surface

        mat3    mRx, mRy, mRz;
        mat3    mRxT, mRyT, mRzT;

        int     cumulativeReflections = 0;

uniform vec3    ellipsoidCentres[num_Ellipses];
uniform vec3    ellipsoidSizes[num_Ellipses];
uniform vec3    ellipsoidOrientations[num_Ellipses];
uniform vec3    ellipsoidColours[num_Ellipses];

uniform vec3    sphereCol[num_Spheres];
uniform vec4    spherePos[num_Spheres];
uniform vec3    sphereOrientations[num_Spheres];

uniform vec3    cameraPostion;

uniform float   arena;

uniform float   ambience;
uniform float   incidentIllumination;
uniform float   polish;
uniform float   lampBrightness;

in          vec3    vPosition;
out         vec4    outputColour;

mat3 rotation(vec3 orientation){
    // http://nghiaho.com/?page_id=846
    // Note ranges to faithfully undo / decompose matrix
    // ThetaX : -PI   -> PI
    // ThetaY : -PI/2 -> PI/2
    // ThetaZ : -PI   -> PI
    mat3 mRx = mat3(
        +1.0,                   +0.0,                   +0.0,
        +0.0,                   +cos(orientation.x),    -sin(orientation.x),
        +0.0,                   +sin(orientation.x),    +cos(orientation.x)
    );
    mat3 mRy = mat3(
        +cos(orientation.y),    +0.0,                   -sin(orientation.y),
        +0.0,                   +1.0,                   +0.0,
        +sin(orientation.y),    +0.0,                   +cos(orientation.y)
    );
    mat3 mRz = mat3(
        +cos(orientation.z),    -sin(orientation.z),    +0.0,
        +sin(orientation.z),    +cos(orientation.z),    +0.0,
        +0.0,                   +0.0,                   +1.0
    );
    return mRx * mRy * mRz;
}

mat3 reverseRotation(vec3 orientation){
    mat3 mRxT = mat3(
        +1.0,                   +0.0,                   +0.0,
        +0.0,                   +cos(orientation.x),    +sin(orientation.x),
        +0.0,                   -sin(orientation.x),    +cos(orientation.x)
    );
    mat3 mRyT = mat3(
        +cos(orientation.y),    +0.0,                   +sin(orientation.y),
        +0.0,                   +1.0,                   +0.0,
        -sin(orientation.y),    +0.0,                   +cos(orientation.y)
    );
    mat3 mRzT = mat3(
        +cos(orientation.z),    +sin(orientation.z),    +0.0,
        -sin(orientation.z),    +cos(orientation.z),    +0.0,
        +0.0,                   +0.0,                   +1.0
    );
    return mRzT * mRyT * mRxT;
}



bool testIntersectsEllipsoid(int i, vec3 rayStart, vec3 rayDirection, out float distance) {
    // What we actually need is spheroid x,y,z a,b,c a1,a2,a3
    // Example : http://cudaopencl.blogspot.com/2012/12/ellipsoids-finally-added-to-ray-tracing.html
    distance = 9999999.0;                                       // Convenient fudge for comparing closeness
    vec3 rayInEllipsoidFrame= rotation(ellipsoidOrientations[i]) * rayDirection;
    vec3 toEllipsoid        = rotation(ellipsoidOrientations[i]) * (ellipsoidCentres[i] - rayStart);
    float a = dot(rayInEllipsoidFrame   / ellipsoidSizes[i],    rayInEllipsoidFrame / ellipsoidSizes[i]);
    float b = dot(rayInEllipsoidFrame   / ellipsoidSizes[i],    toEllipsoid         / ellipsoidSizes[i]);
    float c = dot(toEllipsoid           / ellipsoidSizes[i],    toEllipsoid         / ellipsoidSizes[i]);
    float gapSqd = 4.0 * (a*c - b*b - a);
    if ( gapSqd > 0.0) return false;                            // Miss

    float d = sqrt(-gapSqd);

    float t1 = (2.0 * b - d) / (2.0 * a);
    float t2 = (2.0 * b + d) / (2.0 * a);
    if (t1 < eppsilon && t2 < eppsilon) return false;           // Both behind us
    if (t1 < eppsilon || t2 < eppsilon) distance = t2;          // Inside object (use furthest) ???
    else                                distance = t1;          // Whole object in front (Use closest)
    return true;
}

bool testIntersectsSphere(vec4 sphere, vec3 rayStart, vec3 rayDirection, out float distance) {
    /*
        DIAGRAM : https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-sphere-intersection
        Also SEPERATELY consider refraction / transparency : https://www.scratchapixel.com/lessons/3d-basic-rendering/introduction-to-shading/reflection-refraction-fresnel
        Need to think through : refraction / reflection / total internal relfection
        Air / water refraction index
        Both surfaces not just first hit
        Muxing both reflection and refraction
    */
    distance = 9999999.0;                                       // Convenient fudge for comparing closeness

    vec3    toSphere = sphere.xyz - rayStart;
    float   hyp = length(toSphere);                             // Hypoternuse (of triangle between eye / sphereCenter / closest ray path)
    float   adj = dot(rayDirection, toSphere);                  // Adjacent (toSphere projected onto line in direction of ray)
    float   oppSqd = hyp*hyp - adj*adj;                         // Opposite (distance from centre to closest pass)
    float   gapSqd = oppSqd - sphere.w * sphere.w;              // How much do we miss by?
                                                                // We store sphere radius in .w

    // if (adj < 0.0) return false;                                // Sphere is behind the ray
    if (gapSqd > 0.0) return false;                             // Miss the sphere
    /* We've hit
        Conveniently, due to geometry, the smaller triangle interection / closest pass / centre has
        hyp = radius , opp = opp
        So delta from intersection from closest path (ie the amount on our ray path we fall short of closest path due to intersection = sqrt(-gapSqd)
    */
    float d = sqrt(-gapSqd);

    float t1 = adj - d;
    float t2 = adj + d;
    if (t1 < eppsilon && t2 < eppsilon) return false;           // Both behind us
    if (t1 < eppsilon || t2 < eppsilon) distance = t2;          // Inside object (use furthest)
    else                                distance = t1;          // Whole object in front (Use closest)
    return true;
}

/*
    Returns TRUE if pt of interest interects with SPHERE before LIGHT SOURCE
    Returns FALSE if unobstructed path to light source
*/
bool visibleToLightSource(vec3 lStart, vec3 lightSourceDirection) {
    float d_dummy;

    for (int i = 0; i < num_Spheres; i++)
        if (testIntersectsSphere(spherePos[i], lStart, -lightSourceDirection, d_dummy)) return false;   // Back towards the light source

    for (int i = 0; i < num_Ellipses; i++)
        if (testIntersectsEllipsoid(i, lStart, -lightSourceDirection, d_dummy))         return false;   // Test hardcoded ellipsoid // **** NEED TO PASS ELLIPSE OR INDEX ?!?!!

    return true;
}

/* NOTE :
    The LightSource is NOT SUCCESSIVELY raycasted, only the camera rays.
    Specifically:
        We DO   get successive reflections of the LightSource (and the ambient & incidentIllumination we can see in those reflections) as seen STARTING FROM THE CAMERA
        We DONT get incidentIllumination from LightSource reflections ONTO THIS POINT from the light source

    The shinyer our model, the more realistic it becomes
    Whereas as 'incidentIllumination' becomes material, then the diverge from real physics (where ambient is made from mulitple indicent illuminations)
*/
float lightAt(vec3 instersectNormal, vec3 rayDirection, vec3 intersectPosition) {

    vec3    lightSourceRay[num_Lights];
    vec3    physicalLightSourceReflectionFromThisPt[num_Lights];
    float   lightSourceBrightness[num_Lights];
    float   visibleLightReflection[num_Lights];
    float   lightLevelFromPt = ambience;
    // lightLevelFromPt             //Initialised = Ambience. Light that evenly permeates everywhere (kills shadows)
    // incidentIllumination         // LightSource illumination of facing incidence (visible from every angle)
    // polish                       // Infinitly shiny will faithly reflect LightSource as point. Unpolished will reflect from more points
                                    // >1 increases saturation area away from exact LightSource
    lightSourceBrightness[0]  =lampBrightness; lightSourceRay[0] = normalize(vec3(+0.0, -1.0, -1.0)); // Pass in as uniforms from JS
    lightSourceBrightness[1]  =lampBrightness; lightSourceRay[1] = normalize(vec3(-1.0, -1.0, +0.0));

    for (int i = 0; i < num_Lights; i++){
        physicalLightSourceReflectionFromThisPt[i]  = reflect(lightSourceRay[i], instersectNormal);
        visibleLightReflection[i]                   = dot(-physicalLightSourceReflectionFromThisPt[i], rayDirection);
        if (visibleToLightSource(intersectPosition, lightSourceRay[i]))                                     // If LightSource visible DUE TO SURFACE ORIENTATION
            lightLevelFromPt  += lightSourceBrightness[i] * (
                                    + dot(-lightSourceRay[i], instersectNormal) * incidentIllumination      // Visible LightSource illumination
                                    + pow(max(0.0, visibleLightReflection[i]), polish)                      // Visible LightSource reflection
                                );
    }

    return lightLevelFromPt;
}

/*
    Returns TRUE if the ray interects with something visible, to enable successive reflections
    Returns FALSE if no further reflections
*/
bool reflectIfIntersectWorld(vec3 lStart, inout vec3 rayDirection, out vec3 intersectPosition, inout vec3 endColour, inout float cumulativeDistance) {
    vec3 instersectNormal, collisionColor, sphereColor, ballCenter, sphereOrientation, ellipsoidCentre, ellipsoidOrientation, ellipsoidSize;
    float   d[num_Spheres], distance = 0.0;
    bool    h[num_Spheres], ground = false, ceiling = false, ellipsoid = false;
    int     lastSphere  = num_Spheres - 1;
    int     lastEllipse = num_Ellipses - 1;

    /*
        NOTE - This is very much PoC for Array of Spheres together with Array of Ellipses
        Question - is it faster to spare the extra maths with spheres, but have longer conditional code
        OR - simpler code treating everything as an ellipse??
    */
    for (int i = 0; i < num_Spheres; i++)
        h[i] = testIntersectsSphere(spherePos[i], lStart, rayDirection, d[i]);

    for (int i = 0; i < num_Spheres; i++){
        if (!h[i])  continue;                                   // We didn't hit this ball, move to the next
        if (i == lastSphere) {                                  // If it's the last ball then choose this
            distance            = d[i];
            sphereColor         = sphereCol[i];
            ballCenter          = spherePos[i].xyz;
            sphereOrientation   = sphereOrientations[i];
        }
        for (int j = i+1; j < num_Spheres; j++){
            if (d[i] > d[j]) break;                             // If ANY OTHER ball is nearer consider next
            if (j == lastSphere) {
                distance            = d[i];
                sphereColor         = sphereCol[i];
                ballCenter          = spherePos[i].xyz;
                sphereOrientation   = sphereOrientations[i];
                i = num_Spheres;                                // If ALL of the other balls are further than choose this and BREAK OUT
            }
        }
    }
    // Fudge resuse h[] / d[] num_Ellipses < spheres
    for (int i = 0; i < num_Ellipses; i++)
        h[i] = testIntersectsEllipsoid(i, lStart, rayDirection, d[i]);                    // **** NEED TO PASS ELLIPSE OR INDEX ?!?!!

    for (int i = 0; i < num_Ellipses; i++){
        if (!h[i] || (distance > 0.0 && d[i] > distance))  continue;                // We didn't hit this ellipse OR have a nearer sphere, move to the next
        if (i == lastEllipse) {                                 // If not, and it's the last ellpise then choose this
            distance            = d[i];
            sphereColor         = ellipsoidColours[i];
            ellipsoidCentre     = ellipsoidCentres[i];
            ellipsoidOrientation= ellipsoidOrientations[i];
            ellipsoidSize       = ellipsoidSizes[i];
            ellipsoid = true;
        }
        for (int j = i+1; j < num_Ellipses; j++){
            if (d[i] > d[j]) break;                             // If ANY OTHER ball is nearer consider next
            if (j == lastEllipse) {
                distance            = d[i];
                sphereColor         = ellipsoidColours[i];
                ellipsoidCentre     = ellipsoidCentres[i];
                ellipsoidOrientation= ellipsoidOrientations[i];
                ellipsoidSize       = ellipsoidSizes[i];
                ellipsoid = true;
                i = num_Ellipses;                                // If ALL of the other balls are further than choose this and BREAK OUT
            }
        }
    }

    if (distance == 0.0){ // untouched
        if (rayDirection.y < 0.0)   {distance = -lStart.y / rayDirection.y; ground = true;}
        else return false;                                      // Didn't hit anything, and moving UP away from floor
    }

    intersectPosition   = lStart + distance * rayDirection;

    // NOTE : we don't plan for objects below the surface. They will render INSTEAD of the ground
    if (ground){
        float r = length(intersectPosition.xz);
        if (r > arena) return false; // If no object AND floor beyond range Save remaining matrix maths
        // if (abs(intersectPosition.x) > 20.0) return false;
        // if (abs(intersectPosition.z) > 20.0) return false;

        instersectNormal = vec3(0.0,1.0,0.0);
        // if (fract(intersectPosition.x) > 0.5 == fract(intersectPosition.z) > 0.5)   collisionColor = vec3(1.0,1.0,1.0);
        if (fract(r) > 0.5)   collisionColor = vec3(1.0,1.0,1.0);
        else                                                                        collisionColor = vec3(0.5, 0.5, 0.3);

    } else if (ellipsoid) {
        // Rotate frame until our ellipsoid axis line up with frame. Calc normal. Then reverse transform back to world
        instersectNormal    = reverseRotation(ellipsoidOrientation) * normalize(rotation(ellipsoidOrientation) * (intersectPosition - ellipsoidCentre)*2.0 / (ellipsoidSize * ellipsoidSize));
        collisionColor      = rotation(ellipsoidOrientation) * normalize(intersectPosition - ellipsoidCentre);
        float theta1 = atan(collisionColor.z, collisionColor.x);
        float theta2 = atan(collisionColor.z, collisionColor.y);
        // if (fract(2.0*theta1) > 0.5 == fract(2.0*theta2) > 0.5) collisionColor = sphereColor;
        if (fract(5.0*theta1/PI) > 0.5 ) collisionColor = sphereColor;
        else                                                    collisionColor = blandColour;

    } else {
        instersectNormal    = normalize(intersectPosition - ballCenter);
        collisionColor      =  rotation(sphereOrientation) * normalize(intersectPosition - ballCenter); // Transform for INDIVIDUAL sphere orientation
        float theta1 = atan(collisionColor.z, collisionColor.x);
        float theta2 = atan(collisionColor.z, collisionColor.y);
        // if (fract(5.0*theta1/PI) > 0.5 == fract(theta2) > 0.5) collisionColor = sphereColor;
        if (fract(5.0*theta1/PI) > 0.5 )collisionColor = sphereColor;
        else                            collisionColor = blandColour/10.0;
    }

    cumulativeDistance += distance;                                                                 // Keep a track of how much air travelled through
    cumulativeReflections++;
    endColour   += lightAt(instersectNormal, rayDirection, intersectPosition) * collisionColor / float(cumulativeReflections);  // Get brightness [NOTE : Currently blind as to where the point is in space!!]
    rayDirection = reflect(rayDirection, instersectNormal);                                         // Finally, reflect the ray off the surface hit for onward tracing
    return true;
}

void main(void) {
    vec3 rayDirection   = normalize(vPosition - cameraPostion);
    vec3 endColour      = vec3(0.0, 0.0, 0.0);
    vec3 intersectPosition[maxReflections];
    float cumulativeDistance = 0.0;

    // At least in WebGL1 we need array indexes to be constants. Appears an int within a loop works. But not a global int like cumulativeReflections
    intersectPosition[0] = cameraPostion;
    for (int i = 0; i < maxReflections; i++)
        if (!reflectIfIntersectWorld(intersectPosition[i], rayDirection, intersectPosition[i+1], endColour, cumulativeDistance)) break;

    //endColour /= cumulativeDistance * cumulativeDistance * 0.0005;                                  // Proxy for ether occulsivity
    endColour   /= float(cumulativeReflections);                                                      // Proxy for averaging rather than adding reflections
    endColour    = mix(endColour, vec3(1.0,1.0,1.0), max(0.0,min(length(endColour)-1.0, 1.0)));        // Ensure oversaturation BLOOMS to white
    outputColour = vec4(endColour, 1.0);
}