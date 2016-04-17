/**
@class angular_controller.Configuration
@memberOf angular_controller
@description This module serves to set the configuration values for the websocket 
on the front end.
*/
angular.module('UavOpsInterface')
.controller('ConfigurationCtrl', function ($scope, Websocket, $interval){	
	
	$scope.altitudeConfiguration = {
		isValid:false, 
		status: "",
	};

	$interval(function (){
  		$scope.altitudeConfiguration = Websocket.getConfiguration();
	}, 100); 

	if($scope.altitudeConfiguration > 0){
		$scope.altitudeConfiguration.status = "Valid max altitude configuration"
		$scope.altitudeConfiguration.isValid = true; 
	}
	else{
		$scope.altitudeConfiguration.status = "Invalid max altitude configuration. Altitude must be a positive number."
		$scope.altitudeConfiguration.isValid = false; 
	}

	$scope.updateAltitudeConfig = function (){
			
	}
});