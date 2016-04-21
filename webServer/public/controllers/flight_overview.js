angular.module('UavOpsInterface')
.controller('FlightOverviewCtrl', function ($scope, $http, $routeParams){	
	var req = {
        method: 'GET', 
        url: '/api/flight/'+ $routeParams.flightId, 
    };
    $http(req).then(function(data){   
    	console.log(data); 	
    	$scope.flight = data.data.data;
    });
});