angular.module('UavOpsInterface')
.controller('LoginCtrl', function($scope, $http, Notification){
	
	$scope.submit = function (){

		var req = {
			method: 'POST',
			url: 'api/login',
			data: { pass: $scope.pass, username: $scope.username }
		}

		$http(req).then(function(data){
			if(data.data.success) Notification({message: 'Welcome '+data.data.user.name}, 'success'); 
			else Notification({message: data.data.message}, 'error');
		});
		
	}
  
  	
});