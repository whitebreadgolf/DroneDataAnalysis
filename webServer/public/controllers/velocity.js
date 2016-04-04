angular.module('UavOpsInterface')
.controller('VelocityCtrl', function ($scope, Websocket, $interval){

	$interval(function (){
  		$scope.speeds = Websocket.getSpeed();
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
	            axisLabel: 'Time elapsed (s)'
	        },
	        yAxis: {
	            axisLabel: 'Velocity (m/s)',
	            axisLabelDistance: 30
	        }
    	}, 
    	title: {
            enable: true,
            text: 'Drone Velocities Over Time'
        },
        subtitle: {
            enable: true,
            text: 'This displays the drone velocities in meters per second over seconds.',
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