/**
@class angular_controller.NewProfile
@memberOf angular_controller
*/
angular.module('UavOpsInterface')
.controller('NewProfileCtrl', function($scope, $http){
	
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
			data: { pass: $scope.pass, username: $scope.username, name: $scope.name }
		}

		$http(req).then(function(data){
			console.log(data);
		});
		
	}
  
});