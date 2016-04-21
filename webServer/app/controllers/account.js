/**
@module controllers/account
@description A controller to interact with user accounts
@requires analytics/buildingProximity
@requires models/user
@requires models/airport
*/

var buildingProximity = require('../analytics/buildingProximity');
var User = require('../models/user');
var BinaryMap = require('../models/binaryMap');
var Airport = require('../models/airport');
var Obstacle = require('../models/obstacle');

/**
@function configureUserMap
@description Generates a bitmap of the given range of longitudes and latitudes
@alias controllers/account.configureUserMap
@param {Object} _latLngNW - longitude latitude object for the Northwest border
@param {Object} _latLngWE - longitude latitude object for the Southest border
@param {string} _id - a mongo user id
@param {function} _callback - a callback function for the result of the operation
*/
var configureUserMap = function (_latLngNW, _latLngSE, _id, _callback){
	
	// set new map set
	BinaryMap.find({ 'user': _id }, function (err, maps) {
		if (err || maps === null) _callback('error'); 
		else{
			var numMaps = maps.length;
			var mapCount = 0;

			// delete all maps
			if(numMaps > 0){
				for(var i=0;i<numMaps;i++){
					maps[i].remove(function(err, data){
						if (err) console.log(err);
						else {
							mapCount++;

							// generate range once we delete all maps
							if(mapCount === numMaps){
								deleteAllObstaclesForUser(_id, function(){
									deleteAllAirportsForUser(_id, function(){
										console.log('done deleting airports');
										buildingProximity.generateMapWithRange(_latLngNW, _latLngSE, _id, _callback);
									});
								});	
							}
						}
					});
				} 
			}
			else{ 
				deleteAllAirportsForUser(_id, function(){
					console.log('done deleting airports');
					buildingProximity.generateMapWithRange(_latLngNW, _latLngSE, _id, _callback);
				});
			}
		}
	});
}

/**
@function deleteAllAirportsForUser 
@description deletes all airports in database for a user
@param {string} _id - a mongo user id
@param {function} _callback - a generic callback
*/
var deleteAllAirportsForUser = function(_id, _callback){
	Airport.find({ 'user': _id }, function (err, airports) {
		if (err || airports === null) _callback('error'); 
		else{
			var numAirports = airports.length;
			var airportCount = 0;

			// delete all maps
			if(numAirports > 0){
				for(var i=0;i<numAirports;i++){
					airports[i].remove(function(err, data){
						if (err) console.log(err);
						else {
							airportCount++;

							// generate range once we delete all maps
							if(airportCount === numAirports) _callback();
						}
					});
				} 
			}
			else _callback();
		}
	});
};

var deleteAllObstaclesForUser = function(_id, _callback){
	Obstacle.find({ 'user': _id }, function (err, obstacles) {
		if (err || obstacles === null) _callback('error'); 
		else{
			var numObstacles = obstacles.length;
			var obstacleCount = 0;

			// delete all maps
			if(numObstacles > 0){
				for(var i=0;i<numObstacles;i++){
					obstacles[i].remove(function(err, data){
						if (err) console.log(err);
						else {
							obstacleCount++;

							// generate range once we delete all maps
							if(obstacleCount === numObstacles){
								_callback()
							}
						}
					});
				} 
			}
			else{ 
				_callback();
			}
		}
	});
}

/**
@function isUserMapConfigured 
@description function to check if a given user already generated a map
@alias controllers/account.isUserMapConfigured
@param {string} _id - a mongo user id
@param {function} _callback - a callback function for the result of the operation
*/
var getUserMapConfigured = function (_id, _callback){

	// check current map configuration
	BinaryMap.find({ 'user': _id }, function (err, maps) {
		if (err || maps === null){ _callback({success: false}); }
		else{

			// return success if map is set
			_callback({success: true, data: maps}); 
		}
	});
}



/**
@function loginUser 
@description used to login a user
@alias controllers/account.loginUser
@param {string} _username - a username
@param {string} _pass - a password
@param {function} _callback - a callback function to report the results of a login attempt
*/
var loginUser = function (_username, _pass, _callback){
	User.findOne({ 'username': _username, 'password': _pass }, function (err, user) {
		if (err || user === null){
			_callback('error'); 
		}
		else{ _callback('sucessful', _username); }
	});
}

/**
@function createNewUser 
@description to create a new user
@alias controllers/account.createNewUser
@param {string} _username - username
@param {string} _pass - password
@param {string} _name - the users full name
@param {function} _callback - a callback function to report the results of an account creation
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
	getUserMapConfigured: getUserMapConfigured
};