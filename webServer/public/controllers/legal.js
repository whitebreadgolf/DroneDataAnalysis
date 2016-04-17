angular.module('UavOpsInterface')
.controller('LegalCtrl', function($scope, TrackHeight, $interval){


	$scope.mainHeight = 0;

	var setTwitterHeight = $interval(function(){
		var height = TrackHeight.get('mainSection').current;

		// if the element has loaded with a height
		if(height >= 0){
			$scope.mainHeight = height;
			$interval.cancel(setTwitterHeight);
		}
	});
	
});