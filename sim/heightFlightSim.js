var http = require('http');
var fs = require('fs');
var sleep = require('sleep');
var querystring = require('querystring');
var DOMAIN = 'localhost';

var authenticateUser = function(){
	var post_data = querystring.stringify({username: 'karl', pass: 'karl'});

	// An object of options to indicate where to post to
	var post_options = {
		host: DOMAIN, port: '5000', path: '/api/authenticate', method: 'POST',
		headers: {
		  'Content-Type': 'application/x-www-form-urlencoded',
		  'Content-Length': Buffer.byteLength(post_data)
		}
	};

	var response = '';
	// Set up the request
	var post_req = http.request(post_options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			response+=chunk;
		});
		res.on('end', function(){
			response = JSON.parse(response);
			getCurrentFlight(response.user._id);
		});
	});

	// post the data
	post_req.write(post_data);
	post_req.end();
}

var getCurrentFlight = function(_id){
	var post_options = {
		host: DOMAIN, port: '5000', path: '/api/curentFlight/'+_id, method: 'GET',	
		headers: {
		  'Content-Type': 'application/x-www-form-urlencoded',
		  'Content-Length': 0
		}
	}; 

	var response = '';
	var post_req = http.request(post_options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			response+=chunk;
		});
		res.on('end', function(){
			response = JSON.parse(response);
			if(response.success) startDataFlow(_id, response.data)
			else{ 
				console.log('no flight');
				sleep.sleep(5);
				getCurrentFlight(_id);
			}
		});
	});
	post_req.end();
}

var startDataFlow = function(_id, _flightId){

	// read file first
	fs.readFile('flight_data_big.csv', 'utf8', function (_err, _data){
		if (_err) throw err;
		var rows = _data.split('\n');
		dataFlow(_id, _flightId, rows, 0);
	});
}
var dataFlow = function(_id, _flightId, _rows, _fd){
	var post_data = querystring.stringify({
	    user_id: _id,
	    type: 'single',
	    csv_string: _rows[_fd],
	    flight_id: _flightId
	});
	console.log(_rows[_fd]);
	var post_options = {
		host: DOMAIN, port: '5000', path: '/api/data', method: 'POST',
		headers: {
		  'Content-Type': 'application/x-www-form-urlencoded',
		  'Content-Length': Buffer.byteLength(post_data)
		}
	};

	// Set up the request
	var response = '';
	var post_req = http.request(post_options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			response += chunk;	
		});
		res.on('end', function(){
			response = JSON.parse(response);
			console.log(response.message);
	 		sleep.sleep(1);
	 		dataFlow(_id, _flightId, _rows, _fd+1);
		});
	});	

	post_req.write(post_data);
	post_req.end();
}

authenticateUser();
