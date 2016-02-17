/**
@module buildingProximity
*/

/**
@requires get-pixels
@requires googlemaps
@requires config
@requires ndarray
*/

var getPixels = require('get-pixels');
var GoogleMapsAPI = require('../../node_modules/googlemaps/lib/index');
var config = require('./../config/config');
var ndarray = require('ndarray');

// initalize gmap API
var gmAPI = new GoogleMapsAPI(config.gmapConfig);

// module constants
var ZOOM = 20;
var MAP_SIZE = {text: '400x400', x: 400, y:400};
var MAP_TYPE = 'roadmap';
var AVE_DOT_DIM = 4;

/**
@function generateMapWithRange - a function to split large range into n subranges for n static maps
@alias controllers/safetyStatus.generateMapWithRange
@param {object} _startObj - gives latitude and longitude for start
@param {object} _endObj - gives latitude and longitude for end
@returns {array} - whole binary restriction map
*/
var generateMapWithRange = function (_startObj, _endObj){

    // calculate the expected map size of n subranges (sqrt(n) * sqrt(n) array)

    // split whole range into n subranges
    // iterate through all and calculate the expected center lat+long value
    // call generateSubrange on each of these values with a callback

    // the callback function should concat all the 2d arrays into one whole array given its position
    // when there have been n callbacks, return the final binary map

    /*
    generateSubrange('34.0224972,-118.2822796', {}, function (binaryMap){
        
        //console.log(binaryMap[0]);
        for(var width = 0; width < 100; width=width+2){
            var line = '';
            for(var height = 0; height < 100; height=height+2){
                if(binaryMap[width][height] === 1){
                    line += '\x1b[36m%s\x1b[0m';
                }
                else{
                    line += '\x1b[33m%s\x1b[0m';
                }
            }
            console.log(line);
        }
    });*/
};

/**
@function generateSubrange - a function to get a google static map and transform it into a binary array of allowed positions
@alias controllers/safetyStatus.generateSubrange
@param {object} _center - latitude and longitude for center of map
@param {function} _callback - a callback function where the binary map is passed to
@params {object} _pos - expected position in the final binary map, used in the callback function
*/
var generateSubrange = function (_center, _pos, _callback){

    // static map URL params
    var params = {
        center: _center,
        zoom: ZOOM,
        size: MAP_SIZE.text,
        maptype: MAP_TYPE
    };

    // return static map URL 
    var mapUrl = gmAPI.staticMap(params); 

    console.log(mapUrl);

    // get the 400 x 400 x 4 array of integers for PNG image
    getPixels(mapUrl, function(err, pixels) {

        // the eventual
        retArray = [];

        // if error ocured
        if(err) { _callback(err); }
     
        // create a 2d binary map from this to locate buildings
        // result should be 100 x 100 abstraction
        arr = pixels;

        // iterat through 2d array
        for(var i = 0;i < MAP_SIZE.x;i = i + 4){
            for(var j = 0;j < MAP_SIZE.y;j = j + 4){


                if(j === 0){ retArray.push([]); }

                // get rgb totals
                var rTot = 0;
                var gTot = 0;
                var bTot = 0;
                //var aTot = 0;

                // 4 x 4 square average rgb values
                for(var width = i; width < i + AVE_DOT_DIM; width++){
                    for(var height = j; height < j + AVE_DOT_DIM; height++){
                        rTot += arr.get(height, width, 0);
                        gTot += arr.get(height, width, 1);
                        bTot += arr.get(height, width, 2);
                        //aTot += arr.get(width, height, 3);
                    }
                }

                // calc averages
                var divFactor = AVE_DOT_DIM*AVE_DOT_DIM;
                var rAve = Math.floor(rTot/divFactor);
                var gAve = Math.floor(gTot/divFactor);
                var bAve = Math.floor(bTot/divFactor);
                //var aAve = aTot/divFactor;


                // check for building colors
                //244 240 226 
                //227 224 217
                //250 247 232
                if(rAve === 244 && gAve === 240 && bAve === 226 || rAve === 227 && gAve === 224 && bAve === 217 || rAve === 250 && gAve === 247 && bAve === 232){
                    retArray[i/AVE_DOT_DIM][j/AVE_DOT_DIM] = 1;
                }
                else{
                    retArray[i/AVE_DOT_DIM][j/AVE_DOT_DIM] = 0;
                }
            }
        }

        // call with our binary array
        _callback(retArray);
    });
};

// export all submodules
module.exports = {
    generateMapWithRange: generateMapWithRange
};