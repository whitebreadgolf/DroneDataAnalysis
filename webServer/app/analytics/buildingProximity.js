/**
@module buildingProximity
*/

/**
@requires config
@requires get-pixels
@requires ndarray
@requires binaryMap
@requires regulationConfig
@requires when
*/

var config = require('../config/config');
var getPixels = require('get-pixels');
var ndarray = require('ndarray');
var BinaryMap = require('../models/binaryMap');
var regulationConfig = require('../config/regulationConfig');
var when = require('when');

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
var STATIC_MAPS_URL = {seg1:'https://maps.googleapis.com/maps/api/staticmap?center=', seg2:'&zoom=20&size=400x400&key=' + config.google_static_map_key};

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
@function generateMapWithRange - a function to split large range into n subranges for n static maps
@alias analytics/buildingProximity.generateMapWithRange
@param {object} _startObj - gives latitude and longitude for start
@param {object} _endObj - gives latitude and longitude for end
@returns {array} - whole binary restriction map
*/
var generateMapWithRange = function (_startObj, _endObj, _id, _callback){

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

    // var latLon = fromPointToLatLng({
    //     x: center_x, 
    //     y: center_y,
    // });
    // var curLon = latLon.lon;
    // var curLat = _startObj.lat;

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
                
                // PRINT MAP
                //printMap(_binaryMap);
                // PRINT MAP END
            });

            j++;

            // lat -> y
            // lon -> x
            var latLon = fromPointToLatLng({
                x: (center_x + (MAP_SIZE.x * j)/ SCALE), 
                y: (center_y + (MAP_SIZE.y * i)/ SCALE)
            });

            // advance longitude
            //console.log(measure(curLat, curLon, latLon.lat, latLon.lon));
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
};

/**
@function generateSubrange - a function to get a google static map and transform it into a binary array of allowed positions
@alias analytics/buildingProximity.generateSubrange
@param {object} _center - latitude and longitude for center of map
@param {function} _callback - a callback function where the binary map is passed to
@params {object} _pos - expected position in the final binary map, used in the callback function
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
        // iterat through 2d array
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
@function bound - a function to return a non null bounded value
@alias analytics/buildingProximity.bound
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
@function degreesToRadians - a function convert degrees to radians
@alias analytics/buildingProximity.degreesToRadians
@params {Number} _deg - degree value
@returns {Number} the radian value
*/
var degreesToRadians = function (_deg) {
    return _deg * (Math.PI / 180);
}

/**
@function radiansToDegrees - a function convert radians to degrees
@alias analytics/buildingProximity.radiansToDegrees
@params {Number} _rad - radian value
@returns {Number} the degree value
*/
var radiansToDegrees = function (_rad) {
    return _rad / (Math.PI / 180);
}

/**
@function fromPointToLatLng - a function convert a 2d point to a latitude and longitude 
@alias analytics/buildingProximity.fromPointToLatLng
@params {object} _point - 2d point
@returns {object} the latitude and longitude object
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
@function measure - a function to calculate the distance in meters between latitude/longitude coordinates
@alias analytics/buildingProximity.measure
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
@function getMapDimentions - a function to calculate the dimentions for a given center coordinate and google maps zoom
@alias analytics/buildingProximity.getMapDimentions
@params {object} _center - latitude/longitude
@returns {object} contains southwest and northeast latitude/longitude and width/height of map
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
@function printMap - to print a binary map on the console
@alias analytics/buildingProximity.printMap
@param {Object} _binaryMap - 2d map with binary data
*/
var printMap = function(_binaryMap){
    var line = '';
    for(var i = 0; i < _binaryMap.length; i++){

        // add color or not
        if(_binaryMap[i] === true){ line += '\x1b[36m%s\x1b[0m'; }
        else line += '\x1b[33m%s\x1b[0m'; 

        // print and reset line 
        if(i % MAP_SIZE.transform_dim === false){
            console.log(line);
            line = '';
        }
    }    
    console.log("");
}

/**
@function pushToMapQueue - pushes a map object to the map queue
@alias analytics/buildingProximity.pushToMapQueue
@param {Object} _map - mongoose mapObject
*/
var tempQueue = [];
var QUEUE_SIZE = 4;
var pushToMapQueue = function(_map){

    // check if stack is too full
    //if(tempStack.length === 4) regulationConfig.cur_flight[_id].map.cur_map.shift()
    if(tempQueue.length === QUEUE_SIZE) dequeueMap(1);

    // push to stack
    enqueueMap(_map);
}

