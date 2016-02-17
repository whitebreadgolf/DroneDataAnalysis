/**
@module user
*/

/**
@requires mongoose
*/

var mongoose = require('mongoose');

// initalize scheme object
var Schema = mongoose.Schema;

// describe user in schema
var userSchema = new Schema({
	name: String,
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	admin: Boolean,
	map: [{ type: Schema.Types.ObjectId, ref: 'BinaryMap'}],
	created_at: Date
});

// declare exported module
var User = mongoose.model('User', userSchema);

// export module 
module.exports = User;