angular.module('UavOpsInterface')
.controller('HistGraphModal', function ($scope, $uibModalInstance, $location, text, time, rerouteTime, rerouteFlight) {
  $scope.time = time;
  $scope.text = text;
  $scope.rerouteTime = function () {
    $uibModalInstance.close();
    $location.path(rerouteTime.trim());
  };
  $scope.rerouteFlight = function () {
    $uibModalInstance.close();
    $location.path(rerouteFlight.trim());
  };
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});