/**
@module process - a module to spawn a program for signal processing capabilities
*/

/**
@requires child_process
@requires decodeDotDAT
*/

// import packages
var spawn = require('child_process').spawn;
var decode = require('./decodeDotDAT');

// constants
var MOCK_SP_FP = __dirname + "/../../../signalProcessor/mock/a.out";
var SP_FP = __dirname + "/../../../signalProcessor/";

// our signal processing spawned process
var sp;

/**
@function initialize - to initialize the real cpp program and stdout callbacks on the spawed process
@alias controllers/process/initialize
*/
var initialize = function(){

	// empty for now

};

/**
@function initializeMock - to initialize the mock cpp program and stdout callbacks on the spawed process
@alias controllers/process/initializeMock
*/
var initializeMock = function(){

	// any initalizations pre-function call
	sp = spawn("" + MOCK_SP_FP);

	// set stdout callback, just print for now
	sp.stdout.on('data', function(data){

		// convert to uint8 array
		var ab = new ArrayBuffer(data.length);
    	var view = new Uint8Array(ab);
    	for (var i = 0; i < data.length; ++i) {
        	view[i] = data[i];
    	}

		// decode sequence
		decode.importDataBlob(view);
	});

	// when sp exits
	sp.on('close', function(code){
		console.log("sp exited with code: " + code);
	});
};

/**
@function endMock - ends the mock flight data stream
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