var enqueueMap = function(_map){
    //regulationConfig.cur_flight[_id].map.cur_map.push(_map);
    //tempQueue.push({x:_map.x_coord, y:_map.y_coord});
    tempQueue.push(_map);
}

var dequeueMap = function(_num){
    for(var i=0;i<_num;i++) tempQueue.shift();
}

var shrinkQueueTo = function(_num){
    while(tempQueue.length > _num) tempQueue.shift();
}

/**
@function loadMapWithCloseLatLon - loads a set of maps cooresponing to a lat/lon point
@alias analytics/buildingProximity.loadMapWithCloseLatLon
@param {String} _id - mongodb object id
@param {Number} _lat - latitude
@param {Number} _lon - longitude
@param {function} _callback - a callback
*/
var loadMapWithCloseLatLon = function(_id, _lat, _lon, _callback){

    // empty queue
    tempQueue = [];

    // fire off queries
    loadMapWithCloseLatLonHelper(_id, _lat, _lon, 0, 0, _callback);
};

/**
@function pushCloserPointSecond - pushes the map that is closer to the target second into a queue
@alias analytics/buildingProximity.pushCloserPointSecond
@param {Object} _map1 - mongoose mapObject
@param {Object} _map2 - mongoose mapObject
@param {Number} _lat - latitude
@param {Number} _lon - longitude
*/
var pushCloserPointSecond = function(_map1, _map2, _lat, _lon){

    // one is closer
    if(measure(_map1.lat, _map1.lon, _lat, _lon) < measure(_map2.lat, _map2.lon, _lat, _lon)){
        pushToMapQueue(_map2);
        pushToMapQueue(_map1);
    }

    // 2 is closer
    else{
        pushToMapQueue(_map1);
        pushToMapQueue(_map2);
    }
}

/**
@function loadMapWithCloseLatLonHelper - helps to load a set of maps cooresponing to a lat/lon point
@alias analytics/buildingProximity.loadMapWithCloseLatLonHelper
@param {String} _id - mongodb object id
@param {Number} _lat - latitude
@param {Number} _lon - longitude
@param {Number} _x - starting x coordinate
@param {Number} -y - starting y coordinate
@param {function} _callback - a callback
*/
var loadMapWithCloseLatLonHelper = function(_id, _lat, _lon, _x, _y, _callback){

    // load map for refrence
    BinaryMap.findOne({user: _id, x_coord: _x, y_coord: _y}, function (_err, _map){
        if(_err || !_map) _callback('error');
        else{
            // set regulationConfig obejct width and height parameters
            //regulationConfig.cur_flight[_id].width = _map.width;
            //regulationConfig.cur_flight[_id].height = _map.height;

            // get bounds and other parameters
            var isBound = { east: _map.bound_e, south: _map.bound_s, north: _map.bound_n, west: _map.bound_w };
            var lat = _map.lat;
            var lon = _map.lon;
            var x = _map.x_coord;
            var y = _map.y_coord;

            // check if this is the first map
            if(x === 0 && y === 0) pushToMapQueue(_map);

            // move southeast
            if(_lat < lat && _lon > lon && !isBound.east && !isBound.south){

                // push east then south
                var eastMap = BinaryMap.findOne({user: _id, x_coord: x, y_coord: y+1});
                var southMap = BinaryMap.findOne({user: _id, x_coord: x+1, y_coord: y});
                var southeastMap = BinaryMap.findOne({user: _id, x_coord: x+1, y_coord: y+1});

                // perform all querries
                when.join(eastMap, southMap, southeastMap).then(function(values){        
                    pushCloserPointSecond(values[0], values[1], _lat, _lon);
                    pushToMapQueue(values[2]);
                    loadMapWithCloseLatLonHelper(_id, _lat, _lon, values[2].x_coord, values[2].y_coord, _callback);
                });
            }

            // move south
            else if(_lat < lat && !isBound.south){

                // see if we can also load west map
                if(!isBound.west){
                    var southwestMap = BinaryMap.findOne({user: _id, x_coord: x-1, y_coord: y+1});
                    var southMap = BinaryMap.findOne({user: _id, x_coord: x, y_coord: y+1});
                    when.join(southwestMap, southMap).then(function(values){
                        pushToMapQueue(values[0]);
                        pushToMapQueue(values[1]);
                        loadMapWithCloseLatLonHelper(_id, _lat, _lon, values[1].x_coord, values[1].y_coord, _callback);
                    });
                }

                // just load south
                else{
                    BinaryMap.findOne({user: _id, x_coord: x, y_coord: y+1}).then(function(_southMap){
                        pushToMapQueue(_southMap);
                        loadMapWithCloseLatLonHelper(_id, _lat, _lon, _southMap.x_coord, _southMap.y_coord, _callback);
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
                        pushToMapQueue(values[0]);
                        pushToMapQueue(values[1]);
                        loadMapWithCloseLatLonHelper(_id, _lat, _lon, values[1].x_coord, values[1].y_coord, _callback);
                    });
                }

                // just load east
                else{
                    BinaryMap.findOne({user: _id, x_coord: x+1, y_coord: y}).then(function(_eastMap){
                        pushToMapQueue(_eastMap);
                        loadMapWithCloseLatLonHelper(_id, _lat, _lon, _eastMap.x_coord, _eastMap.y_coord, _callback);
                    });
                }      
            }

            // done with querying
            else{ 

                // perform dequeues if neccessary
                if(_lat < lat && _lon > lon && isBound.south && isBound.east) shrinkQueueTo(1);
                else if(_lat < lat && isBound.south && !isBound.west) shrinkQueueTo(2);
                else if(_lon > lon && isBound.east && !isBound.north) shrinkQueueTo(2);
                else if(isBound.north && isBound.west) shrinkQueueTo(1);
                else if(isBound.south && isBound.west && _lat < lat) shrinkQueueTo(1);
                else if(isBound.north && isBound.east && _lon > lon) shrinkQueueTo(1);
                else if(isBound.north) shrinkQueueTo(2);
                else if(isBound.west) shrinkQueueTo(2);
                _callback(tempQueue);
            }
        }
    });
};


