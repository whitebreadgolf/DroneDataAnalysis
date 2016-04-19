/**
@module models/acceleration
@requires mongoose
*/

var mongoose = require('mongoose');

// initalize scheme object
var Schema = mongoose.Schema;

// describe user in schema
var accelerationSchema = new Schema({
	flight_id: { type: Schema.Types.ObjectId, ref: 'Flight' },
	acc_x: { type: Number, required: true},
	acc_y: { type: Number, required: true},
	acc_z: { type: Number, required: true},
	created_at: Date
});

// declare exported module
var Acceleration = mongoose.model('Acceleration', accelerationSchema);

// export module 
module.exports = Acceleration;