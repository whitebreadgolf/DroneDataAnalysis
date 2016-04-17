/**
@class angular_controller.LocationHistory
@memberOf angular_controller
@description This module allows the user to search for and display their location history
associated with a specific flight.
*/
angular.module('UavOpsInterface')
.controller('LocationHistCtrl', function ($scope, $http, FlightName){	
	
    $scope.showChart = false;
    $scope.allMarkers = [];
    
    FlightName.getFlights().then(function(flightObj){ 
        $scope.flights = flightObj.flights;
        $scope.noData = flightObj.noData;
        $scope.dataError = flightObj.dataError;
    });

    $scope.searchClicked = function(){
        $scope.showChart = false;
        $scope.allMarkers = [];
    };

    /**
    @function flightSearch
    @memberOf angular_controller.LocationHistory
    @param {String} _flightId - Represents a single stored or running flight.
    @description This function takes in a flight id and shows all the corresponding
    historical data associated with the flight.
    */
    $scope.flightSearch = function(_flightId){
        var req = {
            method: 'GET', 
            url: 'api/location/'+_flightId, 
        };
        $http(req).then(function(data){
            console.log(data.data);
            $scope.showChart = true;
            $scope.allMarkers = data.data.data;
        });
    };
});