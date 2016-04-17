/**
@module controllers/location 
@description a module to interact with location data
@requires models/location
*/

var Loc = require('../models/location');

/**
@function getAllLocationsForFlightId
@description queries all locations for a given flight id
@alias controllers/locations.getAllLocationsForFlightId
@param {string} _flightId - a mongo object id
@param {function} _callback - reports the status and locations
*/
var getAllLocationsForFlightId = function(_flightId, _callback){
	Loc.find({flight_id: _flightId}, function(err, locations){
		if(err) _callback({success: false, data: 'error querying locations'});
		else _callback({success: true, data: locations});
	});
}

/**
@function saveLocation 
@description saves location in database
@alias controllers/location.saveLocation
@param {Object} _data - location data to be saved
@param {function} _callback - reports the status
*/
var saveLocation = function(_data, _callback){
	var loc = new Loc(_data);
	loc.save(function(err, data){
		if(err) console.log(err);
		else console.log('collected location');
		_callback();
	});
}

// export functions
module.exports = {
	getAllLocationsForFlightId: getAllLocationsForFlightId,
	saveLocation: saveLocation
};