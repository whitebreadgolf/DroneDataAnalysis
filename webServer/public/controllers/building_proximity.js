/**
@class angular_controller.BuildingProximity
@memberOf angular_controller
@requires angular_controller.Websocket
*/
angular.module('UavOpsInterface')
.controller('BuildingProxCtrl', function ($scope, Websocket, $interval){	
	$interval(function (){
  		$scope.building = Websocket.getBuilding();
	}, 1000); 

    /**
    @member BuildingProximityOptions
    @memberOf angular_controller.BuildingProximity
    @description This options object governs the appearance of the building proximity chart.
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
            "showValues": true,
            "duration": 500,
            "xAxis": {
                "axisLabel": "Time"
            },
            "yAxis": {
                "axisLabel": "Meters",
                "axisLabelDistance": -10
            }
        }
    };
});