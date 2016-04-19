/**
@class angular_controller.AirportNotifications
@memberOf angular_controller
@requires angular_controller.FlightName
*/
angular.module('UavOpsInterface')
.controller('AirportNotificationsCtrl', function ($scope, $http, FlightName){
		
	FlightName.getFlights().then(function(flightObj){ 
		$scope.flights = flightObj.flights;
		$scope.noData = flightObj.noData;
		$scope.dataError = flightObj.dataError;
	});

	$scope.showNotificaitons = false;
	$scope.searchClicked = function(){
        $scope.showNotifications = false;
    };

	/** 
	@function flightSearch
	@memberOf angular_controller.AirportNotifications
	@description Given the flight id parameter, this function will push any airport-relevant 
	notifications to the controller.
	@param {String} _flightId - Flight id
	*/
	$scope.notifications = [];
	$scope.flightSearch = function(_flightId){
		var req = {
			method: 'GET', 
			url: 'api/safetyStatus/'+_flightId, 
		};
		$http(req).then(function(data){
			var notifications = data.data.data;
			$scope.showNotifications = true;
			for(var i in notifications){
				if(notifications[i].type === 'airport'){
					$scope.notifications.push({
						report: notifications[i].report,
						value: notifications[i].value,
						created_at: notifications[i].created_at
					});
				}
			}	
		});
	};

});