angular.module('UavOpsInterface')
.controller('NewProfileCtrl', function($scope, $http){
	
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