/**
@class angular_factories.Decoder
@description responsible for decoding a dat file
@deprecated since the version with internal flight simulations
@requires Notification
@requires ngProgressFactory
*/
angular.module('UavOpsInterface')
.factory('Decoder', function (ngProgressFactory, Notification, $interval, $http){

	// map for current decodings
	var currentDecoding = null;
	var decodeQueue = [];

	/**
	@function convert 
	@memberOf angular_factories.DecoderFactory
	@description converts int to decoded string
	@param {Number} _integer - an integer Number
	@returns {Number} the integer input with possible appended 0 
	*/
	function convert(integer) {
	    var str = Number(integer).toString(16);
	    return str.length == 1 ? "0" + str : str;
	};

	/**
	@function parseLittleEndianDouble 
	@memberOf angular_factories.DecoderFactory
	@description creates byte array from input string
	@param {string} _str - the string to be converted
	@returns {Object} a Float64Array with internal byte array buffer
	*/
	function parseLittleEndianDouble(str) {
	    var buffer = new ArrayBuffer(8);
	    var bytes = new Uint8Array(buffer);
	    var doubles = new Float64Array(buffer);
	    bytes[7] = parseInt(str.substring(14, 16), 16);
	    bytes[6] = parseInt(str.substring(12, 14), 16);
	    bytes[5] = parseInt(str.substring(10, 12), 16);
	    bytes[4] = parseInt(str.substring(8, 10), 16);
	    bytes[3] = parseInt(str.substring(6, 8), 16);
	    bytes[2] = parseInt(str.substring(4, 6), 16);
	    bytes[1] = parseInt(str.substring(2, 4), 16);
	    bytes[0] = parseInt(str.substring(0, 2), 16);
	    my_double = doubles[0];
	    return my_double;
	}

	/**
	@function parseLittleEndianFloat 
	@memberOf angular_factories.DecoderFactory
	@description converts input string into float
	@param {string} _str - the string to be converted
	@returns {Object} a Float64Array with internal byte array buffer
	*/
	function parseLittleEndianFloat(str) {
	    var f = 0,
	        sign, order, mantiss, exp, int = 0,
	        multi = 1;
	    var reversed = '0x';
	    str = str.substring(2, str.length);
	    while (str.length > 0) {
	        reversed += str.substring(str.length - 2, str.length);
	        str = str.substring(0, str.length - 2);
	    }
	    str = reversed;
	    if (/^0x/.exec(str)) {
	        int = parseInt(str, 16);
	    } else {
	        for (var i = str.length - 1; i >= 0; i -= 1) {
	            if (str.charCodeAt(i) > 255) {
	                return false;
	            }
	            int += str.charCodeAt(i) * multi;
	            multi *= 256;
	        }
	    }
	    sign = (int >>> 31) ? -1 : 1;
	    exp = (int >>> 23 & 0xff) - 127;
	    mantiss = ((int & 0x7fffff) + 0x800000).toString(2);
	    for (i = 0; i < mantiss.length; i += 1) {
	        f += parseInt(mantiss[i]) ? Math.pow(2, exp) : 0;
	        exp--;
	    }
	    return f * sign;
	}

	/**
	@function calcCrow 
	@memberOf angular_factories.DecoderFactory
	@description calculates the distance between 2 latitude/longitude points
	@param {Number} _lat1 - latitude point 1
	@param {Number} _lon1 - longitude point 1
	@param {Number} _lat2 - latitude point 2
	@param {Number} _lon2 - longitude point 2
	@returns {Number} distance from point 1 to point 2
	*/
	function calcCrow(lat1, lon1, lat2, lon2) {
	    var R = 6371;
	    var dLat = toRad(lat2 - lat1);
	    var dLon = toRad(lon2 - lon1);
	    var lat1 = toRad(lat1);
	    var lat2 = toRad(lat2);
	    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
	        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
	    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	    var d = R * c;
	    return d;
	}

	/**
	@function toRad 
	@memberOf angular_factories.DecoderFactory
	@description convert arclength to radians
	@param {Number} _value - the value of the arclength
	@returns {Number} radian value
	*/
	function toRad(Value) {
	    return Value * Math.PI / 180;
	}

	/**
	@function parseLittleEndianSigned32 
	@memberOf angular_factories.DecoderFactory
	@description calculates decimal value from 32 bit unsigned hexidecimal string
	@param {string} _hex - hexidecimal value
	@returns {Number} decimal value 
	*/
	function parseLittleEndianSigned32(hex) {
	    var result = 0;
	    var pow = 0;
	    while (hex.length > 0) {
	        result += parseInt(hex.substring(0, 2), 16) * Math.pow(2, pow);
	        hex = hex.substring(2, hex.length);
	        pow += 8;
	    }
	    if ((result & 0x80000000) != 0) {
	        result = result - 0x100000000;
	    }
	    return result;
	}

	/**
	@function parseLittleEndianUnsigned32 
	@memberOf angular_factories.DecoderFactory
	@description calculates decimal value from 32 bit unsigned hexidecimal string
	@param {string} _hex - hexidecimal value
	@returns {Number} decimal value 
	*/
	function parseLittleEndianUnsigned32(hex) {
	    var result = 0;
	    var pow = 0;
	    while (hex.length > 0) {
	        result += parseInt(hex.substring(0, 2), 16) * Math.pow(2, pow);
	        hex = hex.substring(2, hex.length);
	        pow += 8;
	    }
	    return result;
	}

	/**
	@function parseLittleEndianSigned16 
	@memberOf angular_factories.DecoderFactory
	@description calculates decimal value from 16 bit signed hexidecimal string
	@param {string} _hex - hexidecimal value
	@returns {Number} decimal value 
	*/
	function parseLittleEndianSigned16(hex) {
	    var result = 0;
	    var pow = 0;
	    while (hex.length > 0) {
	        result += parseInt(hex.substring(0, 2), 16) * Math.pow(2, pow);
	        hex = hex.substring(2, hex.length);
	        pow += 8;
	    }
	    if ((result & 0x8000) != 0) {
	        result = result - 0x10000;
	    }
	    return result;
	}

	/**
	@function parseLittleEndianUnsigned16
	@memberOf angular_factories.DecoderFactory 
	@description calculates decimal value from 16 bit unsigned hexidecimal string
	@param {string} _hex - hexidecimal value
	@returns {Number} decimal value 
	*/
	function parseLittleEndianUnsigned16(hex) {
	    var result = 0;
	    var pow = 0;
	    while (hex.length > 0) {
	        result += parseInt(hex.substring(0, 2), 16) * Math.pow(2, pow);
	        hex = hex.substring(2, hex.length);
	        pow += 8;
	    }
	    return result;
	}

	/**
	@function subtract_offset 
	@memberOf angular_factories.DecoderFactory
	@description calculates the hex value of an incoming byte value
	@param {string} _in_byte - hexidecimal value
	@param {string} _mask - hexidecimal value
	@returns {Number} masked byte in hex
	*/
	function subtract_offset(in_byte, mask) {
	    var the_byte = parseInt(in_byte, 16) ^ mask;
	    if (the_byte < 0)
	        the_byte = 255 + the_byte;
	    return dec2hex(the_byte);
	}

	/**
	@function zeroFill 
	@memberOf angular_factories.DecoderFactory
	@description calculates the hex value of an incoming byte value
	@param {string} _number - hexidecimal value
	@param {string} _width - hexidecimal value
	@returns {Number} 
	*/
	function zeroFill(number, width) {
	    width -= number.toString().length;
	    if (width > 0) {
	        return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
	    }
	    return number + "";
	}
	Math.radians = function(degrees) {
	    return degrees * Math.PI / 180;
	};
	Math.degrees = function(radians) {
	    return radians * 180 / Math.PI;
	};

	function clean_message(in_string, offset) {
	    var new_string = '';
	    var hex_string = in_string;
	    for (i = 0; i < hex_string.length; i += 2) {
	        var the_byte_hex = hex_string.substring(i, i + 2);
	        var the_fixed_byte = subtract_offset(the_byte_hex, offset);
	        new_string += zeroFill(the_fixed_byte, 2);
	    }
	    return new_string;
	}

	function round3(num) {
	    var result = Math.round(num * 1000) / 1000;
	    return result;
	}

	var convertBase = function(num, baseFrom, baseTo) {
	    return parseInt(num, baseFrom).toString(baseTo);
	};
	var bin2dec = function(num) {
	    return convertBase(num, 2, 10);
	};
	var bin2hex = function(num) {
	    return convertBase(num, 2, 16);
	};
	var dec2bin = function(num) {
	    return convertBase(num, 10, 2);
	};
	var dec2hex = function(num) {
	    return convertBase(num, 10, 16);
	};
	var hex2bin = function(num) {
	    return convertBase(num, 16, 2);
	};
	var hex2dec = function(num) {
	    return convertBase(num, 16, 10);
	};

	var	isRunningOrInQueue = function(_flightId){
		if(currentDecoding && currentDecoding.flight_id === _flightId) return true;
		else{
			for(var i=0;i<decodeQueue.length;i++){
				if(decodeQueue[i].flightId === _flightId) return true;
			}

			// no trues were returned
			return false;
		}
	}

	/**
	@function stopDecoding
	@memberOf angular_factories.DecoderFactory
	@description calculates the hex value of an incoming byte value
	@param {String} _flightId - Flight id
	@param {Callback} _startAnalysis - callbacks to start analysis
	@param {Callback} _endAnalysis - callbacks to end analysis
	@returns {Number} 
	*/
	var	stopDecoding = function(_flightId, _startAnalysis, _endAnalysis){
		if(currentDecoding.flight_id === _flightId){

			// first check if the decoding was finished
			if(currentDecoding.finished === true){

				// first start flight
				var req = {
					method: 'POST',
					url: 'api/flight',
					data: {type: 'decoding', flight_id: _flightId, action: 'start'}
				};
				$http(req).then(function(data){
					if(data.data.success){
						Notification({message: data.data.message}, 'success'); 
						_startAnalysis();
						var req = {
							method: 'POST',
							url: 'api/data',
							data: {type: 'multi', csv_string: currentDecoding.csv_string, flight_id: _flightId}
						};
						$http(req).then(function(data){
							if(data.data.success) {
								Notification({message: data.data.message}, 'success');
								_endAnalysis();
								var req = {
									method: 'POST',
									url: 'api/flight',
									data: {type: 'decoding', flight_id: _flightId, action: 'end'}
								};
								$http(req).then(function(data){
									if(data.data.success) Notification({message: data.data.message}, 'success'); 
									else Notification({message: data.data.message}, 'error');

									// controller needs to know that we are done
								}); 
							}
							else Notification({message: data.data.message}, 'error');
						});

						// destroy current updating and set current object data and stop progress bar animation
						// stop file reading
						$interval.cancel(currentDecoding.progress_interval);
						currentDecoding.progress_interval = undefined;
						currentDecoding.progress_bar.reset();
						currentDecoding.progress_bar.stop();
						currentDecoding.reader.abort();

						// check if we need to start another decoding and start
						if(decodeQueue.length > 0){ 
							var decodingProcess = decodeQueue.pop();
							startDecoderHelper(decodingProcess.flightId, decodingProcess.file, decodingProcess.doneDecoding, decodingProcess.startAnalysis, decodingProcess.endAnalysis);
						}

						// kill object
						currentDecoding = null;
					}
					else Notification({message: data.data.message}, 'error');
				});
			}
			else{ 
				Notification({message: 'flight '+_flightId+ ' stopped'}, 'info'); 

				// destroy current updating and set current object data and stop progress bar animation
				// stop file reading
				$interval.cancel(currentDecoding.progress_interval);
				currentDecoding.progress_interval = undefined;
				currentDecoding.progress_bar.reset();
				currentDecoding.progress_bar.stop();
				currentDecoding.reader.abort();

				// check if we need to start another decoding and start
				if(decodeQueue.length > 0){ 
					var decodingProcess = decodeQueue.pop();
					startDecoderHelper(decodingProcess.flightId, decodingProcess.file, decodingProcess.doneDecoding, decodingProcess.startAnalysis, decodingProcess.endAnalysis);
				}

				// kill object
				currentDecoding = null;
			}
		}

		// it is a queued element
		else{
			for(var i=0;i<decodeQueue.length;i++){
				if(decodeQueue[i].flightId === _flightId){ 
					Notification({message: 'flight '+_flightId+ ' dequeued'}, 'info');
					decodeQueue.splice(i, 1);
				}
			}
		}
	}

	/**
	@function startDecoder
	@memberOf angular_factories.DecoderFactory
	@description Starts the decoding process.
	@param {String} _flightId - Flight id
	@param {Object} _file - File to be decoded.
	@param {Callback} _doneDecoding - callbacks to be performed once 
	the decoding process is complete
	@param {Callback} _startAnalysis - callbacks to start analysis
	@param {Callback} _endAnalysis - callbacks to end analysis
	@returns {Number} 
	*/
	var startDecoder = function(_flightId, _file, _doneDecoding, _startAnalysis, _endAnalysis){

		// start decoder now
		if(!currentDecoding) startDecoderHelper(_flightId, _file, _doneDecoding, _startAnalysis, _endAnalysis);

		// wait till finished
		else{
			decodeQueue.push({
				flightId: _flightId, file: _file, 
				doneDecoding:_doneDecoding, startAnalysis:_startAnalysis, endAnalysis:_endAnalysis
			});
			Notification({message: 'flight '+_flightId+ ' decoding queued'}, 'warning');
		}
	}

	/**
	@function startDecoderHelper
	@memberOf angular_factories.DecoderFactory
	@description Helps startDecoder perform the decoding process.
	@param {String} _flightId - Flight id
	@param {Object} _file - File to be decoded.
	@param {Callback} _doneDecoding - callbacks to be performed once 
	the decoding process is complete
	@param {Callback} _startAnalysis - callbacks to start analysis
	@param {Callback} _endAnalysis - callbacks to end analysis
	@returns {Number} 
	*/
	var	startDecoderHelper = function(_flightId, _file, _doneDecoding, _startAnalysis, _endAnalysis){

		// create object
		currentDecoding = {
			flight_id: _flightId,
			progress: 0,
			finished: false,
			reader: new FileReader(),
			csv_string: '',
			LatLonAltVel: [],
			previous_time: '',
			progress_bar: ngProgressFactory.createInstance()
		};

		// start progress bar
		currentDecoding.progress_bar.setHeight('2px');
		currentDecoding.progress_bar.setColor('#FFDF00');
    	currentDecoding.progress_bar.start();

    	currentDecoding.progress_interval = $interval(function(){
				currentDecoding.progress_bar.set(currentDecoding.progress);
		}, 1000);

    	Notification({message: 'flight '+_flightId+ ' decoding starting'}, 'info');

    	// initalize
	    var file = _file;
	    var blob;
	    var file_valid = false;
	    var blob_count = 0;
	    var file_length = file.size;
	    var last_byte = 0;
	    var previous_time_int = 0;
	    path_points_string = '';
	    path_points = [];
	    var main_voltage = 0;
	    var can_voltage = 0;
	    var ec_voltage = 0;

	    // set onload to trigger
	    currentDecoding.reader.onload = function(e) {

	        var view = new Uint8Array(currentDecoding.reader.result);
	        var data = '';
	        for (i = 0; i < view.length; i++) {
	            data += convert(view[i]);
	        }
	        var segments = data.split('558400cf01');
	        if (segments.length > 10) {
	            file_valid = true;
	            for (j = 1; j < segments.length - 1; j++) {
	                if (segments[j].substring(254, 256) == '55') {
	                    var message = segments[j].substring(0, 254);
	                    var sequence_number_bytes = message.substring(2, 8);
	                    var sequence_number = parseLittleEndianUnsigned32(sequence_number_bytes);
	                    var mask = sequence_number % 256;
	                    var payload = message.substring(10, 244);
	                    var cleaned_payload = clean_message(payload, mask);
	                    var longitude_substring = cleaned_payload.substring(0, 16);
	                    var latitude_substring = cleaned_payload.substring(16, 32);
	                    var longitude = Math.degrees(parseLittleEndianDouble(longitude_substring));
	                    var latitude = Math.degrees(parseLittleEndianDouble(latitude_substring));
	                    var gps_altitude_substring = cleaned_payload.substring(32, 40);
	                    var altitude = parseLittleEndianFloat("0x" + gps_altitude_substring);
	                    var accx_bytes = cleaned_payload.substring(40, 48);
	                    var accx = parseLittleEndianFloat("0x" + accx_bytes);
	                    var accy_bytes = cleaned_payload.substring(48, 56);
	                    var accy = parseLittleEndianFloat("0x" + accy_bytes);
	                    var accz_bytes = cleaned_payload.substring(56, 64);
	                    var accz = parseLittleEndianFloat("0x" + accz_bytes);
	                    var gyrox_bytes = cleaned_payload.substring(64, 72);
	                    var gyrox = parseLittleEndianFloat("0x" + gyrox_bytes);
	                    var gyroy_bytes = cleaned_payload.substring(72, 80);
	                    var gyroy = parseLittleEndianFloat("0x" + gyroy_bytes);
	                    var gyroz_bytes = cleaned_payload.substring(80, 88);
	                    var gyroz = parseLittleEndianFloat("0x" + gyroz_bytes);
	                    var barometric_altitude_substring = cleaned_payload.substring(88, 96);
	                    var baro_alt = parseLittleEndianFloat("0x" + barometric_altitude_substring);
	                    var quatw_bytes = cleaned_payload.substring(96, 104);
	                    var quatw = parseLittleEndianFloat("0x" + quatw_bytes);
	                    var quatx_bytes = cleaned_payload.substring(104, 112);
	                    var quatx = parseLittleEndianFloat("0x" + quatx_bytes);
	                    var quaty_bytes = cleaned_payload.substring(112, 120);
	                    var quaty = parseLittleEndianFloat("0x" + quaty_bytes);
	                    var quatz_bytes = cleaned_payload.substring(120, 128);
	                    var quatz = parseLittleEndianFloat("0x" + quatz_bytes);
	                    var roll = Math.degrees(Math.atan2(2.0 * (quaty * quatz + quatw * quatx), quatw * quatw - quatx * quatx - quaty * quaty + quatz * quatz));
	                    var pitch = Math.degrees(Math.asin(-2.0 * (quatx * quatz - quatw * quaty)));
	                    var yaw = Math.degrees(Math.atan2(2.0 * (quatx * quaty + quatw * quatz), quatw * quatw + quatx * quatx - quaty * quaty - quatz * quatz));
	                    var magx_bytes = cleaned_payload.substring(128, 136);
	                    var magx = parseLittleEndianFloat("0x" + magx_bytes);
	                    var magy_bytes = cleaned_payload.substring(136, 144);
	                    var magy = parseLittleEndianFloat("0x" + magy_bytes);
	                    var magz_bytes = cleaned_payload.substring(144, 152);
	                    var magz = parseLittleEndianFloat("0x" + magz_bytes);
	                    var velocity_north_substring = cleaned_payload.substring(152, 160);
	                    var velocity_east_substring = cleaned_payload.substring(160, 168);
	                    var velocity_down_substring = cleaned_payload.substring(168, 176);
	                    var velocity_north = parseLittleEndianFloat("0x" + velocity_north_substring);
	                    var velocity_east = parseLittleEndianFloat("0x" + velocity_east_substring);
	                    var velocity_down = parseLittleEndianFloat("0x" + velocity_down_substring);
	                    var ground_speed = Math.sqrt(Math.pow(velocity_north, 2) + Math.pow(velocity_east, 2))
	                    var velocity = Math.sqrt(velocity_north * velocity_north + velocity_east * velocity_east + velocity_down * velocity_down);
	                    var sats_bytes = cleaned_payload.substring(232, 236);
	                    var sats = parseLittleEndianSigned16(sats_bytes);
	                    var time_scale = sequence_number * 1.68;
	                    var time_string = parseInt(time_scale / 1000 / 3600) + ":" + parseInt(time_scale / 1000 / 60) + ":" + parseInt((time_scale / 1000) % 60);
	                    var time_is_new = true;
	                    if (currentDecoding.previous_time == time_string) {
	                        time_is_new = false;
	                    }
	                    if (time_string == '0:0:0') {
	                        time_is_new = false;
	                    }
	                    currentDecoding.previous_time = time_string;
	                    if (time_is_new && longitude > -180 && longitude < 180 && longitude != 0 && latitude > -90 && latitude < 90 && latitude != 0) {
	                        currentDecoding.LatLonAltVel.push({
	                            lat: latitude,
	                            lon: longitude,
	                            alt: altitude,
	                            vel: ground_speed,
	                            time: time_string
	                        });
	                    }
	                    if (velocity_north > -1000 && velocity_north < 1000 && latitude > -90 && latitude < 90 && longitude > -180 && longitude < 180 && altitude < 30000 && altitude > -1000 && quatx >= -1 && quatx <= 1 && quaty >= -1 && quaty <= 1 && quatz >= -1 && quatz <= 1 && quatw >= -1 && quatw <= 1) {
	                        //var dataline = latitude + "," + longitude + "," + altitude + "," + velocity_north + "," + velocity_east + "," + velocity_down + "," + velocity + "," + ground_speed + "," + accx + "," + accy + "," + accz + "," + gyrox + "," + gyroy + "," + gyroz + "," + baro_alt + "," + quatx + "," + quaty + "," + quatz + "," + quatw + "," + roll + "," + pitch + ", " + yaw + "," + magx + "," + magy + "," + magz + "," + sats + "," + sequence_number + "," + "\n";
	                        //currentDecoding.csv_string += dataline;
	                        var usedData = latitude + ',' + longitude + ',' + altitude + ',' + velocity_north+ ',' + velocity_east + ',' + velocity_down + ',' + accx + ',' + accy + ',' + accz + ',' + gyrox + ',' + gyroy + ',' + gyroz + ',' + roll + ',' + pitch + ',' + yaw + ',' + magx + ',' + magy + ',' + magz + '\n';
	                        currentDecoding.csv_string += usedData;
	                    }
	                }
	            }
	        }
	        var segments = data.split('555555aaaaaa666666cccccc');
	        if (segments.length > 10) {
	            file_valid = true;
	            for (j = 0; j < segments.length; j++) {
	                var k = 0;
	                if (segments[j].length == 24576) {
	                    var message7F = [];
	                    var all_bytes_09 = '';
	                    var all_bytes_38 = '';
	                    while (k < 24576) {
	                        var line = segments[j].substring(k, k + 24);
	                        k += 24;
	                        if (line.substring(2, 4) == '7f') {
	                            message7F.push(line);
	                        }
	                        if (line.substring(2, 4) == '09') {
	                            all_bytes_09 += line.substring(8, 24);
	                        }
	                        if (line.substring(2, 4) == '38') {
	                            all_bytes_38 += line.substring(8, 24);
	                        }
	                    }
	                    for (x = 0; x < all_bytes_38.length; x++) {
	                        if (all_bytes_38.substring(x + 2, x + 4) == 'b5' && all_bytes_09.substring(x + 4, x + 6) == '00' && all_bytes_09.length >= x + 368) {
	                            var main_voltage_bytes = all_bytes_38.substring(x + 346, x + 350);
	                            var main_voltage_prelim = parseLittleEndianUnsigned16(main_voltage_bytes);
	                            var can_voltage_bytes = all_bytes_38.substring(x + 350, x + 354);
	                            var can_voltage_prelim = parseLittleEndianUnsigned16(can_voltage_bytes);
	                            var ec_voltage_bytes = all_bytes_38.substring(x + 354, x + 358);
	                            var ec_voltage_prelim = parseLittleEndianUnsigned16(ec_voltage_bytes);
	                            if (main_voltage_prelim > 10000 && main_voltage_prelim < 30000 && can_voltage_prelim > 3000 && can_voltage_prelim < 9000) {
	                                main_voltage = main_voltage_prelim / 1000;
	                                can_voltage = can_voltage_prelim / 1000;
	                                ec_voltage = ec_voltage_prelim / 1000;
	                                break;
	                            }
	                        }
	                    }
	                    for (x = 0; x < all_bytes_09.length; x++) {
	                        var mask_bytes = all_bytes_09.substring(x + 246, x + 248);
	                        var mask = parseLittleEndianSigned16(mask_bytes);
	                        if (all_bytes_09.substring(x + 2, x + 4) == '80' && all_bytes_09.substring(x + 4, x + 6) == '00' && all_bytes_09.length >= x + 256) {
	                            var sats_bytes = clean_message(all_bytes_09.substring(x + 244, x + 248), mask);
	                            var sats = parseLittleEndianSigned16(sats_bytes);
	                            if (sats >= 0 && sats <= 24) {
	                                var longitude_bytes = clean_message(all_bytes_09.substring(x + 12, x + 28), mask);
	                                var longitude = Math.degrees(parseLittleEndianDouble(longitude_bytes));
	                                var latitude_bytes = clean_message(all_bytes_09.substring(x + 28, x + 44), mask);
	                                var latitude = Math.degrees(parseLittleEndianDouble(latitude_bytes));
	                                var altitude_bytes = clean_message(all_bytes_09.substring(x + 44, x + 52), mask);
	                                var altitude = parseLittleEndianFloat("0x" + altitude_bytes);
	                                var accx_bytes = clean_message(all_bytes_09.substring(x + 52, x + 60), mask);
	                                var accx = parseLittleEndianFloat("0x" + accx_bytes);
	                                var accy_bytes = clean_message(all_bytes_09.substring(x + 60, x + 68), mask);
	                                var accy = parseLittleEndianFloat("0x" + accy_bytes);
	                                var accz_bytes = clean_message(all_bytes_09.substring(x + 68, x + 76), mask);
	                                var accz = parseLittleEndianFloat("0x" + accz_bytes);
	                                var gyrox_bytes = clean_message(all_bytes_09.substring(x + 76, x + 84), mask);
	                                var gyrox = parseLittleEndianFloat("0x" + gyrox_bytes);
	                                var gyroy_bytes = clean_message(all_bytes_09.substring(x + 84, x + 92), mask);
	                                var gyroy = parseLittleEndianFloat("0x" + gyroy_bytes);
	                                var gyroz_bytes = clean_message(all_bytes_09.substring(x + 92, x + 100), mask);
	                                var gyroz = parseLittleEndianFloat("0x" + gyroz_bytes);
	                                var baro_bytes = clean_message(all_bytes_09.substring(x + 100, x + 108), mask);
	                                var baro_alt = parseLittleEndianFloat("0x" + baro_bytes);
	                                var quatw_bytes = clean_message(all_bytes_09.substring(x + 108, x + 116), mask);
	                                var quatw = parseLittleEndianFloat("0x" + quatw_bytes);
	                                var quatx_bytes = clean_message(all_bytes_09.substring(x + 116, x + 124), mask);
	                                var quatx = parseLittleEndianFloat("0x" + quatx_bytes);
	                                var quaty_bytes = clean_message(all_bytes_09.substring(x + 124, x + 132), mask);
	                                var quaty = parseLittleEndianFloat("0x" + quaty_bytes);
	                                var quatz_bytes = clean_message(all_bytes_09.substring(x + 132, x + 140), mask);
	                                var quatz = parseLittleEndianFloat("0x" + quatz_bytes);
	                                var roll = Math.degrees(Math.atan2(2.0 * (quaty * quatz + quatw * quatx), quatw * quatw - quatx * quatx - quaty * quaty + quatz * quatz));
	                                var pitch = Math.degrees(Math.asin(-2.0 * (quatx * quatz - quatw * quaty)));
	                                var yaw = Math.degrees(Math.atan2(2.0 * (quatx * quaty + quatw * quatz), quatw * quatw + quatx * quatx - quaty * quaty - quatz * quatz));
	                                var north_bytes = clean_message(all_bytes_09.substring(x + 164, x + 172), mask);
	                                var north_vel = parseLittleEndianFloat("0x" + north_bytes);
	                                var east_bytes = clean_message(all_bytes_09.substring(x + 172, x + 180), mask);
	                                var east_vel = parseLittleEndianFloat("0x" + east_bytes);
	                                var down_bytes = clean_message(all_bytes_09.substring(x + 180, x + 188), mask);
	                                var down_vel = parseLittleEndianFloat("0x" + down_bytes);
	                                var velocity = Math.sqrt(north_vel * north_vel + east_vel * east_vel + down_vel * down_vel);
	                                var ground_speed = Math.sqrt(north_vel * north_vel + east_vel * east_vel);
	                                var magx_bytes = clean_message(all_bytes_09.substring(x + 212, x + 216), mask);
	                                var magx = parseLittleEndianSigned16(magx_bytes);
	                                var magy_bytes = clean_message(all_bytes_09.substring(x + 216, x + 220), mask);
	                                var magy = parseLittleEndianSigned16(magy_bytes);
	                                var magz_bytes = clean_message(all_bytes_09.substring(x + 220, x + 224), mask);
	                                var magz = parseLittleEndianSigned16(magz_bytes);
	                                var sequence_bytes = clean_message(all_bytes_09.substring(x + 248, x + 252), mask);
	                                var sequence = parseLittleEndianUnsigned16(sequence_bytes);
	                                if (north_vel > -1000 && north_vel < 1000 && latitude > -90 && latitude < 90 && longitude > -180 && longitude < 180 && altitude < 30000 && altitude > -1000 && quatx >= -1 && quatx <= 1 && quaty >= -1 && quaty <= 1 && quatz >= -1 && quatz <= 1 && quatw >= -1 && quatw <= 1) {
	                                    //var dataline = latitude + ", " + longitude + ", " + altitude + ", " + north_vel + ", " + east_vel + ", " + down_vel + ", " + velocity + ", " + ground_speed + ", " + accx + ", " + accy + ", " + accz + ", " + gyrox + ", " + gyroy + ", " + gyroz + ", " + baro_alt + ", " + quatx + ", " + quaty + ", " + quatz + ", " + quatw + ", " + roll + ", " + pitch + ", " + yaw + ", " + magx + ", " + magy + ", " + magz + ", " + sats + ", " + main_voltage + ", " + can_voltage + ", " + ec_voltage + ", " + sequence + "\n";
	                                    //currentDecoding.csv_string += dataline;
	                                    var usedData = latitude + ',' + longitude + ',' + altitude + ',' + north_vel + ',' + east_vel + ',' + down_vel + ',' + accx + ',' + accy + ',' + accz + ',' + gyrox + ',' + gyroy + ',' + gyroz + ',' + roll + ',' + pitch + ',' + yaw + ',' + magx + ',' + magy + ',' + magz + '\n';
	                                    currentDecoding.csv_string += usedData;
	                                }
	                            }
	                        }
	                    }
	                    if (message7F.length == 19) {
	                        var time_bytes = message7F[1].substring(12, 20);
	                        var time_int = parseLittleEndianSigned32(time_bytes);
	                        var time_int_str = time_int.toString();
	                        seconds = time_int_str.substring(time_int_str.length - 2, time_int_str.length);
	                        minutes = time_int_str.substring(time_int_str.length - 4, time_int_str.length - 2);
	                        hours = time_int_str.substring(0, time_int_str.length - 4);
	                        var time_val = hours + ":" + minutes + ":" + seconds;
	                        var lon_bytes = message7F[1].substring(20, 24) + message7F[2].substring(8, 12);
	                        var lon_val = parseLittleEndianSigned32(lon_bytes) * 1e-7;
	                        var lat_bytes = message7F[2].substring(12, 20);
	                        var lat_val = parseLittleEndianSigned32(lat_bytes) * 1e-7;
	                        var alt_bytes = message7F[2].substring(20, 24) + message7F[3].substring(8, 12);
	                        var alt_val = parseLittleEndianSigned32(alt_bytes) / 1000.0;
	                        var north_bytes = message7F[3].substring(12, 20);
	                        var north_val = parseLittleEndianFloat("0x" + north_bytes);
	                        var east_bytes = message7F[3].substring(20, 24) + message7F[4].substring(8, 12);
	                        var east_val = parseLittleEndianFloat("0x" + east_bytes);
	                        var down_bytes = message7F[4].substring(12, 20);
	                        var down_val = parseLittleEndianFloat("0x" + down_bytes);
	                        var vel_val = Math.sqrt(north_val * north_val + east_val * east_val + down_val * down_val) / 100;
	                        var time_is_new = true;
	                        if (currentDecoding.previous_time == time_val) {
	                            time_is_new = false;
	                        }
	                        if (time_val == '0:0:0') {
	                            time_is_new = false;
	                        }
	                        if (parseInt(hours) >= 24 && parseInt(hours) < 0 && parseInt(minutes) >= 60 && parseInt(minutes) < 0 && parseInt(seconds) >= 60 && parseInt(seconds) < 0) {
	                            time_is_new = false;
	                        }
	                        previous_time_int = seconds;
	                        currentDecoding.previous_time = time_val;
	                        if (time_is_new && lon_val > -180 && lon_val < 180 && lon_val != 0 && lat_val > -90 && lat_val < 90 && lat_val != 0 && north_val > -10000 && north_val < 10000 && east_val > -10000 && east_val < 10000) {
	                            if (currentDecoding.LatLonAltVel.length > 0) {
	                                if (calcCrow(currentDecoding.LatLonAltVel[currentDecoding.LatLonAltVel.length - 1].lat, currentDecoding.LatLonAltVel[currentDecoding.LatLonAltVel.length - 1].lon, lat_val, lon_val) < 1) {
	                                    currentDecoding.LatLonAltVel.push({
	                                        lat: lat_val,
	                                        lon: lon_val,
	                                        alt: alt_val,
	                                        vel: vel_val,
	                                        time: time_val
	                                    });
	                                }
	                            } else {
	                                currentDecoding.LatLonAltVel.push({
	                                    lat: lat_val,
	                                    lon: lon_val,
	                                    alt: alt_val,
	                                    vel: vel_val,
	                                    time: time_val
	                                });
	                            }
	                        }
	                    }
	                }
	            }
	        }
	        segments = data.split('55aa');
	        if (segments.length > 10) {
	            file_valid = true;
	            for (j = 0; j < segments.length; j++) {
	                if (segments[j].substring(0, 4) == '103a') {
	                    var message10 = segments[j];
	                    if (message10.length == 124) {
	                        var mask_hex = message10.substring(114, 116);
	                        var masked_message = '';
	                        var m = 0;
	                        for (m = 0; m < message10.length; m = m + 2) {
	                            bytes = message10.substring(m, m + 2);
	                            masked_bytes = dec2hex(hex2dec(bytes) ^ hex2dec(mask_hex));
	                            if (masked_bytes.length == 1)
	                                masked_bytes = "0" + masked_bytes;
	                            masked_message += masked_bytes;
	                        }
	                        message10 = masked_message;
	                        var time_bytes = message10.substring(4, 12);
	                        var time_int = parseLittleEndianUnsigned32(time_bytes);
	                        var time_int_str = dec2bin(time_int);
	                        var prepend = '';
	                        if (time_int_str.length < 32) {
	                            var n = 0;
	                            for (n = 0; n < 32 - time_int_str.length; n++) {
	                                prepend += '0';
	                            }
	                        }
	                        time_int_str = prepend + time_int_str;
	                        seconds = bin2dec(time_int_str.substring(time_int_str.length - 6, time_int_str.length));
	                        minutes = bin2dec(time_int_str.substring(time_int_str.length - 12, time_int_str.length - 6));
	                        hours = bin2dec(time_int_str.substring(time_int_str.length - 16, time_int_str.length - 12));
	                        day = bin2dec(time_int_str.substring(11, 16));
	                        month = bin2dec(time_int_str.substring(7, 11));
	                        year = bin2dec(time_int_str.substring(0, 7));
	                        var time_val = hours + ":" + minutes + ":" + seconds;
	                        var date_val = month + "/" + day + "/" + year;
	                        var fix_type_hex = message10.substring(104, 106);
	                        var fix_type = hex2dec(fix_type_hex);
	                        var lon_bytes = message10.substring(12, 20);
	                        var lon_val = parseLittleEndianSigned32(lon_bytes) * 1e-7;
	                        var lat_bytes = message10.substring(20, 28);
	                        var lat_val = parseLittleEndianSigned32(lat_bytes) * 1e-7;
	                        var alt_bytes = message10.substring(28, 36);
	                        var alt_val = parseLittleEndianSigned32(alt_bytes) / 1000.0;
	                        var north_bytes = message10.substring(60, 68);
	                        var north_val = parseLittleEndianSigned32(north_bytes);
	                        var east_bytes = message10.substring(68, 76);
	                        var east_val = parseLittleEndianSigned32(east_bytes);
	                        var down_bytes = message10.substring(76, 84);
	                        var down_val = parseLittleEndianSigned32(down_bytes);
	                        var vel_val = Math.sqrt(north_val * north_val + east_val * east_val + down_val * down_val) / 100;
	                        var time_is_new = true;
	                        if (currentDecoding.previous_time == time_val) {
	                            time_is_new = false;
	                        }
	                        if (time_val == '0:0:0' || time_val.indexOf("NaN") != -1) {
	                            time_is_new = false;
	                        }
	                        if (parseInt(hours) >= 24 || parseInt(hours) < 0 || parseInt(minutes) >= 60 || parseInt(minutes) < 0 || parseInt(seconds) >= 60 || parseInt(seconds) < 0) {
	                            time_is_new = false;
	                        }
	                        if (parseInt(day) >= 32 || parseInt(day) < 0 || parseInt(month) >= 13 || parseInt(month) < 0 || parseInt(year) <= 0 || parseInt(year) >= 20) {
	                            time_is_new = false;
	                        }
	                        if (date_val == '0/0/0' || date_val.indexOf("NaN") != -1) {
	                            time_is_new = false;
	                        }
	                        previous_time_int = time_int;
	                        currentDecoding.previous_time = time_val;
	                        if (fix_type == 3 && time_is_new && lon_val > -180 && lon_val < 180 && lon_val != 0 && lat_val > -90 && lat_val < 90 && lat_val != 0 && north_val > -10000 && north_val < 10000 && east_val > -10000 && east_val < 10000) {
	                            if (currentDecoding.LatLonAltVel.length > 0) {
	                                if (calcCrow(currentDecoding.LatLonAltVel[currentDecoding.LatLonAltVel.length - 1].lat, currentDecoding.LatLonAltVel[currentDecoding.LatLonAltVel.length - 1].lon, lat_val, lon_val) < 1) {
	                                    currentDecoding.LatLonAltVel.push({
	                                        lat: lat_val,
	                                        lon: lon_val,
	                                        alt: alt_val,
	                                        vel: vel_val,
	                                        time: time_val
	                                    });
	                                }
	                            } else {
	                                currentDecoding.LatLonAltVel.push({
	                                    lat: lat_val,
	                                    lon: lon_val,
	                                    alt: alt_val,
	                                    vel: vel_val,
	                                    time: time_val
	                                });
	                            }
	                        }
	                    }
	                }
	            }
	        }
	        if (file_length == last_byte) {
	        //if(blob_count === 6){

	            // DONE WITH DECODING
	            _doneDecoding();
	            currentDecoding.finished = true;
	    		stopDecoding(_flightId, _startAnalysis, _endAnalysis);
	        }
	        if (file_length - (blob_count * 500000) > 500000) {
	            blob = file.slice(blob_count * 500000, blob_count * 500000 + 500000);
	            currentDecoding.reader.readAsArrayBuffer(blob);
	            last_byte = blob_count * 500000 + 500000;
	            currentDecoding.progress = Math.round(last_byte / file_length * 100);
	            blob_count += 1;
	        
	        } else if (file_length - (blob_count * 500000) < 500000 && file_length != last_byte) {
	            blob = file.slice((blob_count * 500000), file_length);
	            currentDecoding.reader.readAsArrayBuffer(blob);
	            last_byte = file_length;
	        }
	    }
	    blob = file.slice(0, 1);
	    currentDecoding.reader.readAsArrayBuffer(blob);
	    blob_count = 0;
	}

	// return public factory
	return {
		startDecoder: startDecoder,
		stopDecoding: stopDecoding,
		isRunningOrInQueue: isRunningOrInQueue
	};
});