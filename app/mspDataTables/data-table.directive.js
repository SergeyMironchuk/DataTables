angular
.module('mspDataTable', [])
.directive('mspDataTable', function() {
    return{
        transclude: true,
        template: `
            <table style="width:100%"></table>
            <div ng-transclude></div>
            `,
        scope: {
            datasourceUrl: "@",
            className: "@"
        },
        link: function(scope, element, attrs, controller){
            let dtColumns = scope.columns.map(function(c){
                return {data: c.modelProperty ? c.modelProperty : null };
            });
            let dtColumnDefs = [];
            let columnNumber = 0;
            scope.columns.forEach(function (column){
                let columnDef = {
                    "targets": columnNumber,
                    "title": column.header,
                    "sortable": eval(column.sortable)
                };
                if (column.className) {
                    columnDef.className = column.className;
                }
                let asyncContents = "";
                if (column.asyncContents.length > 0) {
                    let asyncContentNumber = 0;
                    column.asyncContents.forEach(function(asyncAction){
                        asyncContents += "<span async-content-id='"
                            + columnNumber + "_" + asyncContentNumber++ + "'>"
                            + asyncAction.spinTemplate + "</span>";
                    });
                }
                let actions = "";
                if (column.actions.length > 0) {
                    let actionNumber = 0;
                    column.actions.forEach(function(action){
                        if (action.template) {
                            let html = $($.parseHTML(action.template));
                            html.first().attr("action-id", columnNumber + "_" + actionNumber++);
                            html.css('cursor', 'pointer');
                            actions += html.prop('outerHTML');
                        }
                    });
                }
                if (column.template) {
                    columnDef.render = function(data, type, model) {
                        return eval(column.template) + asyncContents + actions;
                    }
                }
                else if ((actions || asyncContents) && column.modelProperty){
                    columnDef.render = function(data, type, model) {
                        return data + asyncContents + actions;
                    }
                }
                else if (actions || asyncContents){
                    columnDef.render = function(data, type, model) {
                        return asyncContents + actions;
                    }
                }
                dtColumnDefs.push(columnDef);
                columnNumber++;
            });

            let tableElement = element.find('table').first();
            tableElement.addClass(scope.className);
            tableElement.DataTable( {
                "ajax": scope.datasourceUrl,
                "columns": dtColumns,
                "columnDefs": dtColumnDefs

            });

            let table = tableElement.DataTable();
            tableElement.on('click', '[action-id]', function () {
                let actionElement = $(this);
                let tr = actionElement.parents("tr");
                let model = table.row( tr ).data();
                let actionId = actionElement.attr("action-id");
                if (actionId) {
                    let actionIdArray = actionId.split('_');
                    let action = scope.columns[+actionIdArray[0]].actions[+actionIdArray[1]];
                    action.onAction({id: model.id});
                }
            } );
            table.on('draw', function () {
                tableElement.find('[async-content-id]').each(function(){
                    let contentElement = $(this);
                    let tr = contentElement.parents("tr");
                    let model = table.row( tr ).data();
                    let contentId = contentElement.attr("async-content-id");
                    if (contentId) {
                        let contentIdArray = contentId.split('_');
                        let asyncContent = scope.columns[+contentIdArray[0]].asyncContents[+contentIdArray[1]];
                        asyncContent.getAsyncContent({id: model.id})
                            .then(function(content){
                                contentElement.html(content);
                            })
                            .catch(function(error){
                                contentElement.html(error);
                            });
                    }
                });
            } );
        },
        controller: ["$scope", function ($scope) {
            this.columns = $scope.columns = [];
            this.addColumn = function(scope){
                this.columns.push(scope);
            };
        }]
    }
})
.directive('mspColumn', function() {
    return {
        transclude: true,
        template: '<div ng-transclude></div>',
        require: '^^mspDataTable',
        restrict: 'E',
        scope: {
            modelProperty: '@',
            header: '@',
            template: "@",
            className: "@",
            sortable: "@"
        },
        link: function(scope, element, attrs, tableCtrl) {
            tableCtrl.addColumn(scope);
        },
        controller: ["$scope", function ($scope) {
            this.actions = $scope.actions = [];
            this.asyncContents = $scope.asyncContents = [];
            this.addAction = function(action){
                this.actions.push(action);
            };
            this.addAsyncContent = function(asyncContent){
                this.asyncContents.push(asyncContent);
            };
            this.changeTemplate = function(template) {
                $scope.template = template;
            }
        }]
    }
})
.directive('mspColumnAction', function() {
    return {
        transclude: true,
        require: '^^mspColumn',
        restrict: 'E',
        scope: {
            onAction: "&",
            template: '@'
        },
        link: function(scope, element, attrs, columnCtrl) {
            scope.template = "<span>" + scope.template + "&nbsp;</span>";
            columnCtrl.addAction(scope);
        }
    }
})
.directive('mspColumnTemplate', function() {
    return {
        transclude: true,
        require: '^^mspColumn',
        template: '<div ng-transclude></div>',
        restrict: 'E',
        scope: {
        },
        link: function(scope, element, attrs, columnCtrl) {
            let templateElement = element.children().first();
            let templateText = templateElement.html().trim();
            let leading = templateText.startsWith("[[") ? "" : "'";
            let trailing = templateText.endsWith("]]") ? "" : "'";
            let template = leading + templateText
                .replace(/\"/g, "\\'")
                .replace(/^\[\[/g, "")
                .replace(/\]\]$/g, "")
                .replace(/\[\[/g, "'+")
                .replace(/\]\]/g, "+'")
            + trailing;
            templateElement.html("");
            columnCtrl.changeTemplate(template);
        }
    }
})
.directive('mspAsyncContent', function() {
    return {
        transclude: true,
        require: '^^mspColumn',
        restrict: 'E',
        scope: {
            getAsyncContent: "&",
            spinTemplate: '@'
        },
        link: function(scope, element, attrs, columnCtrl) {
            columnCtrl.addAsyncContent(scope);
        }
    }
});