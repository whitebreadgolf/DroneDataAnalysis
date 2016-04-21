angular.module('UavOpsInterface')
.controller('DataOverviewCtrl', function ($scope, $http, $routeParams){	
	var req = {
        method: 'GET', 
        url: 'api/all/'+ $routeParams.flightId + '/' + $routeParams.time, 
    };
    $http(req).then(function(data){    	
    	$scope.data = data.data.data;
    });
});