angular.module('UavOpsInterface')
.controller('AccelerationCtrl', function ($scope, Websocket, $interval){
   
	$interval(function (){
  		$scope.accelerations = Websocket.getAcceleration();
	}, 100);

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
	        y: function(d){ return d.value*0.514444444; },
	        showValues: true,
	        valueFormat: function(d){
	            return d3.format(',.4f')(d);
	        },
	        deepWatchData: true,
	        xAxis: {
	            axisLabel: 'Time elapsed (s)'
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