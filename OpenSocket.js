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

function OpenSocket(args) {

    defaultArgs = {
        channel: "",
        methods: {

        },
        onerror: function () { },
        onclose: function () { },
        room: 1
    }

    this.constructor = (args) => {

        var self = new WebSocket("ws://" + window.location.hostname + ":3000" + "/websockets/" + args.channel);

        args = args || this.defaultArgs;
        for (var method in args.methods) {
            self[method] = args.methods[method];
        }
        self.onmessage = function (data) {
            data = JSON.parse(data.data);
            if(data.action in self)
                self[data.action](...data.data);
            else
                console.error(`No such method ${data.action} in websocket`);
        }
        self.onerror = args.onerror;
        self.onclose = args.onclose;
        self.server = noSuchMethod({}, function (name, data) {
            self.send(JSON.stringify({ action: name, data: data }));
        });
        return self;
    }

    return this.constructor(args);
}