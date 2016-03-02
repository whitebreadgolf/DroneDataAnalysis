/**
@module websocket
*/
var WebSocketServer = require('ws').Server;

var wss = new WebSocketServer({ port: 5001 });

wss.broadcast = function broadcast(data) {
	wss.clients.forEach(function each(client) {
		client.send(data);
	});
};

// export new websocket
module.exports = wss;