angular.module('UavOpsInterface')
.controller('UserCtrl', function ($scope, Session){	
    $scope.loggedIn = false;
    Session.getUser().then(function(user){
        if(user.name){
            $scope.loggedIn = true;
            $scope.name = user.username;
        }
    });
});