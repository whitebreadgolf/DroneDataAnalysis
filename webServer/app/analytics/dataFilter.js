/**
@module analytics/dataFilter
@description distributes to analysis filters and organizes data
@requires interProcessCommunication/websocket
@requires config/regulationConfig
@requires analytics/magneticWarningFilter
@requires analytics/velocityAltitudeFilter
@requires analytics/dataSaveFilter
@requires analytics/buildingProximity
*/

var wss = require('../interProcessCommunication/websocket');
var regulationConfig = require('../config/regulationConfig');
var magneticWarningFilter = require('./magneticWarningFilter');
var velocityAltitudeFilter = require('./velocityAltitudeFilter');
var dataSaveFilter = require('./dataSaveFilter');
var buildingProximity = require('../analytics/buildingProximity');

/**
@function routeParameters 
@description routes all data parameters to certain functions
@alias analytics/dataFilter:routeParameters
@param {Object} _collect - to determine whether we are collecting data
@param {Object} _isLive - to determine if the data is live
@param {string} _id - a mongo user id
@param {string} _flightId - a mongo flight id
@param {Object} _data - all of the flight data
@param {function} _callback - a generic callback
*/
var routeDataParameters = function (_collect, _isLive, _id, _flightId, _data, _callback){

    // create data for magnetic warning filter and velAlt
    var mag_data_stream = {
        gyro_x: _data[9],
        gyro_y: _data[10],
        gyro_z: _data[11],
        mag_x: _data[14],
        mag_y: _data[15],
        mag_z: _data[16],
    };
    var data_stream = {
        velocity_x: _data[4], 
        velocity_y: _data[3], 
        velocity_z: _data[5], 
        altitude: _data[2],
        latitude: _data[0],
        longitude: _data[1]
    };


	// apply filters and send
    //magneticWarningFilter.magFilter(_id, mag_data_stream);
    velocityAltitudeFilter.velAltFilter(_collect, _isLive, _id, _flightId, data_stream, function(){
        // send data to interface if live
        // collect data if collection is on
        if(_isLive.status) sendLiveData(_id, data_stream);
        if(_collect){ 
            dataSaveFilter.routeDataParameters(_id, _flightId, _isLive, data_stream, function(){
                _callback();
            }); 
        }
        else _callback();
    });
};

/**
@function routeSingleCsvString 
@description splits a csv string into expected data parameters
@alias analytics/dataFilter:routeSingleCsvString
@param {string} _id - a mongo user id
@param {string} _flightId - a mongo flight id
@param {string} _csvString - the flight data point
@param {function} _callback - returns status of collection
*/
var routeSingleCsvString = function(_id, _flightId, _csvString, _callback){

    // split actual csv data
    var splitData = _csvString.split(',');
    routeDataParameters(true, {status: true, value: null}, _id, _flightId, splitData, function(){
        _callback({success: true, message: 'single data point collected'});
    });
};

/**
@function routeMultiCsvString 
@description splits a csv file into expected csv strings
@alias analytics/dataFilter:routeMultiCsvString
@param {string} _id - a mongo user id
@param {string} _flightId - a mongo flight id
@param {string} _csvFile - all of the flight data
@param {function} _callback - returns status of collection
*/
var routeMultiCsvString = function(_id, _flightId, _csvFile, _callback){

    // split by newline char
    var csvStrings = _csvFile.split('\n');
    var totalLength = csvStrings.length-1;
    var count = 0;
    for(var i in csvStrings){
        if(csvStrings[i].length > 0){

            // split actual csv data
            var splitData = csvStrings[i].split(',');
            routeDataParameters(true, {status: false, value: i}, _id, _flightId, splitData, function(){

                count++;
                if(count === totalLength) _callback({success: true, message: 'multiple data points collected'});
            });
        }
    }
};

/**
@function sendLiveData 
@description sends live user drone data to interface
@alias analytics/dataFilter:sendLiveData
@param {string} _id - a mongo user id
@param {Object} _data_stream - contains all data parameters
*/
var sendLiveData = function (_id, _data_stream){

	// set more key/values
	_data_stream.type = 'data';
    _data_stream.time = (new Date()) - regulationConfig.cur_flight[_id].start_time;

    // broadcast with websocket
    wss.broadcast(JSON.stringify(_data_stream));
};

// export functions
module.exports = {
	routeDataParameters: routeDataParameters,
    routeSingleCsvString: routeSingleCsvString,
    routeMultiCsvString: routeMultiCsvString
};