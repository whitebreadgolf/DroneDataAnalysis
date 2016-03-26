/**
@module account - controller to interact with user accounts directly
*/

/**
@requires buildingProximity
@requires user
*/

var buildingProximity = require('../analytics/buildingProximity');
var User = require('../models/user');
var BinaryMap = require('../models/binaryMap');

/**
@function configureUserMap - function to generate a bitmap of the given range of longitudes and latitudes
@alias controllers/account.configureUserMap
@param {object} _latLngNW - longitude latitude object for the Northwest border
@param {object} _latLngWE - longitude latitude object for the Southest border
@param {String} _username - a username
@param {function} _callback - a callback function for the result of the operation
*/
var configureUserMap = function (_latLngNW, _latLngSE, _id, _callback){
	
	// set new map set
	buildingProximity.generateMapWithRange(_latLngNW, _latLngSE, _id, _callback);
}

/**
@function isUserMapConfigured - function to check if a given user already generated a map
@alias controllers/account.isUserMapConfigured
@param {String} _username - a username
@param {function} _callback - a callback function for the result of the operation
*/
var isUserMapConfigured = function (_id, _callback){

	// check current map configuration
	BinaryMap.findOne({ 'user': _id }, function (err, map) {
		if (err || map === null){ _callback('error'); }
		else{

			// return success if map is set
			_callback('success'); 
		}
	});
}


/**
@function loginUser - a function to login a user
@alias controllers/account.loginUser
@param {String} _username - username
@param {String} _pass - password
@param {Function} _callback - a callback function
*/
var loginUser = function (_username, _pass, _callback){

	User.findOne({ 'username': _username, 'password': _pass }, function (err, user) {
		if (err || user === null){ _callback('error'); }
		else{ _callback('sucessful', _username); }
	});
}

/**
@function createNewUser - a function to create a new user
@alias controllers/account.createNewUser
@param {String} _username - username
@param {String} _pass - password
@param {String} _name - the users full name
@param {Function} _callback - a callback function
*/
var createNewUser = function (_username, _pass, _name, _callback){

	// look for user with same username
	User.findOne({ 'username': _username }, function (err, user) {

		// found a duplicate
		if (!(err || user === null)){ _callback('user with same username exists'); }
		
		// no matches
		else{

			// set up data
			var data = {
				name: _name,
				username: _username,
				password: _pass,
				admin: false,
				map: null
			}

			// create new model and save
			var u = new User(data);
			u.save(function (error, data){
                if(error){ console.log(error); }
                else{ console.log(data); }
            });

			// callback to client
			_callback('new user created', _username);
		}
	});
}

// export all modules
module.exports = {
	loginUser: loginUser,
	createNewUser: createNewUser,
	configureUserMap: configureUserMap,
	isUserMapConfigured: isUserMapConfigured
};