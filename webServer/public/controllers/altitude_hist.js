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
            console.log(data.data);
            $scope.showChart = true;
            $scope.altitudes = [
                {
                    key: "altitudes",
                    values: data.data.data
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
                    html: '<b>Figure 1.</b> Lorem ipsum dolor sit amet, at eam blandit sadipscing, <span style="text-decoration: underline;">vim adhuc sanctus disputando ex</span>, cu usu affert alienum urbanitas. <i>Cum in purto erat, mea ne nominavi persecuti reformidans.</i> Docendi blandit abhorreant ea has, minim tantas alterum pro eu. <span style="color: darkred;">Exerci graeci ad vix, elit tacimates ea duo</span>. Id mel eruditi fuisset. Stet vidit patrioque in pro, eum ex veri verterem abhorreant, id unum oportere intellegam nec<sup>[1, <a href="https://github.com/krispo/angular-nvd3" target="_blank">2</a>, 3]</sup>.',
                    css: {
                        'text-align': 'justify',
                        'margin': '10px 13px 0px 7px'
                    }
                }
            };
        });

    };
});