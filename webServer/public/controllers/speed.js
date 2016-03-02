angular.module('UavOpsInterface')
.controller('SpeedCtrl', function ($scope, Websocket, $interval){

	$interval(function (){
  		$scope.speeds = Websocket.getSpeed();
	}, 100);
  
  	$scope.speedNum = function(){
  		return Websocket.getNumSpeed();
  	};

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
	        useInteractiveGuideline: false,
	        x: function(d){ return d.label; },
	        y: function(d){ return d.value; },
	        showValues: true,
	        valueFormat: function(d){
	            return d3.format(',.4f')(d);
	        },
	        deepWatchData: true,
	        xAxis: {
	            axisLabel: 'X Axis'
	        },
	        yAxis: {
	            axisLabel: 'Y Axis',
	            axisLabelDistance: 30
	        }
    	}
	};
});