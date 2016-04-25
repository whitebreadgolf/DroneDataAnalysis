angular.module('UavOpsInterface')
.controller('LogoutCtrl', function($location, $window, Session){

	Session.getUser().then(function(data){
		if(data.name){
			Session.logout().then(function(){
				$window.location.reload();
			});
		}
		else{
			$location.path('/about');
		}
	});
	
});