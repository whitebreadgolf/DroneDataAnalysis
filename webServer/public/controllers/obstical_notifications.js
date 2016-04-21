/**
@class angular_controller.ObsticalNotifications
@memberOf angular_controller
@requires angular_factories.FlightName
*/
angular.module('UavOpsInterface')
.controller('ObsticalNotificationsCtrl', function ($scope, $http, FlightName, $uibModal){
	
    $scope.toggleInput = false;
    $scope.showBack = false;
    $scope.searchFilter = '';
    var allFlights = [];	
	$scope.flightSelected = false;
	$scope.obstacleData = [
        {
            key: 'obstacle proximity', 
            values:[]
        }
    ];

	FlightName.getFlights().then(function(flightObj){ 
		$scope.flights = flightObj.flights;
        allFlights = flightObj.flights;
		$scope.noData = flightObj.noData;
		$scope.dataError = flightObj.dataError;
	});	

    $scope.backClicked = function(){
        $scope.flightSelected = false;
        $scope.showBack = false;
    };
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
    @memberOf angular_controller.ObsticalNotifications
    @param {string} _flightId - Represents a single stored or running flight.
    @description This function takes in a flight id and will update the notifications queue with notifications of obstacles based on the inputted flight id.
    */
	$scope.flightSearch = function(_flightId){
		var req = {
			method: 'GET', 
			url: 'api/safetyStatus/'+_flightId, 
		};
		$http(req).then(function(data){
			var notifications = data.data.data;
			for(var i in notifications){
				if(notifications[i].type === 'proximity'){
					$scope.obstacleData[0].values.push({
						value: notifications[i].value,
						label: new Date(notifications[i].created_at).getTime()
					});
				}
			}
            $scope.obstacleData[0].values.sort(function(a,b){ return a.label-b.label; });
			$scope.flightSelected = true;
            $scope.showBack = true;
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
                    lines: {
                        dispatch: {
                            elementClick: handleGraphClick
                        }
                    },
                    x: function(d){ return d.label; },
                    y: function(d){ return d.value; },
                    useInteractiveGuideline: true,
                    xAxis: {
                        axisLabel: 'Time (ms)'
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
                    text: 'Drone\'s Obstacle Proximity'
                },
                subtitle: {
                    enable: true,
                    text: 'This displays the drone\'s proximity to an obstacle',
                    css: {
                        'text-align': 'center',
                        'margin': '10px 13px 0px 7px'
                    }
                }
            };
        });

        var handleGraphClick = function (event) {
            console.log(event);
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