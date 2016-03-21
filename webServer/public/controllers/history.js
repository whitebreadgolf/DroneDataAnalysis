angular.module('UavOpsInterface')
.controller('HistoryCtrl', function ($scope, Websocket, $interval){	
	
	$interval(function (){
  		$scope.altitudes = Websocket.getHistory();
	}, 100); 


});