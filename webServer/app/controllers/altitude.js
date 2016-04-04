/**
@module altitude - controller to interact with altitude data
*/

/**
@requires altitude
*/

var Altitude = require('../models/altitude');

/**
@function getAllAltitudesForFlightId - queries all altitudes for a given flight id
@alias controllers/altitude.getAllAltitudesForFlightId
@param {String} _flightId - a mogoose object id
@param {function} _callback - a function callback
*/
var getAllAltitudesForFlightId = function(_flightId, _callback){
	Altitude.find({flight_id: _flightId}, function(err, altitudes){
		if(err) _callback({success: false, data: 'error querying altitude'});
		else _callback({success: true, data: altitudes});
	});
}

module.exports = {
	getAllAltitudesForFlightId: getAllAltitudesForFlightId
};
