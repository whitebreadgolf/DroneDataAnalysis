/**
@module analytics/velocityAltitudeFilter
@description performs analysis on velocity and altitude parameters
@requires config/regulationConfig
@requires interProcessCommunication/websocket
@requires controllers/safetyStatus
*/

var regulationConfig = require('../config/regulationConfig');
var wss = require('../interProcessCommunication/websocket');
var safetyStatus = require('../controllers/safetyStatus');

/**
@function velAltFilter 
@description splits data into velocities and altitude
@alias analytics/velocityAltiudeFilter.velAltFilter
@param {Object} _collect - to determine whether we are collecting data
@param {Object} _isLive - to determine if the data is live
@param {string} _id - a mongo user id
@param {string} _flightId - a mongo flight id
@param {Object} _data_stream - the flight data
@param {function} _callback - a generic callback
*/
var velAltFilter = function (_time, _collect, _isLive, _id, _flightId, _data_stream, _callback){

	// apply both filters synchronously
	if(_data_stream.altitude !== null && _data_stream.velocity_x !== null && _data_stream.velocity_y !== null && _data_stream.velocity_z !== null){
		var altitude = parseFloat(_data_stream.altitude);
		var speed_x = parseFloat(_data_stream.velocity_x);
		var speed_y = parseFloat(_data_stream.velocity_y);
		var speed_z = parseFloat(_data_stream.velocity_z);
		altFilter(_time, _collect, _isLive, _id, _flightId, altitude, function(){
			velFilter(_time, _collect, _isLive, _id, _flightId, speed_x, speed_y, speed_z, function(){
				_callback();
			});
		});	
	}
	else if(_data_stream.velocity_x !== null && _data_stream.velocity_y !== null && _data_stream.velocity_z !== null){
		var speed_x = parseFloat(_data_stream.velocity_x);
		var speed_y = parseFloat(_data_stream.velocity_y);
		var speed_z = parseFloat(_data_stream.velocity_z);
		velFilter(_time, _collect, _isLive, _id, _flightId, speed_x, speed_y, speed_z, function(){
			_callback();
		});
	}
	else if(_data_stream.altitude !== null){
		var altitude = parseFloat(_data_stream.altitude);
		altFilter(_time, _collect, _isLive, _id, _flightId, altitude, function(){
			_callback();
		});	
	}
	else
		_callback();
};

/**
@function altFilter 
@description applies comparative analytics to altitude
@alias analytics/velocityAltiudeFilter.altFilter
@param {Object} _collect - to determine whether we are collecting data
@param {Object} _isLive - to determine if the data is live
@param {string} _id - a mongo user id
@param {string} _flightId - a mongo flight id
@param {Number} _altitude - an altitude
@param {function} _callback - a generic callback
*/
var altFilter = function(_time, _collect, _isLive, _id, _flightId, _altitude, _callback){

	var altitudeHazzard = regulationConfig.cur_flight[_id].warning.altitude.hazard;
	var altitudeWarning = regulationConfig.cur_flight[_id].warning.altitude.warning;
	
	// determine time
	var curTime = _time;

	if(_altitude > regulationConfig.faa_reg.max_altitude.hazard){
		if(altitudeHazzard === null || curTime - altitudeHazzard >= 10000){
			regulationConfig.cur_flight[_id].warning.altitude.hazard = curTime;
			var data = {
				type: 'notification',
				level: 'hazard',
				param: 'altitude',
				text: 'Your drone is operating above the legal altitude for FAA drone regulations',
				time: curTime - regulationConfig.cur_flight[_id].start_time
			};
			routeLiveAndSave(_time, _collect, _isLive, _id, _flightId, data, _callback);
		}
		else{
			_callback();
		}
	}
	else if(_altitude > regulationConfig.faa_reg.max_altitude.warning){
		if(altitudeWarning === null || curTime - altitudeWarning >= 10000){
			regulationConfig.cur_flight[_id].warning.altitude.warning = curTime;
			var data = {
				type: 'notification',
				level: 'warning',
				param: 'altitude',
				text: 'Your drone is operating 90% of the legal altitude for FAA drone regulations',
				time: curTime - regulationConfig.cur_flight[_id].start_time
			};
			routeLiveAndSave(_time, _collect, _isLive, _id, _flightId, data, _callback);
		}
		else{
			_callback();
		}
	}
	else _callback();
};

