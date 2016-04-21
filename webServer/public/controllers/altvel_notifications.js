/**
@class angular_controller.AltitudeVelocityNotifications
@memberOf angular_controller
@requires angular_factories.FlightName
*/
angular.module('UavOpsInterface')
.controller('AltVelNotificationsCtrl', function ($scope, $http, FlightName){
		
	$scope.toggleInput = false;
    $scope.showBack = false;
    $scope.searchFilter = '';
    var allFlights = [];
    $scope.showNotifications = false;

	FlightName.getFlights().then(function(flightObj){ 
		$scope.flights = flightObj.flights;
		allFlights = flightObj.flights;
		$scope.noData = flightObj.noData;
		$scope.dataError = flightObj.dataError;
	});

    $scope.backClicked = function(){
        $scope.showNotifications = false;
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
			$scope.showNotifications = true;
			$scope.notifications = [];
			$scope.showBack = true;
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


