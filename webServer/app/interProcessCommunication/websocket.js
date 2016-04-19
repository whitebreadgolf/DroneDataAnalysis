/**
@module interProcessCommunication/websocket 
@description sends data to client via wesocket connection
@requires ws
*/
var WebSocketServer = require('ws').Server;

// init websocket on port
var wss = new WebSocketServer({ port: 5001 });

/**
@function broadcast 
@description sends data to all clients
@param {string} data - data to be broadcasted
*/
wss.broadcast = function broadcast(data) {
	wss.clients.forEach(function each(client) {
		client.send(data);
	});
};

// export new websocket
module.exports = wss;