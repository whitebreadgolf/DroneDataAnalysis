/**
@module dataFilter
*/

/**
@requires wss
@requires sleep
@requires regulationConfig
*/

var wss = require('../interProcessCommunication/websocket');
var sleep = require('sleep');
var regulationConfig = require('../config/regulationConfig');

/**
@function routeParameters - routes all data parameters to certain functions
@alias analytics/routeParameters
*/
var routeDataParameters = function (latitude, longitude, altitude, velocity_north, velocity_east, velocity_down, velocity, ground_speed, accx, accy, accz, gyrox, gyroy, gyroz, baro_alt, quatx, quaty, quatz, quatw, roll, pitch, yaw, magx, magy, magz, sats, sequence_number){

	// send data to interface
    sendLiveData(velocity_east, velocity_north, velocity_down, baro_alt);
};

/**
@function sendLiveData - sends live user drone data to interface
@alias analytics/dataFilter.sendLiveData
@param {Number} velocity_east - velocity in the x plane
@param {Number} velocity_north - velocity in the y plane
@param {Number} velocity_down - velocity in the z plane
@param {Number} baro_alt - the altitude measured
*/
var sendLiveData = function (velocity_east, velocity_north, velocity_down, baro_alt){

	// create object
	var data_stream = {
        type: 'data',
        speed_x: velocity_east, 
        speed_y: velocity_north, 
        speed_z: velocity_down, 
        altitude: baro_alt,
        time: (new Date()) - regulationConfig.cur_flight[0].start_time
    };

    // broadcast with websocket and filter for warnings
    warningFilter(data_stream);
    wss.broadcast(JSON.stringify(data_stream));
};

/**
@function filterCsvString - takes a csv line and parses it into it's contents
@alias analytics/dataFilter.filterCsvString
@param {String} _csvString - a csv file line
*/
var filterCsvString = function (_csvString){

	var splitData = _csvString.split(',');

	// create object
	var data_stream = {
        type: 'data',
        speed_x: splitData[4], 
        speed_y: splitData[3], 
        speed_z: splitData[5], 
        altitude: splitData[14],
        time: (new Date()) - regulationConfig.cur_flight[0].start_time
    };

    // broadcast with websocket and filter for warnings
    warningFilter(data_stream);
    wss.broadcast(JSON.stringify(data_stream));
}

/**
@function warningFilter - to detect warning worthy
@alias analytics
*/

