/**
@class angular_factories.FlightName
@memberOf angular_factories
*/
angular.module('UavOpsInterface')
.factory('FlightName', function ($http){
	return {
	    getFlights: function(){
	    	var req = {method: 'GET', url: 'api/flight'};
			return $http(req).then(function(data){
				if(data.data.success){
					if(data.data.data.length === 0) return {dataError: false, noData: true, flights: []};
					else return {dataError: false, noData: false, flights: data.data.data};
				}	
				else return {dataError: true, noData: false, flights: []};
			});
	    }
	};
});