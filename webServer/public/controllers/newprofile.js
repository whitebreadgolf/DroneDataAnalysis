angular.module('UavOpsInterface')
.controller('NewProfileCtrl', function($scope, $http, Notification){
	
	$scope.submit = function (){

		var req = {
			method: 'POST',
			url: 'api/createprofile',
			data: { pass: $scope.pass, username: $scope.username, name: $scope.name, reg_id: $scope.reg_id }
		}

		for(var key in req.data){
			if(!req.data[key] || req.data[key] === ''){ 
				Notification({message: 'complete all fields'}, 'error');
				return;
			}
		}

		$http(req).then(function(data){
			if(data.data.success) Notification({message: 'User registered, please log in'}, 'success'); 
			else Notification({message: data.data.message}, 'error');
		});
		
	}
  
});