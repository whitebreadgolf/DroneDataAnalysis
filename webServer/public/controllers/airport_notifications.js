/**
@class angular_controller.AirportNotifications
@memberOf angular_controller
@requires angular_controller.FlightName
*/
angular.module('UavOpsInterface')
.controller('AirportNotificationsCtrl', function ($scope, $http, FlightName, $uibModal){
		
	$scope.flightSelected = false;
	$scope.airports = [];
	$scope.showAirport = false;
	$scope.toggleInput = false;
    $scope.showBack = false;
    $scope.showNotificaitons = false;
    $scope.searchFilter = '';
    var allFlights = [];
	$scope.airportData = [
		{
			key: '', 
			values:[]
		}
	];
	var allNotifications = [];

	FlightName.getFlights().then(function(flightObj){ 
		$scope.flights = flightObj.flights;
		allFlights = flightObj.flights;
		$scope.noData = flightObj.noData;
		$scope.dataError = flightObj.dataError;
	});
	
    $scope.backClicked = function(){
        if($scope.showAirport){
			//$scope.showNotifications = false;
	        $scope.flightSelected = true;
	        $scope.showAirport = false;
	        $scope.showBack = true;
        }
        else{
        	$scope.showNotifications = false;
        	$scope.showBack = false;
        	$scope.flightSelected = false;
        	$scope.showAirport = false;
        }
    }

    $scope.clickAirport = function(_name){
    	$scope.flightSelected = false;
    	var airArr = [];
    	for(var i in allNotifications){
			if(allNotifications[i].report === _name){
				airArr.push({
					label: (new Date(allNotifications[i].created_at)).getTime(),
					value: allNotifications[i].value
				});
			}
		}
		airArr.sort(function(a,b){ return a.label-b.label; });

		$scope.airportData[0].values = airArr;
		$scope.airportData[0].key = _name;
		$scope.showAirport = true;
    }
     $scope.searchFlights = function(){
        $scope.flights = [];
        if($scope.toggleInput){
            var startDate = new Date($scope.startDate);
            var endDate = new Date($scope.endDate);
            for(var i in allFlights){
                var date = new Date(allFlights[i].flight_started);
                if(date > startDate && date < endDate){
                    $scope.flights.push(allFlights[i]);
                }
            }
        }
        else{
            for(var i in allFlights){
                if(allFlights[i].flight_name.indexOf($scope.searchFilter) > -1){
                    $scope.flights.push(allFlights[i]);
                }
            }       
        }
    }

	/** 
	@function flightSearch
	@memberOf angular_controller.AirportNotifications
	@description Given the flight id parameter, this function will push any airport-relevant 
	notifications to the controller.
	@param {String} _flightId - Flight id
	*/
	$scope.flightSearch = function(_flightId){
		var req = {
			method: 'GET', 
			url: 'api/safetyStatus/'+_flightId, 
		};
		$http(req).then(function(data){
			var notifications = data.data.data;
			$scope.showNotifications = true;
			$scope.showBack = true;
			var nameMap = {};
			for(var i in notifications){
				if(notifications[i].type === 'airport'){
					allNotifications.push({
						report: notifications[i].report,
						value: notifications[i].value,
						created_at: notifications[i].created_at
					});
					if(nameMap[notifications[i].report]){}
					else
						nameMap[notifications[i].report] = '';
				}
			}	
			$scope.airports = Object.keys(nameMap);
			$scope.flightSelected = true;
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
		            x: function(d){
		             	return d.label; 
		         	},
		            y: function(d){ 
		            	return d.value; 
		        	},
		        	lines: {
			            dispatch: {
			                elementClick: handleGraphClick
			            }
			        },
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
		var handleGraphClick = function (event) {
            var time = point = event[0].point.label;
            var reroute = '/data_overview/' + _flightId + '/' + (new Date(time)).getTime();
            var text = 'You selected a point from a velocity graph. Would you like to see all datapoints collected with the timestamp: ';
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'templates/histGraphModal.html',
                controller: 'HistGraphModal',
                size: 'small',
                resolve: {
                    text: function(){ return text; },
                    time: function(){ return time; },
                    reroute: function(){ return reroute; }
                }
            });
        };
	};
});