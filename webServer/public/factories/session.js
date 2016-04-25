angular.module('UavOpsInterface')
.factory('Session', function ($http, Notification){
	return {
	    getUser: function(){
	    	var req = {method: 'GET', url: 'api/login'};
			return $http(req).then(function(data){
				if(data.data.name) Notification({message: 'Welcome '+data.data.name});
				return data.data;
			});
	    },
	    logout: function(){
	    	var req = {method: 'POST', url: 'api/logout'};
			return $http(req).then(function(data){
				return data.data;
			});
	    },
	};
});