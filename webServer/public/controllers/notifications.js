angular.module('UavOpsInterface')
.controller('NotificationsCtrl', function($scope, Websocket, $interval){
  
  	$scope.notifications = [];
  	$scope.noNotifications = true;

  	$interval(function (){

  		// set notifications
  		var allNotifications = Websocket.getNotifications();
  		$scope.notifications = allNotifications;

  		// check size
  		if(allNotifications.length > 0) $scope.noNotifications = false;
  		else $scope.noNotifications = true;
	}, 100); 

	$scope.notificationClicked = function (id){
		Websocket.deleteNotification(id);
	}

});


