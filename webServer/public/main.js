angular.module('UavOpsInterface', ['ngRoute', 'ngMap', 'nvd3'])
.config(function ($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'templates/home.html',
			controller: 'HomeCtrl'
		})
		.when('/login', {
			templateUrl: 'templates/login.html',
			controller: 'LoginCtrl'
		})
		.when('/newprofile', {
			templateUrl: 'templates/newprofile.html',
			controller: 'NewProfileCtrl'
		})
		.when('/configmap', {
			templateUrl: 'templates/configmap.html',
			controller: 'ConfigMapCtrl'
		})
		.when('/addobstacle', {
			templateUrl: 'templates/addobstacle.html',
			controller: 'AddObstacleCtrl'
		})
		.when('/speed', {
			templateUrl: 'templates/speed.html',
			controller: 'SpeedCtrl'
		})
		.when('/altitude', {
			templateUrl: 'templates/altitude.html',
			controller: 'AltitudeCtrl'
		})
		.when('/flight', {
			templateUrl: 'templates/flight.html',
			controller: 'FlightCtrl'
		})
		.when('/notifications', {
			templateUrl: 'templates/notifications.html',
			controller: 'NotificationsCtrl'
		})
		.when('/history', {
			templateUrl: 'templates/history.html',
			controller: 'HistoryCtrl'
		})
		.when('/configuration', {
			templateUrl: 'templates/configuration.html',
			controller: 'ConfigurationCtrl'
		})
		.when('/pre-flight', {
			templateUrl: 'templates/pre-flight.html',
			controller: 'Pre-FlightCtrl'
		})
		.otherwise({
			redirectTo: '/'
		});


})
.run(function (Websocket) {
       
	// create on run
	Websocket.create();
});
