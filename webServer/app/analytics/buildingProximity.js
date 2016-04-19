/**
@module analytics/buildingProximity
@description analysis and configuration for buidling location and feature data
@requires config/config
@requires get-pixels
@requires ndarray
@requires models/binaryMap
@requires models/airport
@requires config/regulationConfig
@requires when
@requires controllers/safetyStatus
@requires interProcessCommunication/websocket
@requires analytics/airportProximity
*/

var config = require('../config/config');
var getPixels = require('get-pixels');
var ndarray = require('ndarray');
var BinaryMap = require('../models/binaryMap');
var Airport = require('../models/airport');
var regulationConfig = require('../config/regulationConfig');
var when = require('when');
var safetyStatus = require('../controllers/safetyStatus');
var wss = require('../interProcessCommunication/websocket');
var airportProximity = require('./airportProximity');

// module constants
var ZOOM = 20;
var MAP_SIZE = {
    text: '400x400', x: 400, y:400,
    width_meters: 50,
    height_meters: 50,
    transform_dim: 100
};
var MAP_TYPE = 'roadmap';
var AVE_DOT_DIM = 4;
var STATIC_MAPS_URL = {seg1:'https://maps.googleapis.com/maps/api/staticmap?center=', seg2:'&zoom=20&size=400x400&key='+ config.google_static_map_key};

// values for the map calculations
var MERCATOR_RANGE = 256;
var R = 6378.137; 
var SCALE = Math.pow(2, ZOOM);
var MercatorObject = {
    pixelOrigin: {
        x:(MERCATOR_RANGE / 2), 
        y:(MERCATOR_RANGE / 2)
    },
    pixelsPerLonDegree: MERCATOR_RANGE / 360,
    pixelsPerLonRadian: MERCATOR_RANGE / (2 * Math.PI)
};

/**
@function generateMapWithRange 
@description splits large range into n subranges for n static maps
@alias analytics/buildingProximity:generateMapWithRange
@param {object} _startObj - gives latitude and longitude for start
@param {object} _endObj - gives latitude and longitude for end
@param {string} _id - mongo user id
@param {function} _callback - returns whole binary restriction map
*/
var generateMapWithRange = function (_startObj, _endObj, _id, _callback){

    airportProximity.findAirportsInRange(_startObj, _endObj, _id, function(){ 

        // calculate the expected map size of n subranges (sqrt(n) * sqrt(n) array)
        // assume we have NW and SE coordinates
        var totalWidth = measure(_startObj.lat, _startObj.lon, _startObj.lat, _endObj.lon) + MAP_SIZE.width_meters;
        var totalHeight = measure(_startObj.lat, _startObj.lon, _endObj.lat, _startObj.lon) + MAP_SIZE.height_meters;

        // numRows * numCols = total map elements
        var numCols = Math.ceil(totalWidth/MAP_SIZE.width_meters);
        var numRows = Math.ceil(totalHeight/MAP_SIZE.height_meters);
        var totalMapElems = numCols * numRows;
        var mapCount = 0;

        // split whole range into n subranges
        // iterate through all and calculate the expected center lat+long value
        // call generateSubrange on each of these values with a callback

        // the callback function should concat all the 2d arrays into one whole array given its position
        // when there have been n callbacks, return the final binary map

        var allLatLon = [];
        var curLon = _startObj.lon;
        var curLat = _startObj.lat;
        var center_x = MercatorObject.pixelOrigin.x + _startObj.lon * MercatorObject.pixelsPerLonDegree;
        var siny = bound(Math.sin(degreesToRadians(_startObj.lat), -0.9999, 0.9999));
        var center_y = MercatorObject.pixelOrigin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) * -MercatorObject.pixelsPerLonRadian;

        // iterable indicies
        var i=0;
        var j=0;

        // over all of the rows, ie latitudes
        while(i<numRows){ 

            // initialize j index and longitude
            j=0;
            curLon = _startObj.lon;

            // make distance (NB: not updated until after)
            var latLon = fromPointToLatLng({
                x: (center_x + (MAP_SIZE.x * (j+1))/ SCALE), 
                y: (center_y + (MAP_SIZE.y * i)/ SCALE)
            });
            var distance = measure(curLat, curLon, latLon.lat, latLon.lon);

            // over all of the columns, ie longitudes  
            while(j<numCols){

                // create object for the latitude and longitude
                var latLonObj = {
                    text: curLat + ',' + curLon,
                    dimentions: {lat: curLat, lon: curLon}
                };

                // generate subrange with given callback
                generateSubrange(latLonObj, {x: j, y: i}, distance, function (_binaryMap, _pos, _map_dim){

                    // iterate completed maps
                    mapCount ++;

                    // binaryMap data organized
                    var data = {
                        user: _id,
                        lat: _map_dim.lat, 
                        lon: _map_dim.lon,
                        x_coord: _pos.x,
                        y_coord: _pos.y,
                        height: numRows,
                        width: numCols,
                        distance: _map_dim.distance,
                        bound_n: (_pos.y == 0),
                        bound_e: (_pos.x == numCols-1),
                        bound_s: (_pos.y == numRows-1),
                        bound_w: (_pos.x == 0),
                        values: _binaryMap
                    };

                    // create new mongoose binaryMap and save
                    var binMap = new BinaryMap(data);
                    binMap.save(function(error, data){
                        if(error) console.log('error saving map'); 
                        else console.log('added map with id'); 
                    });

                    // push into return object
                    allLatLon.push({ lat: _map_dim.lat, lon: _map_dim.lon, x: _pos.x, y: _pos.y});

                    // made last map
                    if(mapCount === totalMapElems){ _callback({text: 'success', data: allLatLon}); }
                });

                j++;

                // lat -> y
                // lon -> x
                var latLon = fromPointToLatLng({
                    x: (center_x + (MAP_SIZE.x * j)/ SCALE), 
                    y: (center_y + (MAP_SIZE.y * i)/ SCALE)
                });

                // advance longitude
                curLon = latLon.lon;
            }

            i++;

            // lat -> y
            // lon -> x
            var latLon = fromPointToLatLng({
                x: (center_x + (MAP_SIZE.x * j)/ SCALE), 
                y: (center_y + (MAP_SIZE.y * i)/ SCALE)
            });
            curLat = latLon.lat;
        }
    });
};

