var exceptionDB = ['template0', 'template1']; //The databases that will not be displayed
var exceptionColumns = ['uuid']; //The columns that will not be displayed
var readOnlyDB = ['sonde']; //Contains the read only databases
var displayName = ['name', 'tenant_name', 'sg_name', 'subnet_name', 'ecs_name', 'kp_name', 'vpc_name', 'uuid'];
var busy = false;

//Check if a database is in read only mode
var checkIfReadOnlyDB = function(db){
  ret = false;
  for(let i=0; i<readOnlyDB.length; i++){
    if(db === readOnlyDB[i]){
      ret = true;
      break;
    }
  }
  return ret;
};

//When the user clicks on a table
var tableSelected = null;
var isTableSelected = function (table){
  tableSelected = table;
  if(document.getElementById('displayButton') != null) document.getElementById('displayButton').disabled = false;
  if(document.getElementById('seeRelationsButton') != null) document.getElementById('seeRelationsButton').disabled = false;
}

//When the user clicks on a row
var rowSelected = null;
var isRowSelected = function(row){
  if(tableSelected != null && !busy){
    let temp = tableSelected.split(';');
    let db = temp[0];
    var isReadOnly = checkIfReadOnlyDB(db);

    if(!isReadOnly){
      if(document.getElementById("modifyButton") != null)document.getElementById('modifyButton').disabled = false;
      if(document.getElementById("deleteButton") != null)document.getElementById('deleteButton').disabled = false;
    }
    if(document.getElementById("showRelationsButton") != null) document.getElementById("showRelationsButton").disabled = false;
    if(rowSelected != row){
      document.getElementById(row).style.backgroundColor = "gray";
      if(rowSelected != null) document.getElementById(rowSelected).style.backgroundColor = "";
      rowSelected = row;
    }
    else{
      document.getElementById(row).style.backgroundColor = "";
      if(!isReadOnly){
        if(document.getElementById("modifyButton") != null) document.getElementById('modifyButton').disabled = true;
        if(document.getElementById("deleteButton") != null) document.getElementById('deleteButton').disabled = true;
      }
      if(document.getElementById("showRelationsButton") != null) document.getElementById("showRelationsButton").disabled = true;
      rowSelected = null;
    }
  }
}


var app = angular.module('DBEditorAPF', ["ngRoute"], function($rootScopeProvider){
  $rootScopeProvider.digestTtl(20);
});

app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "html/defaultDisplay.html"
    })
    .when("/db_management", {
        templateUrl : "html/db_management.html"
    })
    .when("/db_views", {
        templateUrl : "html/db_views.html"
    })
    .when("/dashboard", {
        templateUrl : "html/dashboard.html"
    })
    .when("/help", {
        templateUrl : "html/help.html"
    })
    .when("/login", {
        templateUrl : "html/login.html"
    })
    .when("/signup", {
        templateUrl : "html/signup.html"
    })
    .otherwise({
        redirectTo: '/'
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

app.factory('treeDatabaseAreaFactory', function(){
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

app.controller('postgresqlController', function($scope, $http, postgresqlFactory){

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
        //$scope.successRequest = true;
        $scope.tableArray = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        //$scope.successRequest = false;
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
        $scope.successRequest = true;
        $scope.columnsArray = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.successRequest = false;
        $scope.columnsArray = data;
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
        $scope.successRequest = true;
        $scope.columnConstraint = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.successRequest = false;
        $scope.columnConstraint = data;
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
        $scope.successRequest = true;
        $scope.columnValues = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.successRequest = false;
        $scope.columnValues = data;
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
        $scope.successRequest = true;
        $scope.valuesOf = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.successRequest = false;
        $scope.valuesOf = data;
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
        $scope.successRequest = true;
        $scope.addRequest = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.successRequest = false;
        $scope.addRequest = data;
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
        $scope.successRequest = true;
        $scope.modifyRequest = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.successRequest = false;
        $scope.modifyRequest = data;
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
        $scope.successRequest = true;
        $scope.primaryKey = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.successRequest = false;
        $scope.primaryKey = data;
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
        $scope.successRequest = true;
        $scope.deleteRequest = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.successRequest = false;
        $scope.deleteRequest = data;
        if(callback) callback();
    });
  };

  $scope.query = function(dbName,tableName,select,condAtt,condValue,callback){
    $http({
      method: 'GET',
      url: '/db/query?db='+dbName+'&table='+tableName+'&select='+select+'&condAtt='+condAtt+"&condValue="+condValue
    })
    .then(
      function successCallback(data) {
        $scope.successRequest = true;
        $scope.queryRequest = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.successRequest = false;
        $scope.queryRequest = data;
        if(callback) callback();
    });
  };

  $scope.getIdFromMD5 = function(md5,callback){
    $http({
      method: 'GET',
      url: '/db/getIdFromMD5?md5='+md5
    })
    .then(
      function successCallback(data) {
        $scope.successRequest = true;
        $scope.queryLogin = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.successRequest = false;
        $scope.queryLogin = data;
        if(callback) callback();
    });
  };

  $scope.addLogin = function(user,md5,email,callback){
    console.log("addlog : " + user);
    $http({
      method: 'GET',
      url: "/db/addLogin?id="+user+"&md5="+md5+"&mail="+email
    })
    .then(
      function successCallback(data) {
        $scope.successRequest = true;
        $scope.addLogin = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.successRequest = false;
        $scope.addLogin = data;
        if(callback) callback();
    });
  };
});
