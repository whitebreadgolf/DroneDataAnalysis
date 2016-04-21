/**
@module models/models
@description initializes all of the mongoose models and connects to the db
@requires models/mongoose
@requires models/airport
@requires models/altitude
@requires models/binaryMap
@requires models/location
@requires models/flight
@requires models/safetyReport
@requires models/velocity
@requires models/user
*/

var mongoose = require('mongoose');
var airport = require('./airport');
var altitude = require('./altitude');
var obstacle = require('./obstacle');
var binaryMap = require('./binaryMap');
var location = require('./location');
var flight = require('./flight');
var safetyReport = require('./safetyReport');
var velocity = require('./velocity');
var user = require('./user');

/**
@function connectDb 
@description connects to mongodb 
@param {object} _app - the express app object
*/
var connectDb = function (_app){

	// connect db
	mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGOHQ_URL ||'mongodb://localhost/uav_db');
};

// export empty module
module.exports = connectDb;

