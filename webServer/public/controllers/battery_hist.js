angular.module('UavOpsInterface')
.controller('BatteryHistCtrl', function ($scope, $http, FlightName, $uibModal){	
	
    $scope.showChart = false;
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
  
    $scope.flightSearch = function(_flightId){
        var req = {
            method: 'GET', 
            url: 'api/battery/'+_flightId, 
        };
        $http(req).then(function(data){
            $scope.showChart = true;
            $scope.showBack = true;
            var batteries = [];
            for(var i in data.data.data){
                batteries.push({
                    label: (new Date(data.data.data[i].created_at)),
                    value: data.data.data[i].battery
                });
            }

            // sort
            var sortFunc = function(a, b){return a.label-b.label};
            batteries.sort(sortFunc);
            $scope.batteries = [
                {
                    key: "battery levels",
                    values: batteries
                }
            ];

            $scope.options = {
                chart: {
                    type: 'lineChart',
                    height: 450,
                    margin : {
                        top: 20,
                        right: 20,
                        bottom: 40,
                        left: 55
                    },
                    lines: {
                        dispatch: {
                            elementClick: handleGraphClick
                        }
                    },
                    x: function(d){ return d.label; },
                    y: function(d){ return d.value; },
                    useInteractiveGuideline: true,
                    xAxis: {
                        axisLabel: 'Time'
                    },
                    yAxis: {
                        axisLabel: 'Charge (%)',
                        tickFormat: function(d){
                            return d3.format('.02f')(d);
                        },
                        axisLabelDistance: -10
                    }
                },
                title: {
                    enable: true,
                    text: 'Drone Battery Charge Over Time'
                }
            };
        });

        var handleGraphClick = function (event) {
            var time = point = event[0].point.label;
            var rerouteTime = '/data_overview/' + _flightId + '/' + (new Date(time)).getTime();
            var rerouteFlight = '/flight_overview/' + _flightId;
            var text = 'You selected a point from a battery charge graph. Would you like to see an overview of the flight? Or see all datapoints collected with the timestamp: ';
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'templates/histGraphModal.html',
                controller: 'HistGraphModal',
                size: 'small',
                resolve: {
                    text: function(){ return text; },
                    time: function(){ return time; },
                    rerouteTime: function(){ return rerouteTime; },
                    rerouteFlight: function(){ return rerouteFlight; }
                }
            });
        };
    }; 
});