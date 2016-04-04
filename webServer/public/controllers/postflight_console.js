angular.module('UavOpsInterface')
.controller('PostFlightConsoleCtrl', function($scope, $http){
	
	$scope.noFlightData = true;
	$scope.flightDataError = true;
	$scope.searchTerm = '';
	$scope.flights = [];
	$scope.searchFilter = function (flight) { 
		if($scope.searchTerm === '') return true;
		else{
			if(flight && flight.flight_name && flight.flight_name.includes($scope.searchTerm)) return true;
			else return false;
		}
	};

	var req = {
		method: 'GET',
		url: 'api/flight'
	};

	$http(req).then(function(data){
		if(data.data.success){
			if(data.data.data.length === 0) $scope.flightDataError = false;
			else{ 
				$scope.flights = data.data.data;
				$scope.noFlightData = false;
				$scope.flightDataError = false;
			}
		} 
		else $scope.noFlightData = false;
	});
});