/**
@module config/regulationConfig 
@description stores and interacts with temporary app configuration data 
*/

/**
Object to store faa reguation constants for flight data
*/
var faa_reg = {
	max_velocity:{
		hazard:'44.704', 
		warning:'40.2336'
	},
	max_altitude:{
		hazard:'121.92', 
		warning:'109.728'
	}
};

/**
Stores current flight data, supports multiple user flights
*/
var cur_flight = {};

/**
Stores application constants
*/
var app_constants = {
	dji_dat_collect_rate: 10,
	app_collection_rate: 2000 // milliseconds
};

/**
@function startFlight 
@description inserts current flight data for a given user
@param {string} _id - mongo user id
@param {Object} _startObj - to describe what type of flight should be started
*/
var startFlight = function(_id, _startObj){

	// add the flight data
	cur_flight[_id] = {

		// start of flight and last collected
		start_time: new Date(), 
		last_collect: null,

		// simulation status
		simulation: {
			status: null,
			file_read: null
		},

		// other type of flight
		flight_type: {
			real_time: null,
			decoding: null
		},

		// ongoing warning data
		warning: {
			altitude: {
				hazard: null,
				warning: null
			},
			max_velocity:{
				x: {
					hazard: null,
					warning: null
				},
				y: {
					hazard: null,
					warning: null
				},
				z: {
					hazard: null,
					warning: null
				}
			}
		},

		// map data
		map: {

			// 1-4 maps around a coordinate
			cur_map: [],
			width: null,
			hieght: null,
			x: null,
			y: null,
			initialized: false
		}
	};

	// check start object
	if(_startObj.simulation){
		cur_flight[_id].simulation.status = true;
		cur_flight[_id].simulation.file_read = _startObj.simulation;
	}
	else if(_startObj.real_time){
		cur_flight[_id].flight_type.real_time = _startObj.real_time;
	}
	else if(_startObj.decoding){
		cur_flight[_id].flight_type.decoding = _startObj.decoding;
	}
};

/**
@function endFlight 
@description clears current flight data for a given user
@param {string} _id - mongo user id
*/
var endFlight = function(_id){

	// remove data from object
	cur_flight[_id] = null;
};

// export public data and functions
module.exports = {
	faa_reg: faa_reg,
	app_constants: app_constants,
	cur_flight: cur_flight,
	startFlight: startFlight,
	endFlight: endFlight
};