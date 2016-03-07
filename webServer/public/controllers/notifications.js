angular.module('UavOpsInterface')
.controller('NotificationsCtrl', function($scope, Websocket, $interval){
	$scope.greeting = "You've got Notifications!";
  
  	$interval(function (){
  		$scope.notifications = Websocket.getNotifications();
	}, 100); 

 	$scope.isHideAlert = false;
    //$scope.alertMessage = function(d){ return d.level; }
	$scope.alertMessage = "WARNING: Drone altitude level is nearing FAA Regulation maximum.";

});


