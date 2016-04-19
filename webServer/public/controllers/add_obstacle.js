/**
@class angular_controller.AddObstacle
@memberOf angular_controller
@requires Notification
*/
angular.module('UavOpsInterface')
.controller('AddObstacleCtrl', function ($scope, $http, Notification) {

	// array for our dynamic markers
	$scope.configMarkers = [];
	$scope.allMarkers = {};
	$scope.mapConfiguration = {
		isValid:false, 
		isInvalid: true,	
	};

	$http({
		method: 'GET', 
		url: 'api/configuremap'
	}).then(function(data){

	/**
	@function configureMap
	@memberOf angular_controller.AddObstacle
	@description The function iterates through the configured bounds of the map 
	and converts the map into same-sized tiles, saves the tiles into the mongodb,
	and add metadata such as whether the tile is a corner and edge tile.
	*/
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

	/**
	@function generateId
	@memberOf angular_controller.AddObstacle
	@description The function generates a randomized id of alphanumeric characters.
	*/
	var genId = function(){
		var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	    for( var i=0;i<3; i++ ){
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
	    }
	    return text;
	};

	$scope.clearMarkers = function (){
		
		// empty array
		$scope.allMarkers = {}; 
		$scope.mapConfiguration.isValid = false; 
		$scope.mapConfiguration.isInvalid = true;
	};

	/**
	@function AddMapMarker
	@memberOf angular_controller.AddObstacle
	@param {Object} event - Event object that contains the data about the location of 
	where the obstacle marker is being placed on the map.
	@description When the map is clicked, adds a marker as a placeholder where 
	the obstacle is on the map. When configureObstacle is called, the obstacles
	will be added into the map.
	*/
	$scope.mapClicked = function (event){

		// add a new marker
		var id = genId();
		$scope.allMarkers[id] = {
			id: id,
			lat: event.latLng.lat(), 
			lon: event.latLng.lng(),
			name: '', 
			radius: ''
		};
		$scope.mapConfiguration.isValid = true; 
		$scope.mapConfiguration.isInvalid = false;
	};
	$scope.removeObsticle = function(i){
		delete $scope.allMarkers[i];
	}

	/**
	@function ConfigureObstacle
	@memberOf angular_controller.AddObstacle
	@description Calls backend service to add obstacles to the map. Has error 
	checks so this option should not be accessable until conditions are correct.
	*/
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


	// Service calls and helper functions
	var makeAddObsticleReq = function(i){
		return $http({
			method: 'POST', 
			url: 'api/addobstacle',
			data: {
				lat: parseFloat($scope.allMarkers[i].lat), 
				lon: parseFloat($scope.allMarkers[i].lon), 
				radius: parseInt($scope.allMarkers[i].radius), 
				name: $scope.allMarkers[i].name
			}
		}).then(function(data){
		 	return data.data;
		});
	} 
	var validObsticle = function(i){
		return $scope.allMarkers[i].name !== '' && $scope.allMarkers[i].radius !== '';
	}

	$scope.configureAllObstacles = function (){
		for(var i in $scope.allMarkers){
			if(validObsticle(i)){
				makeAddObsticleReq(i).then(function(data){
					if(data.success)
						Notification({message: data.message}, 'success');
					else
						Notification({message: data.message}, 'error');	
				});
				delete $scope.allMarkers[i];
			}
			else{
				Notification({message: 'Obsticle with id '+i+' is not valid'}, 'warning');
				return;
			}
		}

	/** 
	@function ClearObstacleMarkers
	@memberOf angular_controllers.AddObstacle
	@description Clears all user added markers from the map. 
	*/
	$scope.clearMarkers = function (){
		
		// empty array
		while($scope.allMarkers.length > 0){ $scope.allMarkers.pop(); }

		$scope.mapConfiguration.isValid = false; 
		$scope.mapConfiguration.isInvalid = true;
	};
	
	$scope.addObsticle = function(i){
		if(validObsticle(i)){
			makeAddObsticleReq(i).then(function(data){
				delete $scope.allMarkers[i];
				if(data.success)
					Notification({message: data.message}, 'success');
				else
					Notification({message: data.message}, 'error');	
			});
		}
		else{
			Notification({message: 'Obsticle with id '+i+' is not valid'}, 'warning');
			return;
		}
	}
});