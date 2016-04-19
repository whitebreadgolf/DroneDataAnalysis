/**
@class angular_controller.PostFlightConsole
@memberOf angular_controller
@description This module helps to display the data needed for 
post flight procedures. 
*/
angular.module('UavOpsInterface')
.controller('PostFlightConsoleCtrl', function($scope, $http){
	
	$scope.noFlightData = true;
	$scope.flightDataError = true;
	$scope.searchTerm = '';
	$scope.flights = [];

	/**
	@function flightSearch
	@memberOf angular_controller.PostFlightConsole
	@param {Object} flight - Flight object containing all the corresponding flight data.
	@description This function takes in a flight object and checks whether the object contains
	data that relate to the search terms. If the object doesn't contain the search terms, then 
	the function returns true.
	*/
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