/**
@module safetyStatus - a module to interact with safety data 
*/

/**
@requires 
*/

var SafetyReport = require('../models/safetyReport');

var getSafetyStatus = function(_flightId, _callback){
	SafetyReport.find({flight_id: _flightId}, function(err, statuses){
		if(err || statuses.length === 0) _callback({success: false, message: 'no notifications found'});
		else _callback({success: true, data: statuses});
	});
};

var saveSafetyStatus = function(_collectData, _callback){
	var safetyReport = new SafetyReport(_collectData);
	safetyReport.save(function(error, data){
        if(error) console.log('error saving safety report'); 
        else console.log('added safety report'); 
        _callback();
    });
};

module.exports = {
	getSafetyStatus: getSafetyStatus,
	saveSafetyStatus: saveSafetyStatus
};