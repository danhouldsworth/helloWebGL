var fs = require('fs');
var serveHTTP = function (req, res) {
	console.log(req.url);
	res.writeHead(200);
    switch (req.url){
    	case "/mandy" :
    	case "/loopsInShaderBreakiOS" 		: res.end(fs.readFileSync("7. GPGPU/2.html")); break;
    	case "/lolipop" :
    	case "/GPUandMultiTouchSprint" 		: res.end(fs.readFileSync("7. GPGPU/4.html")); break;
    	case "/Ray" :
    	case "/RayTrace_iOSfragShadeBreaks" 	: res.end(fs.readFileSync("7. GPGPU/5.html")); break;
    	// case "RayTrace_iOSfragShadeBreaks" : res.end(fs.readFileSync("7. GPGPU/5.html")); break;
    	default : res.end("Nope - this is a secure sprint test server for internal use only, so can't let you search. Good bye robots.");
    }
};
require("http").createServer(serveHTTP).listen(54321);