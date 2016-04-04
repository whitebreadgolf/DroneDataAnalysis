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

	$scope.uploadFile = function(_file, _flightId){

		// start decoder
        Decoder.startDecoder(_flightId, _file);

        // set started to true
        for(var i=0;i<$scope.flights.length;i++){
			if($scope.flights[i]._id === _flightId){
				$scope.flights[i].started = true;
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
					$scope.flights[i].started = false;
					$scope.flights[i].created_at = (new Date($scope.flights[i].created_at)).toDateString();

					// configure ui elements
					if(Decoder.isRunningOrInQueue($scope.flights[i]._id)) $scope.flights[i].started = true;
					else $scope.flights[i].started = false;
				}
			}
		} 
		else $scope.noFlightData = false;
	});
});