/**
@module appMain 
*/

// import necessary modules for a basic web server
var express = require('express');
var app = express();
var bodyParser = require('body-parser')

// setup app listening an settings
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());       
app.use(bodyParser.urlencoded({ extended: true })); 

// setup api routes
require('./app/routes/routes')(app);

//listen
app.listen(process.env.PORT || 5000);