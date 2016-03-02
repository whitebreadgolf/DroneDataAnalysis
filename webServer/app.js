/**
@module app 
*/

/**
@requires express
@requires body-parser
@requires process
@requires express-session
@requires websocket
*/

// import necessary modules for a basic web server
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');


// setup app listening an settings
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());       
app.use(bodyParser.urlencoded({ extended: true })); 

app.set('trust proxy', 1); // trust first proxy
app.use(session({
	secret: 'keyboard cat',
	duration: 30 * 60 * 1000,
	resave: false,
	saveUninitialized: true,
	cookie: { 
		maxAge: 60000 
	},
	rolling: true
}));

// setup and start db
require('./app/models/models')(app);

// setup api routes
require('./app/routes/routes')(app);

/*

Testing section, not finalized code

*/

/*

END testing section

*/

/*

END testing section

*/

//listen
app.listen(process.env.PORT || 5000);