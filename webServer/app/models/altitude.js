/**
@module altitude
*/

/**
@requires mongoose
*/

var mongoose = require('mongoose');

// initalize scheme object
var Schema = mongoose.Schema;

// describe user in schema
var altitudeSchema = new Schema({
	pilot: { type: Schema.Types.ObjectId, ref: 'User' },
	flight_id: Number,
	val: { type: Number, required: true},
	created_at: Date
});

// declare exported module
var Altitude = mongoose.model('Altitude', altitudeSchema);

// export module 
module.exports = Altitude;