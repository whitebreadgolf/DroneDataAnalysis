angular.module('UavOpsInterface')
.service('Websocket', function (){

	var ws;
	var speed = [{
		key: "x velocity",
		values: []

	}];
	var altitude = [];
	var warnings = [];
	var overallCount = 0;

	return {
	    create: function (){ 

	    	// configure the websocket and incoming data flow
			ws = new WebSocket('ws://localhost:5001');
			ws.onmessage = function (event) {

				var jsonData = JSON.parse(event.data);

				if(jsonData.type === 'data'){
					
				
					var pushVal = { "label" : overallCount++ , "value" : jsonData.speed_x};
					speed[0].values.push(pushVal);
					console.log(jsonData);
					//speed.push({x: jsonData.speed_x, y: jsonData.speed_y, z: jsonData.speed_z});
					altitude.push(jsonData.altitude);
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
	    getWarnings: function(){ return warnings; }
	};
});