/**
@module velocityAltiudeFilter
*/

/**
@requires regulationConfig
@requires wss
*/

var regulationConfig = require('../config/regulationConfig');
var wss = require('../interProcessCommunication/websocket');

/**
@function velAltFilter - splits data into velocities and altitude
@alias analytics/velocityAltiudeFilter.velAltFilter
@param {String} _id - mongodb id for user
@param {Object} _data_stream
*/
var velAltFilter = function (_id, _data_stream){

	// split data 
	var altitude = Number.parseFloat(_data_stream.altitude);
	var speed_x = Number.parseFloat(_data_stream.speed_x);
	var speed_y = Number.parseFloat(_data_stream.speed_y);
	var speed_z = Number.parseFloat(_data_stream.speed_z);

	// apply both filters
	altFilter(_id, altitude);
	velFilter(_id, speed_x, speed_y, speed_z);	
};

/**
@function altFilter - applies comparative analytics to altitude
@alias analytics/velocityAltiudeFilter.altFilter
@param {String} _id - mongodb id for user
@param {Number} _altitude - an altitude
*/
var altFilter = function(_id, _altitude){
	if(_altitude > regulationConfig.faa_reg.max_altitude.hazard){
		if(regulationConfig.cur_flight[_id].warning.altitude.hazard === null || (new Date()) - regulationConfig.cur_flight[_id].warning.altitude.hazard >= 10000){
			regulationConfig.cur_flight[_id].warning.altitude.hazard = (new Date());
			wss.broadcast(JSON.stringify({
				type: 'notification',
				level: 'hazard',
				param: 'altitude',
				text: 'Your drone is operating above the legal altitude for FAA drone regulations',
				time: (new Date()) - regulationConfig.cur_flight[_id].start_time
			}));
		}
	}
	else if(_altitude > regulationConfig.faa_reg.max_altitude.warning){
		if(regulationConfig.cur_flight[_id].warning.altitude.warning === null || (new Date()) - regulationConfig.cur_flight[_id].warning.altitude.warning >= 10000){
			regulationConfig.cur_flight[_id].warning.altitude.warning = (new Date());
			wss.broadcast(JSON.stringify({
				type: 'notification',
				level: 'warning',
				param: 'altitude',
				text: 'Your drone is operating 90% of the legal altitude for FAA drone regulations',
				time: (new Date()) - regulationConfig.cur_flight[_id].start_time
			}));
		}
	}
};

/**
@function velFilter - applies comparative analytics to velocities
@alias analytics/velocityAltiudeFilter.velFilter
@param {String} _id - mongodb id for user
@param {Number} _speed_x - an x velocity
@param {Number} _speed_y - an y velocity
@param {Number} _speed_z - an z velocity
*/
var velFilter = function(_id, _speed_x, _speed_y, _speed_z){

	// velocity checks x
	if(_speed_x > regulationConfig.faa_reg.max_velocity.hazard){
		if(regulationConfig.cur_flight[_id].warning.max_velocity.x.hazard === null || (new Date()) - regulationConfig.cur_flight[_id].warning.max_velocity.x.hazard >= 5000){
			regulationConfig.cur_flight[_id].warning.max_velocity.x.hazard = (new Date());
			wss.broadcast(JSON.stringify({
				type: 'notification',
				level: 'warning',
				param: 'velocity',
				text: 'Your drone is operating above the legal x velocity for FAA drone regulations',
				time: (new Date()) - regulationConfig.cur_flight[_id].start_time
			}));
		}
	}
	else if(_speed_x > regulationConfig.faa_reg.max_velocity.warning){
		if(regulationConfig.cur_flight[_id].warning.max_velocity.x.warning === null || (new Date()) - regulationConfig.cur_flight[_id].warning.max_velocity.x.warning >= 5000){
			regulationConfig.cur_flight[_id].warning.max_velocity.x.warning = (new Date());
			wss.broadcast(JSON.stringify({
				type: 'notification',
				level: 'warning',
				param: 'velocity',
				text: 'Your drone is operating at 90% the legal x velocity for FAA drone regulations',
				time: (new Date()) - regulationConfig.cur_flight[_id].start_time
			}));
		}
	}

	// velocity checks y
	if(_speed_y > regulationConfig.faa_reg.max_velocity.hazard){
		if(regulationConfig.cur_flight[_id].warning.max_velocity.y.hazard === null || (new Date()) - regulationConfig.cur_flight[_id].warning.max_velocity.y.hazard >= 5000){
			regulationConfig.cur_flight[_id].warning.max_velocity.y.hazard = (new Date());
			wss.broadcast(JSON.stringify({
				type: 'notification',
				level: 'warning',
				param: 'velocity',
				text: 'Your drone is operating above the legal y velocity for FAA drone regulations',
				time: (new Date()) - regulationConfig.cur_flight[_id].start_time
			}));
		}
	}
	else if(_speed_y > regulationConfig.faa_reg.max_velocity.warning){
		if(regulationConfig.cur_flight[_id].warning.max_velocity.y.warning === null || (new Date()) - regulationConfig.cur_flight[_id].warning.max_velocity.y.warning >= 5000){
			regulationConfig.cur_flight[_id].warning.max_velocity.y.warning = (new Date());
			wss.broadcast(JSON.stringify({
				type: 'notification',
				level: 'warning',
				param: 'velocity',
				text: 'Your drone is operating at 90% the legal y velocity for FAA drone regulations',
				time: (new Date()) - regulationConfig.cur_flight[0].start_time
			}));
		}
	}	

	// velocity checks z
	if(_speed_z > regulationConfig.faa_reg.max_velocity.hazard){
		if(regulationConfig.cur_flight[_id].warning.max_velocity.z.hazard === null || (new Date()) - regulationConfig.cur_flight[_id].warning.max_velocity.z.hazard >= 5000){
			regulationConfig.cur_flight[_id].warning.max_velocity.z.hazard = (new Date());
			wss.broadcast(JSON.stringify({
				type: 'notification',
				level: 'warning',
				param: 'velocity',
				text: 'Your drone is operating above the legal z velocity for FAA drone regulations',
				time: (new Date()) - regulationConfig.cur_flight[_id].start_time
			}));
		}
	}
	else if(_speed_z > regulationConfig.faa_reg.max_velocity.warning){
		if(regulationConfig.cur_flight[_id].warning.max_velocity.z.warning === null || (new Date()) - regulationConfig.cur_flight[_id].warning.max_velocity.z.warning >= 5000){
			regulationConfig.cur_flight[_id].warning.max_velocity.z.warning = (new Date());
			wss.broadcast(JSON.stringify({
				type: 'notification',
				level: 'warning',
				param: 'velocity',
				text: 'Your drone is operating at 90% the legal z velocity for FAA drone regulations',
				time: (new Date()) - regulationConfig.cur_flight[_id].start_time
			}));
		}
	}
};

// export all functions
module.exports = {
	velAltFilter: velAltFilter
};