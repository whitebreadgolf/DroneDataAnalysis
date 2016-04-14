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

    // load data for id
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