var warningFilter = function (data_stream){

	data_stream.altitude = Number.parseFloat(data_stream.altitude);
	data_stream.speed_x = Number.parseFloat(data_stream.speed_x);
	data_stream.speed_y = Number.parseFloat(data_stream.speed_y);
	data_stream.speed_z = Number.parseFloat(data_stream.speed_z);

	// altitude checks
	if(data_stream.altitude > regulationConfig.faa_reg.max_altitude.hazard){
		if(regulationConfig.cur_flight[0].warning.altitude.hazard === null || (new Date()) - regulationConfig.cur_flight[0].warning.altitude.hazard >= 10000){
			regulationConfig.cur_flight[0].warning.altitude.hazard = (new Date());
			var warning = {
				type: 'notification',
				level: 'hazard',
				param: 'altitude',
				text: 'Your drone is operating above the legal altitude for FAA drone regulations',
				time: (new Date()) - regulationConfig.cur_flight[0].start_time
			};
			wss.broadcast(JSON.stringify(warning));
		}
	}
	else if(data_stream.altitude > regulationConfig.faa_reg.max_altitude.warning){
		if(regulationConfig.cur_flight[0].warning.altitude.warning === null || (new Date()) - regulationConfig.cur_flight[0].warning.altitude.warning >= 10000){
			regulationConfig.cur_flight[0].warning.altitude.warning = (new Date());
			var warning = {
				type: 'notification',
				level: 'warning',
				param: 'altitude',
				text: 'Your drone is operating 90% of the legal altitude for FAA drone regulations',
				time: (new Date()) - regulationConfig.cur_flight[0].start_time
			};
			wss.broadcast(JSON.stringify(warning));
		}
	}

	// velocity checks x
	if(data_stream.speed_x > regulationConfig.faa_reg.max_velocity.hazard){
		if(regulationConfig.cur_flight[0].warning.max_velocity.x.hazard === null || (new Date()) - regulationConfig.cur_flight[0].warning.max_velocity.x.hazard >= 5000){
			regulationConfig.cur_flight[0].warning.max_velocity.x.hazard = (new Date());
			var warning = {
				type: 'notification',
				level: 'warning',
				param: 'velocity',
				text: 'Your drone is operating above the legal x velocity for FAA drone regulations',
				time: (new Date()) - regulationConfig.cur_flight[0].start_time
			};
			wss.broadcast(JSON.stringify(warning));
		}
	}
	else if(data_stream.speed_x > regulationConfig.faa_reg.max_velocity.warning){
		if(regulationConfig.cur_flight[0].warning.max_velocity.x.warning === null || (new Date()) - regulationConfig.cur_flight[0].warning.max_velocity.x.warning >= 5000){
			regulationConfig.cur_flight[0].warning.max_velocity.x.warning = (new Date());
			var warning = {
				type: 'notification',
				level: 'warning',
				param: 'velocity',
				text: 'Your drone is operating at 90% the legal x velocity for FAA drone regulations',
				time: (new Date()) - regulationConfig.cur_flight[0].start_time
			};
			wss.broadcast(JSON.stringify(warning));
		}
	}

	// velocity checks y
	if(data_stream.speed_y > regulationConfig.faa_reg.max_velocity.hazard){
		if(regulationConfig.cur_flight[0].warning.max_velocity.y.hazard === null || (new Date()) - regulationConfig.cur_flight[0].warning.max_velocity.y.hazard >= 5000){
			regulationConfig.cur_flight[0].warning.max_velocity.y.hazard = (new Date());
			var warning = {
				type: 'notification',
				level: 'warning',
				param: 'velocity',
				text: 'Your drone is operating above the legal y velocity for FAA drone regulations',
				time: (new Date()) - regulationConfig.cur_flight[0].start_time
			};
			wss.broadcast(JSON.stringify(warning));
		}
	}
	else if(data_stream.speed_y > regulationConfig.faa_reg.max_velocity.warning){
		if(regulationConfig.cur_flight[0].warning.max_velocity.y.warning === null || (new Date()) - regulationConfig.cur_flight[0].warning.max_velocity.y.warning >= 5000){
			regulationConfig.cur_flight[0].warning.max_velocity.y.warning = (new Date());
			var warning = {
				type: 'notification',
				level: 'warning',
				param: 'velocity',
				text: 'Your drone is operating at 90% the legal y velocity for FAA drone regulations',
				time: (new Date()) - regulationConfig.cur_flight[0].start_time
			};
			wss.broadcast(JSON.stringify(warning));
		}
	}	

	// velocity checks z
	if(data_stream.speed_z > regulationConfig.faa_reg.max_velocity.hazard){
		if(regulationConfig.cur_flight[0].warning.max_velocity.z.hazard === null || (new Date()) - regulationConfig.cur_flight[0].warning.max_velocity.z.hazard >= 5000){
			regulationConfig.cur_flight[0].warning.max_velocity.z.hazard = (new Date());
			var warning = {
				type: 'notification',
				level: 'warning',
				param: 'velocity',
				text: 'Your drone is operating above the legal z velocity for FAA drone regulations',
				time: (new Date()) - regulationConfig.cur_flight[0].start_time
			};
			wss.broadcast(JSON.stringify(warning));
		}
	}
	else if(data_stream.speed_x > regulationConfig.faa_reg.max_velocity.warning){
		if(regulationConfig.cur_flight[0].warning.max_velocity.z.warning === null || (new Date()) - regulationConfig.cur_flight[0].warning.max_velocity.z.warning >= 5000){
			regulationConfig.cur_flight[0].warning.max_velocity.z.warning = (new Date());
			var warning = {
				type: 'notification',
				level: 'warning',
				param: 'velocity',
				text: 'Your drone is operating at 90% the legal z velocity for FAA drone regulations',
				time: (new Date()) - regulationConfig.cur_flight[0].start_time
			};
			wss.broadcast(JSON.stringify(warning));
		}
	}
};

/**
@function
*/

// export
module.exports = {
	routeDataParameters: routeDataParameters,
	filterCsvString: filterCsvString
};