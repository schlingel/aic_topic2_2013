'use strict';

var taskUrl = 'http://localhost:34555/tasks';
var simulateUrl = 'http://localhost:34555/simulate/';

var crowdApp = angular.module('crowdApp', []);

crowdApp.controller('TaskListCtrl', ['$scope', '$http', function ($scope, $http) {
    $scope.simulateResult = function(task) {
        $http.get(simulateUrl + task.id).success(function() {
            $http.get(task.callback).success(function(result) {
                if (result && result.success) {
                    alert("Successfull!");
                }
            });
        });
    };

    $http.get(taskUrl).success(function(result) {
        if (result && result.success) {
            $scope.tasks = result.tasks;
        }
    });
}]);

