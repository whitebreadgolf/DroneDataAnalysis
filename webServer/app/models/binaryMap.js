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
	lon_coord_start: Number,
	lat_coord_end: Number,
	lon_coord_end: Number,
	x_coord: Number,
	y_coord: Number,
	values: [Boolean],
	created_at: Date
});

// declare exported module
var BinaryMap = mongoose.model('BinaryMap', binaryMapSchema);

// export module 
module.exports = BinaryMap;