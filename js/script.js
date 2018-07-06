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

app.factory('buttonAreaFactory', function(){
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

app.controller('buttonAreaController', function($scope, columnsDisplayFactory, postgresqlFactory, buttonAreaFactory){

  buttonAreaFactory.setScope($scope);
  var postgresScope = postgresqlFactory.getScope();

  document.getElementById("displayButton").disabled = true;
  if(document.getElementById("addButton") != null) document.getElementById("addButton").disabled = true;
  if(document.getElementById("modifyButton") != null) document.getElementById("modifyButton").disabled = true;
  if(document.getElementById("deleteButton") != null) document.getElementById("deleteButton").disabled = true;
  document.getElementById("clearButton").disabled = false;

  $scope.display = function(){

    var columnsDisplayScope = columnsDisplayFactory.getScope();
    window.location = "#!";

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
            if(postgresScope.columnConstraint){
              postgresScope.valuesOfConstraint = [];
              for(let i=0; i<postgresScope.columnConstraint.data.length; i++){
                let temp = [];
                postgresScope.getValuesOf(db,postgresScope.columnConstraint.data[i].foreign_table_name,postgresScope.columnConstraint.data[i].foreign_column_name, function(){
                  if(postgresScope.valuesOf){
                    for(val in postgresScope.valuesOf.data)
                      temp.push(val);
                  }
                });
                postgresScope.valuesOfConstraint.push({
                  name : postgresScope.columnConstraint.data[i].column_name,
                  values : temp
                });
              }
            };
          });
        };
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

app.controller('addRowAreaController', function($scope, columnsDisplayFactory, postgresqlFactory, buttonAreaFactory){

  var columnsDisplayScope = columnsDisplayFactory.getScope();
  var postgresqlScope = postgresqlFactory.getScope();
  var buttonAreaScope = buttonAreaFactory.getScope();

  $scope.attributes = [];
  for(let i=0;i<columnsDisplayScope.columns.length;i++){
    if(!exceptionColumns.includes(columnsDisplayScope.columns[i].column_name))
      $scope.attributes.push(columnsDisplayScope.columns[i]);
  };

  $scope.checkIfIsReference = function(att){
    var ret = false;

    if(tableSelected != null){
      for(let i=0; i<postgresqlScope.columnConstraint.data.length; i++){
        if(att === postgresqlScope.columnConstraint.data[i].column_name){
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
      for(let i=0; i<postgresqlScope.valuesOfConstraint.length; i++){
        if(att === postgresqlScope.valuesOfConstraint[i].name){
          ret = postgresqlScope.valuesOfConstraint[i].values;
          break;
        }
      }
    }
    return ret;
  };

  $scope.saveRecord = function(){

    if(confirm("Are you sure you want to save this record ?")){

      window.location = "#!";
      document.getElementById('addButton').disabled = false;
      if(rowSelected != null) document.getElementById('modifyButton').disabled = false;

      if(tableSelected != null){
        let temp = tableSelected.split(';');
        let db = temp[0];
        let table = temp[1];

        columnList = [];
        for(let i=0; i<$scope.attributes.length; i++)
          columnList.push($scope.attributes[i].column_name);

        valueList = [];
        for(let j=0; j<columnList.length; j++){
          console.log(columnList[j]);
          let elt = document.getElementById(columnList[j]/*.toString()*/);
          if(elt.nodeName === "INPUT") valueList.push(elt.value);
          else if(elt.nodeName === "SELECT") value.list.push(elt.options[elt.selectedIndex].text);
        }

        postgresqlScope.addRecord(db, table, columnList, valueList, function(){
          if(postgresqlScope.insertSucess){
            console.log(postgresqlScope.insertSucess);
            buttonAreaScope.display();
          }
        });
      }
    }
  };

  $scope.cancelRecord = function(){

    if(confirm("Are you sure you want to cancel ?")){

      window.location = "#!";
      document.getElementById('addButton').disabled = false;
      if(rowSelected != null) document.getElementById('modifyButton').disabled = false;

    }
  };
});

app.controller('modifyRowAreaController', function($scope, columnsDisplayFactory, postgresqlFactory){

  var columnsDisplayScope = columnsDisplayFactory.getScope();
  var postgresqlScope = postgresqlFactory.getScope();

  $scope.attributes = [];
  let parseRowSelected = JSON.parse(rowSelected);
  for(let i=0;i<columnsDisplayScope.columns.length;i++){
    if(!exceptionColumns.includes(columnsDisplayScope.columns[i].column_name))
      $scope.attributes.push({
        name : columnsDisplayScope.columns[i],
        value : parseRowSelected[i]
      });
  };

  $scope.saveRecord = function(){
    if(confirm("Are you sure you want to save this record ?")){

      window.location = "#!";
      document.getElementById('addButton').disabled = false;
      document.getElementById('modifyButton').disabled = false;
    }
  }

  $scope.cancelRecord = function(){
    if(confirm("Are you sure you want to cancel ?")){

      window.location = "#!";
      document.getElementById('addButton').disabled = false;
      document.getElementById('modifyButton').disabled = false;
    }
  }

  $scope.checkIfIsReference = function(att){
    var ret = false;

    if(tableSelected != null){
      for(let i=0; i<postgresqlScope.columnConstraint.data.length; i++){
        if(att === postgresqlScope.columnConstraint.data[i].column_name){
          ret = true;
          break;
        }
      }
    }
    return ret;
  };

  $scope.getReferences = function(att, val){
    ret = [];
    if(tableSelected != null){
      for(let i=0; i<postgresqlScope.valuesOfConstraint.length; i++){
        if(att === postgresqlScope.valuesOfConstraint[i].name){
          ret = postgresqlScope.valuesOfConstraint[i].values;
          ret.splice(ret.indexOf(val), 1);
          break;
        }
      }
    }
    return ret;
  };
});

app.controller('postgresqlController', function($scope,$http, postgresqlFactory){

  window.location = "#!";
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

  $scope.addRecord = function(dbName,tableName,columnList,valueList,callback){

    tempCol = "["+columnList.toString()+"]";
    tempVal = "["+valueList.toString()+"]";
    console.log(tempCol);
    console.log(tempVal);

    columnListParse = JSON.parse("[test, test]");
    valueListParse = JSON.parse(tempVal);
    columns = "";
    values = "";

    for(col in columnListParse)
      columns += col+",";
    for(val in valueListParse)
      values += val+",";

    columns.replace(/.$/,"");
    values.replace(/.$/,"");

    console.log(columns);
    console.log(values);

    $http({
      method: 'GET',
      url: '/db/addRecord?db='+dbName+'&table='+tableName+'&column_list=['+columnList.toString()+']&value_list=['+valueList.toString()+']'
    })
    .then(
      function successCallback(data) {
        $scope.insertSucess = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.valuesOf = false;
        if(callback) callback();
    });
  };
});
