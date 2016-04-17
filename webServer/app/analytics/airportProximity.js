/**
@module analytics/airportProximity
@description analysis and configuraiton for aiport location data
@requires models/airport
@requires controllers/safetyStatus
@requires request
@requires config/config
*/

var Airport = require('../models/airport');
var safetyStatus = require('../controllers/safetyStatus');
var request = require('request');
config = require('../config/config');

//module constants
var R = 6378.137;
var AIRPORT_SEARCH = {seg1:'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=', seg2:'&rankby=distance&name=airport&key='+ config.google_static_map_key};

/**
@function getProximitiesForEachAirport
@description finds the proximity to a given airport
@alias analytics/airportProximity:getProximitiesForEachAirport
@param {string} _id - a mongo user id
@param {string} _flightId - a mongo flight id
@param {Number} _lat - the latitude of the drone
@param {Number} _lon - the longitude of the drone
@param {function} _callback - generic callback
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

/**
@function calcDistanceAndSaveData 
@description calculates distance between points and saves the proximity data
@alias analytics/airportProximity:calcDistanceAndSaveData
@param {Object} _data - the airport mongo object
@param {Number} _lat - the latitude of the drone
@param {Number} _lon - the longitude of the drone
@param {function} _callback - generic callback function
*/
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
@function findAirportsInRange 
@description finds the closest airport to the lat/lon range given by the user
@alias analytics/buildingProximity:findAirportsInRange
@param {Object} _startObj - the starting lat/lon
@param {Object} _endObj - the ending lat/lon
@param {string} _id - mongo user id
@param {function} _callback - callback that returns all the airport objects generated
*/
var findAirportsInRange = function(_startObj, _endObj, _id, _callback){

    // find all corners
    var northWest = _startObj.lat + ',' + _startObj.lon;
    var northEast = _startObj.lat + ',' + _endObj.lon;
    var southWest = _endObj.lat + ',' + _startObj.lon;
    var southEast = _endObj.lat + ',' + _endObj.lon;
    var allCoords = [northWest, northEast, southWest, southEast];

    // find all of the airports and return a unique set
    findAirport(allCoords, {}, function(_airportMap){
        var length = Object.keys(_airportMap).length;
        var count = 0;
        for(var airport in _airportMap){
            var data = {
                name: airport,
                user: _id,
                lat: _airportMap[airport].lat,
                lon: _airportMap[airport].lon,
                icon: _airportMap[airport].icon,
                map_link: _airportMap[airport].map_link,
                place_id: _airportMap[airport].place_id
            };
            var air = new Airport(data);
            air.save().then(function(_err, _data){
                count++;
                if(count === length){
                    _callback();
                }
            });
        }
    });
};

/**
@function findAirport 
@description finds airports in a 50,000 meter radius of an array of coordinates
@alias analytics/airportProximity:findAirport
@param {Array} _allCoords - coordinates at 4 corners of configuration space
@param {Object} _airportMap - a map where keys are airport names and values are the airport objects
@param {function} _callback - returns the enhanced airportMap object
*/
var findAirport = function(_allCoords, _airportMap, _callback){
    request(AIRPORT_SEARCH.seg1+_allCoords[0]+AIRPORT_SEARCH.seg2, function (error, response, body) {
        if (!error && response.statusCode == 200){

            // extract airport info
            body = JSON.parse(body);
            for(var airport in body.results){
                if(!_airportMap[body.results[airport].name]){
                    _airportMap[body.results[airport].name] = {
                        lat: body.results[airport].geometry.location.lat,
                        lon: body.results[airport].geometry.location.lng,
                        icon: body.results[airport].icon,
                        map_link: body.results[airport].photos && body.results[airport].photos[0].html_attributions,
                        place_id: body.results[airport].place_id
                    };
                }
            }

            // mark the coordinate as already querried
            _allCoords.shift();

            // check if we need to query again
            if(_allCoords.length > 0){
                findAirport(_allCoords, _airportMap, _callback);
            }
            else{
                _callback(_airportMap);
            }
        }
    });
};

/**
@function measure 
@description calculates the distance in meters between latitude/longitude coordinates
@alias analytics/airportProximity:measure
@params {Number} _lat1 - start latitude
@params {Number} _lon1 - start longitude
@params {Number} _lat2 - end latitude
@params {Number} _lon2 - end longitude
@returns {Number} the distance from start to end in meters
*/
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

// export functions
module.exports = {
	getProximitiesForEachAirport: getProximitiesForEachAirport,
	findAirportsInRange: findAirportsInRange
};