angular.module('UavOpsInterface')
.factory('Websocket', function (Notification){
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
	var altitude = [
		{
	 		key: "Altitude",
	 		values: []
		}
	];
	var notifications = [];

	return {
	     create: function (){ 

	    	// configure the websocket and incoming data flow
			ws = new WebSocket('ws://localhost:5001');
			ws.onmessage = function (event) {

			 	var jsonData = JSON.parse(event.data);
			 	console.log(jsonData);
				if(jsonData.type === 'data'){

					// build altitude data
					if(jsonData.altitude < 0.01 && jsonData.altitude > -0.01) jsonData.altitude = 0;
					var pushAlt = { "label" : jsonData.time/1000 , "value":jsonData.altitude};
					altitude[0].values.push(pushAlt);
					if (altitude[0].values.length > 15){
						altitude[0].values.shift();
					}

					// build velocity x data
					if(jsonData.velocity_x < 0.01 && jsonData.velocity_x > -0.01) jsonData.velocity_x = 0;
					var pushX = {"label":jsonData.time/1000, "value":jsonData.velocity_x};
					speed[0].values.push(pushX);
					if (speed[0].values.length > 15){
						speed[0].values.shift();
					}

					// build velocity y data
					if(jsonData.velocity_y < 0.01 && jsonData.velocity_y > -0.01) jsonData.velocity_y = 0;
					var pushY = {"label":jsonData.time/1000, "value":jsonData.velocity_y};
					speed[1].values.push(pushY);
					if (speed[1].values.length > 15){
						speed[1].values.shift();
					}

					// build velocity z data
					if(jsonData.velocity_z < 0.01 && jsonData.velocity_z > -0.01) jsonData.velocity_z = 0;
					var pushZ = {"label":jsonData.time/1000, "value":jsonData.velocity_z};
					speed[2].values.push(pushZ);
					if (speed[2].values.length > 15){
						speed[2].values.shift();
					}					
				}
				else if(jsonData.type === 'notification'){

					// push warning here
					var pushNotif = {
						text: jsonData.text,
						type: jsonData.level, 
						param: jsonData.param,
						time: jsonData.time
					};
					notifications.push(pushNotif);

					if(jsonData.level === 'warning') Notification({message: jsonData.param}, 'warning');
					else if(jsonData.level === 'hazard') Notification({message: jsonData.param}, 'error'); 
					else if(jsonData.level === 'update') Notification({message: jsonData.param}, 'info');
				}
				else{
					console.log('invalid websocket data');
				}
			}
	    },

	    // all getters
	    getSpeed: function(){ return speed; },
	    getAltitude: function(){ return altitude; },
	    getNotifications: function(){ return notifications; },
	    getHistory: function(){ return history; },
	    getConstraints: function(){ return constraints; },	

	    // setters
	    deleteNotification: function(id){
	    	notifications.splice(id, 1);
	    },
	    deleteAllNotifications: function(){ notifications = []; },
	    deleteAllSpeeds: function(){ 
	    	speed[0].values = []; 
	    	speed[1].values = []; 
	    	speed[2].values = []; 
	    },
	    deleteAllAltitudes: function(){ altitude[0].values = []; }
	};
});