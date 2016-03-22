angular.module('UavOpsInterface')
.controller('FlightConsoleCtrl', function($scope, $http){
	
	$scope.flightData = false;

	var req = {
		method: 'GET',
		url: 'api/preflight'
	}

	$http(req).then(function(data){
		if(data.data.success){
			$scope.flightData = true;
			$scope.flights = data.data.data;
		} 
	});
});