var mapArray = [
    [null, null, null],
    [null, null, null],
    [null, null, null]
];

/**
@function resetMapArray - reset the mapArray data structure to empty state
@alias analytics/buildingProximity.resetMapArray
 */
var resetMapArray = function() {
    var mapArray = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];
}

/**
@function loadSurroundingMaps - load the surrounding maps into a combined binary map
@alias analytics/buildingProximity.loadSurroundingMaps
@param {String} _id - mongodb object user id
@param {Object} _binaryMap - 2d starting map with binary data
 */
var loadSurroundingMaps = function(_id, _lat, _lon, _x, _y) {
    // reset the global variables
    resetMapArray();

    BinaryMap.findOne({user: _id, x_coord: _x, y_coord: _y}, function (_err, _map){
        if(_err || !_map) {
            _callback('error');
        } else {
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
                });
            }
        }

    });

}

/**
@function getNearestBuildingLocation - within a 3x3 set of tiles, we are going to return the row and col index of the nearest building location
@alias analytics/buildingProximity.getNearestBuildingLocation
@param {String} _id - mongodb object user id
@param {Object} _binaryMap - 2d starting map with binary data
@param {Object} _droneloc - {x, y}, x and y location of the drone
@return {Object} buildingLocation - object containing the building's x and y location and its longitude and latitude
 */
