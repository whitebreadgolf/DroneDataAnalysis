/**
@module buildingProximity
*/

/**
@requires config
@requires get-pixels
@requires ndarray
@requires binaryMap
*/

var config = require('../config/config');
var getPixels = require('get-pixels');
var ndarray = require('ndarray');
var binaryMap = require('../models/binaryMap');

// module constants
var ZOOM = 20;
var MAP_SIZE = {
    text: '400x400', x: 400, y:400,
    width_meters: 49.49391757363202,
    height_meters: 49.494047211814326,
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
}

/**
@function generateMapWithRange - a function to split large range into n subranges for n static maps
@alias analytics/buildingProximity.generateMapWithRange
@param {object} _startObj - gives latitude and longitude for start
@param {object} _endObj - gives latitude and longitude for end
@returns {array} - whole binary restriction map
*/
var generateMapWithRange = function (_startObj, _endObj){

    // calculate the expected map size of n subranges (sqrt(n) * sqrt(n) array)
    // assume we have NW and SE coordinates
    var totalWidth = measure(_startObj.lat, _startObj.lon, _startObj.lat, _endObj.lon);
    var totalHeight = measure(_startObj.lat, _startObj.lon, _endObj.lat, _startObj.lon);

    // numRows * numCols = total map elements
    var numCols = Math.ceil(totalWidth/MAP_SIZE.width_meters);
    var numRows = Math.ceil(totalHeight/MAP_SIZE.height_meters);
    var totalMapElems = numCols * numRows;

    // split whole range into n subranges
    // iterate through all and calculate the expected center lat+long value
    // call generateSubrange on each of these values with a callback

    // the callback function should concat all the 2d arrays into one whole array given its position
    // when there have been n callbacks, return the final binary map

    console.log(totalHeight);
    console.log(totalWidth);

    var curLat = _startObj.lat;
    var curLon = _startObj.lon;
    var origLon = curLon;
    var center_x = MercatorObject.pixelOrigin.x + curLon * MercatorObject.pixelsPerLonDegree;
    var siny = bound(Math.sin(degreesToRadians(curLat), -0.9999, 0.9999));
    var center_y = MercatorObject.pixelOrigin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) * -MercatorObject.pixelsPerLonRadian;

    // over all of the rows, ie latitudes
    for(var i=0;i<numRows;i++){        
        
        // over all of the columns, ie longitudes     
        for(var j=0;j<numCols;j++){

            // create object for the latitude and longitude
            var latLonObj = {
                text: curLat + ',' + curLon,
                dimentions: {lat: curLat, lon: curLon}
            };

            //console.log(latLonObj);
            generateSubrange(latLonObj, {x: i, y: j}, function (_binaryMap, _pos, _map_dim){

                // binaryMap data organized
                var data = {
                    lat_start: _map_dim.coordinates.NELatLon.lat,
                    lon_start: _map_dim.coordinates.NELatLon.lon,
                    lat_end: _map_dim.coordinates.SWLatLon.lat,
                    lon_end: _map_dim.coordinates.SWLatLon.lon,
                    x_coord: _pos.x,
                    y_coord: _pos.y,
                    width: _map_dim.dimentions.width,
                    height: _map_dim.dimentions.height,
                    values: _binaryMap,
                };

                // create new mongoose binaryMap and save
                var binMap = new binaryMap(data);
                binMap.save(function(error, data){
                    if(error){ console.log(error); }
                    else{ console.log(data); }
                });

                // made last map
                if(_pos.x === (numRows-1) && _pos.y === (numCols-1)){ return 'success: all maps generated'; }

                /*
                // PRINT MAP
                var line = '';
                for(var i = 0; i < _binaryMap.length; i=i+2){

                    // add color or not
                    if(_binaryMap[i] === 1){ line += '\x1b[36m%s\x1b[0m'; }
                    else{ line += '\x1b[33m%s\x1b[0m'; }

                    // print and reset line 
                    if(i % MAP_SIZE.transform_dim === 0){
                        console.log(line);
                        line = '';
                    }
                }    
                // PRINT MAP END
                */
            });

            // lat -> y
            // lon -> x
            var latLon = fromPointToLatLng({
                x: (center_x + (MAP_SIZE.x * j)/ SCALE), 
                y: (center_y + (MAP_SIZE.y * i)/ SCALE)
            });

            // advance longitude and latitude
            curLon = latLon.lon;
            curLat = latLon.lat

            break;
        }
        break;
    }
};

/**
@function generateSubrange - a function to get a google static map and transform it into a binary array of allowed positions
@alias analytics/buildingProximity.generateSubrange
@param {object} _center - latitude and longitude for center of map
@param {function} _callback - a callback function where the binary map is passed to
@params {object} _pos - expected position in the final binary map, used in the callback function
*/
var generateSubrange = function (_center, _pos, _callback){

    // return static map URL 
    var mapUrl = STATIC_MAPS_URL.seg1 + _center.text + STATIC_MAPS_URL.seg2;
    console.log(mapUrl);

    // map dimentions calculate
    // NOTE: do we actually need to re-compute this every time
    var map_dim = getMapDimentions(_center.dimentions ,ZOOM, MAP_SIZE.x, MAP_SIZE.y);
    
    // get the 400 x 400 x 4 array of integers for PNG image
    getPixels(mapUrl, function(err, pixels) {

        // the eventual full array
        retArray = [];

        // if error ocured
        if(err) { _callback(err); }
     
        // create a 2d binary map from this to locate buildings
        // result should be 100 x 100 abstraction
        // iterat through 2d array
        for(var i = 0;i < MAP_SIZE.x;i = i + AVE_DOT_DIM){
            for(var j = 0;j < MAP_SIZE.y;j = j + AVE_DOT_DIM){

                // for 2d array version
                //if(j === 0){ retArray.push([]); }

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
                    rAve === 244 && gAve === 243 && bAve === 236){

                    retArray[(i/AVE_DOT_DIM)*MAP_SIZE.transform_dim + (j/AVE_DOT_DIM)] = 1;
                }
                else{
                    retArray[(i/AVE_DOT_DIM)*MAP_SIZE.transform_dim + (j/AVE_DOT_DIM)] = 0;
                }
            }
        }

        // call with our binary array
        _callback(retArray, _pos, map_dim);
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
    if (_opt_min != null){ _value = Math.max(_value, _opt_min); }
    if (_opt_max != null){ _value = Math.min(_value, _opt_max); }
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


// export all submodules
module.exports = {
    generateMapWithRange: generateMapWithRange
};