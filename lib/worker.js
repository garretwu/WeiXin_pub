var http = require('http'),
    cp = require('child_process'),
    net = require('net');

//get message from server
//trigger connection event
var worker = http.createServer(function(req, res){
    res.writeHead(200, {"Content-Type": "text/plain", "Connection": "close"});
    res.write('hello');
    res.end();
});

console.log("worker start on " + process.pid);

process.on("message", function(msg, socket){
    process.nextTick(function(){
        if(msg == 'c' && socket){
            socket.readable = socket.writeable = true;
            socket.resume();
            worker.connections++;
            socket.server = worker;
            worker.emit("connection", socket);
            socket.emit("connect");
        }
    });
});
