angular.module('UavOpsInterface', ['ngRoute', 'ngMap', 'nvd3', 'ui-notification', 'ngFileUpload', 'ngProgress'])
.config(function ($routeProvider, NotificationProvider) {
	$routeProvider

		// user settings
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
		.when('/add_obstacle', {
			templateUrl: 'templates/add_obstacle.html',
			controller: 'AddObstacleCtrl'
		})

		// velocity
		.when('/velocity', {
			templateUrl: 'templates/velocity.html',
			controller: 'VelocityCtrl'
		})
		.when('/velocity_hist', {
			templateUrl: 'templates/velocity_hist.html',
			controller: 'VelocityHistCtrl'
		})

		// altitude
		.when('/altitude', {
			templateUrl: 'templates/altitude.html',
			controller: 'AltitudeCtrl'
		})
		.when('/altitude_hist', {
			templateUrl: 'templates/altitude_hist.html',
			controller: 'AltitudeHistCtrl'
		})

		// flight
		.when('/flight', {
			templateUrl: 'templates/flight.html',
			controller: 'FlightCtrl'
		})
		.when('/preflight', {
			templateUrl: 'templates/preflight.html',
			controller: 'PreflightCtrl'
		})
		.when('/flight_console', {
			templateUrl: 'templates/flight_console.html',
			controller: 'FlightConsoleCtrl'
		})
		.when('/postflight_console', {
			templateUrl: 'templates/postflight_console.html',
			controller: 'PostFlightConsoleCtrl'
		})

		// notifications
		.when('/notifications', {
			templateUrl: 'templates/notifications.html',
			controller: 'NotificationsCtrl'
		})
		.when('/notifications_hist', {
			templateUrl: 'templates/notifications_hist.html',
			controller: 'NotificationsHistCtrl'
		})
		
		// home page and legal
		.when('/legal', {
			templateUrl: 'templates/legal.html',
		})
		.otherwise({
			redirectTo: '/legal'
		});

	NotificationProvider.setOptions({
        delay: 2000,
        startTop: 20,
        startRight: 10,
        verticalSpacing: 20,
        horizontalSpacing: 20,
        positionX: 'right',
        positionY: 'top'
    });
})
.run(function (Websocket) {
       
	// create on run
	Websocket.create();
});
