/**
@module routes/routes 
@description a module to initalize the web API routes
@requires controllers/account
@requires controllers/altitude
@requires controllers/daylight
@requires controllers/direction
@requires controllers/location
@requires controllers/flight
@requires controllers/safetyStatus
@requires controllers/velocity
@requires passport
@requires models/user
@requires models/airport
@requires config/regulationConfig
@requires analytics/buildingProximity
@requires analytics/dataFilter
*/

var account = require('./../controllers/account');
var altitude = require('./../controllers/altitude');
var daylight = require('./../controllers/daylight');
var direction = require('./../controllers/direction');
var location = require('./../controllers/location');
var flight = require('./../controllers/flight');
var safetyStatus = require('./../controllers/safetyStatus');
var velocity = require('./../controllers/velocity');
var simulation = require('./../controllers/simulation');
var passport = require('passport');
var User = require('../models/user');
var Airport = require('../models/airport');
var regulationConfig = require('../config/regulationConfig');
var buildingProximity = require('../analytics/buildingProximity');
var dataFilter = require('../analytics/dataFilter');

/**
@function initRoutes 
@description initializes all routes with express app
@alias routes/routes:initRoutes
@param {Object} _app - the express app object
*/
var initRoutes = function (_app){

	// POST addobsitcle
	_app.post('/api/addobstacle', function (req, res){

		if(!(req.user)) res.json({success: false, status: 'user'}); 
		else{
			buildingProximity.addObsticleWithWidth(req.user._id, req.body.lat, req.body.lon, req.body.name, req.body.radius, function(status){
			 	res.json(status);
			});
		}
	});

	// GET configuremap
	_app.get('/api/configuremap', function (req, res){

		// res - {status: ("error"|"success")}

		if(!(req.user)) res.json({success: false, status: 'user'}); 
		else{
			account.getUserMapConfigured(req.user._id, function(_statusObj){		
				res.json(_statusObj);
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
	_app.post('/api/authenticate', function (req, res){

		// req - {username: <string>, pass: <string>}
		// res - {success: <boolean>, message: <string>}
		
		User.authenticate()(req.body.username, req.body.pass, function (err, user, options) {
	        if (user === false) {
	            res.json({
	                message: options.message,
	                success: false
	            });
	        } 
	        else {       
	            res.json({
	                success: true,
	                user: user
	            });
	        }
	    });
	});

	// POST login
	_app.post('/api/login', function (req, res){

		// req - {username: <string>, pass: <string>}
		// res - {success: <boolean>, message: <string>}

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

	// POST login
	_app.post('/api/logout', function (req, res){

		// res - {success: <boolean>, message: <string>}

		req.logout();
		res.json({success: true, message: 'user logged out'});
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
			admin: false,
			reg_id: req.body.reg_id
		}), req.body.pass, function(err) {
			if (err) {
				res.json({success: false, message:'user not registered'});
			}
			else{
				res.json({success: true, message:'user registered'});
			}
		});
	});

	//////////////////////////////////////////////////////////////////////
	/////////// GET endpoints for basic flight data paramters ////////////
	//////////////////////////////////////////////////////////////////////

	// GET velocity
	_app.get('/api/velocity/:id', function (req, res){

		// res - {data_points: [<double>, ….]}
		
		if(req.user && req.params.id){
			velocity.getAllVelocitiesForFlightId(req.params.id, function(velocities){
				res.json(velocities);
			});
		}
		else res.json({success: false, data: 'user must log in'});
	});

	// GET altitude
	_app.get('/api/altitude/:id', function (req, res){
		
		// res - {data_points: [<double>, ….]}

		if(req.user && req.params.id){
			altitude.getAllAltitudesForFlightId(req.params.id, function(altitudes){
				res.json(altitudes);
			});
		}
		else res.json({success: false, data: 'user must log in'});
	});


	// GET location
	_app.get('/api/location/:id', function (req, res){
		
		// res - {data_points: [<double>, ….]}

		if(req.user && req.params.id){
			location.getAllLocationsForFlightId(req.params.id, function(locations){
				res.json(locations);
			});
		}
	});

	// GET safety analysis
	_app.get('/api/safetyStatus/:id', function (req, res){
	
		// res - {data_points: [<double>, ….]}

		if(req.user && req.params.id){
			safetyStatus.getSafetyStatus(req.params.id, function(statuses){
				res.json(statuses);
			});
		}
		else res.json({success: false, message: 'user must log in'});
	});	

	//////////////////////////////////////////////////////////////////////////
	/////////// END GET endpoints for basic flight data paramters ////////////
	//////////////////////////////////////////////////////////////////////////

	//////////////////////////////////////////////////////////////////////////
	///////////////// GET endpoints for airport interaction //////////////////
	//////////////////////////////////////////////////////////////////////////

	_app.get('/api/airports/:id', function (req, res){
	
		// res - {data_points: [<double>, ….]}

		if(req.user && req.params.id){
			Airport.find({'user':req.params.id}, function(_err, _airports){
				res.json({success: true, data: _airports});
			});
		}
		else res.json({success: false, message: 'user must log in'});
	});

	//////////////////////////////////////////////////////////////////////////
	/////////////// END GET endpoints for airport interaction ////////////////
	//////////////////////////////////////////////////////////////////////////

	// GET flight id for user id
	_app.get('/api/curentFlight/:id', function (req, res){	
		if(regulationConfig.cur_flight[req.params.id] && regulationConfig.cur_flight[req.params.id].flight_type.real_time){
			res.json({success: true, data: regulationConfig.cur_flight[req.params.id].flight_type.real_time});
		}
		else{
			res.json({message: "flight not started, user must manually start flight", success: false});
		}
	});

	// GET flight inspections
	_app.get('/api/flight', function (req, res){
		
		// res - {data_points: [{date: <integer>,remote_controller_charge: <double>, intelligent_flight_battery:<double>, propellers:[<boolean>, <boolean>, <boolean>, <boolean>], micro_sd: <boolean>, gimbal: <boolean>}, ….]}

		if(req.user){
			flight.getAllFlightsWithCollectedData(req.user._id, function(err, flights){

				if(err) res.json({success: false});
				else res.json({success: true, data: flights});
			});
		}
		else{
			res.json({message: "flight data not available, user must be logged in", success: false});
		}
	});

	// POST flight inspections - starts/ends a flight
	_app.post('/api/flight', function (req, res){
		
		// req - {action: (start|end), type: (real_time|decoding), flight_id: <String>}
		// res - {success: <boolean>, message: <string>}

		if(req.user){
			if(req.body.action === 'start'){
				if(req.body.type === 'real_time'){
					flight.startRTFlight(req.user._id, req.body.flight_id, function(status){
						console.log(status);
						res.json(status);
					});
				}
				else if(req.body.type === 'decoding'){
					flight.startDFlight(req.user._id, req.body.flight_id, function(status){
						res.json(status);
					});
				}
				else res.json({message: "cannot start flight, type not recognized", success: false});
			}
			else if(req.body.action === 'end'){
				if(req.body.type === 'real_time'){
					flight.endRTFlight(req.user._id, req.body.flight_id, function(status){
						res.json(status);
					});
				}
				else if(req.body.type === 'decoding'){
					flight.endDFlight(req.user._id, req.body.flight_id, function(status){
						res.json(status);
					});
				}
				else res.json({message: "cannot end flight, type not recognized", success: false});
			}
			else res.json({message: "cannot modify flight, action not recognized", success: false});
		}
		else res.json({message: "cannot modify flight, user must be logged in", success: false});
	});	

	// GET preflight inspections
	_app.get('/api/preflight', function (req, res){
		
		// res - {data_points: [{date: <integer>,remote_controller_charge: <double>, intelligent_flight_battery:<double>, propellers:[<boolean>, <boolean>, <boolean>, <boolean>], micro_sd: <boolean>, gimbal: <boolean>}, ….]}
		
		if(req.user){
			flight.getAllFlightsWithoutCollectedData(req.user._id, function(err, flights){

				if(err) res.json({success: false});
				else res.json({success: true, data: flights});
			});
		}
		else{
			res.json({message: "pre-flight data not available, user must be logged in", success: false});
		}
	});	

	// POST preflight inspection
	_app.post('/api/preflight', function (req, res){

		// req - {remote_controller_charge:<double>, intelligent_flight_battery:<double>, propellers:[<boolean>, <boolean>, <boolean>, <boolean>], micro_sd: <boolean>, gimbal: <boolean>}
		// res - {status: <boolean>}

		if(req.user){
			 flight.addPreflightInspection(req.user._id, req.body.flight_name, req.body.remote_controller_charge, req.body.intelligent_flight_battery, req.body.propeller_0, req.body.propeller_1, req.body.propeller_2, req.body.propeller_3, req.body.micro_sd, req.body.gimbal, function (_status){
			 	res.json(_status);
			 });
		}
		else res.json({message: "pre-flight inspection not recorded, user must be logged in", success: false}); 	
	});

	// DELETE preflight inspection
	_app.delete('/api/preflight/:id', function (req, res){
		if(req.user){
			 flight.removePreflightInspection(req.params.id, function (_status){
			 	res.json(_status);
			 });
		}
		else res.json({message: "pre-flight inspection not removed, user must be logged in", success: false});
	});

	//////////////////////////////////////////////////////////////////////
	//////////////////// Flight Simulator endpoints //////////////////////
	//////////////////////////////////////////////////////////////////////

	// POST flight simulator
	// _app.post('/api/simulation/start', function (req, res){

	// 	// req - {ext: <string>, type: <string>}
	// 	// res - {status: <string>}

	// 	if(req.user){
	// 		if(!regulationConfig.cur_flight[req.user._id]){
	// 			simulation.startFlightSim(req.user._id, req.body.ext, req.body.type, function(){
	// 				res.json({success: true, message: 'simulation started'});
	// 			});
	// 		}
	// 		else res.json({message: "a flight has already been started", success: false}); 
	// 	}
	// 	else res.json({message: "simulation not started, user must be logged in", success: false}); 	
	// });

	// POST end flight
	// this used to mark the end of a flight
	// _app.post('/api/simulation/end', function (req, res){

	// 	// res - {status: <boolean>}

	// 	// end the simulation
	// 	if(req.user){
	// 		simulation.endSimFlightWithPilotId(req.user._id, function(){
	// 			res.json({message: 'simulation ended', success: true});
	// 		});
	// 	}
	// 	else res.json({message: "simulation not ended, user must be logged in", success: false}); 
	// });	

	//////////////////////////////////////////////////////////////////////
	////////////////// END Flight Simulator endpoints ////////////////////
	//////////////////////////////////////////////////////////////////////

	//////////////////////////////////////////////////////////////////////
	///////////////////// Data Submission Endpoints //////////////////////
	//////////////////////////////////////////////////////////////////////

	_app.post('/api/data', function (req, res){

		// req - {type: ('single'|'multi'), csv_string: <string>, user_id: <string>, flight_id: <string>}
		// res - {success: <boolean>, data: <string>}

		// user must be logged in or a key provided
		if(req.user || req.body.user_id){

			// set correct user id from req body or session 
			var user_id;
			var flight_id = req.body.flight_id;
			var csv_string = req.body.csv_string;
			var type = req.body.type;
			if(req.user)
				user_id = req.user._id;
			else if(req.body.user_id)
				user_id = req.body.user_id;

			// forward to data filter based on type
			if(type === 'single'){
				dataFilter.routeSingleCsvString(user_id, flight_id, csv_string, function(status){
					res.json(status);
				}); 
			}
			else if(type === 'multi'){
				dataFilter.routeMultiCsvString(user_id, flight_id, csv_string, function(status){
					res.json(status);
				});				
			}
			else res.json({message: "data not collected, data type not recognized", success: false});
		}
		else res.json({message: "data not collected, user must be logged in", success: false}); 
	});

	//////////////////////////////////////////////////////////////////////
	/////////////////// END Data Submission Endpoints ////////////////////
	//////////////////////////////////////////////////////////////////////
};

// export the module as a function
module.exports = initRoutes;