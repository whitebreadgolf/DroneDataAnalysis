/**
@module controllers/simulation 
@description a module to start and end simulations
@deprecated since the version with internal flight simulations
@requires interProcessCommunication/process
@requires config/regulationConfig
*/

var sp_process = require('./../interProcessCommunication/process');
var regulationConfig = require('../config/regulationConfig');

/**
@function startFlightSim 
@description to configure and start a flight simulation
@alias controllers/simulation.startFlightSim
@param {string} _id - a mongo user id
@param {string} _readExt - the reading file extention
@param {string} _readType - the type of file being read
@param {function} _callback - a generic callback 
*/
var startFlightSim = function (_id, _readExt, _readType, _callback) {

	// start flight data and data flow process
	regulationConfig.startFlight(_id, {simulation: _readExt});
	sp_process.initializeMock(_id, _readExt, _readType);
	_callback();
}

/**
@function endSimFlightWithPilotId 
@description to end flow of flight data and reconfigure
@alias controllers/simulation.endSimFlightWithPilotId
@param {string} _id - a mongo user id
@param {function} _callback - a generic callback
*/
var endSimFlightWithPilotId = function (_id, _callback){

	// end the mock process and clear flight data
	sp_process.endMock(_id);
	regulationConfig.endFlight(_id);
	_callback();
};

// export all functions
module.exports = {
	startFlightSim: startFlightSim,
	endSimFlightWithPilotId: endSimFlightWithPilotId
};