// A super crude file server as some of these experiments require textures to be served as local file access is forbidden.

var fs = require('fs');
var serveHTTP = function (req, res) {
    console.log(req.url);
    res.writeHead(200);
    switch (req.url){
        case "/test.jpg"                    : res.end(fs.readFileSync("5. Textures/test.jpg")); break;
        case "/logo.png"                    : res.end(fs.readFileSync("5. Textures/logo.png")); break;
        case "/tex1"                        : res.end(fs.readFileSync("5. Textures/1.html"));   break;
        case "/tex1a"                       : res.end(fs.readFileSync("5. Textures/1a.html"));  break;
        case "/tex1b"                       : res.end(fs.readFileSync("5. Textures/1b.html"));  break;
        case "/tex2"                        : res.end(fs.readFileSync("5. Textures/2.html"));   break;
        case "/tex2b"                       : res.end(fs.readFileSync("5. Textures/2b.html"));  break;
        case "/tex2c"                       : res.end(fs.readFileSync("5. Textures/2c.html"));  break;
        case "/tex3"                        : res.end(fs.readFileSync("5. Textures/3.html"));   break;
        case "/tex3b"                       : res.end(fs.readFileSync("5. Textures/3b.html"));  break;
        case "/tex4"                        : res.end(fs.readFileSync("5. Textures/4.html"));   break;
        case "/tex4b"                       : res.end(fs.readFileSync("5. Textures/4b.html"));  break;
        case "/tex4c"                       : res.end(fs.readFileSync("5. Textures/4c.html"));  break;
        case "/mandy" :
        case "/loopsInShaderBreakiOS"       : res.end(fs.readFileSync("7. GPGPU/2.html"));      break;
        case "/lolipop" :
        case "/GPUandMultiTouchSprint"      : res.end(fs.readFileSync("7. GPGPU/4.html"));      break;
        case "/Ray" :
        case "/RayTrace_iOSfragShadeBreaks" : res.end(fs.readFileSync("7. GPGPU/5.html"));      break;
        case "/ray2"                        : res.end(fs.readFileSync("7. GPGPU/6.html"));      break;
        // case "RayTrace_iOSfragShadeBreaks" : res.end(fs.readFileSync("7. GPGPU/5.html")); break;
        default : res.end("Nope - this is a secure sprint test server for internal use only, so can't let you search. Good bye robots.");
    }
};
require("http").createServer(serveHTTP).listen(54321);