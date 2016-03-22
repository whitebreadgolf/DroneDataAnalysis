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
var sp = {};

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
var initializeMock = function(_id, _readExt, _readType){

	// get our filename
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
	sp[_id] = spawn(MOCK_SP_FP, [MOCK_SP_DIR + map[_readType.toLowerCase()], _readExt.toLowerCase(),'real_time', _id]);

	// set stdout callback, just print for now
	sp[_id].stdout.on('data', function(data){

		// advance index to index after the first space
		// accumulate the characters up till then and use it as id
		var id = "";
		var space_index = 0;
		var dataString = data.toString();
		while(dataString.charAt(space_index) !== " "){
	        id += dataString.charAt(space_index);
	        space_index++;
	    }
	    space_index++;

	    // check read type and filter accordingly
		if(regulationConfig.cur_flight[id].simulation.file_read === 'DAT'){

			// convert to uint8 array 
	    	var view = new Uint8Array(new ArrayBuffer(data.length));
	    	for (var i = space_index; i < data.length; ++i) {
	        	view[i] = data[i];
	    	}

			// decode sequence
			decode.importDataBlob(id, view);
		}
		else if(regulationConfig.cur_flight[id].simulation.file_read === 'CSV'){

			// feed in csv data			
			dataFilter.filterCsvString(id, dataString.substr(space_index, data.length));
		}
		else console.log('unknown data output');
	});

	// when sp exits
	sp[_id].on('close', function(code){
		console.log("sp exited with code: " + code);
	});
};

/**
@function endMock - ends the mock flight data stream
@alias interProcessCommunication/process.endMock
*/
var endMock = function (_id){
	sp[_id].kill('SIGHUP');
}


/**
all exports
*/
module.exports = {
	initialize: initialize,
	initializeMock: initializeMock,
	endMock: endMock
};