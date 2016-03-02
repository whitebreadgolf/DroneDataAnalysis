angular.module('UavOpsInterface')
.controller('FlightCtrl', function($scope, $http){
	
	$scope.startFlight = function (){

		var req = {
			method: 'POST',
			url: 'api/preflight',
		}

		$http(req).then(function(data){
			console.log(data);
		});	
	}

	$scope.endFlight = function (){

		var req = {
			method: 'POST',
			url: 'api/endflight',
		}

		$http(req).then(function(data){
			console.log(data);
		});		
	}
});