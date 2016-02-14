/**
@module routes - a module to initalize the web API routes
*/

/**
@requires altitude
@requires daylight
@requires direction
@requires initialConditions
@requires location
@requires preflight
@requires safetyStatus
@requires speed
*/

var altitude = require('./../controllers/altitude');
var daylight = require('./../controllers/daylight');
var direction = require('./../controllers/direction');
var initialConditions = require('./../controllers/initialConditions');
var location = require('./../controllers/location');
var preflight = require('./../controllers/preflight');
var safetyStatus = require('./../controllers/safetyStatus');
var speed = require('./../controllers/speed');

/**
@function initRoutes - to initialize all 
@alias routes/initRoutes
@param {object} _app - the express app object
*/
var initRoutes = function (_app){

	// GET speed
	_app.get('/api/speed', function (res, req){

		// req - {time_interval:{start_time:<integer>,end_time:<integer>}}
		// res - {data_points: [<double>, ….]}

	});

	// GET altitude
	_app.get('/api/altitude', function (res, req){
		
		// req - time_interval:{start_time:<integer>,end_time:<integer>}
		// res - {data_points: [<double>, ….]}

	});

	// GET daylight
	_app.get('/api/daylight', function (res, req){
		
		// res - {is_daylight: <boolean>}

	});	

	// GET preflight inspection
	_app.get('/api/preflight', function (res, req){
		
		// req - {time_interval:{start_time:<integer>,end_time:<integer>}}
		// res - {data_points: [{date: <integer>,remote_controller_charge: <double>, intelligent_flight_battery:<double>, propellers:[<boolean>, <boolean>, <boolean>, <boolean>], micro_sd: <boolean>, gimbal: <boolean>}, ….]}

	});	

	// POST preflight inspection
	_app.post('/api/preflight', function (res, req){

		// req - {remote_controller_charge:<double>, intelligent_flight_battery:<double>, propellers:[<boolean>, <boolean>, <boolean>, <boolean>], micro_sd: <boolean>, gimbal: <boolean>}
		// res - {status: <boolean>}

	});

	// GET inital conditions
	_app.get('/api/initialCondition', function (res, req){
		
		// res - {altitude:<double>, speed:<double>, location:{latitude:<double>, longitude:<double>}}

	});	

	// GET Magnetometer direction
	_app.get('/api/direction', function (res, req){
		
		// res - {mag_x:<double>, mag_y:<double>, mag_z:<double>}

	});	

	// GET location
	_app.get('/api/location', function (res, req){
		
		// res - {latitude:<double>, longitude:<double>}

	});

	// GET safety analysis
	_app.get('/api/safetyStatus', function (res, req){
		
		// res - {operation: {is_unsafe:<boolean>, type: <string>, degree:<double>}, location: {is_unsafe:<boolean>, type: <string>, degree:<double>}}

	});	

	// POST safety analysis
	_app.post('/api/safetyStatus', function (res, req){
		
		// req - {is_unsafe:<boolean>, type: <string>, degree:<double>}
		// res - {status: <boolean>}

	});
};

// export the module as a function
module.exports = initRoutes;