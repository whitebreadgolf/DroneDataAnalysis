/**
@class angular_controller.NewProfile
@memberOf angular_controller
@requires Notification
*/
angular.module('UavOpsInterface')
.controller('NewProfileCtrl', function($scope, $http, Notification){
	
	/**
	@function newProfileSubmit
	@memberOf angular_controller.NewProfile
	@description This function takes in a name, username, and password
	combination from the scoped textboxes and saves it as a user in the
	database.
	*/
	$scope.submit = function (){

		var req = {
			method: 'POST',
			url: 'api/createprofile',
			data: { pass: $scope.pass, username: $scope.username, name: $scope.name, reg_id: $scope.reg_id }
		}

		for(var key in req.data){
			if(!req.data[key] || req.data[key] === ''){ 
				$scope.type = 'error';
				Notification({message: 'complete all fields', scope: $scope});
				return;
			}
		}

		$http(req).then(function(data){
			if(data.data.success) {
				$scope.type = 'success';
				Notification({message: 'User registered, please log in', scope: $scope});
			} 
			else {
				$scope.type = 'error';
				Notification({message: data.data.message, scope: $scope});
			}
		});
		
	}
  
});