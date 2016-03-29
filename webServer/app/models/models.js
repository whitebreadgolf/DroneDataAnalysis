/**
@module models
*/

/**
@requires mongoose
@requires alititude
@requires binaryMap
@requires location
@requires preflight
@requires safetyReport
@requires speed
@requires user
*/

var mongoose = require('mongoose');
var altitude = require('./altitude');
var binaryMap = require('./binaryMap');
var location = require('./location');
var flight = require('./flight');
var safetyReport = require('./safetyReport');
var velocity = require('./velocity');
var user = require('./user');

/**
@function connectDb - a function to connect to the mongodb and session db
@param {object} _app - the express app object
*/
var connectDb = function (_app){

	// connect db
	mongoose.connect('mongodb://localhost/uav_db');
};

// export empty module
module.exports = connectDb;

