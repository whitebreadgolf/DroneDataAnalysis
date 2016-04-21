/**
@class angular_controller.Battery
@memberOf angular_controller
@requires angular_controller.Websocket
*/
angular.module('UavOpsInterface')
.controller('BatteryCtrl', function ($scope, Websocket, $interval){	
	
	$interval(function (){
  		$scope.batteries = Websocket.getBattery();
	}, 1000); 

    /**
    @member BatteryChartOptions
    @memberOf angular_controller.Battery
    @description This options object governs the appearance of the battery chart.
    */
	$scope.options = {
        "chart": {
            "type": "discreteBarChart",
            "height": 450,
            "margin": {
                "top": 20,
                "right": 20,
                "bottom": 50,
                "left": 55
            },
            x: function(d){ return d.label; },
            y: function(d){ return d.value; },
            "showValues": true,
            "duration": 500,
            "xAxis": {
                "axisLabel": "Time"
            },
            "yAxis": {
                "axisLabel": "Charge",
                "axisLabelDistance": -10
            }
        }
    };
});