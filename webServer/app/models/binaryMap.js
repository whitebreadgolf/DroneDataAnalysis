/**
@module binaryMap
*/

/**
@requires mongoose
*/

var mongoose = require('mongoose');

// initalize scheme object
var Schema = mongoose.Schema;

// describe user in schema
var binaryMapSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'user'},
	lat: Number,
	lon: Number,
	x_coord: Number,
	y_coord: Number,
	width: Number,
	heigth: Number,
	values: [Boolean],
	created_at: Date
});

// declare exported module
var BinaryMap = mongoose.model('BinaryMap', binaryMapSchema);

// export module 
module.exports = BinaryMap;