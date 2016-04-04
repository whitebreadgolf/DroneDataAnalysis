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
const mag_threshold = 1;

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
var magFilter = function(_id, gyrox, gyroy, gyroz, magx, magy, magz){

	// create datapoint of magnetic and gyro data to add to queue
	var magData = {
		gyro_x: Number.parseFloat(gyrox),
		gyro_y: Number.parseFloat(gyroy),
		gyro_z: Number.parseFloat(gyroz),
		mag_x: Number.parseFloat(magx),
		mag_y: Number.parseFloat(magy),
		mag_z: Number.parseFloat(magz)
 	};
 	//console.log("gyro: " + gyro_x);
 	if (Math.abs(magData.gyro_x) < zero_threshold || magData.gyro_x == null) {
 		magData.gyro_x = 0;
 	}
 	if (Math.abs(magData.gyro_y) < zero_threshold || magData.gyro_y == null) {
 		magData.gyro_y = 0;
 	}
 	if (Math.abs(magData.gyro_z) < zero_threshold || magData.gyro_z == null) {
 		magData.gyro_z = 0;
 	}
 	if (Math.abs(magData.mag_x) < zero_threshold || magData.mag_x == null) {
 		magData.mag_x = 0;
 	}
 	if (Math.abs(magData.mag_y) < zero_threshold || magData.mag_y == null) {
 		magData.mag_y = 0;
 	}
 	if (Math.abs(magData.mag_z) < zero_threshold || magData.mag_z == null) {
 		magData.mag_z = 0;
 	}

	gm_queue.push(magData);
	// only have the most recent 10 datapoints in the queue
 	if (gm_queue.length > 2) {
 		gm_queue.shift();
 	}

 	// analyze the most recent 10 datapoints to see if the gyroscope and magnetic data are in sync
 	var magwarn = false;

 	for (var i = 1; i < gm_queue.length; i++) {
 		var gm_diff = gyromagDiff(i);
 		if (Math.abs(gm_diff.mag_x / gm_diff.gyro_x) > mag_threshold) {
			magwarn = true;
		}
 		if (Math.abs(gm_diff.mag_y / gm_diff.gyro_y) > mag_threshold) {
 			magwarn = true;
 		}
 		if (Math.abs(gm_diff.mag_z / gm_diff.gyro_z) > mag_threshold) {
 			magwarn = true;
 		}
 	}
 
	// if the threshold was exceeded then throw a warning
	if (magwarn == true)
	{
		var warning = {
			type: 'notification',
			level: 'hazard',
			param: 'magnetic field sensor',
			text: 'Your drone is nearing sources of electromagnetic interference',
			time: (new Date()) - regulationConfig.cur_flight[_id].start_time
		};
		wss.broadcast(JSON.stringify(warning));

		gm_queue = [];
	}
	
}

var gyromagDiff = function(i) {
	var gm_diff = {
		gyro_x: gm_queue[i].gyro_x - gm_queue[i-1].gyro_x,
		gyro_y: gm_queue[i].gyro_y - gm_queue[i-1].gyro_y,
		gyro_z: gm_queue[i].gyro_z - gm_queue[i-1].gyro_z,
		mag_x: gm_queue[i].mag_x - gm_queue[i-1].mag_x,
		mag_y: gm_queue[i].mag_y - gm_queue[i-1].mag_y,
		mag_z: gm_queue[i].mag_z - gm_queue[i-1].mag_z,
	}
	return gm_diff;
}

module.exports = {
	magFilter: magFilter
};