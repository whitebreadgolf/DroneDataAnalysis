/**
@class angular_controller.Login
@memberOf angular_controller
@requires Notification
*/
angular.module('UavOpsInterface')
.controller('LoginCtrl', function($scope, $http, Notification){
	
	/**
	@function loginSubmit
	@memberOf angular_controller.Login
	@description This function takes in the username and password from the 
	scoped password and username textboxes and submits the combination for 
	verification from the database. It then alerts the user with a notification
	as to whether the login was successful or not.
	*/
	$scope.submit = function (){

		// username/ password
		var data = { pass: $scope.pass, username: $scope.username };

		// check username/password
		for(var key in data){
			if(!data[key] || data[key] === ''){ 
				Notification({message: 'complete all fields'}, 'error');
				return;
			}
		}

		var req = { method: 'POST', url: 'api/login', data: data};
		$http(req).then(function(data){
			if(data.data.success) Notification({message: 'Welcome '+data.data.user.name}, 'success'); 
			else Notification({message: data.data.message}, 'error');
		});	
	}	
});