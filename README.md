### `mspDataTables` — AngularJS directives for [DataTables.net](https://datatables.net/)

Cover subset of DataTables.net features according example below.

Result you can see here: [mspdatatables.azurewebsites.net](https://mspdatatables.azurewebsites.net)

```HTML
<body ng-app="myApp" ng-controller="MainCtrl">

<msp-data-table datasource-url="data/objects.txt" class-name="table table-striped table-bordered">
    <msp-column header="name" model-property="name">
        <msp-column-template>
            <i class="material-icons align-middle">person_pin</i> [[model.name]] (<b> [[model.id]] </b>)
        </msp-column-template>
    </msp-column>
    <msp-column header="position" model-property="position"></msp-column>
    <msp-column header="office" model-property="office">
        <msp-async-content
                get-async-content="getAsyncContent2(id)"
                spin-template=" <i class='fas fa-spinner fa-spin'></i>">
        </msp-async-content>
    </msp-column>
    <msp-column header="salary" model-property="salary" class-name="text-right"></msp-column>
    <msp-column header="" class-name="text-right" sortable="false">
        <msp-column-action
                on-action="onEmail(id)"
                template="<i class='material-icons align-middle'>email</i>">
        </msp-column-action>
        <msp-column-action
                on-action="onDelete(id)"
                confirm-message="Are you sure for delete?"
                template="<i class='material-icons align-middle'>delete</i>">
        </msp-column-action>
        <msp-async-content
                get-async-content="getAsyncContent1(id)"
                spin-template="<i class='fas fa-spinner fa-spin'></i>&nbsp;&nbsp;&nbsp;">
        </msp-async-content>
    </msp-column>
</msp-data-table>

</body>
```

Nothing more required. And beautiful and enough powerful data table appear in your form ([mspdatatables.azurewebsites.net](https://mspdatatables.azurewebsites.net)).

Functions related your domain logic is placed to App controller and other services.

#### App Controller code:

```JavaScript
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
                    resolve(', office ' + id);
                } else {
                    reject('error');
                }
            }, 1000);
        });
    };
}]);
```

#### Directives description

