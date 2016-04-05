/**
@module velocityAltiudeFilter
*/

/**
@requires regulationConfig
@requires wss
@requires safetyReport
*/

var regulationConfig = require('../config/regulationConfig');
var wss = require('../interProcessCommunication/websocket');
var SafetyReport = require('../models/safetyReport');

/**
@function velAltFilter - splits data into velocities and altitude
@alias analytics/velocityAltiudeFilter.velAltFilter
@param {String} _id - mongodb id for user
@param {Object} _data_stream
*/
var velAltFilter = function (_collect, _isLive, _id, _flightId, _data_stream, _callback){

	// split data 
	var altitude = Number.parseFloat(_data_stream.altitude);
	var speed_x = Number.parseFloat(_data_stream.speed_x);
	var speed_y = Number.parseFloat(_data_stream.speed_y);
	var speed_z = Number.parseFloat(_data_stream.speed_z);

	// apply both filters synchronously
	altFilter(_collect, _isLive, _id, _flightId, altitude, function(){
		velFilter(_collect, _isLive, _id, _flightId, speed_x, speed_y, speed_z, function(){
			_callback();
		});
	});	
};

/**
@function altFilter - applies comparative analytics to altitude
@alias analytics/velocityAltiudeFilter.altFilter
@param {String} _id - mongodb id for user
@param {Number} _altitude - an altitude
*/
var altFilter = function(_collect, _isLive, _id, _flightId, _altitude, _callback){

	var altitudeHazzard = regulationConfig.cur_flight[_id].warning.altitude.hazard;
	var altitudeWarning = regulationConfig.cur_flight[_id].warning.altitude.warning;
	
	// determine time
	var curTime;
	if(_isLive.status) curTime = (new Date());
	else curTime = _isLive.value * regulationConfig.app_constants.dji_dat_collect_rate + regulationConfig.cur_flight[_id].start_time;

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
			routeLiveAndSave(_collect, _isLive, _id, _flightId, data, _callback);
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
			routeLiveAndSave(_collect, _isLive, _id, _flightId, data, _callback);
		}
	}
	else _callback();
};

/**
@function velFilter - applies comparative analytics to velocities
@alias analytics/velocityAltiudeFilter.velFilter
@param {String} _id - mongodb id for user
@param {Number} _speed_x - an x velocity
@param {Number} _speed_y - an y velocity
@param {Number} _speed_z - an z velocity
*/
var velFilter = function(_collect, _isLive, _id, _flightId, _speed_x, _speed_y, _speed_z, _callback){

	// determine time
	var curTime;
	if(_isLive.status) curTime = (new Date());
	else curTime = _isLive.value * regulationConfig.app_constants.dji_dat_collect_rate + (new Date(regulationConfig.cur_flight[_id].start_time)).getTime();
	velXFilter(_collect, _isLive, _id, _flightId, curTime, _speed_x, function(){
		velYFilter(_collect, _isLive, _id, _flightId, curTime, _speed_y, function(){
			velZFilter(_collect, _isLive, _id, _flightId, curTime, _speed_z, function(){
				_callback();
			});
		});
	});	
};

/**
@function velXFilter - applies comparative analytics to x velocity
@alias analytics/velocityAltiudeFilter.velXFilter
@param {String} _id - mongodb id for user
@param {Number} _speed_x - an x velocity
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
			routeLiveAndSave(_collect, _isLive, _id, _flightId, data, _callback);
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
			routeLiveAndSave(_collect, _isLive, _id, _flightId, data, _callback);
		}
	}
	else _callback();
};

/**
@function velYFilter - applies comparative analytics to y velocity
@alias analytics/velocityAltiudeFilter.velFilter
@param {String} _id - mongodb id for user
@param {Number} _speed_y - an y velocity
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
			routeLiveAndSave(_collect, _isLive, _id, _flightId, data, _callback);
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
			routeLiveAndSave(_collect, _isLive, _id, _flightId, data, _callback);
		}
	}	
	else _callback();
};

/**
@function velZFilter - applies comparative analytics to z velocity
@alias analytics/velocityAltiudeFilter.velFilter
@param {String} _id - mongodb id for user
@param {Number} _speed_z - an z velocity
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
			routeLiveAndSave(_collect, _isLive, _id, _flightId, data, _callback);
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
			routeLiveAndSave(_collect, _isLive, _id, _flightId, data, _callback);
		}
	}
	else _callback();
};

var routeLiveAndSave = function(_collect, _isLive, _id, _flightId, _data_stream, _callback){
	if(_isLive) wss.broadcast(JSON.stringify(_data_stream));
	if(_collect){

		// organize and save data
		var collectData = {
			pilot: _id, flight_id: _flightId, type: _data_stream.level,
			value: _data_stream.text, created_at: new Date()
		};	
		var safetyReport = new SafetyReport(collectData);
		safetyReport.save(function(error, data){
            if(error) console.log('error saving safety report'); 
            else console.log('added safety report'); 

            _callback();
        });
	}
	else _callback();
};

// export all functions
module.exports = {
	velAltFilter: velAltFilter
};