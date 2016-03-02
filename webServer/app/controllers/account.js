/**
@module account - controller to interact with user accounts directly
*/

/**
@requires buildingProximity
*/

var buildingProximity = require('../analytics/buildingProximity');
var User = require('../models/user');

/**
@function configureUserMap - function to generate a bitmap of the given range of longitudes and latitudes
@param {object} _latLngNW - longitude latitude object for the Northwest border
@param {object} _latLngWE - longitude latitude object for the Southest border
@param {String} _username - a username
@param {function} _callback - a callback function for the result of the operation
*/
var configureUserMap = function (_latLngNW, _latLngSE, _username, _callback){

	// User.findOne({ 'username': _username }, function (err, user) {
	// 	if (err || user === null){ _callback('error'); }
	// 	else{

			// check current map configuration

			//console.log(user);

			//buildingProximity.generateMapWithRange(_latLngNW, _latLngSE, user, _callback);
			buildingProximity.generateMapWithRange(_latLngNW, _latLngSE, null, _callback);
	// 	}
	// });
	
}

/**
@function isUserMapConfigured - function to check if a given user already generated a map
@param {String} _username - a username
@param {function} _callback - a callback function for the result of the operation
*/
var isUserMapConfigured = function (_username, _callback){

	User.findOne({ 'username': _username }, function (err, user) {
		if (err || user === null){ _callback('error'); }
		else{

			// check current map configuration
			// return success if map is set
			if(user.map !== null){ _callback('success'); }
			else { _callback('error'); }
		}
	});
}


/**
@function loginUser - a function to login a user
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
			u.save(function(error, data){
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