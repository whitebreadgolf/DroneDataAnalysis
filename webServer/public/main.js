angular.module('UavOpsInterface', ['ngRoute', 'ngMap', 'nvd3', 'ui-notification'])
.config(function ($routeProvider, NotificationProvider) {
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
		.when('/preflight', {
			templateUrl: 'templates/preflight.html',
			controller: 'PreflightCtrl'
		})
		.when('/flightconsole', {
			templateUrl: 'templates/flightconsole.html',
			controller: 'FlightConsoleCtrl'
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
		.when('/legal', {
			templateUrl: 'templates/legal.html',
			controller: 'LegalCtrl'
		})
		.otherwise({
			redirectTo: '/'
		});

	NotificationProvider.setOptions({
        delay: 2000,
        startTop: 20,
        startRight: 10,
        verticalSpacing: 20,
        horizontalSpacing: 20,
        positionX: 'right',
        positionY: 'bottom'
    });
})
.run(function (Websocket) {
       
	// create on run
	Websocket.create();
});
