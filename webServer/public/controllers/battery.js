angular.module('UavOpsInterface')
.controller('BatteryCtrl', function ($scope, Websocket, $interval){	
	
	$interval(function (){
  		$scope.battery = Websocket.getBattery();
	}, 1000); 

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