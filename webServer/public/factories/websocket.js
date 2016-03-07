angular.module('UavOpsInterface')
.service('Websocket', function (){

	//var thisCpy = this;
	var ws;
	var speed = [{
		key: "x velocity",
		values: []

	}];
	var altitude = [{  // graphing purposes
	 	key: "Altitude",
	 	values: [
	 		{ "label" : "0" , "value" : 10 },
	 		{ "label" : "1" , "value" : 20 },
	 		{ "label" : "3" , "value" : 10 }
	 	]
	 }];
	var warnings = [];
	var notifications = [];
	var overallCount = 0;

	// speed = [{ 
	// 	key: "Cumulative Return",
	// 	values: [
	// 		{ "label" : "A" , "value" : -29.765957771107 },
	// 		{ "label" : "B" , "value" : 0 },
	// 		{ "label" : "C" , "value" : 32.807804682612 }
	// 	]
	// }];

	return {
	     create: function (){ 

	  //   	// init internal arrays
	  //   	//thisCpy.speed = [];
			// //thisCpy.altitude = [];
			// //thisCpy.warnings = [];

	  //   	// configure the websocket and incoming data flow
			 ws = new WebSocket('ws://localhost:5001');
			 ws.onmessage = function (event) {

			 	var jsonData = JSON.parse(event.data);

			// 	if(jsonData.type === 'data'){
					
			// 		// if(jsonData.speed_x < 0.0001 && jsonData.speed_x > -0.0001){
			// 		// 	jsonData.speed_x = 0;
			// 		// }
			// 		var pushVal = { "label" : overallCount++ , "value" : jsonData.speed_x};
			// 		console.log(pushVal);
			// 		speed[0].values.push(pushVal);
			// 		//speed.push({x: jsonData.speed_x, y: jsonData.speed_y, z: jsonData.speed_z});
			// 		altitude.push(jsonData.altitude);
			// 	}
			// 	else if(jsonData.type === 'warning'){

			// 		// push warning here
			// 	}
			// 	else{
			// 		console.log('invalid websocket data');
			// 	}
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