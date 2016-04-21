/**
@module models/flight
@requires mongoose
*/

var mongoose = require('mongoose');

// initalize scheme object
var Schema = mongoose.Schema;

// describe user in schema
var flightSchema = new Schema({
	collected_data: Boolean,
	pilot: { type: Schema.Types.ObjectId, ref: 'User' },
	flight_name: String,
	remote_controller_charge: Number, 
	intelligent_flight_battery: Number, 
	propeller_0: Number, 
	propeller_1: Number, 
	propeller_2: Number, 
	propeller_3: Number, 
	micro_sd: Number, 
	gimbal: Number,
	flight_started: Date,
	flight_ended: Date,
	created_at: Date
});

// declare exported module
var Flight = mongoose.model('Flight', flightSchema);

// export module 
module.exports = Flight;