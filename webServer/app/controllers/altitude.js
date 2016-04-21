/**
@module controllers/altitude 
@description controller to interact with altitude data
@requires models/altitude
*/

var Altitude = require('../models/altitude');

/**
@function getAllAltitudesForFlightId 
@description queries all altitudes for a given flight id
@alias controllers/altitude.getAllAltitudesForFlightId
@param {string} _flightId - a mogoose object id
@param {function} _callback - returns status and altitudes
*/
var getAllAltitudesForFlightId = function(_flightId, _callback){
	Altitude.find({flight_id: _flightId}, function(err, altitudes){
		if(err) _callback({success: false, data: 'error querying altitude'});
		else _callback({success: true, data: altitudes});
	});
}

/**
@function saveAltitude 
@description saves a single altitude data parameter
@alias controllers/altitude.saveAltitude
@param {Object} _data - the data to create an altitude object
@param {function} _callback - returns status
*/
var saveAltitude = function(_data, _callback){
	var alt = new Altitude(_data);
	alt.save(function(err, data){
		if(err) console.log(err);
		_callback();
	});
}

// export functions
module.exports = {
	getAllAltitudesForFlightId: getAllAltitudesForFlightId,
	saveAltitude: saveAltitude
};
