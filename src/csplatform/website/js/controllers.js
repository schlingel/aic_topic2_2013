'use strict';

var taskUrl = 'http://localhost:34555/tasks';
var simulateUrl = 'http://localhost:34555/simulate/';

var crowdApp = angular.module('crowdApp', ['ngRoute']);

crowdApp.controller('TaskListCtrl', ['$scope', '$http', '$route', function ($scope, $http, $route) {
    $scope.simulateResult = function(task) {
        $http.get(simulateUrl + task.id).success(function() {
            $http.get(task.callback).success(function(result) {
                if (result && result.success) {
                    alert("Successfull!");
                }
                $http.put(taskUrl, {task_id: task.id, status: 1});
            });
        });
    };

    $http.get(taskUrl + '?status=0').success(function(result) {
        if (result && result.success) {
            $scope.tasks = result.tasks;
        }
    });

    $http.get(taskUrl + '?status=1').success(function(result) {
        if (result && result.success) {
            $scope.finishedTasks = result.tasks;
        }
    });
}]);

