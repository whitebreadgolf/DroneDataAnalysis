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

// connect db
mongoose.connect('mongodb://localhost/uav_db');

// do anything else to init dbs
// end

// export empty module
module.exports = {};
