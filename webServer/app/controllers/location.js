/**
@module location - a module to interact with location data
*/

/**
@requires location
*/

var Loc = require('../models/location');

/**
@function getAllLocationsForFlightId - queries all locations for a given flight id
@alias controllers/velocity.getAllLocationsForFlightId
@param {String} _flightId - a mogoose object id
@param {function} _callback - a function callback
*/
var getAllLocationsForFlightId = function(_flightId, _callback){
	Loc.find({flight_id: _flightId}, function(err, locations){
		if(err) _callback({success: false, data: 'error querying locations'});
		else _callback({success: true, data: location});
	});
}

var saveLocation = function(_data, _callback){
	var loc = new Loc(_data);
	loc.save(function(err, data){
		if(err) console.log(err);
		else console.log('collected location');
		_callback();
	});
}

module.exports = {
	getAllLocationsForFlightId: getAllLocationsForFlightId,
	saveLocation: saveLocation
};