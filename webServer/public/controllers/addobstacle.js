angular.module('UavOpsInterface')
.controller('AddObstacleCtrl', function ($scope, $http) {

	// array for our dynamic markers
	$scope.allMarkers = [];
	$scope.mapConfiguration = {
		isValid:false, 
		isInvalid: true,	
	};

	// when the map is clicked
	$scope.mapClicked = function (event){

		// add a new marker
		$scope.allMarkers.push({lat: event.latLng.lat(), lon: event.latLng.lng()});
		$scope.mapConfiguration.isValid = true; 
		$scope.mapConfiguration.isInvalid = false;
	};

	// calls backend service, should not be accessable until conditions are correct
	$scope.configureObstacle = function (){
		
		var req = {
			method: 'POST', url: 'api/addobstacle',
			data: {}
		}

		$http(req).then(function(data){
			console.log(data);
		});
	};

	// empties markers array
	$scope.clearMarkers = function (){
		
		// empty array
		while($scope.allMarkers.length > 0){ $scope.allMarkers.pop(); }

		$scope.mapConfiguration.isValid = false; 
		$scope.mapConfiguration.isInvalid = true;
	};
});