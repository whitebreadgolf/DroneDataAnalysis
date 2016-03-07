angular.module('UavOpsInterface')
.controller('AddObstacleCtrl', function ($scope, $http) {

	// array for our dynamic markers
	$scope.allMarkers = [];
	$scope.mapConfiguration = {
		isValid:false, 
		isInvalid: true,	
	};

	var genId = function(){
		var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	    for( var i=0;i<3; i++ ){
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
	    }
	    return text;
	};

	// when the map is clicked
	$scope.mapClicked = function (event){

		// add a new marker
		$scope.allMarkers.push({lat: event.latLng.lat(), lon: event.latLng.lng(), id: genId()});
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

	$scope.markerClicked = function(id){
		console.log(id);
	}

	$scope.formClicked = function(id){
		for(var i in $scope.allMarkers){
			if($scope.allMarkers[i].id == id){
				$scope.allMarkers.splice(i, 1);
			}
		}
	}

	// empties markers array
	$scope.clearMarkers = function (){
		
		// empty array
		while($scope.allMarkers.length > 0){ $scope.allMarkers.pop(); }

		$scope.mapConfiguration.isValid = false; 
		$scope.mapConfiguration.isInvalid = true;
	};
});