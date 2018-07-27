var exceptionDB = ['postgres', 'template0', 'template1']; //The databases that will not be displayed
var exceptionColumns = ['uuid']; //The columns that will not be displayed
var readOnlyDB = []; //Contains the read only databases
var displayName = ['name', 'tenant_name', 'sg_name', 'subnet_name', 'ecs_name', 'kp_name', 'vpc_name', 'uuid']; //The name that will be displayed instead of the id
var busy = false; //When a view in db_management is displayed, this turn to true in order to prevent from some unwanted behaviors
var exceptionTables = ['map']; //The tables which starts with these elements won't be displayed in the dashboard charts
var waitFor = 1; //The time in ms use in the sleep function
var forbiddenChar = ['#','%','&','+','[',']','{','}',"'",'"','\\']; //The chars that the user can't write when he add or modify an element

//Check if a table is elligible to exceptionTables
var isInExceptionTables = function(table){
  ret = false;

  for(let i=0; i<exceptionTables.length; i++){
    if(table.startsWith(exceptionTables[i])){
      ret = true;
      break;
    }
  }

  return ret;
};

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

//Allows to stop the execution for a specific time, it's used to prevent from async issues in certain functions
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//Check if a string contains a forbidden char
function containsForbiddenChar(str){
  ret = false;
  for(let i=0; i<forbiddenChar.length; i++){
    if(str.indexOf(forbiddenChar[i]) > -1){
      ret = true;
      break;
    }
  }
  return ret;
}

//Here we define the application, we also use angular module route
var app = angular.module('DBEditorAPF', ["ngRoute"]);

//Here we configure the routes
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "public/html/defaultDisplay.html"
    })
    .when("/db_management", {
        templateUrl : "public/html/db_management.html"
    })
    .when("/db_views", {
        templateUrl : "public/html/db_views.html"
    })
    .when("/dashboard", {
        templateUrl : "public/html/dashboard.html"
    })
    .when("/help", {
        templateUrl : "public/html/help.html"
    })
    .when("/login", {
        templateUrl : "public/html/login.html"
    })
    .when("/signup", {
        templateUrl : "public/html/signup.html"
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

app.factory('loginFactory', function(){
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

//This controller allows to do all the requests in databases, therefore he needs to be on top of every others
app.controller('postgresqlController', function($scope, $http, postgresqlFactory){

  postgresqlFactory.setScope($scope); //We set the $scope

  //All the following functions has the same structure :
  // 1) Query with specific attributes
  // 2) A function for success, a function for error, an attribute successRequest set depending the outcome and an array for the request
  // 3) At the end a callback function

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
      method: 'POST',
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
      method: 'POST',
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
      method: 'POST',
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

  $scope.getDbMemory = function(dbName, callback){
    $http({
      method: 'GET',
      url: '/db/getDbMemory?db='+dbName
    })
    .then(
      function successCallback(data) {
        $scope.successRequest = true;
        $scope.dbMemoryRequest = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.successRequest = false;
        $scope.dbMemoryRequest = data;
        if(callback) callback();
    });
  };
});