/**
@function generateSubrange 
@description gets a google static map and transform it into a binary array of allowed positions
@alias analytics/buildingProximity:generateSubrange
@param {Object} _center - latitude and longitude for center of map
@param {Object} _pos - expected position in the final binary map, used in the callback function
@param {string} _distance - the width in meter for all of the maps with a common latitude range 
@param {function} _callback - a callback function where the binary map is passed to
*/
var generateSubrange = function (_center, _pos, _distance, _callback){

    // return static map URL 
    var mapUrl = STATIC_MAPS_URL.seg1 + _center.text + STATIC_MAPS_URL.seg2;

    // map dimentions calculate
    // NOTE: do we actually need to re-compute this every time
    var map_dim = getMapDimentions(_center.dimentions ,ZOOM, MAP_SIZE.x, MAP_SIZE.y);

    // get the 400 x 400 x 4 array of integers for PNG image
    getPixels(mapUrl, function(err, pixels) {

        // the eventual full array
        retArray = [];

        // if error ocured
        if(err) _callback(err); 
     
        // create a 2d binary map from this to locate buildings
        // result should be 100 x 100 abstraction
        // iterate through 2d array
        for(var i = 0;i < MAP_SIZE.x;i = i + AVE_DOT_DIM){
            for(var j = 0;j < MAP_SIZE.y;j = j + AVE_DOT_DIM){

                // get rgb totals
                var rTot = 0;
                var gTot = 0;
                var bTot = 0;

                // 4 x 4 square average rgb values
                for(var width = i; width < i + AVE_DOT_DIM; width++){
                    for(var height = j; height < j + AVE_DOT_DIM; height++){
                        rTot += pixels.get(height, width, 0);
                        gTot += pixels.get(height, width, 1);
                        bTot += pixels.get(height, width, 2);
                    }
                }

                // calc averages
                var divFactor = AVE_DOT_DIM*AVE_DOT_DIM;
                var rAve = Math.floor(rTot/divFactor);
                var gAve = Math.floor(gTot/divFactor);
                var bAve = Math.floor(bTot/divFactor);

                // check for building colors
                //244 240 226 
                //227 224 217
                //250 247 232
                //244 243 236
                if( rAve === 244 && gAve === 240 && bAve === 226 || 
                    rAve === 227 && gAve === 224 && bAve === 217 || 
                    rAve === 250 && gAve === 247 && bAve === 232 ||
                    rAve === 244 && gAve === 243 && bAve === 236 ||
                    rAve === 238 && gAve === 234 && bAve === 223 ||
                    rAve === 242 && gAve === 238 && bAve === 225 ||
                    rAve === 224 && gAve === 220 && bAve === 216 ||
                    rAve === 242 && gAve === 240 && bAve === 233 ||
                    rAve === 218 && gAve === 216 && bAve === 213 ){

                    retArray[(i/AVE_DOT_DIM)*MAP_SIZE.transform_dim + (j/AVE_DOT_DIM)] = true;
                }

                else retArray[(i/AVE_DOT_DIM)*MAP_SIZE.transform_dim + (j/AVE_DOT_DIM)] = false;
            }
        }

        // call with our binary array
        _center.dimentions.distance = _distance;
        _callback(retArray, _pos, _center.dimentions);
    });
};

/**
@function addObsticleWithWidth 
@description adds obsticle object to database while also drawing it on the configuration map
@alias analytics/buildingProximity:addObsticleWithWidth
*/
var addObsticleWithWidth = function(_id, _lat, _lon, _name, _radius, _callback){
    loadMapWithCloseLatLon(_id, _lat, _lon, function (_maps){
        if(_maps === -1) 
            _callback({success: false, message: ''});
        else{
            translateLatLonToGridPoint(_lat, _lon, _maps, function (_map, _droneloc){

                printMap(_map.values);
                console.log();
                // the radius in points
                var pointRad = Math.floor(100*(_radius/_map.distance));
                highlightPointRadius(_map, pointRad, _droneloc, function(_map){
                    printMap(_map.values);
                    _callback({success: true, message: ''});
                });
            });
        }
    });
}

var highlightPointRadius = function(_map, _radius, _droneloc, _callback){
    // set large bound
    var xBound = {min:0, max:100};
    var yBound = {min:0, max:100};

    // tighten bounds
    if((_droneloc.x - _radius) > 0)
        xBound.min = _droneloc.x - _radius;
    if((_droneloc.x + _radius) < 100)
        xBound.max = _droneloc.x + _radius;
    if((_droneloc.y - _radius) > 0)
        yBound.min = _droneloc.y - _radius;
    if((_droneloc.y + _radius) < 100)
        yBound.max = _droneloc.y + _radius;

    // now do highlighting
    for(var i=xBound.min;i<xBound.max;i++){
        for(var j=yBound.min;j<yBound.max;j++){
            var diffx = Math.abs(i - _droneloc.x);
            var diffy = Math.abs(j - _droneloc.y);
            var dist = Math.sqrt(Math.pow(diffx,2) + Math.pow(diffy,2));
            if(dist <= _radius){
                _map.values[j*100 + i] = true;
            }
        }    
    }

    // return altered map
    _callback(_map);
}

