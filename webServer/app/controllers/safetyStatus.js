/**
@module controllers/safetyStatus 
@description a module to interact with safety data 
@requires models/safetyReport
*/

var SafetyReport = require('../models/safetyReport');

/**
@function getSafetyStatus 
@description queries all safety statuses for a given flight id
@alias controllers/velocity.getSafetyStatus
@param {string} _flightId - a mongo object id
@param {function} _callback - a function callback
*/
var getSafetyStatus = function(_flightId, _callback){
	SafetyReport.find({flight_id: _flightId}, function(err, statuses){
		if(err || statuses.length === 0) _callback({success: false, message: 'no notifications found'});
		else _callback({success: true, data: statuses});
	});
};

/**
@function saveSafetyStatus 
@description saves safety report in database
@alias controllers/safetyStatus.saveSafetyStatus
@param {Object} _collectData - safety status data to be saved
@param {function} _callback - reports the status
*/
var saveSafetyStatus = function(_collectData, _callback){
	var safetyReport = new SafetyReport(_collectData);
	safetyReport.save(function(error, data){
        if(error) console.log('error saving safety report'); 
        else console.log('added safety report'); 
        _callback();
    });
};

// export functions
module.exports = {
	getSafetyStatus: getSafetyStatus,
	saveSafetyStatus: saveSafetyStatus
};