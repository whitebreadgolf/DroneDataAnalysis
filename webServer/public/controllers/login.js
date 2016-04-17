angular.module('UavOpsInterface')
.controller('LoginCtrl', function($scope, $http, Notification){
	
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