var exceptionDB = ['postgres', 'template0', 'template1'];
var exceptionColumns = ['uuid'];

var tableSelected = null;
var isTableSelected = function (table){
  tableSelected = table;
  document.getElementById('displayButton').disabled = false;
}

var rowSelected = null;
var isRowSelected = function(row){
  document.getElementById('modifyButton').disabled = false;
  document.getElementById('deleteButton').disabled = false;
  if(rowSelected != row){
    document.getElementById(row).style.backgroundColor = "gray";
    if(rowSelected != null) document.getElementById(rowSelected).style.backgroundColor = "";
    rowSelected = row;
  }
  else{
    document.getElementById(row).style.backgroundColor = "";
    document.getElementById('modifyButton').disabled = true;
    document.getElementById('deleteButton').disabled = true;
    rowSelected = null;
  }
}

var app = angular.module('DBEditorAPF', ["ngRoute"]);

app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "html/defaultDisplay.html"
    })
    .when("/add", {
        templateUrl : "html/addRow.html"
    })
    .when("/modify", {
        templateUrl : "html/modifyRow.html"
    });
});

app.factory('columnsDisplayFactory', function(){
  var theScope;

  return{
    setScope : function(scope){
      theScope = scope;
    },

    getScope : function(){
      return theScope;
    }
  };
});

app.factory('postgresqlFactory', function(){
  var theScope;

  return{
    setScope : function(scope){
      theScope = scope;
    },

    getScope : function(){
      return theScope;
    }
  };
});

app.controller('treeDatabaseAreaController', function($scope, postgresqlFactory){
  $scope.databases = [];
  var postgresScope = postgresqlFactory.getScope();
  $scope.ready = false;

  postgresScope.getDBName(function(){
    if(!postgresScope.dbArray){
      alert('The request has failed, contact your administrator')
    }
    else{
      for(let i=0;i<postgresScope.dbArray.data.length;i++){
        if(!exceptionDB.includes(postgresScope.dbArray.data[i].datname)){
          postgresScope.getTableName(postgresScope.dbArray.data[i].datname, function(){
            if(postgresScope.tableArray){
              $scope.databases.push({
                name : postgresScope.dbArray.data[i].datname,
                table : postgresScope.tableArray.data
              });
              $scope.ready = true;
              $(function() {
                $('#treeDatabaseArea').jstree();
              });
            }
          });
        }
      }
    }
  });
});

app.controller('columnsDisplayAreaController', function($scope, columnsDisplayFactory){
  columnsDisplayFactory.setScope($scope);
});

app.controller('buttonAreaController', function($scope, columnsDisplayFactory, postgresqlFactory){

  var postgresScope = postgresqlFactory.getScope();

  document.getElementById("displayButton").disabled = true;
  if(document.getElementById("addButton") != null) document.getElementById("addButton").disabled = true;
  if(document.getElementById("modifyButton") != null) document.getElementById("modifyButton").disabled = true;
  if(document.getElementById("deleteButton") != null) document.getElementById("deleteButton").disabled = true;
  document.getElementById("clearButton").disabled = false;

  $scope.display = function(){

    var columnsDisplayScope = columnsDisplayFactory.getScope();

    document.getElementById("columnsDisplayArea").style.display = "block";
    if(document.getElementById("modifyButton") != null) document.getElementById("modifyButton").disabled = true;
    if(document.getElementById("deleteButton") != null) document.getElementById("deleteButton").disabled = true;
    if(tableSelected != null){
      let temp = tableSelected.split(';');
      let db = temp[0];
      let table = temp[1];
      document.getElementById('addButton').disabled = false;

      postgresScope.getColumnName(db, table, function(){
        if(postgresScope.columnsArray){
          columnsDisplayScope.columns = postgresScope.columnsArray.data;
          postgresScope.getAllValues(db, table, function(){
            if(postgresScope.columnValues){
              columnsDisplayScope.tuples = [];
              for(let i=0;i<postgresScope.columnValues.data.length;i++){
                temp = [];
                for(let j=0;j<columnsDisplayScope.columns.length;j++){
                  temp.push(postgresScope.columnValues.data[i][(columnsDisplayScope.columns[j].column_name).toString()]);
                }
                columnsDisplayScope.tuples.push({
                  values : temp
                });
              }
            }
          });
          postgresScope.getColumnConstraint(db, table, function(){
            if(!postgresScope.columnConstraint)
              console.log('Aucunce contraintes de clé étrangère trouvées pour cette table');
          });
        }
      });
    }
  }

  $scope.add = function(){

    document.getElementById('addButton').disabled = true;
    document.getElementById("modifyButton").disabled = true;
    document.getElementById("deleteButton").disabled = true;

  };

  $scope.modify = function(){

    document.getElementById('addButton').disabled = true;
    document.getElementById("modifyButton").disabled = true;
    document.getElementById("deleteButton").disabled = true;
  }

  $scope.delete = function(){
    if(confirm('Do you want to delete this record ?')){
      //Faire requête de suppression
      var isRecord;
      var rowSelectedParse = JSON.parse(rowSelected);

      for(var i=0; i<columnsDisplayScope.tuples.length;i++){
        isRecord = true;
        for(var j=0; j<columnsDisplayScope.tuples[i].values.length; j++){
          if(columnsDisplayScope.tuples[i].values[j] !== rowSelectedParse[j]){
            isRecord = false;
            break;
          }
        }
        if(isRecord){
          columnsDisplayScope.tuples.splice(i,1);
          rowSelected = null;
          document.getElementById("modifyButton").disabled = true;
          document.getElementById("deleteButton").disabled = true;
          break;
        }
      }
    }
  };

  $scope.clear = function(){
    document.getElementById("columnsDisplayArea").style.display = "none";
    document.getElementById("addButton").disabled = true;
    document.getElementById("modifyButton").disabled = true;
    document.getElementById("deleteButton").disabled = true;
  };
});

