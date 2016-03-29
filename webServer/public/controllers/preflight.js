angular.module('UavOpsInterface')
.controller('PreflightCtrl', function($scope, $http, Notification){
	
	$scope.submit = function(){

		// organize data
		var preflightData = {
			flight_name: $scope.name,
			remote_controller_charge: $scope.controllerCharge,
			intelligent_flight_battery: $scope.droneCharge,
			propeller_0: $scope.propeller1,
			propeller_1: $scope.propeller2,
			propeller_2: $scope.propeller3,
			propeller_3: $scope.propeller4,
			micro_sd: $scope.sdCard,
			gimbal: $scope.gimbal
		};

		for(var key in preflightData){
			console.log(preflightData[key]);
			if(preflightData[key] === undefined || !preflightData[key] || preflightData[key] === ''){ 
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