angular.module('UavOpsInterface')
.controller('AltitudeHistCtrl', function ($scope, $http, FlightName){	
	
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
            url: 'api/altitude/'+_flightId, 
        };
        $http(req).then(function(data){
            $scope.showChart = true;

            var altitudes = [];
            for(var i in data.data.data){
                altitudes.push({
                    label: (new Date(data.data.data[i].created_at)).getTime(),
                    value: data.data.data[i].alt
                });
            }

            // sort
            var sortFunc = function(a, b){return a.label-b.label};
            altitudes.sort(sortFunc);

            $scope.altitudes = [
                {
                    key: "altitudes",
                    values: altitudes
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
                        axisLabel: 'Altitude (m)',
                        tickFormat: function(d){
                            return d3.format('.02f')(d);
                        },
                        axisLabelDistance: -10
                    }
                },
                title: {
                    enable: true,
                    text: 'Drone Altitude Over Time'
                },
                subtitle: {
                    enable: true,
                    text: 'This displays the drone altitude in meters over seconds.',
                    css: {
                        'text-align': 'center',
                        'margin': '10px 13px 0px 7px'
                    }
                },
                caption: {
                    enable: true,
                    html: 'This displays the drone\'s altitude in meters over seconds elapsed.',
                    css: {
                        'text-align': 'justify',
                        'margin': '10px 13px 0px 7px'
                    }
                }
            };
        });
    };
});