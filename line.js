module.exports = function (RED) {
    var Liner = require('liner');


    function ReadLine(n) {
        RED.nodes.createNode(this, n);
        this.name = n.name;
        this.topic = n.topic;
        this.file = n.file;
        var node = this;


        node.on('close', function (done) {
            node.status({});
            done();
        });

        node.on('input', function (msg) {
            if (msg.file !== undefined && msg.file !== "") {
                file = msg.file;
            } else {
                file = node.file;
            }
            var liner = new Liner(file);

            var oldPayload = null;

            if (msg['payload'] !== undefined) {
                var oldPayload = msg['payload'];
            }
            var i = 0;
            
            liner.on('readable', function () {
                while (true) {
                    var line = liner.read();
                    if (line === null) {
                        break;
                    }
                    msg['payload'] = line;
                    msg['line'] = i;
                    node.send([msg, null]);
                    i++;
                }
            });
            liner.on('error', function (err) {
                node.error(err);
            });
            liner.on('end', function () {
                msg['lines'] = i;
                msg['payload'] = oldPayload;
                node.send([null, msg]);
            });

        });

    }
    RED.nodes.registerType("read-line", ReadLine);


};