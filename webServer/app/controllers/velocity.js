/**
@module velocity - a module to interact with the velocity data
*/

/**
@requires velocity
*/

var Velocity = require('../models/velocity');

/**
@function getAllVelocitiesForFlightId - queries all velocities for a given flight id
@alias controllers/velocity.getAllVelocitiesForFlightId
@param {String} _flightId - a mogoose object id
@param {function} _callback - a function callback
*/
var getAllVelocitiesForFlightId = function(_flightId, _callback){
	Velocity.find({flight_id: _flightId}, function(err, velocities){
		if(err) _callback({success: false, data: 'error querying velocity'});
		else _callback({success: true, data: velocities});
	});
};

var saveVelocity = function(_data, _callback){
	var vel = new Velocity(_data);
	vel.save(function(err, data){
		if(err) console.log(err);
		else console.log('collected velocity');
		_callback();
	});
};

// export public functions
module.exports = {
	getAllVelocitiesForFlightId: getAllVelocitiesForFlightId,
	saveVelocity: saveVelocity
};