angular.module('UavOpsInterface')
.controller('ConfigMapCtrl', function ($scope, $http) {

	// array for our dynamic markers
	$scope.allMarkers = [];
	$scope.alreadyConfigured = false;
	$scope.notConfigured = true;
	$scope.mapConfiguration = {
		isValid:false, 
		isInvalid: true,
		status: "",
		SE: null,
		NW: null
	};


	// get current config status with an http request
	// set to scoped variable for display
	var req = {
		method: 'GET', url: 'api/configuremap',
	}
	$http(req).then(function(data){
		if(data && data.status === 'success'){
			$scope.alreadyConfigured = true;
			$scope.notConfigured = false;
		}
	});

	// when the map is clicked
	$scope.mapClicked = function (event){

		// already max length, so we need to take one out
		if($scope.allMarkers.length === 2){ $scope.allMarkers.shift(); }

		// add a new marker
		$scope.allMarkers.push({lat: event.latLng.lat(), lon: event.latLng.lng()});

		// add check to see if full
		if($scope.allMarkers.length === 2){ 

			console.log($scope.allMarkers);
			if($scope.allMarkers[0].lat > $scope.allMarkers[1].lat && $scope.allMarkers[0].lon < $scope.allMarkers[1].lon){
				$scope.mapConfiguration.status = "Valid NW SE configuration"
				$scope.mapConfiguration.isValid = true; 
				$scope.mapConfiguration.isInvalid = false;	
				$scope.mapConfiguration.SE = 1;
				$scope.mapConfiguration.NW = 0;
			}
			else if($scope.allMarkers[1].lat > $scope.allMarkers[0].lat && $scope.allMarkers[1].lon < $scope.allMarkers[0].lon) { // 0 is SE and 1 is NW
				$scope.mapConfiguration.status = "Valid NW SE configuration"
				$scope.mapConfiguration.isValid = true; 
				$scope.mapConfiguration.isInvalid = false;
				$scope.mapConfiguration.SE = 0;
				$scope.mapConfiguration.NW = 1;
			}
			else{
				$scope.mapConfiguration.status = "Invalid NW SE configuration"
				$scope.mapConfiguration.isValid = false; 
				$scope.mapConfiguration.isInvalid = true;
				$scope.mapConfiguration.SE = null;
				$scope.mapConfiguration.NW = null;	
			}
		}
	};

	// calls backend service, should not be accessable until conditions are correct
	$scope.configureMap = function (){
		
		var req = {
			method: 'POST', url: 'api/configuremap',
			data: {latLngStart: $scope.allMarkers[$scope.mapConfiguration.NW], latLngEnd: $scope.allMarkers[$scope.mapConfiguration.SE]}
		}

		$http(req).then(function(data){
			console.log(data);
		});
	};

	// empties markers array
	$scope.clearMarkers = function (){
		
		// empty array
		while($scope.allMarkers.length > 0){ $scope.allMarkers.pop(); }

		$scope.mapConfiguration.status = "Invalid NW SE configuration"
		$scope.mapConfiguration.isValid = false; 
		$scope.mapConfiguration.isInvalid = true;
		$scope.mapConfiguration.SE = null;
		$scope.mapConfiguration.NW = null;	
	};
});