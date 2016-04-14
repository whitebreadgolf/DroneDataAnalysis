/**
@module airportProximity
*/

/**
@requires airport
@requires safetyStatus
*/

var Airport = require('../models/airport');
var safetyStatus = require('../controllers/safetyStatus');


/**
@function getProximitiesForEachAirport - 
*/
var getProximitiesForEachAirport = function(_id, _flightId, _lat, _lon, _callback){
	if(_lat !== 0 && _lon !== 0){
		Airport.find({'user':_id}, function(_err, _airports){
			if(!_err && _airports.length !== 0){
				var numAirports = _airports.length;
				var airportCount = 0;
				for(var airport in _airports){
					_airports[airport].id = _id;
					_airports[airport].flightId = _flightId; 
					calcDistanceAndSaveData(_airports[airport], _lat, _lon, function(){
						airportCount++
						if(airportCount === numAirports){
							_callback();
						}
					});
				}
			}
			else{
				_callback();
			}
		});
	}
	else{ _callback(); }
};

var calcDistanceAndSaveData = function(_data, _lat, _lon, _callback){
	var dist = measure(_lat, _lon, _data.lat, _data.lon);
	var data = {
		pilot: _data.id,
		flight_id: _data.flightId,
		type: 'airport',
		report: 'Drone proximity for '+_data.name,
		icon: _data.icon,
		value: dist,
		created_at: new Date()
	};
	safetyStatus.saveSafetyStatus(data, function(){
		_callback();
	});
};

/**
@function measure - a function to calculate the distance in meters between latitude/longitude coordinates
@alias analytics/airportProximity.measure
@params {Number} _lat1 - start latitude
@params {Number} _lon1 - start longitude
@params {Number} _lat2 - end latitude
@params {Number} _lon2 - end longitude
@returns {Number} the distance from start to end in meters
*/
var R = 6378.137;
var measure = function (_lat1, _lon1, _lat2, _lon2){ 
    
    var dLat = (_lat2 - _lat1) * Math.PI / 180;
    var dLon = (_lon2 - _lon1) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(_lat1 * Math.PI / 180) * Math.cos(_lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;

    // returns meters
    return d * 1000; 
}

module.exports = {
	getProximitiesForEachAirport: getProximitiesForEachAirport
};