/**
@function velFilter 
@description applies comparative analytics to velocities
@alias analytics/velocityAltiudeFilter.velFilter
@param {Object} _collect - to determine whether we are collecting data
@param {Object} _isLive - to determine if the data is live
@param {string} _id - a mongo user id
@param {string} _flightId - a mongo flight id
@param {Number} _speed_x - an x velocity
@param {Number} _speed_y - an y velocity
@param {Number} _speed_z - an z velocity
@param {function} _callback - a generic callback
*/
var velFilter = function(_time, _collect, _isLive, _id, _flightId, _speed_x, _speed_y, _speed_z, _callback){

	// determine time
	var curTime = _time;
	velXFilter(_collect, _isLive, _id, _flightId, curTime, _speed_x, function(){
		velYFilter(_collect, _isLive, _id, _flightId, curTime, _speed_y, function(){
			velZFilter(_collect, _isLive, _id, _flightId, curTime, _speed_z, function(){
				_callback();
			});
		});
	});	
};

/**
@function velXFilter 
@description applies comparative analytics to x velocity
@alias analytics/velocityAltiudeFilter.velXFilter
@param {Object} _collect - to determine whether we are collecting data
@param {Object} _isLive - to determine if the data is live
@param {string} _id - a mongo user id
@param {string} _flightId - a mongo flight id
@param {Object} _time - current recorded time
@param {Number} _speed_x - an x velocity
@param {function} _callback - a generic callback
*/
var velXFilter = function(_collect, _isLive, _id, _flightId, _time, _speed_x, _callback){

	var velocityXHazzard = regulationConfig.cur_flight[_id].warning.max_velocity.x.hazard;
	var velocityXWarning = regulationConfig.cur_flight[_id].warning.max_velocity.x.warning;

	// determine time
	var curTime = _time;

	// velocity checks x
	if(_speed_x > regulationConfig.faa_reg.max_velocity.hazard){
		if(velocityXHazzard === null || curTime - velocityXHazzard >= 5000){
			
			regulationConfig.cur_flight[_id].warning.max_velocity.x.hazard = curTime;
			var data = {
				type: 'notification',
				level: 'warning',
				param: 'velocity',
				text: 'Your drone is operating above the legal x velocity for FAA drone regulations',
				time: curTime - regulationConfig.cur_flight[_id].start_time
			};
			routeLiveAndSave(curTime, _collect, _isLive, _id, _flightId, data, _callback);
		}
		else{
			_callback();
		}
	}
	else if(_speed_x > regulationConfig.faa_reg.max_velocity.warning){
		if(velocityXWarning === null || curTime - velocityXWarning >= 5000){
			
			regulationConfig.cur_flight[_id].warning.max_velocity.x.warning = curTime;
			var data = {
				type: 'notification',
				level: 'warning',
				param: 'velocity',
				text: 'Your drone is operating at 90% the legal x velocity for FAA drone regulations',
				time: curTime - regulationConfig.cur_flight[_id].start_time
			};
			routeLiveAndSave(curTime, _collect, _isLive, _id, _flightId, data, _callback);
		}
		else{
			_callback();
		}
	}
	else _callback();
};

