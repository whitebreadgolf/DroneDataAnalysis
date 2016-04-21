/**
@class angular_controller.FlightConsole
@memberOf angular_controller
@requires Notification
@requires angular_factories.Decoder
*/
angular.module('UavOpsInterface')
.controller('FlightConsoleCtrl', function($scope, $http, Notification, Decoder, Websocket){
	
	$scope.noFlightData = true;
	$scope.flightDataError = true;
	$scope.searchTerm = '';
	$scope.flights = [];

	/**
	@function searchFilter
	@memberOf angular_controller.FlightConsole
	@param {Object} flight - Flight object containing flight_name string
	and other relevant data.
	@description This function searches through the flight object to find 
	the included search term.
	*/
	$scope.searchFilter = function(flight) { 
		if($scope.searchTerm === '') return true;
		else{
			if(flight && flight.flight_name && flight.flight_name.includes($scope.searchTerm)) return true;
			else return false;
		}
	};

	/**
	@function deletePreFlight
	@memberOf angular_controller.FlightConsole
	@param {Object} _id - A user id.
	@description This function takes in a user id and then deletes the corresponding 
	pre-flight associated with the user.
	*/
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
			else {
				$scope.type = 'error';
				Notification({message: data.data.message, scope: $scope}); 
			}
		});
	};

	/**
	@function stopDecoding
	@memberOf angular_controller.FlightConsole
	@param {String} _flightId - Represents a single stored or running flight.
	@description This function takes in a flight id and stops the corresponding 
	decoding process of that flight's data.
	*/
	$scope.stopDecoding = function(_flightId){

		// stop decoder for id
		// do not need analysis callbacks
		Decoder.stopDecoding(_flightId);

		// removes button
		for(var i=0;i<$scope.flights.length;i++){
			if($scope.flights[i]._id === _flightId){
				$scope.flights[i].started = false;
			}
		}   
	}

	/** 
	@function startLiveFlight
	@memberOf angular_controller.FlightConsole
	@param {String} _flightId - Represents a single stored or running flight.
	@description This function takes in a flight id and starts a flight that 
	is associated with the flightId. It also notifies the user as to the status
	of the start action.
	*/
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
				$scope.type = 'success';
				Notification({message: data.data.message, scope: $scope}); 
			}
			else {
				$scope.type = 'error';
				Notification({message: data.data.message, scope: $scope});
			}
		}); 
	}


	/**
	@function stopLiveFlight
	@memberOf angular_controller.FlightConsole
	@param {String} _flightId - Represents a single stored or running flight.
	@description This function takes in a flight id and stops its associated
	flight process. It also notifies the user as to the status of the stop 
	action.
	*/
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
				$scope.type = 'success';
				Notification({message: data.data.message, scope: $scope}); 
			}
			else {
				$scope.type = 'error';
				Notification({message: data.data.message, scope: $scope});
			}

			Websocket.deleteAllLiveData();
		}); 
	}

	/**
	@function uploadFile
	@memberOf angular_controller.FlightConsole
	@param {String} _file - Represents the uploaded file's file name.
	@param {String} _flightId - Represents a single stored or running flight.
	@description Starts a decoder process for the uploaded file, which will
	convert the uploaded DAT file into a format that we can use to access
	contained data.
	*/
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
        }, function(){ // start analysis

        	// set animation
        	for(var i=0;i<$scope.flights.length;i++){
				if($scope.flights[i]._id === _flightId)
					$scope.flights[i].analyzing = true;
			}
		
        }, function(){ // end analysis

        	// end animation
        	for(var i=0;i<$scope.flights.length;i++){
				if($scope.flights[i]._id === _flightId)
					$scope.flights[i].analyzing = false;
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
					$scope.flights[i].analyzing = false;
					$scope.flights[i].created_at = (new Date($scope.flights[i].created_at)).toString();
				}
			}
		} 
		else $scope.noFlightData = false;
	});
});