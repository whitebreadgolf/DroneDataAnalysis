angular.module('UavOpsInterface')
.controller('ConfigurationCtrl', function ($scope, Websocket, $interval){	
	
	$interval(function (){
  		$scope.altitudes = Websocket.getConfiguration();
	}, 100); 


});