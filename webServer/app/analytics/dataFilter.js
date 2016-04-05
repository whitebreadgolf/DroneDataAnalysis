/**
@module dataFilter
*/

/**
@requires wss
@requires regulationConfig
@requires magneticWarningFilter
@requires velocityAltitudeFilter
@requires dataSaveFilter
*/

var wss = require('../interProcessCommunication/websocket');
var regulationConfig = require('../config/regulationConfig');
var magneticWarningFilter = require('./magneticWarningFilter');
var velocityAltitudeFilter = require('./velocityAltitudeFilter');
var dataSaveFilter = require('./dataSaveFilter');

/**
@function routeParameters - routes all data parameters to certain functions
@alias analytics/dataFilter.routeParameters
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
        if(_isLive) sendLiveData(_id, data_stream);
        if(_collect){ 
            dataSaveFilter.routeDataParameters(_id, _flightId, _isLive, data_stream, function(){
                _callback();
            }); 
        }
        else _callback();
    });
};

/**
@function routeSingleCsvString - splits a csv string into expected data parameters
@alias analytics/dataFilter.routeSingleCsvString
*/
var routeSingleCsvString = function(_id, _flightId, _csvString, _index, _callback){

    // split actual csv data
    var splitData = csvStrings[i].split(',');
    routeDataParameters(true, {status: true, value: null}, _id, _flightId, splitData, function(){
        _callback({success: true, message: 'single data point collected'});
    });
};

/**
@function routeMultiCsvString - splits a csv file into expected csv strings
@alias analytics/dataFilter.routeMultiCsvString
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
    //_callback({success: true, message: 'multiple data points collected'});
};

/**
@function sendLiveData - sends live user drone data to interface
@alias analytics/dataFilter.sendLiveData
@param {Number} velocity_east - velocity in the x plane
@param {Number} velocity_north - velocity in the y plane
@param {Number} velocity_down - velocity in the z plane
@param {Number} baro_alt - the altitude measured
*/
var sendLiveData = function (_id, _data_stream){

	// set more key/values
	_data_stream.type = 'data';
    _data_stream.time = (new Date()) - regulationConfig.cur_flight[_id].start_time;

    // broadcast with websocket
    wss.broadcast(JSON.stringify(_data_stream));
};

/**
@function filterCsvString - takes a csv line and parses it into it's contents
@alias analytics/dataFilter.filterCsvString
@param {String} _csvString - a csv file line
*/
var filterCsvString = function (_id, _csvString){
	var splitData = _csvString.split(',');
    routeDataParameters(false, {status: true, value: null}, _id, null, splitData[0], splitData[1], splitData[2], splitData[3], 
    splitData[4], splitData[5], splitData[8], splitData[9], splitData[10], splitData[11], splitData[12], splitData[13], 
    splitData[19], splitData[20], splitData[21], splitData[22], splitData[23], splitData[24], function(){


    });
}

// export
module.exports = {
	routeDataParameters: routeDataParameters,
	filterCsvString: filterCsvString,
    routeSingleCsvString: routeSingleCsvString,
    routeMultiCsvString: routeMultiCsvString
};