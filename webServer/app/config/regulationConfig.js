/**
@module regulationConfig
*/

/**
@public {Object} faa_reg - object to store faa reguation constants for flight data
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
@public {Object} cur_flight - to store current flight data, supports multiple user flights
*/
var cur_flight = {};

/**
@function startFlight - to insert current flight data for a given user
@param {String} _id - mongoose user id
*/
var startFlight = function(_id, _readExt){

	// add the flight data
	cur_flight[_id] = {

		// start of flight
		start_time: new Date(), 

		// simulation status
		simulation: {
			status: true,
			file_read: _readExt
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
	}
};

/**
@function endFlight - to clear current flight data for a given user
@param {String} _id - mongoose user id
*/
var endFlight = function(_id){

	// first save all flight data

	// remove data from object
	cur_flight[_id] = null;
};

// export public data and functions
module.exports = {
	faa_reg: faa_reg,
	cur_flight: cur_flight,
	startFlight: startFlight,
	endFlight: endFlight
};