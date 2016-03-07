angular.module('UavOpsInterface')
.controller('NotificationsCtrl', function($scope, Websocket, $interval){
  
  	$interval(function (){
  		$scope.notifications = Websocket.getNotifications();
	}, 100); 

	$scope.notificationClicked = function (id){
		Websocket.deleteNotification(id);
	}

});


