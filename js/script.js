"use strict";
console.log("Test")
var exceptionDB = ['postgres', 'template0', 'template1']; //The databases that will not be displayed
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
