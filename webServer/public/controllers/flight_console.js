angular.module('UavOpsInterface')
.controller('FlightConsoleCtrl', function($scope, $http, Notification, Decoder){
	
	$scope.noFlightData = true;
	$scope.flightDataError = true;
	$scope.searchTerm = '';
	$scope.flights = [];

	$scope.searchFilter = function(flight) { 
		if($scope.searchTerm === '') return true;
		else{
			if(flight && flight.flight_name && flight.flight_name.includes($scope.searchTerm)) return true;
			else return false;
		}
	};

	$scope.deletePreflight = function(_id){
		var req = {
			method: 'DELETE',
			url: 'api/preflight/'+_id
		};

		$http(req).then(function(data){
			if(data.data.success){
				Notification({message: data.data.message}, 'success'); 
				for(var i=0;i<$scope.flights.length;i++){
					if($scope.flights[i]._id === _id){
						$scope.flights.splice(i, 1);
					}
				}
			}
			else Notification({message: data.data.message}, 'error'); 
		});
	};

	$scope.stopDecoding = function(_flightId){

		// stop decoder for id
		Decoder.stopDecoding(_flightId);

		// removes button
		for(var i=0;i<$scope.flights.length;i++){
			if($scope.flights[i]._id === _flightId){
				$scope.flights[i].started = false;
			}
		}   
	}

	$scope.startLiveFlight = function(_flightId){
		for(var i=0;i<$scope.flights.length;i++){
			if($scope.flights[i]._id === _flightId){
				$scope.flights[i].started = true;
				$scope.flights[i].decoding = false;
			}
		} 
		var req = {
			method: 'POST',
			url: 'api/flight',
			data: {type: 'real_time', flight_id: _flightId, action: 'start'}
		};
		$http(req).then(function(data){
			if(data.data.success){ 
				Notification({message: data.data.message}, 'success'); 
			}
			else Notification({message: data.data.message}, 'error');
		}); 
	}

	$scope.stopLiveFlight = function(_flightId){
		for(var i=0;i<$scope.flights.length;i++){
			if($scope.flights[i]._id === _flightId){
				$scope.flights[i].started = false;
			}
		}  
		var req = {
			method: 'POST',
			url: 'api/flight',
			data: {type: 'real_time', flight_id: _flightId, action: 'end'}
		};
		$http(req).then(function(data){
			if(data.data.success){ 
				Notification({message: data.data.message}, 'success'); 
			}
			else Notification({message: data.data.message}, 'error');
		}); 
	}

	$scope.uploadFile = function(_file, _flightId){

		// start decoder
        Decoder.startDecoder(_flightId, _file, function(){

        	// this may or may not be called
        	// we already called stop in the Decoder factory
			for(var i=0;i<$scope.flights.length;i++){
				if($scope.flights[i]._id === _flightId){
					$scope.flights[i].started = false;
				}
			}   
        });

        // set started to true
        for(var i=0;i<$scope.flights.length;i++){
			if($scope.flights[i]._id === _flightId){
				$scope.flights[i].started = true;
				$scope.flights[i].decoding = true;
			}
		}        
	}

	var req = {
		method: 'GET',
		url: 'api/preflight'
	};
	$http(req).then(function(data){
		if(data.data.success){
			if(data.data.data.length === 0) $scope.flightDataError = false;
			else{
				$scope.flights = data.data.data;
				$scope.noFlightData = false;
				$scope.flightDataError = false;

				for(var i=0;i<$scope.flights.length;i++){
					if($scope.flights[i].flight_started){
						$scope.flights[i].started = true;
					}
					else if(Decoder.isRunningOrInQueue($scope.flights[i]._id)) $scope.flights[i].started = true;
					else $scope.flights[i].started = false;
					
					$scope.flights[i].created_at = $scope.flights[i].created_at;
				}
			}
		} 
		else $scope.noFlightData = false;
	});
});