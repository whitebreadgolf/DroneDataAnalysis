angular.module('UavOpsInterface')
.controller('FlightCtrl', function($scope, $http, Websocket){
	
	$scope.startFlight = function (fileExt, fileType){

		var req = {
			method: 'POST',
			url: 'api/simulation/start',
			data: {ext: fileExt, type: fileType}
		}

		$http(req).then(function(data){
			console.log(data);
		});	
	}

	$scope.endFlight = function (){

		var req = {
			method: 'POST',
			url: 'api/simulation/end',
		}

		$http(req).then(function(data){
			console.log(data);

			// delete all internal data
			Websocket.deleteAllNotifications();
			Websocket.deleteAllSpeeds();
			Websocket.deleteAllAltitudes();
		});		
	}
});