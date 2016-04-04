angular.module('UavOpsInterface')
.controller('VelocityHistCtrl', function ($scope){	
	
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
            x: function(d){ return d.label; },
            y: function(d){ return d.value; },
            useInteractiveGuideline: true,
            xAxis: {
                axisLabel: 'Time (s)'
            },
            yAxis: {
                axisLabel: 'Velocity (m/s)',
                tickFormat: function(d){
                    return d3.format('.02f')(d);
                },
                axisLabelDistance: 30
            }
        },
        title: {
            enable: true,
            text: 'Drone\'s Velocity Over Time'
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