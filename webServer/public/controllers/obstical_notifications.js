angular.module('UavOpsInterface')
.controller('ObsticalNotificationsCtrl', function ($scope, $http, FlightName){
		
	$scope.flightSelected = false;
	$scope.airports = [];
	$scope.showAirport = false;
	$scope.airportData = [];
	var allNotifications = [];

	FlightName.getFlights().then(function(flightObj){ 
		$scope.flights = flightObj.flights;
		$scope.noData = flightObj.noData;
		$scope.dataError = flightObj.dataError;
	});

	$scope.showNotifications = false;
	$scope.searchClicked = function(){
        $scope.showNotifications = false;
        $scope.flightSelected = false;
        $scope.showAirport = false;
    };

    $scope.clickAirport = function(_name){
    	var airObj = {key: _name, values:[]};
    	for(var i in allNotifications){
			if(allNotifications[i].report === _name){
				airObj.values.push({
					label: allNotifications[i].created_at,
					value: allNotifications[i].value
				});
			}
		}
		$scope.airportData[0] = airObj;
		$scope.showAirport = true;
    }

	// load data for id
	$scope.flightSearch = function(_flightId){
		var req = {
			method: 'GET', 
			url: 'api/safetyStatus/'+_flightId, 
		};
		$http(req).then(function(data){
			var notifications = data.data.data;
			$scope.showNotifications = true;
			$scope.notifications = [];
			for(var i in notifications){
				if(notifications[i].type === 'proximity'){
					allNotifications.push({
						report: notifications[i].report,
						value: notifications[i].value,
						created_at: notifications[i].created_at
					});
				}
			}
			$scope.flightSelected = true;		
		});
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
            x: function(d){ return d.label; },
            y: function(d){ return d.value; },
            useInteractiveGuideline: true,
            xAxis: {
                axisLabel: 'Time (s)'
            },
            yAxis: {
                axisLabel: 'Distance (m)',
                tickFormat: function(d){
                    return d3.format('.02f')(d);
                },
                axisLabelDistance: -10
            }
        },
        title: {
            enable: true,
            text: 'Drone\'s Airport Proximity'
        },
        subtitle: {
            enable: true,
            text: 'This displays the drone\'s proximity to an airport',
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