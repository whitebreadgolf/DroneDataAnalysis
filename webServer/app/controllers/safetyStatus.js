/**
@module safetyStatus - a module to interact with safety data 
*/

/**
@requires 
*/

var SafetyStatus = require('../models/safetyReport');

var getSafetyStatus = function(_flightId, _callback){
	SafetyStatus.find({flight_id: _flightId}, function(err, statuses){
		if(err || statuses.length === 0) _callback({success: false, message: 'no notifications found'});
		else _callback({success: true, data: statuses});
	});
};

var saveSafetyStatus = function(){

};

module.exports = {
	getSafetyStatus: getSafetyStatus
};