/**
@function velYFilter 
@description applies comparative analytics to y velocity
@alias analytics/velocityAltiudeFilter.velFilter
@param {Object} _collect - to determine whether we are collecting data
@param {Object} _isLive - to determine if the data is live
@param {string} _id - a mongo user id
@param {string} _flightId - a mongo flight id
@param {Object} _time - current recorded time
@param {Number} _speed_y - an y velocity
@param {function} _callback - a generic callback
*/
var velYFilter = function(_collect, _isLive, _id, _flightId, _time, _speed_y, _callback){

	
	var velocityYHazzard = regulationConfig.cur_flight[_id].warning.max_velocity.y.hazard;
	var velocityYWarning = regulationConfig.cur_flight[_id].warning.max_velocity.y.warning
	
	// determine time
	var curTime = _time;

	// velocity checks y
	if(_speed_y > regulationConfig.faa_reg.max_velocity.hazard){
		if(velocityYHazzard === null || curTime - velocityYHazzard >= 5000){
						
			regulationConfig.cur_flight[_id].warning.max_velocity.y.hazard = curTime;
			var data = {
				type: 'notification',
				level: 'warning',
				param: 'velocity',
				text: 'Your drone is operating above the legal y velocity for FAA drone regulations',
				time: curTime - regulationConfig.cur_flight[_id].start_time
			};
			routeLiveAndSave(curTime, _collect, _isLive, _id, _flightId, data, _callback);
		}
		else{
			_callback();
		}
	}
	else if(_speed_y > regulationConfig.faa_reg.max_velocity.warning){
		if(velocityYWarning === null || curTime - velocityYWarning >= 5000){
			
			regulationConfig.cur_flight[_id].warning.max_velocity.y.warning = curTime;
			var data = {
				type: 'notification',
				level: 'warning',
				param: 'velocity',
				text: 'Your drone is operating at 90% the legal y velocity for FAA drone regulations',
				time: curTime - regulationConfig.cur_flight[_id].start_time
			};
			routeLiveAndSave(curTime, _collect, _isLive, _id, _flightId, data, _callback);
		}
		else{
			_callback();
		}
	}	
	else _callback();
};

/**
@function velZFilter 
@description applies comparative analytics to z velocity
@alias analytics/velocityAltiudeFilter.velFilter
@param {Object} _collect - to determine whether we are collecting data
@param {Object} _isLive - to determine if the data is live
@param {string} _id - a mongo user id
@param {string} _flightId - a mongo flight id
@param {Object} _time - current recorded time
@param {Number} _speed_z - an z velocity
@param {function} _callback - a generic callback
*/
var velZFilter = function(_collect, _isLive, _id, _flightId, _time, _speed_z, _callback){

	var velocityZHazzard = regulationConfig.cur_flight[_id].warning.max_velocity.z.hazard
	var velocityZWarning = regulationConfig.cur_flight[_id].warning.max_velocity.z.warning

	// determine time
	var curTime = _time;

	// velocity checks z
	if(_speed_z > regulationConfig.faa_reg.max_velocity.hazard){
		if(velocityZHazzard === null || curTime - velocityZHazzard >= 5000){
			
			regulationConfig.cur_flight[_id].warning.max_velocity.z.hazard = curTime;
			var data = {
				type: 'notification',
				level: 'warning',
				param: 'velocity',
				text: 'Your drone is operating above the legal z velocity for FAA drone regulations',
				time: curTime - regulationConfig.cur_flight[_id].start_time
			};
			routeLiveAndSave(curTime, _collect, _isLive, _id, _flightId, data, _callback);
		}
		else{
			_callback();
		}
	}
	else if(_speed_z > regulationConfig.faa_reg.max_velocity.warning){
		if(velocityZWarning === null || curTime - velocityZWarning >= 5000){
			
			regulationConfig.cur_flight[_id].warning.max_velocity.z.warning = curTime;
			var data = {
				type: 'notification',
				level: 'warning',
				param: 'velocity',
				text: 'Your drone is operating at 90% the legal z velocity for FAA drone regulations',
				time: curTime - regulationConfig.cur_flight[_id].start_time
			}
			routeLiveAndSave(curTime, _collect, _isLive, _id, _flightId, data, _callback);
		}
		else{
			_callback();
		}
	}
	else _callback();
};

/**
@function routeLiveAndSave 
@description routes data to client and save given data
@param {Object} _collect - to determine whether we are collecting data
@param {Object} _isLive - to determine if the data is live
@param {string} _id - a mongo user id
@param {string} _flightId - a mongo flight id
@param {Number} _data_stream - the flight data
@param {function} _callback - a generic callback
*/
var routeLiveAndSave = function(_time, _collect, _isLive, _id, _flightId, _data_stream, _callback){
	if(_isLive.status) wss.broadcast(JSON.stringify(_data_stream));
	if(_collect){

		// organize and save data
		var collectData = {
			pilot: _id, 
			flight_id: _flightId, 
			type: _data_stream.level,
			report: _data_stream.text, 
			value: 0,
			icon: null,
			created_at: _time
		};	

		safetyStatus.saveSafetyStatus(collectData, function(){
			_callback();
		});
	}
	else _callback();
};

// export all functions
module.exports = {
	velAltFilter: velAltFilter
};