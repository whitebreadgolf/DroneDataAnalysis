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
	vel_x: { type: Number, required: true},
	vel_y: { type: Number, required: true},
	vel_z: { type: Number, required: true},
	created_at: Date
});

// declare exported module
var Velocity = mongoose.model('Velocity', velocitySchema);

// export module 
module.exports = Velocity;