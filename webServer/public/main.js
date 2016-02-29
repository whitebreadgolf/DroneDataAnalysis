angular.module('UavOpsInterface', ['ngRoute', 'nvd3'])
	.config(function ($routeProvider) {
		$routeProvider
			.when('/speed', {
				templateUrl: 'templates/speed.html',
				controller: 'SpeedCtrl'
			})
			.when('/altitude', {
				templateUrl: 'templates/altitude.html',
				controller: 'AltitudeCtrl'
			})
			.when('/preflight', {
				templateUrl: 'templates/preflight.html',
				controller: 'PreFlightCtrl'
			})
			.when('/', {
				templateUrl: 'templates/home.html',
				controller: 'HomeCtrl'
			})
			.otherwise({
				redirectTo: '/'
			});

	});
