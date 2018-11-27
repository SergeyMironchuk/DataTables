'use strict';

// Declare app level module which depends on views, and core components
angular.module('myApp', ['mspcDataTable',
  'ngRoute',
  'myApp.view1',
  'myApp.view2',
  'myApp.version'
]).
controller('MainCtrl', ["$scope", function MainCtrl($scope){
  $scope.myEvent = function(id){
      alert( 'callback ' + id);
  }
}]);
