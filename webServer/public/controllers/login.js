angular.module('UavOpsInterface')
.controller('LoginCtrl', function($scope, $http){
	
	$scope.submit = function (){

		var req = {
			method: 'POST',
			url: 'api/login',
			data: { pass: $scope.pass, username: $scope.username }
		}

		$http(req).then(function(data){
			console.log(data);
		});
		
	}
  
  	
});