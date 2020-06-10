float4 O_C = ray.origin-ellipsoid.center;
float4 dir = ray.direction;
normalizeVector( dir );

float a =
        ((dir.x*dir.x)/(ellipsoid.size.x*ellipsoid.size.x))
      + ((dir.y*dir.y)/(ellipsoid.size.y*ellipsoid.size.y))
      + ((dir.z*dir.z)/(ellipsoid.size.z*ellipsoid.size.z));
float b =
        ((2.f*O_C.x*dir.x)/(ellipsoid.size.x*ellipsoid.size.x))
      + ((2.f*O_C.y*dir.y)/(ellipsoid.size.y*ellipsoid.size.y))
      + ((2.f*O_C.z*dir.z)/(ellipsoid.size.z*ellipsoid.size.z));
float c =
        ((O_C.x*O_C.x)/(ellipsoid.size.x*ellipsoid.size.x))
      + ((O_C.y*O_C.y)/(ellipsoid.size.y*ellipsoid.size.y))
      + ((O_C.z*O_C.z)/(ellipsoid.size.z*ellipsoid.size.z))
      - 1.f;

float d = ((b*b)-(4.f*a*c));
if ( d<0.f || a==0.f || b==0.f || c==0.f )
   return false;

d = sqrt(d);

float t1 = (-b+d)/(2.f*a);
float t2 = (-b-d)/(2.f*a);

if( t1<=EPSILON && t2<=EPSILON ) return false; // both intersections are behind the ray origin
back = (t1<=EPSILON || t2<=EPSILON); // If only one intersection (t>0) then we are inside the ellipsoid and the intersection is at the back of the ellipsoid
float t=0.f;
if( t1<=EPSILON )
   t = t2;
else
   if( t2<=EPSILON )
      t = t1;
   else
      t=(t1<t2) ? t1 : t2;

if( t<EPSILON ) return false; // Too close to intersection

intersection = ray.origin + t*dir;
normal = intersection-ellipsoid.center;
normal.x = 2.f*normal.x/(ellipsoid.size.x*ellipsoid.size.x);
normal.y = 2.f*normal.y/(ellipsoid.size.y*ellipsoid.size.y);
normal.z = 2.f*normal.z/(ellipsoid.size.z*ellipsoid.size.z);

normal.w = 0.f;
// normal *= (back) ? -1.f : 1.f;
normalizeVector(normal);
return true;
