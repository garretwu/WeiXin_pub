var http = require('http'),
    cp = require('child_process'),
    net = require('net');

var workers = [];

for (var i=0; i<3; i++){
    workers.push(cp.fork('./lib/worker.js', ['normal']));
}
//listen to 3000
//accept socket 
//send socket to worker process

net.createServer(function(s){
    s.pause();
    var worker = workers.shift();
    worker.send('c',s);
    workers.push(worker);
}).listen(3000);

