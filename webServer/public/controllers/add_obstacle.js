angular.module('UavOpsInterface')
.controller('AddObstacleCtrl', function ($scope, $http, Notification) {

	// array for our dynamic markers
	$scope.configMarkers = [];
	$scope.allMarkers = [];
	$scope.mapConfiguration = {
		isValid:false, 
		isInvalid: true,	
	};

	var req = {
		method: 'GET', url: 'api/configuremap',
	}
	$http(req).then(function(data){
		if(data && data.data.success){
			for(var i=0;i<data.data.data.length;i++){
				if(data.data.data[i].bound_s || data.data.data[i].bound_n || data.data.data[i].bound_e || data.data.data[i].bound_w){
					$scope.configMarkers.push(data.data.data[i]);
				}
			}
		}
		else if(data && !data.data.success){
			Notification({message: 'user must log in'}, 'warning');
		}
	});

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

	$scope.formClicked = function(lat, lon){

		var req = {
			method: 'POST', url: 'api/addobstacle',
			data: {lat: lat, lon: lon}
		}

		$http(req).then(function(data){
			console.log(data);
		});
	}

	// empties markers array
	$scope.clearMarkers = function (){
		
		// empty array
		while($scope.allMarkers.length > 0){ $scope.allMarkers.pop(); }

		$scope.mapConfiguration.isValid = false; 
		$scope.mapConfiguration.isInvalid = true;
	};
});