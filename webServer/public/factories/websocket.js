/**
@class angular_factories.Websocket
@memberOf angular_factories
@requires Notification
*/
angular.module('UavOpsInterface')
.factory('Websocket', function (Notification){
	// websocket data structures
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
	var acceleration = [
		{
			key: "x acceleration",
			values: []
		},
		{
			key: "y acceleration",
			values: []
		},
		{
			key: "z acceleration",
			values: []
		}
	];
	var altitude = [
		{
	 		key: "Altitude",
	 		values: []
		}
	];	
	var building = [
		{
			key:'Building proximity',
			values: []
		}
	]
	var airports = [
		
	];
	var battery = [
		{
			key: "Battery Charge",
			values: []
		}
	];
	var notifications = [];

	return {
		/**
		@function createWebsocket
		@memberOf angular_controller.createWebsocket
		@description The function configures and sets up the websocket. 
		*/
	    create: function (){ 

	    	// configure the websocket and incoming data flow
			ws = new WebSocket('ws://localhost:5001');
			ws.onmessage = function (event) {

			 	var jsonData = JSON.parse(event.data);
			 	console.log(jsonData);
				if(jsonData.type === 'data'){

					// build altitude data
					if(jsonData.altitude !== null){
						if(jsonData.altitude < 0.01 && jsonData.altitude > -0.01) 
							jsonData.altitude = 0;
						var pushAlt = { "label" : jsonData.time/1000 , "value":jsonData.altitude};
						altitude[0].values.push(pushAlt);
						if (altitude[0].values.length > 15)
							altitude[0].values.shift();
					}

					// build velocity x data
					if(jsonData.velocity_x !== null){
						if(jsonData.velocity_x < 0.01 && jsonData.velocity_x > -0.01) 
							jsonData.velocity_x = 0;
						var pushX = {"label":jsonData.time/1000, "value":jsonData.velocity_x};
						speed[0].values.push(pushX);
						if (speed[0].values.length > 15)
							speed[0].values.shift();
					}

					// build velocity y data
					if(jsonData.velocity_y !== null){
						if(jsonData.velocity_y < 0.01 && jsonData.velocity_y > -0.01) 
							jsonData.velocity_y = 0;
						var pushY = {"label":jsonData.time/1000, "value":jsonData.velocity_y};
						speed[1].values.push(pushY);
						if (speed[1].values.length > 15)
							speed[1].values.shift();
					}

					// build velocity z data
					if(jsonData.velocity_z !== null){
						if(jsonData.velocity_z < 0.01 && jsonData.velocity_z > -0.01) 
							jsonData.velocity_z = 0;
						var pushZ = {"label":jsonData.time/1000, "value":jsonData.velocity_z};
						speed[2].values.push(pushZ);
						if (speed[2].values.length > 15)
							speed[2].values.shift();
					}

					// build acceleration x data
					if(jsonData.acc_yacc_y !== null){
						if(jsonData.acc_y < 0.01 && jsonData.acc_y > -0.01) 
							jsonData.acc_y = 0;
						var pushX = {"label":jsonData.time/1000, "value":jsonData.acc_y};
						acceleration[0].values.push(pushX);
						if (acceleration[0].values.length > 15)
							acceleration[0].values.shift();
					}

					// build acceleration y data
					if(jsonData.acc_y !== null){
						if(jsonData.acc_y < 0.01 && jsonData.acc_y > -0.01) 
							jsonData.acc_y = 0;
						var pushY = {"label":jsonData.time/1000, "value":jsonData.acc_y};
						acceleration[1].values.push(pushY);
						if (acceleration[1].values.length > 15)
							acceleration[1].values.shift();
					}

					// build acceleration z data
					if(jsonData.acc_z !== null){
						if(jsonData.acc_z < 0.01 && jsonData.acc_z > -0.01) 
							jsonData.acc_z = 0;
						var pushZ = {"label":jsonData.time/1000, "value":jsonData.acc_z};
						acceleration[2].values.push(pushZ);
						if (acceleration[2].values.length > 15)
							acceleration[2].values.shift();
					}

					// build battery data
					if(jsonData.battery !== null){
						if(jsonData.battery < 0.01 && jsonData.battery > -0.01) 
							jsonData.battery = 0;
						var pushBat = {"label":jsonData.time/1000, "value":jsonData.battery};
						battery[0].values[0] = pushBat;
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

					if(jsonData.level === 'warning') 
						Notification({message: jsonData.param}, 'warning');
					else if(jsonData.level === 'hazard') 
						Notification({message: jsonData.param}, 'error'); 
					else if(jsonData.level === 'update') 
						Notification({message: jsonData.param}, 'info');
				}
				else if(jsonData.type === 'proximity'){
					if(jsonData.param === 'building'){
						building[0].values[0] = {"label":jsonData.time/1000, "value":jsonData.dist};
					}
					else if(jsonData.param === 'airport'){
						var flag = false;
						for(var i in airports){
							if(airports[i].key === jsonData.name){
								flag = true;
								airports[i].values[0] = jsonData.dist;
							}	
						}

						// not in graph yet
						if(!flag)
							airports.push({key: jsonData.name, values: [jsonData.dist]});
					}
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
		getBattery: function(){ return battery; },
		getAcceleration: function(){ return acceleration; },
		getAirport: function(){ return airports; },
		getBuilding: function(){ return building; },

	    // setters
	    deleteNotification: function(id){
	    	notifications.splice(id, 1);
	    },
	   
	    deleteAllLiveData: function(){
			speed[0].values = []; 
			speed[1].values = []; 
			speed[2].values = [];
			acceleration[0].values = []; 
			acceleration[1].values = []; 
			acceleration[2].values = [];
			airports = [];
			battery[0].values = [];
			building[0].values = [];
			notifications = [];
			altitude[0].values = [];
	    }
	};
});