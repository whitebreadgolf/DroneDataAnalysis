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


// setup app listening and settings
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());       
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(session({
	secret: 'keyboard cat',
 	resave: false,
 	saveUninitialized: true
}));

require('./app/config/passport')(app);

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

//listen
app.listen(process.env.PORT || 5000);