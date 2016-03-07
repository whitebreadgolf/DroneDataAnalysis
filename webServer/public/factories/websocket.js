angular.module('UavOpsInterface')
.service('Websocket', function (){

	var ws;
	var speed = [
		{
			key: "x velocity",
			values: []
		},
		{
			key: "y velocity",
			values: []
		},
		{
			key: "z velocity",
			values: []
		}
	];

	var altitude = [{
	 	key: "Altitude",
	 	values: []
	 }];

	var warnings = [];
	var notifications = [];
	var overallCount = 0;

	return {
	     create: function (){ 

	    	// configure the websocket and incoming data flow
			ws = new WebSocket('ws://localhost:5001');
			ws.onmessage = function (event) {

			 	var jsonData = JSON.parse(event.data);

				if(jsonData.type === 'data'){

					var pushAlt = { "label" : jsonData.time/1000 , "value" : jsonData.altitude};
					altitude[0].values.push(pushAlt);

					var pushX = { "label" : jsonData.time/1000 , "value" : jsonData.speed_x};
					speed[0].values.push(pushX);
					var pushY = { "label" : jsonData.time/1000 , "value" : jsonData.speed_y};
					speed[0].values.push(pushY);
					var pushZ = { "label" : jsonData.time/1000 , "value" : jsonData.speed_z};
					speed[0].values.push(pushZ);					

					console.log(jsonData);
				}
				else if(jsonData.type === 'notification'){

					// push warning here
					console.log(jsonData);
				}
				else{
					console.log('invalid websocket data');
				}
			}
	    },

	    // all getters
	    getSpeed: function(){ return speed; },
	    getNumSpeed: function(){ return speed.length;},
	    getAltitude: function(){ return altitude; },
	    getNumAltitude: function(){ return altitude.length;},
	    //getWarnings: function(){ return warnings; }
	    getNotifications: function(){ return notifications; }
	};
});