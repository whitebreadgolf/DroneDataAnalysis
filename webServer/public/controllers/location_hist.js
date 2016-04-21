/**
@class angular_controller.LocationHistory
@memberOf angular_controller
@description This module allows the user to search for and display their location history
associated with a specific flight.
@requires angular_factories.FlightName
*/
angular.module('UavOpsInterface')
.controller('LocationHistCtrl', function ($scope, $http, FlightName, $uibModal){	
	
    $scope.showChart = false;
    $scope.allMarkers = [];
    $scope.toggleInput = false;
    $scope.showBack = false;
    $scope.searchFilter = '';
    var allFlights = [];

    FlightName.getFlights().then(function(flightObj){ 
        $scope.flights = flightObj.flights;
        allFlights = flightObj.flights;
        $scope.noData = flightObj.noData;
        $scope.dataError = flightObj.dataError;
    });

    $scope.backClicked = function(){
        $scope.showChart = false;
        $scope.showBack = false;
        $scope.allMarkers = [];
    };
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
            $scope.showChart = true;
            $scope.showBack = true;
            $scope.allMarkers = data.data.data;
        });

        $scope.handleGraphClick = function (evt, _time) {
            var time = _time.created_at;
            var reroute = '/data_overview/' + _flightId + '/' + (new Date(time)).getTime();
            var text = 'You selected a point from a location map. Would you like to see all datapoints collected with the timestamp: ';
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'templates/histGraphModal.html',
                controller: 'HistGraphModal',
                size: 'small',
                resolve: {
                    text: function(){ return text; },
                    time: function(){ return time; },
                    reroute: function(){ return reroute; }
                }
            });
        };
    };
});