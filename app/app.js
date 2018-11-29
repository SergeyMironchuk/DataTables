'use strict';

// Declare app level module which depends on views, and core components
angular.module('myApp', ['mspDataTable']).
controller('MainCtrl', ["$scope", "$q", function MainCtrl($scope, $q){
    $scope.onEmail = function(id){
        alert( 'EMailed to ' + id);
    };
    $scope.onDelete = function(id){
        alert( 'Deleted ' + id);
    };
    $scope.getAsyncContent1 = function(id){
      return $q(function(resolve, reject) {
          setTimeout(function() {
              if (true) {
                  resolve(id + '-<i class="far fa-smile fa-sm"></i>&nbsp;&nbsp;&nbsp;');
              } else {
                  reject('error');
              }
          }, 1000);
      });
    };
    $scope.getAsyncContent2 = function(id){
        return $q(function(resolve, reject) {
            setTimeout(function() {
                if (true) {
                    resolve('City-' + id);
                } else {
                    reject('error');
                }
            }, 1000);
        });
    };
}]);
