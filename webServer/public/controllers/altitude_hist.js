/**
@class angular_controller.AltitudeHistory
@memberOf angular_controller
*/
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

    /**
    @function getAltitudeHistory
    @memberOf angular_controller.AltitudeHistory
    @param {String} - flightId
    @description The function takes in a flightId and uses it to load the altitude
    history for that user.
    */
    $scope.flightSearch = function(_flightId){
        var req = {
            method: 'GET', 
            url: 'api/altitude/'+_flightId, 
        };
        $http(req).then(function(data){
            console.log(data.data);
            $scope.showChart = true;
            $scope.altitudes = [
                {
                    key: "altitudes",
                    values: data.data.data
                }
            ];

            /**
            @member AltitudeChartOptions
            @memberOf angular_controller.Altitude
            @description This options object governs the appearance of the altitude chart.
            */
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
                    x: function(d){ 
                        return (new Date(d.created_at)).getTime(); 
                    },
                    y: function(d){ return d.alt; },
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