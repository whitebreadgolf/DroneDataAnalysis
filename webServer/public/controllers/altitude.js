angular.module('UavOpsInterface')
.controller('AltitudeCtrl', function ($scope, Websocket){	
	$scope.altitudes = Websocket.getAltitude();
});