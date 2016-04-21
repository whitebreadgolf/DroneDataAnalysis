angular.module('UavOpsInterface')
.controller('HistGraphModal', function ($scope, $uibModalInstance, $location, text, time, reroute) {
  $scope.time = time;
  $scope.text = text;
  console.log(reroute);
  $scope.reroute = function () {
    $uibModalInstance.close();
    $location.path(reroute.trim());
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});