/**
@function bound 
@description returns a non null bounded value
@alias analytics/buildingProximity:bound
@param {Number} _value - a numerical value
@param {Number} _opt_min - the min bound
@params {Number} _opt_max - the max bound
@returns {Number} the min/max or bounded value
*/
var bound = function (_value, _opt_min, _opt_max) {
    if (_opt_min != null) _value = Math.max(_value, _opt_min); 
    if (_opt_max != null) _value = Math.min(_value, _opt_max); 
    return _value;
}

/**
@function degreesToRadians 
@description converts degrees to radians
@alias analytics/buildingProximity:degreesToRadians
@params {Number} _deg - degree value
@returns {Number} the radian value
*/
var degreesToRadians = function (_deg) {
    return _deg * (Math.PI / 180);
}

/**
@function radiansToDegrees 
@description converts radians to degrees
@alias analytics/buildingProximity:radiansToDegrees
@params {Number} _rad - radian value
@returns {Number} the degree value
*/
var radiansToDegrees = function (_rad) {
    return _rad / (Math.PI / 180);
}

/**
@function fromPointToLatLng 
@description converts a 2d point to a latitude and longitude 
@alias analytics/buildingProximity:fromPointToLatLng
@params {Object} _point - 2d point
@returns {Object} the latitude and longitude object
*/
var fromPointToLatLng = function(_point) {
    var origin = MercatorObject.pixelOrigin;
    var lng = (_point.x - origin.x) / MercatorObject.pixelsPerLonDegree;
    var latRadians = (_point.y - origin.y) / -MercatorObject.pixelsPerLonRadian;
    var lat = radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) - Math.PI / 2);

    // return lat lon object
    return {lat:lat, lon:lng};
}

/**
@function measure 
@description calculates the distance in meters between latitude/longitude coordinates
@alias analytics/buildingProximity:measure
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

/**
@function getMapDimentions
@description calculates the dimentions for a given center coordinate and google maps zoom
@alias analytics/buildingProximity:getMapDimentions
@params {Object} _center - latitude/longitude
@returns {Object} contains southwest and northeast latitude/longitude and width/height of map
*/
var getMapDimentions = function (_center){

    // convert center latlng to point
    var centerPx = {x:0, y:0};
    var origin = MercatorObject.pixelOrigin;
    centerPx.x = origin.x + _center.lon * MercatorObject.pixelsPerLonDegree;
    var siny = bound(Math.sin(degreesToRadians(_center.lat), -0.9999, 0.9999));
    centerPx.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) * -MercatorObject.pixelsPerLonRadian;

    // calc southwest point
    var SWPoint = {x: (centerPx.x - (MAP_SIZE.x/2)/ SCALE) , y: (centerPx.y + (MAP_SIZE.y/2)/ SCALE)};
    var SWLatLon = fromPointToLatLng(SWPoint);

    // calc northeast point
    var NEPoint = {x: (centerPx.x + (MAP_SIZE.x/2)/ SCALE) , y: (centerPx.y - (MAP_SIZE.y/2)/ SCALE)};
    var NELatLon = fromPointToLatLng(NEPoint);

    // return object with 
    return {
        coordinates:{
            NELatLon: NELatLon, 
            SWLatLon: SWLatLon
        },
        dimentions: {
            width: measure(NELatLon.lat, NELatLon.lon, NELatLon.lat, SWLatLon.lon), 
            height: measure(SWLatLon.lat, SWLatLon.lon, NELatLon.lat, SWLatLon.lon)
        }
    };
}

/**
@function printMap 
@description prints a binary map on the console, for debugging purposes
@alias analytics/buildingProximity:printMap
@param {Object} _binaryMap - 2d map with binary data
*/
var printMap = function(_binaryMap){
    var line = '';
    for(var i = 0; i < _binaryMap.length; i++){

        // add color or not
        if(_binaryMap[i]){ line += '\x1b[36m%s\x1b[0m'; }
        else line += '\x1b[33m%s\x1b[0m'; 

        // print and reset line 
        if(i % MAP_SIZE.transform_dim === 0){
            console.log(line);
            line = '';
        }
    }    
    console.log("");
}

/**
@function pushToMapQueue 
@description pushes a map object to the map queue and deques a map if the queue is to long
@alias analytics/buildingProximity:pushToMapQueue
@param {Array} _queue - currently loaded maps
@param {Object} _map - mongoose mapObject
@returns {Array} map queue
*/
var pushToMapQueue = function(_queue, _map){

    // check if stack is too full
    if(_queue.length === 4) _queue = dequeueMap(_queue, 1);

    // push to stack
    return enqueueMap(_queue, _map);
}

/**
@function enqueueMap 
@description pushes a map object to the map queue
@alias analytics/buildingProximity:enqueueMap
@param {Array} _queue - currently loaded maps
@param {Object} _map - mongoose mapObject
@returns {Array} map queue
*/
var enqueueMap = function(_queue, _map){
    _queue.push(_map);
    return _queue;
}

