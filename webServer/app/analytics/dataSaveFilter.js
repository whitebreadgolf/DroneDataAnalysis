/**
@module dataSaveFilter
*/

/**
@requires altitude
@requires velocity
@requires location
@requires regulationConfig
@requires buildingProximity
*/

var altitude = require('../controllers/altitude');
var velocity = require('../controllers/velocity');
var location = require('../controllers/location');
var regulationConfig = require('../config/regulationConfig');
var buildingProximity = require('../analytics/buildingProximity');
var airportProximity = require('../analytics/airportProximity');

/**
@function routeDataParameters - routes data parameters to check and save if necessary
@param {String} _id - a mongoose user id
@param {String} _flightId - a mongoose flight id
@param {Object} _data_stream - contains all needed data to route and save
*/
var routeDataParameters = function(_id, _flightId, _isLive, _data_stream, _callback){

	// determing time and if we should collect
	var curTime;
	if(_isLive.status) curTime = (new Date());
	else curTime = _isLive.value * regulationConfig.app_constants.dji_dat_collect_rate + (new Date(regulationConfig.cur_flight[_id].start_time)).getTime();
	if(!regulationConfig.cur_flight[_id].last_collect || (curTime - regulationConfig.cur_flight[_id].last_collect) >= regulationConfig.app_constants.app_collection_rate){
		regulationConfig.cur_flight[_id].last_collect = curTime;
		buildingProximity.loadBuildingProximity(_id, _data_stream.latitude, _data_stream.longitude, function(_dist){
			airportProximity.getProximitiesForEachAirport(_id, _flightId, _data_stream.latitude, _data_stream.longitude, function(){
				saveAltitudeIfCollecting(_flightId, curTime, _data_stream.altitude, function(){
					saveVelocityIfCollecting(_flightId, curTime, _data_stream.velocity_x, _data_stream.velocity_y, _data_stream.velocity_z, function(){
						saveLocationIfCollecting(_flightId, curTime, _data_stream.latitude, _data_stream.longitude, function(){
							_callback();
						});
					});
				});
			});	
		});
	}
	else _callback();
};


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

var saveVelocityIfCollecting = function(_flightId, _time, _vel_x, _vel_y, _vel_z, _callback){
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
};

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

// export public functions
module.exports = {
	routeDataParameters: routeDataParameters
};