var exceptionDB = ['postgres', 'template0', 'template1']; //The databases that will not be displayed
var exceptionColumns = ['uuid']; //The columns that will not be displayed

//When the user clicks on a table
var tableSelected = null;
var isTableSelected = function (table){
  tableSelected = table;
  document.getElementById('displayButton').disabled = false;
}

//When the user clicks on a row
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

//The application
var app = angular.module('DBEditorAPF', ["ngRoute"]);

//Here we configure the routes with the views
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

//The following factories allow to access an element in a controller when you are in another controller
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

//Each controller manage a view in the html
app.controller('treeDatabaseAreaController', function($scope, postgresqlFactory){
  $scope.databases = []; //This array will be use to by jtree
  var postgresScope = postgresqlFactory.getScope();

  postgresScope.getDBName(function(){ //We do the request and we define the callback function
    if(postgresScope.successRequest){
      for(let i=0;i<postgresScope.dbArray.data.length;i++){
        if(!exceptionDB.includes(postgresScope.dbArray.data[i].datname)){
          postgresScope.getTableName(postgresScope.dbArray.data[i].datname, function(){//We do the same thing for this request
            if(postgresScope.successRequest){
              $scope.databases.push({
                name : postgresScope.dbArray.data[i].datname,
                table : postgresScope.tableArray.data
              });
              $(function() {
                $('#treeDatabaseArea').jstree(); //Activating jtree
              });
            }
          });
        }
      }
    }
    else{
      alert()
    }
  });
});

app.controller('columnsDisplayAreaController', function($scope, columnsDisplayFactory){
  columnsDisplayFactory.setScope($scope);
});

app.controller('buttonAreaController', function($scope, columnsDisplayFactory, postgresqlFactory, buttonAreaFactory){

  buttonAreaFactory.setScope($scope);
  var postgresScope = postgresqlFactory.getScope();
  var columnsDisplayScope = columnsDisplayFactory.getScope();

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
      if(tableSelected != null){
        let temp = tableSelected.split(';');
        let db = temp[0];
        let table = temp[1];

        postgresScope.getPrimaryKey(db, table, function(){
          if(postgresScope.primaryKey){
            for(let i=0; i<columnsDisplayScope.columns.length; i++){
              if(postgresScope.primaryKey.data[0].attname === columnsDisplayScope.columns[i].column_name){
                var pkValue = JSON.parse(rowSelected)[i];
                break;
              }
            }
            postgresScope.delRecord(db, table,postgresScope.primaryKey.data[0].attname, pkValue, function(){
              if(postgresScope.deleteSuccess){
                $scope.display();
                rowSelected = null;
              }
            });
          }
        });
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
          let elt = document.getElementById(columnList[j]/*.toString()*/);
          if(elt.nodeName === "INPUT") valueList.push(elt.value);
          else if(elt.nodeName === "SELECT") value.list.push(elt.options[elt.selectedIndex].text);
        }

        postgresqlScope.addRecord(db, table, columnList, valueList, function(){
          if(postgresqlScope.insertSucess){
            buttonAreaScope.display();
            if(rowSelected != null){
              if(document.getElementById("modifyButton") != null) document.getElementById("modifyButton").disabled = false;
              if(document.getElementById("deleteButton") != null) document.getElementById("deleteButton").disabled = false;
            }
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

app.controller('modifyRowAreaController', function($scope, columnsDisplayFactory, postgresqlFactory, buttonAreaFactory){

  var columnsDisplayScope = columnsDisplayFactory.getScope();
  var postgresqlScope = postgresqlFactory.getScope();
  var buttonAreaScope = buttonAreaFactory.getScope();

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

      if(tableSelected != null){
        let temp = tableSelected.split(';');
        let db = temp[0];
        let table = temp[1];

        columnList = [];
        for(let i=0; i<$scope.attributes.length; i++)
          columnList.push($scope.attributes[i].name.column_name);

        valueList = [];
        for(let j=0; j<columnList.length; j++){
          let elt = document.getElementById(columnList[j]);
          if(elt.nodeName === "INPUT") valueList.push(elt.value);
          else if(elt.nodeName === "SELECT") value.list.push(elt.options[elt.selectedIndex].text);
        }

        postgresqlScope.getPrimaryKey(db, table, function(){
          if(postgresqlScope.primaryKey){
            for(let i=0; columnsDisplayScope.columns.length; i++){
              if(postgresqlScope.primaryKey.data[0].attname === columnsDisplayScope.columns[i].column_name){
                var pkValue = JSON.parse(rowSelected)[i];
                break;
              }
            }
            postgresqlScope.modifyRecord(db, table, columnList, valueList, postgresqlScope.primaryKey.data[0].attname, pkValue, function(){
              if(postgresqlScope.modifySuccess){
                buttonAreaScope.display();
                valueList.unshift(pkValue);
                document.getElementById(rowSelected).id = JSON.stringify(valueList);
                rowSelected = JSON.stringify(valueList);
                if(rowSelected != null){
                  if(document.getElementById("modifyButton") != null) document.getElementById("modifyButton").disabled = false;
                  if(document.getElementById("deleteButton") != null) document.getElementById("deleteButton").disabled = false;
                }
              }
            });
          }
        });
      }
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
        $scope.successRequest = true;
        $scope.dbArray = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.successRequest = false;
        $scope.dbArray = data;
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
        $scope.successRequest = true;
        $scope.tableArray = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.successRequest = false;
        $scope.tableArray = data;
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
    $http({
      method: 'GET',
      url: '/db/addRecord?db='+dbName+'&table='+tableName+'&column_list='+JSON.stringify(columnList)+'&value_list='+JSON.stringify(valueList)
    })
    .then(
      function successCallback(data) {
        $scope.insertSucess = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.insertSucess = false;
        if(callback) callback();
    });
  };

  $scope.modifyRecord = function(dbName,tableName,columnList,valueList,pkKey,pkValue,callback){
    $http({
      method: 'GET',
      url: '/db/modifyRecord?db='+dbName+'&table='+tableName+'&column_list='+JSON.stringify(columnList)+'&value_list='+JSON.stringify(valueList)+'&pkKey='+pkKey+'&pkValue='+pkValue
    })
    .then(
      function successCallback(data) {
        $scope.modifySuccess = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.modifySuccess = false;
        if(callback) callback();
    });
  };

  $scope.getPrimaryKey = function(dbName,tableName,callback){
    $http({
      method: 'GET',
      url: '/db/getPrimaryKey?db='+dbName+'&table='+tableName
    })
    .then(
      function successCallback(data) {
        $scope.primaryKey = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.primaryKey = false;
        if(callback) callback();
    });
  };

  $scope.delRecord = function(dbName,tableName,pkKey,pkValue,callback){
    $http({
      method: 'GET',
      url: '/db/delRecord?db='+dbName+'&table='+tableName+'&pkKey='+pkKey+'&pkValue='+pkValue
    })
    .then(
      function successCallback(data) {
        $scope.deleteSuccess = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.deleteSuccess = false;
        if(callback) callback();
    });
  };
});
