/**
@module preflight
*/

/**
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
	propeller_0: Boolean, 
	propeller_1: Boolean, 
	propeller_2: Boolean, 
	propeller_3: Boolean, 
	micro_sd: Boolean, 
	gimbal: Boolean,
	created_at: Date,
	flight_started: Date,
	flight_ended: Date
});

// declare exported module
var Flight = mongoose.model('Flight', flightSchema);

// export module 
module.exports = Flight;