/**
@function dequeueMap 
@description shifts a map object off the map queue
@alias analytics/buildingProximity:dequeueMap
@param {Array} _queue - currently loaded maps
@param {Number} _num - a number of times to dequeue
@returns {Array} map queue
*/
var dequeueMap = function(_queue, _num){
    for(var i=0;i<_num;i++) 
        _queue.shift();
    return _queue;
}

/**
@function shrinkQueueTo 
@description dequeues map queue till it is a certain size
@alias analytics/buildingProximity:shrinkQueueTo
@param {Array} _queue - currently loaded maps
@param {Number} _num - a number of times to dequeue
@returns {Array} map queue
*/
var shrinkQueueTo = function(_queue, _num){
    while(_queue.length > _num) 
        _queue.shift();
    return _queue;
}

/**
@function loadBuildingProximity
@description recursively loads surrounding maps until a tight bound is found
@alias analytics/buildingProximity:loadBuildingProximity
@param {Object} _isLive - to determine if the data is live
@param {string} _flightId - a mongo flight id
@param {string} _id - a mongo user id
@param {Number} _lat - the latitude to be checked
@param {Number} _lon - the longitude to be checked
@param {function} _callback - generic callback
*/
var loadBuildingProximity = function(_time, _isLive, _flightId, _id, _lat, _lon, _callback){
    loadMapWithCloseLatLon(_id, _lat, _lon, function (_maps){
        if(_maps === -1) 
            _callback(-1);
        else{
            translateLatLonToGridPoint(_lat, _lon, _maps, function (_map, _droneloc){
                getNearestBuildingLocation(_id, _map, _droneloc, function (_dist){
                    
                    if(_dist === -1) 
                        _callback('err'); // no building found, don't report
                    else{
                        var liveData = {
                            type: 'proximity',
                            level: 'warning',
                            param: 'building',
                            dist: _dist,
                            time: _time
                        }
                        if(_isLive.status) wss.broadcast(JSON.stringify(liveData));
                       
                        // organize and save data
                        var collectData = {
                            pilot: _id, 
                            flight_id: _flightId, 
                            type: 'proximity',
                            report: 'obsticle', 
                            value: _dist,
                            icon: null,
                            created_at: _time,
                        };  

                        safetyStatus.saveSafetyStatus(collectData, function(){
                            _callback();
                        });
                    }              
                });
            });
        }
    });
};

/**
@function loadMapWithCloseLatLon 
@description loads a set of maps cooresponing to a lat/lon point
@alias analytics/buildingProximity:loadMapWithCloseLatLon
@param {String} _id - mongodb object id
@param {Number} _lat - latitude
@param {Number} _lon - longitude
@param {function} _callback - a callback
*/
var loadMapWithCloseLatLon = function(_id, _lat, _lon, _callback){

    // empty queue
    var queue = [];

    // fire off queries if corrdinate is in range
    checkIfPointIsInRange(_id, _lat, _lon, function(status){
        if(status === 'err'){
            _callback(-1);
        }
        else loadMapWithCloseLatLonHelper(_id, _lat, _lon, 0, 0, queue, _callback);
    });
    
};

/**
@function checkIfPointIsInRange 
@description a check to determine whether a coordinateis in the configuration space
@alias analytics/buildingProximity:checkIfPointIsInRange
@param {String} _id - mongo user id
@param {Number} _lat - the latitude to be checked
@param {Number} _lon - the longitude to be checked
@param {function} _callback - returns success or error
*/
var checkIfPointIsInRange = function(_id, _lat, _lon, _callback){
    BinaryMap.findOne({user: _id, x_coord: 0, y_coord: 0}, function(_err, _map){
        var height = _map.height-1;
        var width = _map.width-1;
        if(_lat < _map.lat && _lon > _map.lon){
            BinaryMap.findOne({user: _id, x_coord: width, y_coord: height}, function(_err, _maxMap){
                if(_lat > _maxMap.lat && _lon < _maxMap.lon){
                    _callback('success');
                }
                else {
                    _callback('err');
                }
            });
        }   
        else {
            _callback('err');
        }
    });
}

/**
@function pushCloserPointSecond 
@description pushes the map that is closer to the target second into a queue
@alias analytics/buildingProximity:pushCloserPointSecond
@param {Object} _map1 - mongoose mapObject
@param {Object} _map2 - mongoose mapObject
@param {Number} _lat - latitude
@param {Number} _lon - longitude
@returns {Array} map queue
*/
var pushCloserPointSecond = function(_queue, _map1, _map2, _lat, _lon){

    // one is closer
    if(measure(_map1.lat, _map1.lon, _lat, _lon) < measure(_map2.lat, _map2.lon, _lat, _lon)){
        _queue = pushToMapQueue(_queue, _map2);
        _queue = pushToMapQueue(_queue, _map1);
    }

    // 2 is closer
    else{
        _queue = pushToMapQueue(_queue, _map1);
        _queue = pushToMapQueue(_queue, _map2);
    }

    return _queue;
}

