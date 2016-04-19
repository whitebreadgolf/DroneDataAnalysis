/**
@module models/obstical
@requires mongoose
*/

var mongoose = require('mongoose');

// initalize scheme object
var Schema = mongoose.Schema;

// describe user in schema
var obsticalSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'User'},
	lat: Number,
	lon: Number,
	width: Number,
	created_at: Date
});

// declare exported module
var Obstical = mongoose.model('Obstical', obsticalSchema);

// export module 
module.exports = Obstical;