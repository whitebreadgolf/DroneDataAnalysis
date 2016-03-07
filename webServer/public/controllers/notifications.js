angular.module('UavOpsInterface')
.controller('NotificationsCtrl', function($scope, Websocket, $interval){
	$scope.greeting = "You've got Notifications!";
  
  	$interval(function (){
  		$scope.notifications = Websocket.getNotifications();
	}, 100); 
});