/**
@function loadMapWithCloseLatLonHelper 
@description helps to load a set of maps cooresponing to a lat/lon point
@alias analytics/buildingProximity:loadMapWithCloseLatLonHelper
@param {string} _id - mongodb object id
@param {Number} _lat - latitude
@param {Number} _lon - longitude
@param {Number} _x - starting x coordinate
@param {Number} _y - starting y coordinate
@param {Array} _queue - maps currently loaded
@param {function} _callback - returns the modified map queue
*/
var loadMapWithCloseLatLonHelper = function(_id, _lat, _lon, _x, _y, _queue, _callback){

    // load map for refrence
    BinaryMap.findOne({user: _id, x_coord: _x, y_coord: _y}, function (_err, _map){
        if(_err || !_map) _callback('error');
        else{

            // get bounds and other parameters
            var isBound = { east: _map.bound_e, south: _map.bound_s, north: _map.bound_n, west: _map.bound_w };
            var lat = _map.lat;
            var lon = _map.lon;
            var x = _map.x_coord;
            var y = _map.y_coord;

            // check if this is the first map
            if(x === 0 && y === 0)
                _queue = pushToMapQueue(_queue, _map);

            // move southeast
            if(_lat < lat && _lon > lon && !isBound.east && !isBound.south){

                // push east then south
                var eastMap = BinaryMap.findOne({user: _id, x_coord: x, y_coord: y+1});
                var southMap = BinaryMap.findOne({user: _id, x_coord: x+1, y_coord: y});
                var southeastMap = BinaryMap.findOne({user: _id, x_coord: x+1, y_coord: y+1});

                // perform all querries
                when.join(eastMap, southMap, southeastMap).then(function(values){        
                    _queue = pushCloserPointSecond(_queue, values[0], values[1], _lat, _lon);
                    _queue = pushToMapQueue(_queue, values[2]);
                    loadMapWithCloseLatLonHelper(_id, _lat, _lon, values[2].x_coord, values[2].y_coord, _queue, _callback);
                });
            }

            // move south
            else if(_lat < lat && !isBound.south){

                // see if we can also load west map
                if(!isBound.west){
                    var southwestMap = BinaryMap.findOne({user: _id, x_coord: x-1, y_coord: y+1});
                    var southMap = BinaryMap.findOne({user: _id, x_coord: x, y_coord: y+1});
                    when.join(southwestMap, southMap).then(function(values){
                        _queue = pushToMapQueue(_queue, values[0]);
                        _queue = pushToMapQueue(_queue, values[1]);
                        loadMapWithCloseLatLonHelper(_id, _lat, _lon, values[1].x_coord, values[1].y_coord, _queue, _callback);
                    });
                }

                // just load south
                else{
                    BinaryMap.findOne({user: _id, x_coord: x, y_coord: y+1}).then(function(_southMap){
                        _queue = pushToMapQueue(_queue, _southMap);
                        loadMapWithCloseLatLonHelper(_id, _lat, _lon, _southMap.x_coord, _southMap.y_coord, _queue, _callback);
                    });
                }      
            }

            // move east
            else if(_lon > lon && !isBound.east){

                // see if we can also load north
                if(!isBound.north){
                    var northeastMap = BinaryMap.findOne({user: _id, x_coord: x+1, y_coord: y-1});
                    var eastMap = BinaryMap.findOne({user: _id, x_coord: x+1, y_coord: y});
                    when.join(northeastMap, eastMap).then(function(values){
                        _queue = pushToMapQueue(_queue, values[0]);
                        _queue = pushToMapQueue(_queue, values[1]);
                        loadMapWithCloseLatLonHelper(_id, _lat, _lon, values[1].x_coord, values[1].y_coord, _queue, _callback);
                    });
                }

                // just load east
                else{
                    BinaryMap.findOne({user: _id, x_coord: x+1, y_coord: y}).then(function(_eastMap){
                        _queue = pushToMapQueue(_queue, _eastMap);
                        loadMapWithCloseLatLonHelper(_id, _lat, _lon, _eastMap.x_coord, _eastMap.y_coord, _queue, _callback);
                    });
                }      
            }

            // done with querying
            else{ 

                // perform dequeues if neccessary
                if(_lat < lat && _lon > lon && isBound.south && isBound.east) 
                    _queue = shrinkQueueTo(_queue, 1);
                else if(_lat < lat && isBound.south && !isBound.west) 
                    _queue = shrinkQueueTo(_queue, 2);
                else if(_lon > lon && isBound.east && !isBound.north) 
                    _queue = shrinkQueueTo(_queue, 2);
                else if(isBound.north && isBound.west) 
                    _queue = shrinkQueueTo(_queue, 1);
                else if(isBound.south && isBound.west && _lat < lat) 
                    _queue = shrinkQueueTo(_queue, 1);
                else if(isBound.north && isBound.east && _lon > lon) 
                    _queue = shrinkQueueTo(_queue, 1);
                else if(isBound.north) 
                    _queue = shrinkQueueTo(_queue, 2);
                else if(isBound.west) 
                    _queue = shrinkQueueTo(_queue, 2);

                _callback(_queue);
            }
        }
    });
};

/**
@function loadSurroundingMaps 
@description load the surrounding maps into a combined binary map
@alias analytics/buildingProximity:loadSurroundingMaps
@param {String} _id - mongodb object user id
@param {Object} _map - 2d starting map with binary data
@param {function} _callback - returns map array or null
 */
