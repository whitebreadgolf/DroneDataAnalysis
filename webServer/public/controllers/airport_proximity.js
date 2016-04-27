/**
@class angular_controller.AirportProximity
@memberOf angular_controller
@requires angular_controller.Websocket
*/
angular.module('UavOpsInterface')
.controller('AirportProxCtrl', function ($scope, Websocket, $interval){	
	$interval(function (){
  		$scope.airports = Websocket.getAirport();
	}, 1000);
    /**
    @member AirportProximityOptions
    @memberOf angular_controller.AirportProximity
    @description This options object governs the appearance of the airport proximity chart.
    */
	$scope.options = {
        chart: {
            type: "discreteBarChart",
            height: 450,
            margin: {
                "top": 20,
                "right": 20,
                "bottom": 50,
                "left": 55
            },
            x: function(d){ return d.label; },
            y: function(d){ return (d.value*3.280839895)/5280; },
            showValues: true,
            duration: 500,
            xAxis: {
                axisLabel: "Airport"
            },
            yAxis: {
                axisLabel: "Distance (mi)",
                axisLabelDistance: -10
            }
        }
    };
});