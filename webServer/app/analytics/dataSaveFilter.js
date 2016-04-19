/**
@module analytics/dataSaveFilter
@description used when data is not been saved continuously, this module will route data every 15 intervals
@requires controllers/altitude
@requires controllers/velocity
@requires controllers/location
@requires config/regulationConfig
@requires analytics/buildingProximity
@requires analytics/airportProximity
*/

var altitude = require('../controllers/altitude');
var velocity = require('../controllers/velocity');
var location = require('../controllers/location');
var battery = require('../controllers/battery');
var acceleration = require('../controllers/acceleration');
var regulationConfig = require('../config/regulationConfig');
var buildingProximity = require('../analytics/buildingProximity');
var airportProximity = require('../analytics/airportProximity');

/**
@function routeDataParameters 
@description routes data parameters to check and save if necessary
@param {string} _id - a mongo user id
@param {string} _flightId - a mongo flight id
@param {Object} _isLive - to determine if the data is live
@param {Object} _data_stream - the flight data
@param {function} _callback - a generic callback
*/
var routeDataParameters = function(_time, _id, _flightId, _isLive, _data_stream, _callback){

	// determing time and if we should collect
	var curTime = _time;		
	regulationConfig.cur_flight[_id].last_collect = curTime;
	saveAltitudeIfCollecting(_flightId, curTime, _data_stream.altitude, function(){
		saveVelocityIfCollecting(_flightId, curTime, _data_stream.velocity_x, _data_stream.velocity_y, _data_stream.velocity_z, function(){
			saveLocationIfCollecting(_flightId, curTime, _data_stream.latitude, _data_stream.longitude, function(){
				saveBatteryIfCollecting(_flightId, curTime, _data_stream.battery, function(){
					saveAccelerationIfCollecting(_flightId, curTime, _data_stream.acc_x, _data_stream.acc_y, _data_stream.acc_z, function(){
						_callback();
					});
				});
			});
		});
	});
};

/**
@function saveAltitudeIfCollecting
@description routes data parameters to check and save if necessary
@param {string} _flightId - a mongo flight id
@param {Object} _time - current recorded time
@param {Number} _altitude - an altitude data point
@param {function} _callback - a generic callback
*/
var saveAltitudeIfCollecting = function(_flightId, _time, _altitude, _callback){
	var data = {
		flight_id: _flightId,
		alt: _altitude,
		created_at: _time
	};
	altitude.saveAltitude(data, function(){
		_callback();
	});
};

/**
@function saveVelocityIfCollecting 
@description routes data parameters to check and save if necessary
@param {string} _flightId - a mongo flight id
@param {Object} _time - current recorded time
@param {Number} _vel_x - an x velocity data point
@param {Number} _vel_y - an y velocity data point
@param {Number} _vel_z - an z velocity data point
@param {function} _callback - a generic callback
*/
var saveVelocityIfCollecting = function(_flightId, _time, _vel_x, _vel_y, _vel_z, _callback){
	if(_vel_x !== null && _vel_y !== null && _vel_z !== null){
		var data = {
			flight_id: _flightId,
			vel_x: _vel_x,
			vel_y: _vel_y,
			vel_z: _vel_z,
			created_at: _time
		};
		velocity.saveVelocity(data, function(){
			_callback();
		});
	}
	else
		_callback();
};

/**
@function saveLocationIfCollecting 
@description routes data parameters to check and save if necessary
@param {string} _flightId - a mongo flight id
@param {Object} _time - current recorded time
@param {Number} _lat - an latitude data point
@param {Number} _lon - an longitude data point
@param {function} _callback - a generic callback
*/
var saveLocationIfCollecting = function(_flightId, _time, _lat, _lon, _callback){
	var data = {
		flight_id: _flightId,
		lat: _lat,
		lon: _lon,
		created_at: _time
	};
	location.saveLocation(data, function(){
		_callback();
	});
};

/**
@function saveBatteryIfCollecting 
@description 
@param {string} _flightId - a mongo flight id
@param {Object} _time - current recorded time
@param {Number} _battery - a battery charge value
@param {function} _callback - a generic callback
*/
var saveBatteryIfCollecting = function(_flightId, _time, _battery, _callback){
	if(_battery !== null){
		var data = {
			flight_id: _flightId,
			battery: _battery,
			created_at: _time
		};
		battery.saveBattery(data, function(){
			_callback();
		});
	}
	else
		_callback();
};

/**
@function saveAccelerationIfCollecting 
@description 
@param {string} _flightId - a mongo flight id
@param {Object} _time - current recorded time
@param {Number} _acc_x - an x acceleration data point
@param {Number} _acc_y - an y acceleration data point
@param {Number} _acc_z - an z acceleration data point
@param {function} _callback - a generic callback
*/
var saveAccelerationIfCollecting = function(_flightId, _time, _acc_x, _acc_y, _acc_z, _callback){
	var data = {
		flight_id: _flightId,
		acc_x: _acc_x,
		acc_y: _acc_y,
		acc_z: _acc_z,
		created_at: _time
	};
	acceleration.saveAcceleration(data, function(){
		_callback();
	});
};

// export public functions
module.exports = {
	routeDataParameters: routeDataParameters
};