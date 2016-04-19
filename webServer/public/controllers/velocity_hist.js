angular.module('UavOpsInterface')
.controller('VelocityHistCtrl', function ($scope, $http, FlightName){	
	$scope.showChart = false;

    FlightName.getFlights().then(function(flightObj){ 
        $scope.flights = flightObj.flights;
        $scope.noData = flightObj.noData;
        $scope.dataError = flightObj.dataError;
    });

    $scope.searchClicked = function(){
        $scope.showChart = false;
    };

    // load data for id
    $scope.flightSearch = function(_flightId){
        var req = {
            method: 'GET', 
            url: 'api/velocity/'+_flightId, 
        };
        $http(req).then(function(data){
            $scope.showChart = true;

            // set up chart data properly for 3 axis
            var xVals = [];
            var yVals = [];
            var zVals = [];
            var velocities = data.data.data
            for(var i in velocities){
                xVals.push({
                    label: (new Date(velocities[i].created_at)).getTime(),
                    value: velocities[i].vel_x
                });
                yVals.push({
                    label: (new Date(velocities[i].created_at)).getTime(),
                    value: velocities[i].vel_y
                });
                zVals.push({
                    label: (new Date(velocities[i].created_at)).getTime(),
                    value: velocities[i].vel_z
                });
            }
            // sort
            var sortFunc = function(a, b){return a.label-b.label};
            xVals.sort(sortFunc);
            yVals.sort(sortFunc);
            zVals.sort(sortFunc);

            $scope.velocities = [
                {
                    key: "x velocity",
                    values: xVals
                },
                {
                    key: "y velocity",
                    values: yVals
                },
                {
                    key: "z velocity",
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
                    y: function(d){ return d.value; },
                    useInteractiveGuideline: true,
                    xAxis: {
                        axisLabel: 'Time (s)'
                    },
                    yAxis: {
                        axisLabel: 'Velocity (m/s)',
                        tickFormat: function(d){
                            return d3.format('.02f')(d);
                        },
                        axisLabelDistance: 30
                    }
                },
                title: {
                    enable: true,
                    text: 'Drone\'s Velocity Over Time'
                },
                subtitle: {
                    enable: true,
                    text: 'This displays the drone\'s velocity in meters per second over seconds elapsed',
                    css: {
                        'text-align': 'center',
                        'margin': '10px 13px 0px 7px'
                    }
                },
                caption: {
                    enable: false,
                    html: ' ',
                    css: {
                        'text-align': 'justify',
                        'margin': '10px 13px 0px 7px'
                    }
                }
            };
        });
    };
	
});