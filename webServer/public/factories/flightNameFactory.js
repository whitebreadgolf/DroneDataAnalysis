/**
@class angular_factories.FlightName
@memberOf angular_factories
*/
angular.module('UavOpsInterface')
.factory('FlightName', function ($http){
	 
	var substringMatcher = function(strs) {
		return function findMatches(q, cb) {
			var matches, substringRegex;

			// an array that will be populated with substring matches
			matches = [];

			// regex used to determine if a string contains the substring `q`
			substrRegex = new RegExp(q, 'i');

			$.each(strs, function(i, str) {
				if (substrRegex.test(str)) matches.push(str);
			});

			cb(matches);
		};
	};

	return {
		substringMatcher: substringMatcher,
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