angular.module('UavOpsInterface')
.controller('ConfigMapCtrl', function ($scope, $http, Notification) {

	// array for our dynamic markers
	$scope.allMarkers = [];
	$scope.configMarkers = [];
	$scope.alreadyConfigured = false;
	$scope.notConfigured = false;
	$scope.configuring = false;
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
		if(data && data.data.success){
			$scope.alreadyConfigured = true;
			$scope.notConfigured = false;
			$scope.configMarkers = data.data.data;
		}
		else if(data && !data.data.success){
			Notification({message: 'user must log in'}, 'warning');
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

		$scope.configuring = true;
		$scope.alreadyConfigured = false;
		$scope.notConfigured = false;
		$scope.mapConfiguration.isValid = false;
		$scope.isInvalid = false;
		
		var req = {
			method: 'POST', url: 'api/configuremap',
			data: {latLngStart: $scope.allMarkers[$scope.mapConfiguration.NW], latLngEnd: $scope.allMarkers[$scope.mapConfiguration.SE]}
		}

		$http(req).then(function(data){
			$scope.configuring = false;		
			$scope.configMarkers = data.data.status.data;
			$scope.alreadyConfigured = true;
			$scope.notConfigured = false;
			while($scope.allMarkers.length > 0){ $scope.allMarkers.pop(); }
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