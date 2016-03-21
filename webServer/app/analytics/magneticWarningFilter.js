/**
@module magneticWarningFilter
*/

/**
@requires websocket
@requires regulationConfig
*/

var wss = require('../interProcessCommunication/websocket');
var regulationConfig = require('../config/regulationConfig');

// if the absolute value of a number is less than this value, then it will be considered 0
const zero_threshold = 0.000001;

// constant threshold used to determine whether the magnetic field is being altered by more than the earth's magnetic field
const mag_threshold = 0.1;

// global mag and gyro queue
var gm_queue = [];

/**
@function magFilter - to generate notifications based on differences in magnetic field readings and gyroscope reading
@param {Number} gyrox - gyroscope data in the x plane
@param {Number} gyroy - gyroscope data in the y plane
@param {Number} gyroz - gyroscope data in the z plane
@param {Number} magx - magnetic field data in the x plane
@param {Number} magy - magnetic field data in the y plane
@param {Number} magz - magnetic field data in the z plane
*/
var magFilter = function(gyrox, gyroy, gyroz, magx, magy, magz){
	// create datapoint of magnetic and gyro data to add to queue
	var magData = {
		gyro_x: gyrox,
		gyro_y: gyroy,
		gyro_z: gyroz,
		mag_x: magx,
		mag_y: magy,
		mag_z: magz
 	};
 	if (Math.abs(magData.gyro_x) < zero_threshold) {
 		magData.gyro_x = 0;
 	}
 	if (Math.abs(magData.gyro_y) < zero_threshold) {
 		magData.gyro_y = 0;
 	}
 	if (Math.abs(magData.gyro_z) < zero_threshold) {
 		magData.gyro_z = 0;
 	}
 	if (Math.abs(magData.mag_x) < zero_threshold) {
 		magData.mag_x = 0;
 	}
 	if (Math.abs(magData.mag_y) < zero_threshold) {
 		magData.mag_y = 0;
 	}
 	if (Math.abs(magData.mag_z) < zero_threshold) {
 		magData.mag_z = 0;
 	}

	gm_queue.push(magData);
	// only have the most recent 10 datapoints in the queue
 	if (gm_queue.length > 10) {
 		gm_queue.shift();
 	}

 	// analyze the most recent 10 datapoints to see if the gyroscope and magnetic data are in sync
 	var magwarn = false;

 	for (var i = 0; i < gm_queue.length; i++) {
 		
 	}








	// if the threshold was exceeded then throw a warning
	if (magwarn == true)
	{
		var warning = {
			type: 'notification',
			level: 'hazard',
			param: 'altitude',
			text: 'Your drone is nearing sources of electromagnetic interference',
			time: (new Date()) - regulationConfig.cur_flight[0].start_time
		};
		wss.broadcast(JSON.stringify(warning));
	}
	
}

module.exports = {
	magFilter: magFilter
};