/**
@class angular_controller.PostFlightConsole
@memberOf angular_controller
@description This module helps to display the data needed for 
post flight procedures. 
*/
angular.module('UavOpsInterface')
.controller('PostFlightConsoleCtrl', function($scope, $http, $location){
	
	$scope.noFlightData = true;
	$scope.flightDataError = true;
	$scope.searchTerm = '';
	$scope.flights = [];
	$scope.toggleInput = false;
    $scope.searchFilter = '';
    var allFlights = [];

	/**
	@function flightSearch
	@memberOf angular_controller.PostFlightConsole
	@param {Object} flight - Flight object containing all the corresponding flight data.
	@description This function takes in a flight object and checks whether the object contains
	data that relate to the search terms. If the object doesn't contain the search terms, then 
	the function returns true.
	*/
	$scope.searchFlights = function(){
        $scope.flights = [];
        if($scope.toggleInput){
            var startDate = new Date($scope.startDate);
            var endDate = new Date($scope.endDate);
            for(var i in allFlights){
                var date = new Date(allFlights[i].flight_started);
                
                if(date > startDate && date < endDate){
                    $scope.flights.push(allFlights[i]);
                }
            }
        }
        else{
            for(var i in allFlights){
                if(allFlights[i].flight_name.indexOf($scope.searchFilter) > -1){
                    $scope.flights.push(allFlights[i]);
                }
            }       
        }
    }
	$scope.moreFlight = function(_flightId){
		$location.path('/flight_overview/' + _flightId);
	}

	var req = {
		method: 'GET',
		url: 'api/flight'
	};
	$http(req).then(function(data){
		if(data.data.success){
			if(data.data.data.length === 0) $scope.flightDataError = false;
			else{ 
				allFlights = data.data.data;
				$scope.flights = data.data.data;
				$scope.noFlightData = false;
				$scope.flightDataError = false;
			}
		} 
		else $scope.noFlightData = false;
	});
});