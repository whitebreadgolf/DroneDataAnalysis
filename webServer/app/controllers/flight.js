/**
@module flight - a module to interact with the preflight data and existing flight data
*/

/**
@requires process
@requires regulationConfig
@requires preflight
*/

var regulationConfig = require('../config/regulationConfig');
var Flight = require('../models/flight');

/**
@function addPreflightInspection - to add a preflight inspection
@alias controllers/preflight.addPreflightInspection
@param {String} _id - a mongoose id
@param {String} _flight_name - the name of a flight
@param {Number} _remote_controller_charge - the charge of the remote controller from 0-4
@param {Number} _intelligent_flight_battery - the charge of the drone from 0-4
@param {boolean} _propeller_0 - the condition of the 0th propeller
@param {boolean} _propeller_1 - the condition of the 1st propeller
@param {boolean} _propeller_2 - the condition of the 2nd propeller
@param {boolean} _propeller_3 - the condition of the 3rd propeller
@param {boolean} _micro_sd - the condition of the micro sd card
@param {boolean} _gimbal - the condition of the gimbal
@param {function} _callback - the functions callback
*/
var addPreflightInspection = function(_id, _flight_name, _remote_controller_charge,_intelligent_flight_battery, _propeller_0, _propeller_1, _propeller_2, _propeller_3, _micro_sd, _gimbal, _callback){

	var flightData = {
		flight_name: _flight_name,
		remote_controller_charge: _remote_controller_charge,
		intelligent_flight_battery: _intelligent_flight_battery,
		propeller_0: _propeller_0,
		propeller_1: _propeller_1,
		propeller_2: _propeller_2,
		propeller_3: _propeller_3,
		micro_sd: _micro_sd,
		gimbal: _gimbal,
		collected_data: false,
		pilot: _id,
		created_at: new Date(),
		flight_started: null,
		flight_ended: null
	};

	var flight = new Flight(flightData);

	flight.save(function (err, data){
		if(err) _callback({message:'could not create pre-flight data', success: false});
		else _callback({message:'created pre-flight data', success: true});
	});
}

/**
@function removePreflightInspection - to remove a preflight checklist
@alias controllers/flight.removePreflightInspection
@param {String} _id - mongoose object id
@param {function} _callback - a function callback
*/
var removePreflightInspection = function(_id, _callback){
	Flight.findOne({_id: _id}, function(err, flight){
		if(err || !flight) _callback({message:'could not delete pre-flight data', success: false});
		else{ 
			flight.remove().then(function(){
				_callback({message:'deleted pre-flight data', success: true})
			});
		}
	});
};

/**
@function getAllFlightsWithoutCollectedData - gets all flights that have not been started
@alias controllers/flight.getAllFlightsWithoutCollectedData
@param {String} _id - mongoose object id
@param {function} _callback - a function callback
*/
var getAllFlightsWithoutCollectedData = function (_id, _callback){
	Flight.find({collected_data: false, pilot: _id}, function(err, flights){
		_callback(err, flights);
	});
};

/**
@function getAllFlightsWithCollectedData - gets all flights that have been started and finished
@alias controllers/flight.getAllFlightsWithCollectedData
@param {String} _id - mongoose object id
@param {function} _callback - a function callback
*/
var getAllFlightsWithCollectedData = function (_id, _callback){
	Flight.find({collected_data: true, pilot: _id}, function(err, flights){
		_callback(err, flights);
	});
};

/**
@function startRTFlight - to start a flight for realtime analysis
@alias controllers/flight.startRTFlight
@param {String} _id - mongoose user id
@param {String} _flightId - mongoose flight id
@param {function} _callback - the functions callback
*/
var startRTFlight = function(_id, _flightId, _callback){
	Flight.findOne({_id: _flightId}, function(err, flight){
		if(err || !flight) _callback({message:'could not start realtime flight', success: false});
		else{ 
			// set data collected and end time
			flight.flight_started = new Date();
			flight.save().then(function (err, data){
				regulationConfig.startFlight(_id, {real_time: _flightId});
				_callback({success: true, message: 'flight started for realtime data'});
			});
		}
	});
}

/**
@function startDFlight - to start a flight for decoded data 
@alias controllers/flight.startDFlight
@param {String} _id - mongoose user id
@param {String} _flightId - mongoose flight id
@param {function} _callback - the functions callback
*/
var startDFlight = function(_id, _flightId, _callback){
	Flight.findOne({_id: _flightId}, function(err, flight){
		if(err || !flight) _callback({message:'could not start decoding flight', success: false});
		else{ 
			
			// set data collected and end time
			flight.flight_started = new Date();
			flight.save().then(function (err, data){
				regulationConfig.startFlight(_id, {decoding: _flightId});
				_callback({success: true, message: 'flight started for decoding data'});
			});
		}
	});
}

/**
@function endRTFlight - to end a flight for realtime analysis
@alias controllers/flight.endRTFlight
@param {String} _id - mongoose user id
@param {String} _flightId - mongoose flight id
@param {function} _callback - the functions callback
*/
var endRTFlight = function(_id, _flightId, _callback){

	Flight.findOne({_id: _flightId}, function(err, flight){
		if(err || !flight) _callback({message:'could not end realtime flight', success: false});
		else{ 
			
			// set data collected and end time
			flight.collected_data = true;
			flight.flight_ended = new Date();
			flight.save().then(function (err, data){
				regulationConfig.endFlight(_id);
				_callback({message:'ended realtime flight', success: true});
			});
		}
	});
}

/**
@function startDFlight - to end a flight for decoded data 
@alias controllers/flight.endDFlight
@param {String} _id - mongoose user id
@param {String} _flightId - mongoose flight id
@param {function} _callback - the functions callback
*/
var endDFlight = function(_id, _flightId, _callback){
	Flight.findOne({_id: _flightId}, function(err, flight){
		if(err || !flight) _callback({message:'could not end decoding flight', success: false});
		else{ 
			
			// set data collected and end time
			flight.collected_data = true;
			flight.flight_ended = new Date();
			flight.save().then(function (err, data){
				regulationConfig.endFlight(_id);
				_callback({message:'ended decoding flight', success: true});
			});
		}
	});
}

// export all modules
module.exports = {
	addPreflightInspection: addPreflightInspection,
	removePreflightInspection: removePreflightInspection,
	getAllFlightsWithoutCollectedData: getAllFlightsWithoutCollectedData,
	getAllFlightsWithCollectedData: getAllFlightsWithCollectedData,
	startRTFlight: startRTFlight,
	startDFlight: startDFlight,
	endDFlight: endDFlight,
	endRTFlight: endRTFlight
};