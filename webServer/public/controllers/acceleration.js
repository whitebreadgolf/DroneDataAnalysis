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
	        y: function(d){ return d.value; },
	        showValues: true,
	        valueFormat: function(d){
	            return d3.format(',.4f')(d);
	        },
	        deepWatchData: true,
	        xAxis: {
	            axisLabel: 'Time elapsed (ms)'
	        },
	        yAxis: {
	            axisLabel: 'Acceleration (m/s)',
                tickFormat: function(d){
                    return d3.format('.02f')(d);
                },
	            axisLabelDistance: 30
	        }
    	}, 
    	title: {
            enable: true,
            text: 'Drone\'s Acceleration Over Time'
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