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
var speedSchema = new Schema({
	pilot: { type: Schema.Types.ObjectId, ref: 'User' },
	flight_id: Number,
	val: { type: Number, required: true},
	created_at: Date
});

// declare exported module
var Speed = mongoose.model('Speed', speedSchema);

// export module 
module.exports = Speed;