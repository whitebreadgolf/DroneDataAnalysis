/**
@module speed
*/

/**
@requires mongoose
*/

var mongoose = require('mongoose');

// initalize scheme object
var Schema = mongoose.Schema;

// describe user in schema
var velocitySchema = new Schema({
	flight_id: { type: Schema.Types.ObjectId, ref: 'Flight' },
	val: { type: Number, required: true},
	time: Date
});

// declare exported module
var Velocity = mongoose.model('Velocity', velocitySchema);

// export module 
module.exports = Velocity;