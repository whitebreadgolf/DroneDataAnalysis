/**
@module preflight - a module to interact with the preflight data and procedure
*/

/**
@requires process
@requires regulationConfig
*/

var sp_process = require('./../interProcessCommunication/process');
var regulationConfig = require('../config/regulationConfig');

/**
@function startFlight - to configure and start a flight
@alias controllers/preflight.startFlight
@param {function} _callback - a callback function
*/
var startFlight = function (_readExt, _readType, _callback) {
	regulationConfig.cur_flight[0].start_time = (new Date());
	regulationConfig.cur_flight[0].simulation.file_read = _readExt;
	sp_process.initializeMock(_readExt, _readType);

	_callback();
}

/**
@function endFlight - to end flow of flight data and reconfigure
@alias controllers/preflight.endFlight
@param {function} _callback - a callback function
*/
var endFlight = function (_callback){
	sp_process.endMock();
	regulationConfig.cur_flight[0].start_time = null;
	_callback();
};

// export all modules
module.exports = {
	startFlight: startFlight,
	endFlight: endFlight
};