angular.module('UavOpsInterface')
.controller('FlightCtrl', function($scope, $http){
	
	$scope.startFlight = function (fileExt, fileType){

		var req = {
			method: 'POST',
			url: 'api/preflight',
			data: {ext: fileExt, type: fileType}
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