var loadSurroundingMaps = function(_id, _map, _callback) {
    
    var mapArray = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];
    if(!_map) callback(null);  
    else {
        // check whether the binaryMap is an edge or corner map
        var isBound = { 
            east: _map.bound_e, 
            south: _map.bound_s, 
            north: _map.bound_n,
            west: _map.bound_w 
        };
        var x = _map.x_coord;
        var y = _map.y_coord;
        
        // set binary map in the middle section of the mapArray
        mapArray[1][1] = _map;

        // northwest most tile - push 3 maps
        if (isBound.west && isBound.north) {
            var eastMap = BinaryMap.findOne({user: _id, x_coord: x, y_coord: y+1});
            var southMap = BinaryMap.findOne({user: _id, x_coord: x+1, y_coord: y});
            var southeastMap = BinaryMap.findOne({user: _id, x_coord: x+1, y_coord: y+1});

            when.join(eastMap, southMap, southeastMap).then(function(maps){
                mapArray[1][2] = maps[0];
                mapArray[2][1] = maps[1];
                mapArray[2][2] = maps[2];
                _callback(mapArray);
            });
        }
        // northeast most tile
        else if (isBound.east && isBound.north) {
            var westMap = BinaryMap.findOne({user: _id, x_coord: x, y_coord: y-1});
            var southMap = BinaryMap.findOne({user: _id, x_coord: x+1, y_coord: y});
            var southwestMap = BinaryMap.findOne({user: _id, x_coord: x+1, y_coord: y-1});

            when.join(westMap, southMap, southwestMap).then(function(maps){
                mapArray[1][0] = maps[0];
                mapArray[2][1] = maps[1];
                mapArray[2][0] = maps[2];
                _callback(mapArray);
            });
        }
        // southwest most tile
        else if (isBound.west && isBound.south) {
            var eastMap = BinaryMap.findOne({user: _id, x_coord: x, y_coord: y+1});
            var northMap = BinaryMap.findOne({user: _id, x_coord: x-1, y_coord: y});
            var northeastMap = BinaryMap.findOne({user: _id, x_coord: x-1, y_coord: y+1});

            when.join(eastMap, northMap, northeastMap).then(function(maps){
                mapArray[1][2] = maps[0];
                mapArray[0][1] = maps[1];
                mapArray[0][2] = maps[2];
                _callback(mapArray);
            });
        }
        // southeast most tile
        else if (isBound.east && isBound.south) {
            var westMap = BinaryMap.findOne({user: _id, x_coord: x, y_coord: y-1});
            var northMap = BinaryMap.findOne({user: _id, x_coord: x-1, y_coord: y});
            var northwestMap = BinaryMap.findOne({user: _id, x_coord: x-1, y_coord: y-1});

            when.join(westMap, northMap, northwestMap).then(function(maps){
                mapArray[1][0] = maps[0];
                mapArray[0][1] = maps[1];
                mapArray[0][0] = maps[2];
                _callback(mapArray);
            });
        }
        else if (isBound.east) {
            var westMap = BinaryMap.findOne({user: _id, x_coord: x, y_coord: y-1});
            var northMap = BinaryMap.findOne({user: _id, x_coord: x-1, y_coord: y});
            var northwestMap = BinaryMap.findOne({user: _id, x_coord: x-1, y_coord: y-1});
            var southMap = BinaryMap.findOne({user: _id, x_coord: x+1, y_coord: y});
            var southwestMap = BinaryMap.findOne({user: _id, x_coord: x+1, y_coord: y-1});

            when.join(westMap, northMap, northwestMap, southMap, southwestMap).then(function(maps){
                mapArray[1][0] = maps[0];
                mapArray[0][1] = maps[1];
                mapArray[0][0] = maps[2];
                mapArray[2][1] = maps[3];
                mapArray[2][0] = maps[4];
                _callback(mapArray);
            });
        }
        else if (isBound.south) {
            var eastMap = BinaryMap.findOne({user: _id, x_coord: x, y_coord: y+1});
            var northMap = BinaryMap.findOne({user: _id, x_coord: x-1, y_coord: y});
            var northeastMap = BinaryMap.findOne({user: _id, x_coord: x-1, y_coord: y+1});
            var westMap = BinaryMap.findOne({user: _id, x_coord: x, y_coord: y-1});
            var northwestMap = BinaryMap.findOne({user: _id, x_coord: x-1, y_coord: y-1});

            when.join(eastMap, northMap, northeastMap, westMap, northwestMap).then(function(maps){
                mapArray[1][2] = maps[0];
                mapArray[0][1] = maps[1];
                mapArray[0][2] = maps[2];
                mapArray[1][0] = maps[3];
                mapArray[0][0] = maps[4];
                _callback(mapArray);
            });

        }
        else if (isBound.north) {
            var eastMap = BinaryMap.findOne({user: _id, x_coord: x, y_coord: y+1});
            var southMap = BinaryMap.findOne({user: _id, x_coord: x+1, y_coord: y});
            var southeastMap = BinaryMap.findOne({user: _id, x_coord: x+1, y_coord: y+1});
            var westMap = BinaryMap.findOne({user: _id, x_coord: x, y_coord: y-1});
            var southwestMap = BinaryMap.findOne({user: _id, x_coord: x+1, y_coord: y-1});

            when.join(eastMap, southMap, southeastMap, westMap, southwestMap).then(function(maps){
                mapArray[1][2] = maps[0];
                mapArray[2][1] = maps[1];
                mapArray[2][2] = maps[2];
                mapArray[1][0] = maps[3];
                mapArray[2][0] = maps[4];
                _callback(mapArray);
            });
        }
        else if (isBound.west) {
            var eastMap = BinaryMap.findOne({user: _id, x_coord: x, y_coord: y+1});
            var northMap = BinaryMap.findOne({user: _id, x_coord: x-1, y_coord: y});
            var northeastMap = BinaryMap.findOne({user: _id, x_coord: x-1, y_coord: y+1});
            var southMap = BinaryMap.findOne({user: _id, x_coord: x+1, y_coord: y});
            var southeastMap = BinaryMap.findOne({user: _id, x_coord: x+1, y_coord: y+1});

            when.join(eastMap, northMap, northeastMap, southMap, southeastMap).then(function(maps){
                mapArray[1][2] = maps[0];
                mapArray[0][1] = maps[1];
                mapArray[0][2] = maps[2];
                mapArray[2][1] = maps[3];
                mapArray[2][2] = maps[4];
                _callback(mapArray);
            });
        }
        else {
            // include all maps around the current spot
            var eastMap = BinaryMap.findOne({user: _id, x_coord: x, y_coord: y+1});
            var northMap = BinaryMap.findOne({user: _id, x_coord: x-1, y_coord: y});
            var northeastMap = BinaryMap.findOne({user: _id, x_coord: x-1, y_coord: y+1});
            var southMap = BinaryMap.findOne({user: _id, x_coord: x+1, y_coord: y});
            var southeastMap = BinaryMap.findOne({user: _id, x_coord: x+1, y_coord: y+1});
            var westMap = BinaryMap.findOne({user: _id, x_coord: x, y_coord: y-1});
            var northwestMap = BinaryMap.findOne({user: _id, x_coord: x-1, y_coord: y-1});
            var southwestMap = BinaryMap.findOne({user: _id, x_coord: x+1, y_coord: y-1});

            when.join(eastMap, northMap, northeastMap, southMap, 
                southeastMap, westMap, northwestMap, southwestMap).then(function(maps){
                mapArray[1][2] = maps[0];
                mapArray[0][1] = maps[1];
                mapArray[0][2] = maps[2];
                mapArray[2][1] = maps[3];
                mapArray[2][2] = maps[4];
                mapArray[1][0] = maps[5];
                mapArray[0][0] = maps[6];
                mapArray[2][0] = maps[7];
                _callback(mapArray);
            });
        }
    }
}

