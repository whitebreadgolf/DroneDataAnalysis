/**
@module controllers/battery 
@description controller to interact with battery data
@requires models/battery
*/

var Battery = require('../models/battery');

/**
@function getAllBatterysForFlightId 
@description queries all batterys for a given flight id
@alias controllers/battery.getAllBatterysForFlightId
@param {string} _flightId - a mogoose object id
@param {function} _callback - returns status and batterys
*/
var getAllBatterysForFlightId = function(_flightId, _callback){
	Battery.find({flight_id: _flightId}, function(err, batterys){
		if(err) _callback({success: false, data: 'error querying battery'});
		else _callback({success: true, data: batterys});
	});
}

/**
@function saveBattery 
@description saves a single battery data parameter
@alias controllers/battery.saveBattery
@param {Object} _data - the data to create an battery object
@param {function} _callback - returns status
*/
var saveBattery = function(_data, _callback){
	var bat = new Battery(_data);
	bat.save(function(err, data){
		if(err) console.log(err);
		else console.log('collected battery');
		_callback();
	});
}

// export functions
module.exports = {
	getAllBatterysForFlightId: getAllBatterysForFlightId,
	saveBattery: saveBattery
};