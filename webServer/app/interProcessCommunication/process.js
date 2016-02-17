/**
@module process - a module to spawn a program for signal processing capabilities
*/

// import packages
var spawn = require('child_process').spawn;

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

		// get decoded string
		var dec_str = data.toString("utf8");

		// replace ' with "
		dec_str = dec_str.replace(/'/g, function(){ return '"'; });

		// parse it
		var dec_json = JSON.parse(dec_str);

		// print it out
		console.log(dec_json);
	});

	// when sp exits
	sp.on('close', function(code){
		console.log("sp exited with code: " + code);
	});
};

/**
all exports
*/
module.exports = {
	initialize: initialize,
	initializeMock: initializeMock
};