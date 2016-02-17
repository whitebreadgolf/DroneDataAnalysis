/**
@module app 
*/

/**
@requires express
@requires body-parser
@requires process
*/

// import necessary modules for a basic web server
var express = require('express');
var bodyParser = require('body-parser')

// initalize communication from c++ program
var sp_process = require('./app/interProcessCommunication/process');

// setup app listening an settings
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());       
app.use(bodyParser.urlencoded({ extended: true })); 

// setup api routes
require('./app/routes/routes')(app);

// setup and start db
require('./app/models/models')

/*

Testing section, not finalized code

*/

// init the mock sp input
sp_process.initializeMock();

/*

END testing section

*/

//listen
app.listen(process.env.PORT || 5000);