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
	flight_id: { type: Schema.Types.ObjectId, ref: 'Flight' },
	lat: { type: Number, required: true},
	lon: { type: Number, required: true},
	created_at: Date
});

// declare exported module
var Loc = mongoose.model('Location', locationSchema);

// export module 
module.exports = Loc;