/**
@module models/battery
@requires mongoose
*/

var mongoose = require('mongoose');

// initalize scheme object
var Schema = mongoose.Schema;

// describe user in schema
var batterySchema = new Schema({
	flight_id: { type: Schema.Types.ObjectId, ref: 'Flight' },
	battery: { type: Number, required: true},
	created_at: Date
});

// declare exported module
var Battery = mongoose.model('Battery', batterySchema);

// export module 
module.exports = Battery;