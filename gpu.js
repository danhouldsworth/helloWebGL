var fs = require('fs');
var serveHTTP = function (req, res) {
    res.writeHead(200);
    res.end(fs.readFileSync("7. GPGPU/4.html"));
};
require("http").createServer(serveHTTP).listen(12345);