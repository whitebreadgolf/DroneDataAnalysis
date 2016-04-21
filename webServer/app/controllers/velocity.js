/**
@module controllers/velocity 
@description a module to interact with the velocity data
@requires models/velocity
*/

var Velocity = require('../models/velocity');

/**
@function getAllVelocitiesForFlightId 
@description queries all velocities for a given flight id
@alias controllers/velocity.getAllVelocitiesForFlightId
@param {string} _flightId - a mongo object id
@param {function} _callback - a function callback
*/
var getAllVelocitiesForFlightId = function(_flightId, _callback){
	Velocity.find({flight_id: _flightId}, function(err, velocities){
		if(err) _callback({success: false, data: 'error querying velocity'});
		else _callback({success: true, data: velocities});
	});
};

/**
@function saveVelocity 
@description saves velocity in database
@alias controllers/velocity.saveVelocity
@param {Object} _data - velocity data to be saved
@param {function} _callback - reports the status
*/
var saveVelocity = function(_data, _callback){
	var vel = new Velocity(_data);
	vel.save(function(err, data){
		if(err) console.log(err);
		_callback();
	});
};

// export public functions
module.exports = {
	getAllVelocitiesForFlightId: getAllVelocitiesForFlightId,
	saveVelocity: saveVelocity
};