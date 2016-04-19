/**
@class angular_controller.PreflightConsole
@memberOf angular_controller
@description This module helps to display the data needed for 
preflight checks. It also takes in data from the scoped textboxes, 
saves them as part of a preflight data object, and notifies the user
whether the save was successful or not.
@requires Notification
*/
angular.module('UavOpsInterface')
.controller('PreflightCtrl', function($scope, $http, Notification){
	
	$scope.submit = function(){

		// organize data
		var preflightData = {
			flight_name: $scope.name,
			remote_controller_charge: parseInt($scope.controllerCharge),
			intelligent_flight_battery: parseInt($scope.droneCharge),
			propeller_0: parseInt($scope.propeller1),
			propeller_1: parseInt($scope.propeller2),
			propeller_2: parseInt($scope.propeller3),
			propeller_3: parseInt($scope.propeller4),
			micro_sd: parseInt($scope.sdCard),
			gimbal: parseInt($scope.gimbal)
		};
		console.log(preflightData);
		for(var key in preflightData){
			
			if(preflightData[key] === undefined || preflightData[key] === ''){ 
				Notification({message: 'fill out all data-fields'}, 'error');
				return;
			}
		}

		var req = {
			method: 'POST',
			url: 'api/preflight',
			data: preflightData
		};

		$http(req).then(function(data){
			if(data.data.success) Notification({message: data.data.message}, 'success'); 
			else Notification({message: data.data.message}, 'error');
		});	
	};
});