/**
@class angular_controller.AltitudeVelocityNotifications
@memberOf angular_controller
@requires angular_factories.FlightName
*/
angular.module('UavOpsInterface')
.controller('AltVelNotificationsCtrl', function ($scope, $http, FlightName){
		
	FlightName.getFlights().then(function(flightObj){ 
		$scope.flights = flightObj.flights;
		$scope.noData = flightObj.noData;
		$scope.dataError = flightObj.dataError;
	});

	$scope.showNotifications = false;
	$scope.searchClicked = function(){
        $scope.showNotifications = false;
    };

	
	/**
	@function configureMap
	@memberOf angular_controller.SearchNotification
	@param {String} - flightId
	@description The function takes in a flight id and uses it to search for notifications of
	hazard and warning levels and adds them into the notifications array to display on the front
	end.
	*/
	$scope.flightSearch = function(_flightId){
		var req = {
			method: 'GET', 
			url: 'api/safetyStatus/'+_flightId, 
		};
		$http(req).then(function(data){
			var notifications = data.data.data;
			console.log(notifications);
			$scope.showNotifications = true;
			$scope.notifications = [];
			for(var i in notifications){
				if(notifications[i].type === 'warning' || notifications[i].type === 'hazard'){
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


