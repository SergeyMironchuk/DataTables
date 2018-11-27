'use strict';

angular.module('mspcDataTable')
.directive('mspcDataTable', function() {
    return{
        transclude: true,
        templateUrl: 'mspcDataTables/data-table.directive.html',
        scope: {
            datasourceUrl: "@"
        },
        compile: function(){
            return {
                post: function(scope, element, attrs, controller){
                    let dtColumns = scope.columns.map(function(c){
                        return {data: c.modelProperty ? c.modelProperty : null };
                    });
                    let dtColumnDefs = [];
                    let columnNumber = 0;
                    scope.columns.forEach(function (column){
                        if (column.actions.length > 0) {
                            let columnDef = {
                                "targets": columnNumber,
                                "defaultContent": ""
                            };
                            let actionNumber = 0;
                            column.actions.forEach(function(action){
                                if (action.template) {
                                    let html = $($.parseHTML(action.template));
                                    html.first().attr("action-id", columnNumber + "_" + actionNumber++);
                                    html.css('cursor', 'pointer');
                                    columnDef.defaultContent += html.prop('outerHTML');
                                }
                            });
                            dtColumnDefs.push(columnDef);
                        }
                        columnNumber++;
                    });
                    let table = $('#example').DataTable( {
                        "ajax": scope.datasourceUrl,
                        "columns": dtColumns,
                        "columnDefs": dtColumnDefs
                    });

                    $('#example tbody').on('click', '[action-id]', function () {
                        let button = $(this);
                        let tr = button.parents("tr");
                        let model = table.row( tr ).data();
                        let actionId = button.attr("action-id");
                        if (actionId) {
                            let actionIdArray = actionId.split('_');
                            let action = scope.columns[+actionIdArray[0]].actions[+actionIdArray[1]];
                            action.onAction({id: model.id});
                        }
                    } );
                }
            }
        },
        controller: ["$scope", function ($scope) {
            this.columns = $scope.columns = [];
            this.addColumn = function(scope){
                this.columns.push(scope);
            };
        }]
    }
})
.directive('mspcColumn', function() {
    return {
        transclude: true,
        template: '<div ng-transclude></div>',
        require: '^^mspcDataTable',
        restrict: 'E',
        scope: {
            modelProperty: '@',
            header: '@'
        },
        link: function(scope, element, attrs, tableCtrl) {
            tableCtrl.addColumn(scope);
        },
        controller: ["$scope", function ($scope) {
            this.actions = $scope.actions = [];
            this.addAction = function(action){
                this.actions.push(action);
            };
        }]
    }
})
.directive('mspcColumnAction', function() {
    return {
        transclude: true,
        require: '^^mspcColumn',
        restrict: 'E',
        scope: {
            title: '@',
            onAction: "&",
            template: '@'
        },
        link: function(scope, element, attrs, columnCtrl) {
            columnCtrl.addAction(scope);
        }
    }
});