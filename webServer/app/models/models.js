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
var preflight = require('./preflight');
var safetyReport = require('./safetyReport');
var speed = require('./speed');
var user = require('./user');

//var session = require('express-session');
//var MongoStore = require('connect-mongo/es5')(session);

/**
@function connectDb - a function to connect to the mongodb and session db
@param {object} _app - the express app object
*/
var connectDb = function (_app){

	// connect db
	mongoose.connect('mongodb://localhost/uav_db');

	// _app.use(session({
	//     store: new MongoStore({ mongooseConnection: mongoose.connection }),
	//     secret: 'keyboard cat',
	//     resave: false,
	//     saveUninitialized: true,
	//     rolling: true
	// }));
};


// do anything else to init dbs
// end

// export empty module
module.exports = connectDb;