var getNearestBuildingLocation = function(_id, _binaryMap, _droneloc) {
    // loadSurroundingMaps(_id, _binaryMap.lat, _binaryMap.lon, _binaryMap.x_coord, _binaryMap.y_coord);

    // queue for BFS
    var searchArray = [];

    // visited array
    var visitedArray = [];
    for (var k = 0; k < mapArray.length; k++) {
        var arrayk = [];
        for (var l = 0; l < mapArray[k].length; l++) {
            var arrayl = [];
            for (var i = 0; i < _binaryMap.height; i++) {
                var visitedSubarray = [];
                for (var j = 0; j < _binaryMap.width; j++) {
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
    console.log("searchArray: " + searchArray.length);

    // while searchArray isn't empty run BFS
    while (searchArray.length !== 0) {
        // console.log(visitedArray);
        // get front location of the array 
        var currLocation = searchArray.shift();
        console.log(currLocation.i + "," + currLocation.j + "," + currLocation.x + "," + currLocation.y);
        // check if current location is a building 
        if (mapArray[currLocation.i][currLocation.j] !== null) {
            var currentTile = mapArray[currLocation.i][currLocation.j];
            if (currentTile.values[currLocation.x * _binaryMap.width + currLocation.y] === true) {
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
            northLocation.i = northLocation.i-1;
            northLocation.x = _binaryMap.height-1;
        }

        var eastLocation = {
            i: currLocation.i,
            j: currLocation.j,
            x: currLocation.x,
            y: currLocation.y
        }
        eastLocation.y = eastLocation.y + 1;
        if (eastLocation.y < 0 && eastLocation.i < 2) {
            eastLocation.i = eastLocation.i-1;
            eastLocation.y = _binaryMap.width-1;
        }

        var westLocation = {
            i: currLocation.i,
            j: currLocation.j,
            x: currLocation.x,
            y: currLocation.y
        }
        westLocation.y = westLocation.y - 1;
        if (westLocation.x < 0 && westLocation.i > 0) {
            westLocation.i = westLocation.i-1;
            westLocation.y = 0;
        }

        var southLocation = {
            i: currLocation.i,
            j: currLocation.j,
            x: currLocation.x,
            y: currLocation.y
        }
        southLocation.x = southLocation.x + 1;
        if (southLocation.x < 0 && southLocation.i < 2) {
            southLocation.i = southLocation.i-1;
            southLocation.x = 0;
        }

        // check if locations are valid 
        if (northLocation.x >= 0 && northLocation.x < _binaryMap.height && 
            visitedArray[northLocation.i][northLocation.j][northLocation.x][northLocation.y] == false) {
            searchArray.push(northLocation);
            visitedArray[northLocation.i][northLocation.j][northLocation.x][northLocation.y] = true;
        }
        if (eastLocation.y >= 0 && eastLocation.y < _binaryMap.width && 
            visitedArray[eastLocation.i][eastLocation.j][eastLocation.x][eastLocation.y] == false) {
            searchArray.push(eastLocation);
            visitedArray[eastLocation.i][eastLocation.j][eastLocation.x][eastLocation.y] = true;
        }
        if (westLocation.y >= 0 && westLocation.y < _binaryMap.width && 
            visitedArray[westLocation.i][westLocation.j][westLocation.x][westLocation.y] == false) {
            searchArray.push(westLocation);
            visitedArray[westLocation.i][westLocation.j][westLocation.x][westLocation.y] = true;
        }
        if (southLocation.x >= 0 && southLocation.x < _binaryMap.height && 
            visitedArray[southLocation.i][southLocation.j][southLocation.x][southLocation.y] == false) {
            searchArray.push(southLocation);
            visitedArray[southLocation.i][southLocation.j][southLocation.x][southLocation.y] = true;
        }
        console.log('test');
    }

    console.log(building.i + "," + building.j + "," + building.x + "," + building.y);

    if (building.i != -1 && building.j != -1) {
        var buildingLocation = {
            x_coord: mapArray[building.i][building.j].x_coord,
            y_coord: mapArray[building.i][building.j].y_coord,
            grid_x: building.x,
            grid_y: building.y
        };
        return buildingLocation;
    }
    else {
        return null;
    }
    
    
}

/* test for getNearestBuildingLocation */
var binaryMap = {
    height: 10,
    width: 10,
    values: []
}

// 10x10 map, building at (3,4) drone at (6,7)
for (var k = 0; k < 3; k++) {
    for (var l = 0; l < 3; l++) {
        var map = { 
            height: 10,
            width: 10,
            values: []
        };
        for (var i = 0; i < 100; i++) {
            map.values.push(false);
        }
        mapArray[k][l] = map;
    }
}
for (var i = 0; i < 100; i++) {
    if (i === 45) {
        binaryMap.values.push(true);
    } else {
        binaryMap.values.push(false);
    }
}
mapArray[0][0] = binaryMap;

var droneLoc = {
    x: 7,
    y: 6
};
getNearestBuildingLocation(1, mapArray[0][0], droneLoc);
/* end test for getNearestBuildingLocation */

// export all submodules
module.exports = {
    generateMapWithRange: generateMapWithRange,
    loadMapWithCloseLatLon: loadMapWithCloseLatLon
};