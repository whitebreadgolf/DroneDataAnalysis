/**
@module controllers/flight 
@description a module to interact with the preflight data and existing flight data
@requires config/regulationConfig
@requires models/flight
*/

var regulationConfig = require('../config/regulationConfig');
var Flight = require('../models/flight');

/**
@function addPreflightInspection 
@description adds a preflight inspection
@alias controllers/preflight.addPreflightInspection
@param {string} _id - a mongo id
@param {string} _flight_name - the name of a flight
@param {Number} _remote_controller_charge - the charge of the remote controller from 0-4
@param {Number} _intelligent_flight_battery - the charge of the drone from 0-4
@param {Number} _propeller_0 - the condition of the 0th propeller
@param {Number} _propeller_1 - the condition of the 1st propeller
@param {Number} _propeller_2 - the condition of the 2nd propeller
@param {Number} _propeller_3 - the condition of the 3rd propeller
@param {Number} _micro_sd - the condition of the micro sd card
@param {Number} _gimbal - the condition of the gimbal
@param {function} _callback - returns the status of adding a flight
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
@function removePreflightInspection 
@description to remove a preflight checklist
@alias controllers/flight.removePreflightInspection
@param {string} _id - mongo object id
@param {function} _callback - returns the status of a remove operation
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
@function getAllFlightsWithoutCollectedData 
@description gets all flights that have not been started
@alias controllers/flight.getAllFlightsWithoutCollectedData
@param {string} _id - mongo object id
@param {function} _callback - reports the error and flights found
*/
var getAllFlightsWithoutCollectedData = function (_id, _callback){
	Flight.find({collected_data: false, pilot: _id}, function(err, flights){
		_callback(err, flights);
	});
};

/**
@function getAllFlightsWithCollectedData 
@description gets all flights that have been started and finished
@alias controllers/flight.getAllFlightsWithCollectedData
@param {string} _id - mongo object id
@param {function} _callback - reports the error and flights found
*/
var getAllFlightsWithCollectedData = function (_id, _callback){
	Flight.find({collected_data: true, pilot: _id}, function(err, flights){
		_callback(err, flights);
	});
};

var getFlightsForId = function(_flightId, _callback){
	Flight.findOne({_id: _flightId}, function(err, flight){
		_callback(err, flight);
	});
};

/**
@function startRTFlight 
@description starts a flight for realtime analysis
@alias controllers/flight.startRTFlight
@param {string} _id - mongo user id
@param {string} _flightId - mongo flight id
@param {function} _callback - reports the status of a started flight
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
@function startDFlight 
@description starts a flight for decoded data 
@alias controllers/flight.startDFlight
@param {string} _id - mongo user id
@param {string} _flightId - mongo flight id
@param {function} _callback - reports the status of a started flight
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
@function endRTFlight 
@description ends a flight for realtime analysis
@alias controllers/flight.endRTFlight
@param {string} _id - mongo user id
@param {string} _flightId - mongo flight id
@param {function} _callback - reports the status of a ended flight
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
@function endDFlight 
@description ends a flight for decoded data 
@alias controllers/flight.endDFlight
@param {string} _id - mongo user id
@param {string} _flightId - mongo flight id
@param {function} _callback - reports the status of a ended flight
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
	getFlightsForId: getFlightsForId,
	startRTFlight: startRTFlight,
	startDFlight: startDFlight,
	endDFlight: endDFlight,
	endRTFlight: endRTFlight
};