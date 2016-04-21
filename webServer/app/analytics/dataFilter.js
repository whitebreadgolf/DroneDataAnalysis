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
var airportProximity = require('../analytics/airportProximity');

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

    // all data object-ified
    var data_stream = {
        battery: _data[18],
        gyro_x: _data[9],
        gyro_y: _data[10],
        gyro_z: _data[11],
        acc_x: _data[6],
        acc_y: _data[7],
        acc_z: _data[8],
        velocity_x: _data[4], 
        velocity_y: _data[3], 
        velocity_z: _data[5], 
        altitude: _data[2],
        latitude: _data[0],
        longitude: _data[1]
    };

    // replace string null with null
    for(var key in data_stream){
        if(data_stream === undefined || data_stream === null || data_stream[key] === 'null')
            data_stream[key] = null;
    }

	// apply filters and send
    var curTime;
    if(_isLive.status) 
        curTime = (new Date());
    else 
        curTime = _isLive.value * regulationConfig.app_constants.dji_dat_collect_rate + (new Date(regulationConfig.cur_flight[_id].start_time)).getTime();
    
    // send live data if live
    if(_isLive.status) 
        sendLiveData(_id, data_stream);

    if(!regulationConfig.cur_flight[_id].last_collect || (curTime - regulationConfig.cur_flight[_id].last_collect) >= regulationConfig.app_constants.app_collection_rate){
        regulationConfig.cur_flight[_id].last_collect = curTime;
        velocityAltitudeFilter.velAltFilter(curTime, _collect, _isLive, _id, _flightId, data_stream, function(){
            buildingProximity.loadBuildingProximity(curTime, _isLive, _flightId, _id, data_stream.latitude, data_stream.longitude, function(_dist){
                airportProximity.getProximitiesForEachAirport(curTime, _id, _flightId, data_stream.latitude, data_stream.longitude, _isLive, function(){
                    
                    // collect data if collection is on       
                    dataSaveFilter.routeDataParameters(curTime, _id, _flightId, _isLive, data_stream, function(){
                        _callback();
                    }); 
                }); 
            });
        });
    }
    else{
        velocityAltitudeFilter.velAltFilter(curTime, _collect, _isLive, _id, _flightId, data_stream, function(){            
            _callback();
        }); 
    }
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