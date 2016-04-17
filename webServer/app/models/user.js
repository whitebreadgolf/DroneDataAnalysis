/**
@module models/user
@requires mongoose
@requires passport-local-mongoose
*/

var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

// initalize scheme object
var Schema = mongoose.Schema;

// describe user in schema
var userSchema = new Schema({
	name: String,
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	admin: Boolean,
	reg_id: String,
	created_at: Date
});

userSchema.plugin(passportLocalMongoose);

// declare exported module
var User = mongoose.model('User', userSchema);


// export module 
module.exports = User;