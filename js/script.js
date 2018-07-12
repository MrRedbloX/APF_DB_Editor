var app = angular.module('DBEditorAPF', ["ngRoute"]);

app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "html/database_management/db_management.html"
    })
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

app.controller('postgresqlController', function($scope, $http, postgresqlFactory){

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
});
