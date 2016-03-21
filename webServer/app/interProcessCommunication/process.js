/**
@module process - a module to spawn a program for signal processing capabilities
*/

/**
@requires child_process
@requires decodeDotDAT
@requires regulationConfig
@requires dataFilter
*/

// import packages
var spawn = require('child_process').spawn;
var decode = require('./decodeDotDAT');
var regulationConfig = require('../config/regulationConfig');
var dataFilter = require('../analytics/dataFilter');

// constants
var MOCK_SP_FP = __dirname + "/../../../signalProcessor/mock/a.out";
var MOCK_SP_DIR = __dirname + "/../../../signalProcessor/mock/data/";
var SP_FP = __dirname + "/../../../signalProcessor/";

// our signal processing spawned process
var sp;

/**
@function initialize - to initialize the real cpp program and stdout callbacks on the spawed process
@alias interProcessCommunication/process.initialize
*/
var initialize = function(){

	// empty for now

};

/**
@function initializeMock - to initialize the mock cpp program and stdout callbacks on the spawed process
@alias interProcessCommunication/process.initializeMock
*/
var initializeMock = function(_readExt, _readType){

	var map = {};
	if (_readExt == 'CSV'){
		map['dummy'] = "flight_data.csv";
		map['normal'] = "flight_data.csv";
		map['high'] = "flight_data_height_error.csv";
		map['mag'] = "flight_data_mag_error.csv";
	}
	else if (_readExt == 'DAT'){
		map['dummy'] = "FLY000.DAT";
		map["normal"] = "FLY000.DAT";
		map["high"] = "FLY000.DAT";
	}

	// any initalizations pre-function call
	sp = spawn(MOCK_SP_FP, [MOCK_SP_DIR+map[_readType.toLowerCase()], _readExt.toLowerCase(),'real_time']);
	console.log(map[_readType.toLowerCase()]);

	// set stdout callback, just print for now
	sp.stdout.on('data', function(data){

		if(regulationConfig.cur_flight[0].simulation.file_read === 'DAT'){

			// convert to uint8 array
			var ab = new ArrayBuffer(data.length);
	    	var view = new Uint8Array(ab);
	    	for (var i = 0; i < data.length; ++i) {
	        	view[i] = data[i];
	    	}

			// decode sequence
			decode.importDataBlob(view);
		}
		else if(regulationConfig.cur_flight[0].simulation.file_read === 'CSV'){

			// feed in csv data			
			dataFilter.filterCsvString(data.toString());
		}
		else{
			console.log('unknown data output');
		}
	});

	// when sp exits
	sp.on('close', function(code){
		console.log("sp exited with code: " + code);
	});
};

/**
@function endMock - ends the mock flight data stream
@alias interProcessCommunication/process.endMock
*/
var endMock = function (){
	sp.kill('SIGHUP');
}


/**
all exports
*/
module.exports = {
	initialize: initialize,
	initializeMock: initializeMock,
	endMock: endMock
};