/**
@module preflight - a module to interact with the preflight data and procedure
*/

/**
@requires process
@requires regulationConfig
@requires preflight
*/

var sp_process = require('./../interProcessCommunication/process');
var regulationConfig = require('../config/regulationConfig');
var Preflight = require('../models/preflight');

/**
@function startFlightSimulation - to configure and start a flight simulation
@alias controllers/preflight.startFlightSimulation
@param {function} _callback - a callback function
*/
var startFlightSimulation = function (_id, _readExt, _readType, _callback) {

	// start flight data and data flow process
	regulationConfig.startFlight(_id, _readExt);
	sp_process.initializeMock(_id, _readExt, _readType);
	_callback();
}

/**
@function endFlight - to end flow of flight data and reconfigure
@alias controllers/preflight.endFlight
@param {function} _callback - a callback function
*/
var endFlightWithPilotId = function (_id, _callback){

	// end the mock process and clear flight data
	sp_process.endMock(_id);
	regulationConfig.endFlight(_id);
	_callback();
};

var addPreflightInspection = function(_id, _flight_name, _remote_controller_charge,_intelligent_flight_battery, _propeller_0, _propeller_1, _propeller_2, _propeller_3, _micro_sd, _gimbal, _callback){

	var preflightData = {
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
		pilot: _id
	};

	var preflight = new Preflight(preflightData);

	preflight.save(function (err, data){
		if(err) _callback({message:'could not create pre-flight data', success: false});
		else _callback({message:'created pre-flight data', success: true});
	});
}

var getAllFlightsWithoutCollectedData = function (_callback){


};

// export all modules
module.exports = {
	addPreflightInspection: addPreflightInspection,
	getAllFlightsWithoutCollectedData: getAllFlightsWithoutCollectedData,
	startFlightSimulation: startFlightSimulation,
	endFlightWithPilotId: endFlightWithPilotId
};