app.controller('addRowAreaController', function($scope, columnsDisplayFactory, postgresqlFactory){

  var columnsDisplayScope = columnsDisplayFactory.getScope();
  var postgresqlScope = postgresqlFactory.getScope();

  $scope.attributes = [];
  for(let i=0;i<columnsDisplayScope.columns.length;i++){
    if(!exceptionColumns.includes(columnsDisplayScope.columns[i].column_name))
      $scope.attributes.push(columnsDisplayScope.columns[i]);
  };

  $scope.checkIfIsReference = function(att){
    var ret = false;
    alert("ok1");

    if(tableSelected != null){
      for(let i=0; i<postgresqlScope.columnConstraint.length; i++){
        if(att === postgresqlScope.columnConstraint[i].column_name){
          alert("ok2");
          $scope.foreignColumName = postgresqlScope.columnConstraint[i].foreign_column_name;
          $scope.foreignTableName = postgresqlScope.columnConstraint[i].foreign_table_name;
          ret = true;
          break;
        }
      }
    }
    return ret;
  };

  $scope.getReferences = function(att){
    ret = [];


    if(tableSelected != null){

      postgresqlScope.getValuesOf($scope.foreignColumName, $scope.foreignTableName, function(){
        if(postgresqlScope.valuesOf){
          console.log(postgresqlScope.valuesOf);
        }

      })
    }

    return ret;
  };

  $scope.saveRecord = function(){

    if(confirm("Are you sure you want to save this record ?")){

      window.location = "#!display";
      document.getElementById('addButton').disabled = false;

    }
  }

  $scope.cancelRecord = function(){

    if(confirm("Are you sure you want to cancel ?")){

      window.location = "#!display";
      document.getElementById('addButton').disabled = false;

    }
  }

});

app.controller('modifyRowAreaController', function($scope){

  $scope.saveRecord = function(){
    if(confirm("Are you sure you want to save this record ?")){

      window.location = "#!display";
      document.getElementById('addButton').disabled = false;
    }
  }

  $scope.cancelRecord = function(){
    if(confirm("Are you sure you want to cancel ?")){

      window.location = "#!display";
      document.getElementById('addButton').disabled = false;

    }
  }

  $scope.attributes = [
    {
      name : "Att1",
      value : "Val1"
    },
    {
      name : "Att2",
      value : "Val2"
    },
    {
      name : "Att3",
      value : "Val3"
    }
  ];

  $scope.checkIfIsReference = checkIfIsReference;

  $scope.getReferences = function(att, value){
    ret = ["Val4","Val5","Val6"]; //Retourner toutes les références sauf values

    return ret;
  };
});

app.controller('postgresqlController', function($scope,$http, postgresqlFactory){

  postgresqlFactory.setScope($scope);

  $scope.getDBName = function(callback){
    $http({
      method: 'GET',
      url: '/db/getDBName'
    })
    .then(
      function successCallback(data) {
        $scope.dbArray = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.dbArray = false;
        if(callback) callback();
    });
  };

  $scope.getTableName = function(dbName,callback){
    $http({
      method: 'GET',
      url: '/db/getTableName?db='+dbName
    })
    .then(
      function successCallback(data) {
        $scope.tableArray = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.tableArray = false;
        if(callback) callback();
    });
  };

  $scope.getColumnName = function(dbName,tableName,callback){
    $http({
      method: 'GET',
      url: '/db/getColumnName?db='+dbName+'&table='+tableName
    })
    .then(
      function successCallback(data) {
        $scope.columnsArray = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.columnsArray = false;
        if(callback) callback();
    });
  };

  $scope.getColumnConstraint = function(dbName,tableName,callback){
    $http({
      method: 'GET',
      url: '/db/getColumnConstraint?db='+dbName+'&table='+tableName
    })
    .then(
      function successCallback(data) {
        $scope.columnConstraint = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.columnConstraint = false;
        if(callback) callback();
    });
  };

  $scope.getAllValues = function(dbName,tableName,callback){
    $http({
      method: 'GET',
      url: '/db/getAllValues?db='+dbName+'&table='+tableName
    })
    .then(
      function successCallback(data) {
        $scope.columnValues = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.columnValues = false;
        if(callback) callback();
    });
  };

  $scope.getValuesOf = function(dbName,tableName,columnName,callback){
    $http({
      method: 'GET',
      url: '/db/getValuesOf?db='+dbName+'&table='+tableName+'&att='+columnName
    })
    .then(
      function successCallback(data) {
        $scope.valuesOf = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.valuesOf = false;
        if(callback) callback();
    });
  };


});
