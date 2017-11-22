const WebSocket = require("ws");

function noSuchMethod(obj, func) {
    return new Proxy(obj, {
        get: function (proxy, name) {        // intercepts property access
            if (name in obj) {
                return obj[name];
            }
            return function (...args) {
                func(name, args);
            }
        }
    });
}

module.exports = function(server, channel){
    var path = '/websockets/' + (channel || '');
    var self = new WebSocket.Server({path, server});
    console.log("websocket started on path " + path);
    self.connections = [];
    
    function incoming(data){
        data = JSON.parse(data);
        if(data.action in self)
            self[data.action](...(data.data));
        else
            console.error(`No such method ${data.action} in websocket`);
    }

    self.on('connection', function connection(ws, req) {
        self.connections.push(ws);
        ws.on('message', incoming);
        ws.on('close', function(){
            self.connections.splice(self.connections.indexOf(ws), 1);
        });
    });

    self.send = function(data){
        for(var i in self.connections){
            self.connections[i].send(data);
        }
    }

    self.clients = noSuchMethod({}, function(name, data){
        self.send(JSON.stringify({ action: name, data: data }));
    });

    return self;
}