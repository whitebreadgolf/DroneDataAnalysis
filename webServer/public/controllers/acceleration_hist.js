angular.module('UavOpsInterface')
.controller('AccelerationHistCtrl', function ($scope, $http, FlightName, $uibModal){	
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
            url: 'api/acceleration/'+_flightId, 
        };

        /**
        @member VelocityChartOptions
        @memberOf angular_controller.Velocity
        @description This options object governs the appearance of the velocity chart.
        */
        $http(req).then(function(data){
            $scope.showChart = true;
            $scope.showBack = true;

            // set up chart data properly for 3 axis
            var xVals = [];
            var yVals = [];
            var zVals = [];
            var accelerations = data.data.data
            for(var i in accelerations){
                xVals.push({
                    label: (new Date(accelerations[i].created_at)).getTime(),
                    value: accelerations[i].acc_x
                });
                yVals.push({
                    label: (new Date(accelerations[i].created_at)).getTime(),
                    value: accelerations[i].acc_y
                });
                zVals.push({
                    label: (new Date(accelerations[i].created_at)).getTime(),
                    value: accelerations[i].acc_z
                });
            }
            // sort
            var sortFunc = function(a, b){return a.label-b.label};
            xVals.sort(sortFunc);
            yVals.sort(sortFunc);
            zVals.sort(sortFunc);

            $scope.accelerations = [
                {
                    key: "x Directional Speed Per Unit Time",
                    values: xVals
                },
                {
                    key: "y Directional Speed Per Unit Time",
                    values: yVals
                },
                {
                    key: "z Directional Speed Per Unit Time",
                    values: zVals
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
                    x: function(d){ return d.label; },
                    y: function(d){ return d.value*0.514444444; },
                    lines: {
                        dispatch: {
                            elementClick: handleGraphClick
                        }
                    },
                    useInteractiveGuideline: true,
                    xAxis: {
                        axisLabel: 'Time'
                    },
                    yAxis: {
                        axisLabel: 'Directional Speed Per Unit Time (knots per second)',
                        tickFormat: function(d){
                            return d3.format('.02f')(d);
                        },
                        axisLabelDistance: 30
                    }
                },
                title: {
                    enable: true,
                    text: 'Drone\'s Directional Speed Per Unit Time Over Time'
                }
            };
        });
        var handleGraphClick = function (event) {
            var time = point = event[0].point.label;
            var rerouteTime = '/data_overview/' + _flightId + '/' + (new Date(time)).getTime();
            var rerouteFlight = '/flight_overview/' + _flightId;
            var text = 'You selected a point from a acceleration graph. Would you like to see an overview of the flight? Or see all datapoints collected with the timestamp: ';
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