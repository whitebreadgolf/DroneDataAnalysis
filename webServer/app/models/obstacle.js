/**
@module models/obstical
@requires mongoose
*/

var mongoose = require('mongoose');

// initalize scheme object
var Schema = mongoose.Schema;

// describe user in schema
var obstacleSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'User'},
	lat: Number,
	lon: Number,
	width: Number,
	created_at: Date
});

// declare exported module
var Obstacle = mongoose.model('Obstacle', obstacleSchema);

// export module 
module.exports = Obstacle;