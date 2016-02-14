/**
@module appMain 
*/

// import necessary modules for a basic web server

/**
@requires express
@requires body-parser
@requires process
*/
var express = require('express');
var bodyParser = require('body-parser')
var sp_process = require('./app/controllers/process');

// setup app listening an settings
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());       
app.use(bodyParser.urlencoded({ extended: true })); 

// setup api routes
require('./app/routes/routes')(app);

/*

Testing section, not finalized code

*/

// init the mock sp input
sp_process.initializeMock();

//listen
app.listen(process.env.PORT || 5000);