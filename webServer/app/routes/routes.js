/**
@module routes - a module to initalize the web API routes
*/

/**
@requires account
@requires altitude
@requires daylight
@requires direction
@requires initialConditions
@requires location
@requires preflight
@requires safetyStatus
@requires speed
@requires passport
@requires user
@requires regulationConfig
*/

var account = require('./../controllers/account');
var altitude = require('./../controllers/altitude');
var daylight = require('./../controllers/daylight');
var direction = require('./../controllers/direction');
var initialConditions = require('./../controllers/initialConditions');
var location = require('./../controllers/location');
var preflight = require('./../controllers/preflight');
var safetyStatus = require('./../controllers/safetyStatus');
var speed = require('./../controllers/speed');

var passport = require('passport');
var User = require('../models/user');

var regulationConfig = require('../config/regulationConfig');

/**
@function initRoutes - to initialize all 
@alias routes/initRoutes
@param {object} _app - the express app object
*/
var initRoutes = function (_app){

	// GET configuremap
	_app.get('/api/configuremap', function (req, res){

		// req - {}
		// res - {status: ("error"|"success")}

		if(!(req.user)){ res.json({status: 'error'}); }
		else{
			account.isUserMapConfigured(req.user._id, function(_status){		
				res.json({status: _status});
			});
		}
	});

	// POST configuremap
	_app.post('/api/configuremap', function (req, res){

		// req - {latLngStart: <object>, latLngEnd: <object>}
		// res - {status: ("error"|"success")}

		if(req.user){
			account.configureUserMap(req.body.latLngStart, req.body.latLngEnd, req.user._id, function(_status){		
				res.json({status: _status});	
			});
		}
	});

	// POST login
	_app.post('/api/login', function (req, res){

		// req - {username: <string>, pass: <string>}
		// res - {status: ("error"|"success")}

		User.authenticate()(req.body.username, req.body.pass, function (err, user, options) {
	        if (user === false) {
	            res.json({
	                message: options.message,
	                success: false
	            });
	        } else {
	            req.login(user, function (err) {
	                res.json({
	                    success: true,
	                    user: user
	                });
	            });
	        }
	    });
	});

	// GET login
	_app.get('/api/login', function (req, res){

		// res - {user: <Object>}

		res.json(req.user);
	});

	// POST createprofile
	_app.post('/api/createprofile', function (req, res){

		// req - {username: <string>, pass: <string>, name:<string>}
		// res - {status: <string>}

		User.register(new User({
			username: req.body.username,
			name: req.body.name,
			password: req.body.pass,
			admin: false
		}), req.body.pass, function(err) {
			if (err) {
				console.log('error while user register!', err);
				res.json('user not registered');
			}
			else{
				console.log('user registered!');
				res.json('user registered');
			}
		});
	});

	// GET speed
	_app.get('/api/speed', function (req, res){

		// req - {time_interval:{start_time:<integer>,end_time:<integer>}}
		// res - {data_points: [<double>, ….]}
		
	});

	// GET altitude
	_app.get('/api/altitude', function (req, res){
		
		// req - time_interval:{start_time:<integer>,end_time:<integer>}
		// res - {data_points: [<double>, ….]}

	});

	// GET daylight
	_app.get('/api/daylight', function (req, res){
		
		// res - {is_daylight: <boolean>}

	});	

	// GET preflight inspections
	_app.get('/api/preflight', function (req, res){
		
		// res - {data_points: [{date: <integer>,remote_controller_charge: <double>, intelligent_flight_battery:<double>, propellers:[<boolean>, <boolean>, <boolean>, <boolean>], micro_sd: <boolean>, gimbal: <boolean>}, ….]}

		preflight.getAllFlightsWithoutCollectedData(function(err, flights){

			if(err){
				res.json({success: false});
			}
			else res.json({success: true, data: flights});
		});
	});	

	


	// POST preflight inspection
	_app.post('/api/preflight', function (req, res){

		// req - {remote_controller_charge:<double>, intelligent_flight_battery:<double>, propellers:[<boolean>, <boolean>, <boolean>, <boolean>], micro_sd: <boolean>, gimbal: <boolean>}
		// res - {status: <boolean>}

		if(req.user){
			 preflight.addPreflightInspection(req.body._id, req.body.flight_name, req.body.remote_controller_charge, req.body.intelligent_flight_battery, req.body.propeller_0, req.body.propeller_1, req.body.propeller_2, req.body.propeller_3, req.body.micro_sd, req.body.gimbal, function (_status){
			 	res.json(_status);
			 });
		}
		else res.json({message: "pre-flight inspection not recorded, user must be logged in", success: false}); 	
	});

	// POST flight simulator
	_app.post('/api/flightsim', function (req, res){

		// req - {ext: <string>, type: <string>}
		// res - {status: <string>}

		// init the mock sp input
		if(req.user){

			if(!regulationConfig.cur_flight[req.user._id]){
				preflight.startFlightSimulation(req.user._id, req.body.ext, req.body.type, function(){
					res.json({success: true, message: 'simulation started'});
				});
			}
			else res.json({message: "a flight has already been started", success: false}); 
		}
		else res.json({message: "simulation not started, user must be logged in", success: false}); 	
	});

	// POST end flight
	// this used to mark the end of a flight
	_app.post('/api/endflight', function (req, res){

		// res - {status: <boolean>}

		// end the simulation
		if(req.user){
			preflight.endFlightWithPilotId(req.user._id, function(){
				res.json({message: 'simulation ended', success: true});
			});
		}
		else res.json({message: "simulation not ended, user must be logged in", success: false}); 
	});

	// GET inital conditions
	_app.get('/api/initialCondition', function (req, res){
		
		// res - {altitude:<double>, speed:<double>, location:{latitude:<double>, longitude:<double>}}

	});	

	// GET Magnetometer direction
	_app.get('/api/direction', function (req, res){
		
		// res - {mag_x:<double>, mag_y:<double>, mag_z:<double>}

	});	

	// GET location
	_app.get('/api/location', function (req, res){
		
		// res - {latitude:<double>, longitude:<double>}

	});

	// GET safety analysis
	_app.get('/api/safetyStatus', function (req, res){
	
		// res - {operation: {is_unsafe:<boolean>, type: <string>, degree:<double>}, location: {is_unsafe:<boolean>, type: <string>, degree:<double>}}

	});	

	// POST safety analysis
	_app.post('/api/safetyStatus', function (req, res){

		// req - {is_unsafe:<boolean>, type: <string>, degree:<double>}
		// res - {status: <boolean>}

	});
};

// export the module as a function
module.exports = initRoutes;