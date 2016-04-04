angular.module('UavOpsInterface')
.controller('NotificationsHistCtrl', function($scope, $http){
  
	$scope.search = '';
	$scope.noteDataError = false;
	$scope.noNoteData = false;

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

	var req = {
		method: 'GET',
		url: 'api/flight'
	};
	var flights = ['test', 'test2'];
	$http(req).then(function(data){
		if(data.data.success){
			if(data.data.data.length === 0) $scope.noNoteData = true;
			else flights = data.data.data;	
		}	
		else $scope.noteDataError = true;
	});

	$scope.flightSearch = function(){

	};
	
	$('#the-basics .typeahead').typeahead(
		{hint: true, highlight: true, minLength: 1}, 
		{name: 'flights', source: substringMatcher(flights)}
	);
});


