/**
@module simulation - a module to start and end simulations
*/

/**
@requires process
@requires regulationConfig
*/

var sp_process = require('./../interProcessCommunication/process');
var regulationConfig = require('../config/regulationConfig');

/**
@function startFlightSim - to configure and start a flight simulation
@alias controllers/simulation.startFlightSim
@param {function} _callback - a callback function
*/
var startFlightSim = function (_id, _readExt, _readType, _callback) {

	// start flight data and data flow process
	regulationConfig.startFlight(_id, {simulation: _readExt});
	sp_process.initializeMock(_id, _readExt, _readType);
	_callback();
}

/**
@function endSimFlightWithPilotId - to end flow of flight data and reconfigure
@alias controllers/simulation.endSimFlightWithPilotId
@param {function} _callback - a callback function
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