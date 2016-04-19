/**
@module controllers/acceleration 
@description controller to interact with acceleration data
@requires models/acceleration
*/

var Acceleration = require('../models/acceleration');

/**
@function getAllAccelerationsForFlightId 
@description queries all accelerations for a given flight id
@alias controllers/acceleration.getAllAccelerationsForFlightId
@param {string} _flightId - a mogoose object id
@param {function} _callback - returns status and accelerations
*/
var getAllAccelerationsForFlightId = function(_flightId, _callback){
	Acceleration.find({flight_id: _flightId}, function(err, accelerations){
		if(err) _callback({success: false, data: 'error querying acceleration'});
		else _callback({success: true, data: accelerations});
	});
}

/**
@function saveAcceleration 
@description saves a single acceleration data parameter
@alias controllers/acceleration.saveAcceleration
@param {Object} _data - the data to create an acceleration object
@param {function} _callback - returns status
*/
var saveAcceleration = function(_data, _callback){
	var bat = new Acceleration(_data);
	bat.save(function(err, data){
		if(err) console.log(err);
		else console.log('collected acceleration');
		_callback();
	});
}

// export functions
module.exports = {
	getAllAccelerationsForFlightId: getAllAccelerationsForFlightId,
	saveAcceleration: saveAcceleration
};