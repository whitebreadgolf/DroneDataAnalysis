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
	$scope.clearMarkers = function (){
		
		// empty array
		$scope.allMarkers = {}; 
		$scope.mapConfiguration.isValid = false; 
		$scope.mapConfiguration.isInvalid = true;
	};
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