/**
@function translateLatLonToGridPoint 
@description takes in the drones location and potential location maps and gives back the exact map index
@alias analytics/buildingProximity:translateLatLonToGridPoint
@param {Number} _lat - a latitude
@param {Number} _lon - a longitude
@param [Object] _maps - all of the surrounding maps
@param {function} _callback - returns the exact map index and surrounding map
*/
var translateLatLonToGridPoint = function(_lat, _lon, _maps, _callback){

    // compute measures, index cooresponds to index in _maps
    var measures = [];
    for(var map in _maps){
        measures[map] = measure(_lat, _lon, _maps[map].lat, _maps[map].lon);
    }

    // assume first is smallest
    // find the smallest measure and hand its map off to the helper function
    var min = 0;
    for(var m in measures){
        if(measures[m] < measures[min]) min = m;
    }

    // locate quadrant and calculate index
    var CENTER = 25;
    var closeMap = _maps[min];
    var closeLat = closeMap.lat;
    var closeLon = closeMap.lon;
    var distance = closeMap.distance;
    var dx = Math.floor((measure(closeLat, _lon, closeLat, closeLon)/distance)*100);
    var dy = Math.floor((measure(_lat, closeLon, closeLat, closeLon)/distance)*100);
    var pos = {};
    if (closeLat > _lat && closeLon < _lon){
        pos.x = CENTER - dx;
        pos.y = CENTER - dy;
    }
    else if (closeLat > _lat && closeLon > _lon){
        pos.x = CENTER + dx;
        pos.y = CENTER - dy;
    }
    else if (closeLat < _lat && closeLon < _lon){
        pos.x = CENTER - dx;
        pos.y = CENTER + dy;
    }
    else if (closeLat < _lat && closeLon > _lon){
        pos.x = CENTER + dx;
        pos.y = CENTER + dy;
    }

    console.log(pos);

    _callback(closeMap, pos);
};

/**
@function getNearestBuildingLocation 
@description within a 3x3 set of tiles, we are going to return the row and col index of the nearest building location
@alias analytics/buildingProximity:getNearestBuildingLocation
@param {String} _id - mongodb object user id
@param {Object} _binaryMap - 2d starting map with binary data
@param {Object} _droneloc - {x, y}, x and y location of the drone
@param {function} _callback - passes the distance in meters
 */
