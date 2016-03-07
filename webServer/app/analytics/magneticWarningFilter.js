/**
@module magneticWarningFilter
*/

/**
@requires websocket
*/

var wss = require('../interProcessCommunication/websocket');

/**
@function magFilter - to generate notifications based on differences in magnetic field readings and gyroscope reading
*/
var magFilter = function(magx, magy, magz, gyrox, gyroy, gyroz){

	//wss.broadcast();
}

module.exports = {
	magFilter: magFilter
};