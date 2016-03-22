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
var magneticWarningFilter = require('./magneticWarningFilter');
var velocityAltitudeFilter = require('./velocityAltitudeFilter');

/**
@function routeParameters - routes all data parameters to certain functions
@alias analytics/routeParameters
*/
var routeDataParameters = function (_id, latitude, longitude, altitude, velocity_north, velocity_east, velocity_down, velocity, ground_speed, accx, accy, accz, gyrox, gyroy, gyroz, baro_alt, quatx, quaty, quatz, quatw, roll, pitch, yaw, magx, magy, magz, sats, sequence_number){

	// send data to interface
    magneticWarningFilter.magFilter(_id, gyrox, gyroy, gyroz, magx, magy, magz);
    sendLiveData(_id, velocity_east, velocity_north, velocity_down, baro_alt);
};

/**
@function sendLiveData - sends live user drone data to interface
@alias analytics/dataFilter.sendLiveData
@param {Number} velocity_east - velocity in the x plane
@param {Number} velocity_north - velocity in the y plane
@param {Number} velocity_down - velocity in the z plane
@param {Number} baro_alt - the altitude measured
*/
var sendLiveData = function (_id, _velocity_east, _velocity_north, _velocity_down, _baro_alt){

	// create object
	var data_stream = {
        type: 'data',
        speed_x: _velocity_east, 
        speed_y: _velocity_north, 
        speed_z: _velocity_down, 
        altitude: _baro_alt,
        time: (new Date()) - regulationConfig.cur_flight[_id].start_time
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
var filterCsvString = function (_id, _csvString){

    console.log(_csvString);
	// create object
	var splitData = _csvString.split(',');
	var data_stream = {
        type: 'data',
        speed_x: splitData[4], 
        speed_y: splitData[3], 
        speed_z: splitData[5],
        gyro_x: splitData[11],
        gyro_y: splitData[12],
        gyro_z: splitData[13],
		altitude: splitData[14],
		mag_x: splitData[22],
        mag_y: splitData[23],
        mag_z: splitData[24],
        time: (new Date()) - regulationConfig.cur_flight[_id].start_time
    };
    // broadcast with websocket and filter for warnings
    velocityAltitudeFilter.velAltFilter(_id, data_stream);
    magneticWarningFilter.magFilter(_id, data_stream.gyro_x, data_stream.gyro_y, data_stream.gyro_z, data_stream.mag_x, data_stream.mag_y, data_stream.mag_z );
    wss.broadcast(JSON.stringify(data_stream));
}

// export
module.exports = {
	routeDataParameters: routeDataParameters,
	filterCsvString: filterCsvString
};