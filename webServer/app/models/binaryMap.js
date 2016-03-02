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
	lat_start: Number,
	lon_start: Number,
	lat_end: Number,
	lon_end: Number,
	x_coord: Number,
	y_coord: Number,
	width: Number,
	height: Number,
	values: [Boolean],
	created_at: Date
});

// declare exported module
var BinaryMap = mongoose.model('BinaryMap', binaryMapSchema);

// export module 
module.exports = BinaryMap;