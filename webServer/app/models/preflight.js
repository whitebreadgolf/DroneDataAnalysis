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
var preflightSchema = new Schema({
	pilot: { type: Schema.Types.ObjectId, ref: 'User' },
	flight_id: Number,
	remote_controller_charge: Number, 
	intelligent_flight_battery: Number, 
	propeller_0: Boolean, 
	propeller_1: Boolean, 
	propeller_2: Boolean, 
	propeller_3: Boolean, 
	micro_sd: Boolean, 
	gimbal: Boolean,
	created_at: Date,
	updated_at: Date
});

// declare exported module
var Preflight = mongoose.model('Preflight', preflightSchema);

// export module 
module.exports = Preflight;