var getNearestBuildingLocation = function(_id, _binaryMap, _droneloc, _callback) {

    var MAP_DIM = 100;
    var tileDim = _binaryMap.distance/100;
    // we are in or on a building, check this first
    if(_binaryMap.values[_droneloc.y*MAP_DIM + _droneloc.x]){
        _callback(0);
        return;
    }

    // load maps and then do search
    loadSurroundingMaps(_id, _binaryMap, function (_mapArray){
        if (!_mapArray) {
            _callback(-1);
            return;
        }
        
        // queue for BFS
        var searchArray = [];

        // visited array
        var visitedArray = [];
        for (var k = 0; k < _mapArray.length; k++) {
            var arrayk = [];
            for (var l = 0; l < _mapArray[k].length; l++) {
                var arrayl = [];
                for (var i = 0; i < MAP_DIM; i++) {// changed to map dim
                    var visitedSubarray = [];
                    for (var j = 0; j < MAP_DIM; j++) {// changed to map dim
                        visitedSubarray.push(false);
                    }
                    arrayl.push(visitedSubarray);
                }
                arrayk.push(arrayl);
            }   
            visitedArray.push(arrayk);
        }
    
        // closest building location
        var building = {
            i: -1,
            j: -1,
            x: -1,
            y: -1
        };

        // add drone's starting location to the array
        var droneloc = {
            i: 1,
            j: 1,
            x: _droneloc.x,
            y: _droneloc.y
        };
        searchArray.push(droneloc);
        visitedArray[droneloc.i][droneloc.j][_droneloc.x][_droneloc.y] = true;

        // while searchArray isn't empty run BFS
        while (searchArray.length !== 0) {
            // get front location of the array 
            var currLocation = searchArray.shift();

            // check if current location is a building 
            if (_mapArray[currLocation.i][currLocation.j] !== null) {
                var currentTile = _mapArray[currLocation.i][currLocation.j];
                if (currentTile.values[currLocation.x * MAP_DIM + currLocation.y] === true) {// changed to map dim
                    building = currLocation;
                    break;
                }
            }

            // get all 4 locations: north, east, west, south and add to the queue
            var northLocation = {
                i: currLocation.i,
                j: currLocation.j,
                x: currLocation.x,
                y: currLocation.y
            }
            northLocation.x = northLocation.x - 1;
            if (northLocation.x < 0 && northLocation.i > 0) {
                northLocation.j = northLocation.j-1;
                northLocation.x = MAP_DIM-1; // changed h to map dim
            }

            var eastLocation = {
                i: currLocation.i,
                j: currLocation.j,
                x: currLocation.x,
                y: currLocation.y
            }
            eastLocation.y = eastLocation.y + 1;
            if (eastLocation.y > MAP_DIM-1 && eastLocation.i < 2) {// changed to map dim
                eastLocation.i = eastLocation.i+1;
                eastLocation.y = 0;
            }
            var westLocation = {
                i: currLocation.i,
                j: currLocation.j,
                x: currLocation.x,
                y: currLocation.y
            }
            westLocation.y = westLocation.y - 1;
            if (westLocation.y < 0 && westLocation.i > 0) {
                westLocation.i = westLocation.i-1;
                westLocation.y = MAP_DIM-1;// changed to map dim
            }
            var southLocation = {
                i: currLocation.i,
                j: currLocation.j,
                x: currLocation.x,
                y: currLocation.y
            }
            southLocation.x = southLocation.x + 1;
            if (southLocation.x > MAP_DIM-1 && southLocation.i < 2) { // changed h to map dim
                southLocation.j = southLocation.j+1;
                southLocation.x = 0;
            }

            // check spots in the mapArray and add to queue if its a valid new location in the array
            if (visitedArray[northLocation.i][northLocation.j] != null ) {
                if (northLocation.x >= 0 && northLocation.x < MAP_DIM && // changed h to map dim
                    visitedArray[northLocation.i][northLocation.j][northLocation.x][northLocation.y] == false) {
                    searchArray.push(northLocation);
                    visitedArray[northLocation.i][northLocation.j][northLocation.x][northLocation.y] = true;
                }
            }

            if (visitedArray[eastLocation.i][eastLocation.j] != null) {
                if (eastLocation.y >= 0 && eastLocation.y < MAP_DIM && // changed to map dim
                    visitedArray[eastLocation.i][eastLocation.j][eastLocation.x][eastLocation.y] == false) {
                    searchArray.push(eastLocation);
                    visitedArray[eastLocation.i][eastLocation.j][eastLocation.x][eastLocation.y] = true;
                }    
            }
            if (visitedArray[westLocation.i][westLocation.j] != null) {
                if (westLocation.y >= 0 && westLocation.y < MAP_DIM && // changed to map dim
                    visitedArray[westLocation.i][westLocation.j][westLocation.x][westLocation.y] == false) {
                    searchArray.push(westLocation);
                    visitedArray[westLocation.i][westLocation.j][westLocation.x][westLocation.y] = true;
                }    
            }
            if (visitedArray[southLocation.i][southLocation.j] != null) {
                if (southLocation.x >= 0 && southLocation.x < MAP_DIM && // changed h to map dim
                    visitedArray[southLocation.i][southLocation.j][southLocation.x][southLocation.y] == false) {
                    searchArray.push(southLocation);
                    visitedArray[southLocation.i][southLocation.j][southLocation.x][southLocation.y] = true;
                }    
            }
        }

        if (building.i != -1 && building.j != -1 && building.x != -1 && building.y != -1) {
            var dist = getDistanceFromDrone (_droneloc, building, MAP_DIM, MAP_DIM); // changed to map dim, changed h to map dim            
            _callback(dist*tileDim);
        } else {

            // no building found
            _callback(-1);
        }
    });
}

/**
@function getDistanceFromDrone 
@description get the distance a point is from the drone's location
@alias analytics/buildingProximity:getDistanceFromDrone
@param {Object} _droneloc - {x, y}, x and y location of the drone
@param {Object} _point - location of the point
@param {Number} _tilewidth - width of a map tile
@param {Number} _tileheight - height of a map tile
@return {Number} - distance from the drone (in units of cells in map tile)
 */
var getDistanceFromDrone = function (_droneloc, _point, _tilewidth, _tileheight) {
    var pointx = _point.i * _tileheight + _point.x;
    var pointy = _point.j * _tilewidth + _point.y;

    var dronex = _tilewidth + _droneloc.x;
    var droney = _tileheight + _droneloc.y;

    var diffx = Math.abs(pointx - dronex);
    var diffy = Math.abs(pointy - droney);

    return Math.sqrt(Math.pow(diffx,2) + Math.pow(diffy,2));
}

// export all submodules
module.exports = {
    generateMapWithRange: generateMapWithRange,
    loadMapWithCloseLatLon: loadMapWithCloseLatLon,
    loadBuildingProximity: loadBuildingProximity,
    addObsticleWithWidth: addObsticleWithWidth
};