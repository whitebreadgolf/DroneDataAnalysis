/**
@module location
*/

/**
@requires mongoose
*/

var mongoose = require('mongoose');

// initalize scheme object
var Schema = mongoose.Schema;

// describe user in schema
var locationSchema = new Schema({
	pilot: { type: Schema.Types.ObjectId, ref: 'User' },
	flight_id: Number,
	latitude: { type: Number, required: true},
	longitude: { type: Number, required: true},
	created_at: Date
});

// declare exported module
var Loc = mongoose.model('Location', locationSchema);

// export module 
module.exports = Loc;