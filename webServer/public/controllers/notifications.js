/**
@class angular_controller.Notifications
@memberOf angular_controller
@description This module accesses notifications in websocket which enables
notifications to show on screen.
@requires angular_factories.Websocket
*/
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


