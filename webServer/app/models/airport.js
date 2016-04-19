/**
@module models/airport
@requires mongoose
*/

var mongoose = require('mongoose');

// initalize scheme object
var Schema = mongoose.Schema;

var airportSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'User'},
	lat: Number,
	lon: Number,
	place_id: String,
	icon: String,
	name: String,
	map_link: String,
	created_at: Date
});

// declare exported module
var Airport = mongoose.model('Airport', airportSchema);

// export module 
module.exports = Airport;