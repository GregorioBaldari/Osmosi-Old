var Kinect2 = require('kinect2'),
    express = require('express'),
    Vue = require('vue'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

var kinect = new Kinect2();

if(kinect.open()) {
    server.listen(8000);
    console.log('Server is listening on port 8000');

    app.get('/', function(req, res) {
        res.sendFile(__dirname + '/index.html');
    });

    app.use("/src", express.static(__dirname + '/src'));
    app.use("/lib", express.static(__dirname + '/lib'));
    app.use("/audio", express.static(__dirname + '/audio'));

    kinect.on('bodyFrame', sendFrame);

    function sendFrame(bodyFrame){
        io.emit('bodyFrame', bodyFrame);
    }

    kinect.openBodyReader();
}
