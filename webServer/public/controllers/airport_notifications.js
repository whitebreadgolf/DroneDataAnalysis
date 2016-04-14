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

	// load data for id
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