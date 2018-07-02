$(function() {
  $('#treeDatabaseArea').jstree();
});

var exceptionDB = ['postgres', 'template0', 'template1'];

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

var checkIfIsReference = function(att){
  ret = false;

  if(att=="Att2") ret = true;

  return ret;
};

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

  postgresScope.getDBName(function(){
    if(!postgresScope.dataset){
      alert('The request has failed, contact your administrator')
    }
    else{
      for(let i=0;i<postgresScope.dataset.data.length;i++){
        if(exceptionDB.indexOf(postgresScope.dataset.data[i]) < 0){
          $scope.databases.push({
            "name" : postgresScope.dataset.data[i]
          });
        }
      }
    }
  });

    /*{
      name : "DB1",
      table : [
        {name : "T1"},
        {name : "T2"}
      ]
    },
    {
      name : "DB2",
      table : [
        {name : "T1"},
        {name : "T2"}
      ]
    }
  ];*/
});

app.controller('columnsDisplayAreaController', function($scope, columnsDisplayFactory){

  columnsDisplayFactory.setScope($scope);

  $scope.columns = ["Col1","Col2","Col3"];
  $scope.tuples = [
    {
      values : ["Val1","Val2","Val3"]
    },
    {
      values : ["Val1","Val2",""]
    },
    {
      values : ["Val1","","Val3"]
    }
  ];
});

app.controller('buttonAreaController', function($scope, columnsDisplayFactory){

  document.getElementById("displayButton").disabled = true;
  if(document.getElementById("addButton") != null) document.getElementById("addButton").disabled = true;
  if(document.getElementById("modifyButton") != null) document.getElementById("modifyButton").disabled = true;
  if(document.getElementById("deleteButton") != null) document.getElementById("deleteButton").disabled = true;
  document.getElementById("clearButton").disabled = false;

  $scope.display = function(){

    document.getElementById("columnsDisplayArea").style.display = "block";
    if(document.getElementById("modifyButton") != null) document.getElementById("modifyButton").disabled = true;
    if(document.getElementById("deleteButton") != null) document.getElementById("deleteButton").disabled = true;
    if(tableSelected != null){

      let temp = tableSelected.split(';');
      let db = temp[0];
      let table = temp[1];
      document.getElementById('addButton').disabled = false;

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

      var aScope = columnsDisplayFactory.getScope();
      var isRecord;
      var rowSelectedParse = JSON.parse(rowSelected);

      for(var i=0; i<aScope.tuples.length;i++){
        isRecord = true;
        for(var j=0; j<aScope.tuples[i].values.length; j++){
          if(aScope.tuples[i].values[j] !== rowSelectedParse[j]){
            isRecord = false;
            break;
          }
        }
        if(isRecord){
          aScope.tuples.splice(i,1);
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

app.controller('addRowAreaController', function($scope){

  $scope.attributes = ["Att1", "Att2", "Att3"];

  $scope.checkIfIsReference = checkIfIsReference;

  $scope.getReferences = function(att){
    ret = ["Choice1","Choice2","Choice3"];

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
        $scope.dataset = data;
        callback();
      },
      function errorCallback(data) {
        $scope.dataset = false;
        callback();
    });
  };

  $scope.addRecord = function(){
    $http({method: 'GET', url: '/db/addRecord?fName='+$scope.fName+'&lName='+$scope.lName+'&email='+$scope.email+'&mbl='+$scope.mbl})
    .success(function(data, status) {
      alert('Record Added');
      $scope.getAllRec();
    });
  }

  $scope.delRecord = function(recId){
    console.log(recId);
    if(confirm('Are you sure you want to delete this record ? ')){
      $http({method: 'GET', url: '/db/delRecord?id='+recId})
      .success(function(data, status) {
        $scope.getAllRec();
      });
    }
  }
});
