var exceptionDB = ['postgres', 'template0', 'template1']; //The databases that will not be displayed
var exceptionColumns = ['uuid']; //The columns that will not be displayed
var readOnlyDB = ['sonde']; //Contains the read only databases

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
  if(document.getElementById('seeRelationsButton') != null) document.getElementById('seeRelationButton').disabled = false;
}

//When the user clicks on a row
var rowSelected = null;
var isRowSelected = function(row){
  if(tableSelected != null){
    let temp = tableSelected.split(';');
    let db = temp[0];
    var isReadOnly = checkIfReadOnlyDB(db);

    if(!isReadOnly){
      document.getElementById('modifyButton').disabled = false;
      document.getElementById('deleteButton').disabled = false;
    }
    if(rowSelected != row){
      document.getElementById(row).style.backgroundColor = "gray";
      if(rowSelected != null) document.getElementById(rowSelected).style.backgroundColor = "";
      rowSelected = row;
    }
    else{
      document.getElementById(row).style.backgroundColor = "";
      if(!isReadOnly){
        document.getElementById('modifyButton').disabled = true;
        document.getElementById('deleteButton').disabled = true;
      }
      rowSelected = null;
    }
  }
}


var app = angular.module('DBEditorAPF', ["ngRoute"]);

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


//Each controller manage a view in the html
app.controller('treeDatabaseManagementAreaController', function($scope, postgresqlFactory, treeDatabaseAreaFactory){
  $scope.databases = []; //This array will be use to by jtree

  var postgresScope = postgresqlFactory.getScope();
  treeDatabaseAreaFactory.setScope($scope);

  $scope.ready = false; //Wait to load page
  $scope.displayNothing = true;
  $scope.displayAdd = false;
  $scope.displayModify = false;

  $scope.setDisplayTo = function(type){
    if(type === "nothing"){
      $scope.displayNothing = true;
      $scope.displayAdd = false;
      $scope.displayModify = false;
    }
    else if(type === "add"){
      $scope.displayNothing = false;
      $scope.displayAdd = true;
      $scope.displayModify = false;
    }
    else if(type === "modify"){
      $scope.displayNothing = false;
      $scope.displayAdd = false;
      $scope.displayModify = true;
    }
    else console.log("Wrong type for setDisplayTo");
  }

  if(!$scope.ready){
    postgresScope.getDBName(function(){ //We do the request and we define the callback function
      if(postgresScope.successRequest){
        for(let i=0;i<postgresScope.dbArray.data.length;i++){
          if(!exceptionDB.includes(postgresScope.dbArray.data[i].datname)){
            postgresScope.getTableName(postgresScope.dbArray.data[i].datname, function(){ //We do the same thing for this request
              if(postgresScope.successRequest){
                $scope.databases.push({
                  name : postgresScope.dbArray.data[i].datname,
                  table : postgresScope.tableArray.data
                });
              }
              else{
                alert("Error on getTableName request, check console logs.");
              }
              $(function() {
                $('#treeDatabaseArea').jstree(); //Activating jtree
              });
            });
          }
        }
        $scope.ready = true;
      }
      else{
        console.log(postgresScope.dbArray);
        alert("Error on getDBName request, check console logs.");
      }
    });
  }
});

app.controller('columnsDisplayAreaController', function($scope, columnsDisplayFactory, postgresqlFactory){
  columnsDisplayFactory.setScope($scope);
  var postgresqlScope = postgresqlFactory.getScope();
  $scope.row_ids = [];

  //Check if an attribute is a foreign key
  $scope.checkIfIsReference = function(att){
    var ret = false;
    for(let i=0; i<postgresqlScope.columnConstraint.data.length; i++){
      if(att === postgresqlScope.columnConstraint.data[i].column_name){
        ret = true;
        break;
      }
    }
    return ret;
  };

  $scope.setIdForToolTips = function(tuple_value, column, val){
    let theID = column+";"+JSON.stringify(tuple_value)+";"+val;

    $scope.row_ids.push({
      id : theID,
      column_name : column,
      value : val
    });

    return "";
  };

  $scope.setToolTips = function(){
    for(let i=0; i<$scope.row_ids.length; i++){
      if($scope.checkIfIsReference($scope.row_ids[i].column_name)){
        if(document.getElementById($scope.row_ids[i].id) != null) {
          document.getElementById($scope.row_ids[i].id).title = $scope.getInfoForFK($scope.row_ids[i].column_name,$scope.row_ids[i].value);
        }
      }
    }
    $scope.row_ids = [];
  }
  $scope.getInfoForFK = function(column_name, value){
    ret = "";
    for(let i=0; i<postgresqlScope.valuesOfConstraint.length; i++){
      if(column_name === postgresqlScope.valuesOfConstraint[i].name){
        for(let j=0; j<postgresqlScope.valuesOfConstraint[i].values.length; j++){
          if(postgresqlScope.valuesOfConstraint[i].values[j].id === value){
            keys = Object.keys(postgresqlScope.valuesOfConstraint[i].values[j].records);
            for(let k=0; k<keys.length; k++)
              ret += postgresqlScope.valuesOfConstraint[i].values[j].records[keys[k]]+" / ";
            ret = ret.substring(0, ret.length-3);
            break;
          }
        }
        break;
      }
    }
    return ret;
  };

  $scope.clearTooltips = function(){
    listTD = document.getElementsByTagName("TD");
    for(let i=0; i<listTD.length; i++)
      listTD[i].title = "";
  }
});

app.controller('buttonAreaController', function($scope, columnsDisplayFactory, postgresqlFactory, buttonAreaFactory, treeDatabaseAreaFactory){

  buttonAreaFactory.setScope($scope);
  var postgresScope = postgresqlFactory.getScope();
  var columnsDisplayScope = columnsDisplayFactory.getScope();
  var treeDatabaseAreaScope = treeDatabaseAreaFactory.getScope();
  var isreadOnly = false;

  //Here we manage the displayability of the buttons
  if(document.getElementById("displayButton") != null) document.getElementById("displayButton").disabled = true;
  if(document.getElementById("addButton") != null) document.getElementById("addButton").disabled = true;
  if(document.getElementById("modifyButton") != null) document.getElementById("modifyButton").disabled = true;
  if(document.getElementById("deleteButton") != null) document.getElementById("deleteButton").disabled = true;
  if(document.getElementById("clearButton") != null) document.getElementById("clearButton").disabled = false;
  if(document.getElementById("seelRelationButton") != null) document.getElementById("seelRelationButton").disabled = true;

  //When we click on display
  $scope.display = function(){
    var columnsDisplayScope = columnsDisplayFactory.getScope();
    treeDatabaseAreaScope.displayNothing = true;
    treeDatabaseAreaScope.displayAdd = false;
    treeDatabaseAreaScope.displayModify = false;
    if(rowSelected != null) document.getElementById(rowSelected).style.backgroundColor = "";
    rowSelected = null;
    columnsDisplayScope.row_ids = [];
    columnsDisplayScope.clearTooltips();

    if(tableSelected != null){
      let temp = tableSelected.split(';');
      let db = temp[0];
      isReadOnly = checkIfReadOnlyDB(db);
    }

    document.getElementById("columnsDisplayArea").style.display = "block";

    if(isReadOnly){
      if(document.getElementById("addButton") != null) document.getElementById("addButton").disabled = true;
      if(document.getElementById("modifyButton") != null) document.getElementById("modifyButton").disabled = true;
      if(document.getElementById("deleteButton") != null) document.getElementById("deleteButton").disabled = true;
    }
    else{
      if(document.getElementById("modifyButton") != null) document.getElementById("modifyButton").disabled = true;
      if(document.getElementById("deleteButton") != null) document.getElementById("deleteButton").disabled = true;
    }

    if(tableSelected != null){
      let temp = tableSelected.split(';'); //We retrieve the db and the table names
      let db = temp[0];
      let table = temp[1];
      if(!isReadOnly) document.getElementById('addButton').disabled = false;

      postgresScope.getColumnName(db, table, function(){ //We get the name of all columns
        if(postgresScope.successRequest){
          columnsDisplayScope.columns = postgresScope.columnsArray.data;
          postgresScope.getAllValues(db, table, function(){ //And we get their values
            if(postgresScope.successRequest){
              columnsDisplayScope.tuples = []; //This will be use to display all the value of the table
              for(let i=0;i<postgresScope.columnValues.data.length;i++){
                temp = [];
                for(let j=0;j<columnsDisplayScope.columns.length;j++){
                  temp.push(postgresScope.columnValues.data[i][(columnsDisplayScope.columns[j].column_name)]);
                }
                columnsDisplayScope.tuples.push({
                  column_names : columnsDisplayScope.columns,
                  values : temp
                });
              }
            }
            else{
              console.log(postgresScope.columnValues);
              alert("Error on getAllValues request, check console logs.");
            }
          });
          postgresScope.getColumnConstraint(db, table, function(){ //We get the foreign key of the table
            if(postgresScope.successRequest){
              postgresScope.valuesOfConstraint = [];
              console.log(postgresScope.columnConstraint);
              for(let i=0; i<postgresScope.columnConstraint.data.length; i++){
                let temp = [];
                postgresScope.getValuesOf(db,postgresScope.columnConstraint.data[i].foreign_table_name,"*", function(){ //And we get their values
                  if(postgresScope.successRequest){
                    for(let j=0; j<postgresScope.valuesOf.data.length; j++){
                      temp.push({
                        id : postgresScope.valuesOf.data[j][postgresScope.columnConstraint.data[i].foreign_column_name],
                        records : postgresScope.valuesOf.data[j]});
                    }
                    postgresScope.valuesOfConstraint.push({
                      name : postgresScope.columnConstraint.data[i].column_name,
                      values : temp
                    });
                    columnsDisplayScope.setToolTips();
                  }
                  else{
                    console.log(postgresScope.valuesOf);
                    alert("Error on getValuesOf request, check console logs.");
                  }
                });
              }
            }
            else{
              console.log(postgresScope.columnConstraint);
              alert("Error on getColumnConstraint request, check console logs.");
            }
          });
        }
        else{
          console.log(postgresScope.columnsArray);
          alert("Error on getColumnName request, check console logs.");
        }
      });
    }
  }

  //When we want to add a tuple
  $scope.add = function(){

    //Here we only manage graphical constraints, the actions are handle in the addRowAreaController
    if(!isreadOnly){
      document.getElementById('addButton').disabled = true;
      document.getElementById("modifyButton").disabled = true;
      document.getElementById("deleteButton").disabled = true;

      treeDatabaseAreaScope.setDisplayTo("add");
    }
  };

  //When we want to modify a tuple
  $scope.modify = function(){

    //Same as add we only manage graphical constraints, the actions are handle in modifyRowAreaController
    if(!isreadOnly){
      document.getElementById('addButton').disabled = true;
      document.getElementById("modifyButton").disabled = true;
      document.getElementById("deleteButton").disabled = true;

      treeDatabaseAreaScope.setDisplayTo("modify");
    }
  }

  //When we want to delete a tuple
  $scope.delete = function(){
    if(confirm('Do you want to delete this record ?')){
      if(tableSelected != null){
        let temp = tableSelected.split(';');
        let db = temp[0];
        let table = temp[1];

        postgresScope.getPrimaryKey(db, table, function(){ //We retrieve the primary key of the table (for now we only handle a single pk)
          if(postgresScope.successRequest){
            for(let i=0; i<columnsDisplayScope.columns.length; i++){
              if(postgresScope.primaryKey.data[0].attname === columnsDisplayScope.columns[i].column_name){
                var pkValue = JSON.parse(rowSelected)[i];
                break;
              }
            }
            postgresScope.delRecord(db, table,postgresScope.primaryKey.data[0].attname, pkValue, function(){ //The request of deletion
              if(postgresScope.successRequest){
                $scope.display(); // We call the display function to refresh the table (the most secure method but it can be a little heavy)
                rowSelected = null;
              }
              else{
                console.log(postgresScope.deleteRequest);
                alert("Error on delRecord request, check console logs.");
              }
            });
          }
          else{
            console.log(postgresScope.primaryKey);
            alert("Error on getPrimaryKey request, check console logs.");
          }
        });
      }
    }
  };

  //When we want to clear the table display
  $scope.clear = function(){

    //We just hide the table display
    document.getElementById("columnsDisplayArea").style.display = "none";
    if(!isreadOnly){
      document.getElementById("addButton").disabled = true;
      document.getElementById("modifyButton").disabled = true;
      document.getElementById("deleteButton").disabled = true;

      treeDatabaseAreaScope.setDisplayTo("nothing");
    }
    rowSelected = null;
  };

});

app.controller('addRowAreaController', function($scope, columnsDisplayFactory, postgresqlFactory, buttonAreaFactory, treeDatabaseAreaFactory){

  var columnsDisplayScope = columnsDisplayFactory.getScope();
  var postgresqlScope = postgresqlFactory.getScope();
  var buttonAreaScope = buttonAreaFactory.getScope();
  var treeDatabaseAreaScope = treeDatabaseAreaFactory.getScope();

  var currentTableSelected = tableSelected;

  columnsDisplayScope.row_ids = [];

  $scope.attributes = []; //This will be use to display the name of columns
  for(let i=0;i<columnsDisplayScope.columns.length;i++){
    if(!exceptionColumns.includes(columnsDisplayScope.columns[i].column_name))
      $scope.attributes.push(columnsDisplayScope.columns[i]);
  };

  //Check if an attribute is a foreign key
  $scope.checkIfIsReference = function(att){
    var ret = false;

    if(currentTableSelected != null){
      for(let i=0; i<postgresqlScope.columnConstraint.data.length; i++){
        if(att === postgresqlScope.columnConstraint.data[i].column_name){
          ret = true;
          break;
        }
      }
    }
    return ret;
  };

  //Return all the value contains in the reference table
  $scope.getReferences = function(att){
    ret = [];
    if(currentTableSelected != null){
      for(let i=0; i<postgresqlScope.valuesOfConstraint.length; i++){
        if(att === postgresqlScope.valuesOfConstraint[i].name){
          for(let j=0; j<postgresqlScope.valuesOfConstraint[i].values.length; j++)
            ret.push(postgresqlScope.valuesOfConstraint[i].values[j].id);
          break;
        }
      }
    }
    return ret;
  };

  //When we want to save a new tuple
  $scope.saveRecord = function(){

    if(confirm("Are you sure you want to save this record ?")){

      if(currentTableSelected != null){
        let temp = currentTableSelected.split(';');
        let db = temp[0];
        let table = temp[1];

        columnList = []; //The list of columns for the request
        for(let i=0; i<$scope.attributes.length; i++)
          columnList.push($scope.attributes[i].column_name);

        valueList = []; //The values to save
        for(let j=0; j<columnList.length; j++){
          let elt = document.getElementById(columnList[j]);
          if(elt.nodeName === "INPUT"){
            if(elt.value == null) valueList.push("");
            else{
              if($scope.attributes[j].data_type.toLowerCase().includes("int")) valueList.push(parseInt(elt.value));
              else valueList.push(elt.value);
            }
          }
          else if(elt.nodeName === "SELECT"){
            if(elt.selectedIndex == null || elt.options[elt.selectedIndex] == null) valueList.push("");
            else{
               if($scope.attributes[j].data_type.toLowerCase().includes("int")) valueList.push(parseInt(elt.options[elt.selectedIndex].text));
               else valueList.push(elt.options[elt.selectedIndex].text);
           }
         }
       }

        postgresqlScope.addRecord(db, table, columnList, valueList, function(){ //Request to save a record in db
          if(postgresqlScope.successRequest){
            buttonAreaScope.display();
            if(rowSelected != null){
              if(document.getElementById("modifyButton") != null) document.getElementById("modifyButton").disabled = false;
              if(document.getElementById("deleteButton") != null) document.getElementById("deleteButton").disabled = false;
            }
          }
          else{
            console.log(postgresqlScope.addRequest);
            alert("Error on addRecord request, check console logs.");
          }
        });
      }

      treeDatabaseAreaScope.setDisplayTo("nothing");
      document.getElementById('addButton').disabled = false;
      if(rowSelected != null) document.getElementById('modifyButton').disabled = false;
    }
  };

  //If we want to cancel
  $scope.cancelRecord = function(){

    if(confirm("Are you sure you want to cancel ?")){

      treeDatabaseAreaScope.setDisplayTo("nothing");
      document.getElementById('addButton').disabled = false;
      if(rowSelected != null) document.getElementById('modifyButton').disabled = false;

    }
  };

  $scope.setIdForToolTips = function(val, column){
    ret = "";
    let theID = "a"+column+val;
    columnsDisplayScope.row_ids.push({
      id : theID,
      column_name : column,
      value : val
    });
    for(let i=0; i<columnsDisplayScope.row_ids.length; i++){
      if(columnsDisplayScope.checkIfIsReference(columnsDisplayScope.row_ids[i].column_name)){
        if(document.getElementById(columnsDisplayScope.row_ids[i].id) != null)
          ret = columnsDisplayScope.getInfoForFK(columnsDisplayScope.row_ids[i].column_name,columnsDisplayScope.row_ids[i].value);
      }
    }
    return ret;
  };
});

app.controller('modifyRowAreaController', function($scope, columnsDisplayFactory, postgresqlFactory, buttonAreaFactory, treeDatabaseAreaFactory){

  //Same process as add, except we need to retrieve the existing primary key
  var columnsDisplayScope = columnsDisplayFactory.getScope();
  var postgresqlScope = postgresqlFactory.getScope();
  var buttonAreaScope = buttonAreaFactory.getScope();
  var treeDatabaseAreaScope = treeDatabaseAreaFactory.getScope();

  var currentRowSelected = rowSelected;
  var currentTableSelected = tableSelected;
  columnsDisplayScope.row_ids = [];

  $scope.attributes = [];
  let parseRowSelected = JSON.parse(currentRowSelected);
  for(let i=0;i<columnsDisplayScope.columns.length;i++){
    if(!exceptionColumns.includes(columnsDisplayScope.columns[i].column_name))
      $scope.attributes.push({
        name : columnsDisplayScope.columns[i],
        value : parseRowSelected[i]
      });
  };
  $scope.references = [];

  $scope.saveRecord = function(){
    if(confirm("Are you sure you want to save this record ?")){

      if(currentTableSelected != null){
        let temp = currentTableSelected.split(';');
        let db = temp[0];
        let table = temp[1];

        columnList = [];
        for(let i=0; i<$scope.attributes.length; i++)
          columnList.push($scope.attributes[i].name.column_name);

        valueList = [];
        for(let j=0; j<columnList.length; j++){
          let elt = document.getElementById(columnList[j]);
          if(elt.nodeName === "INPUT"){
            if(elt.value == null) valueList.push("");
            else{
              if($scope.attributes[j].name.data_type.toLowerCase().includes("int")) valueList.push(parseInt(elt.value));
              else valueList.push(elt.value);
            }
          }
          else if(elt.nodeName === "SELECT"){
            if(elt.selectedIndex == null || elt.options[elt.selectedIndex] == null) valueList.push("");
            else{
               if($scope.attributes[j].name.data_type.toLowerCase().includes("int")) valueList.push(parseInt(elt.options[elt.selectedIndex].text));
               else valueList.push(elt.options[elt.selectedIndex].text);
           }
         }
        }

        postgresqlScope.getPrimaryKey(db, table, function(){
          if(postgresqlScope.successRequest){
            for(let i=0; columnsDisplayScope.columns.length; i++){
              if(postgresqlScope.primaryKey.data[0].attname === columnsDisplayScope.columns[i].column_name){ //The difference is here
                var pkValue = JSON.parse(currentRowSelected)[i];
                break;
              }
            }
            postgresqlScope.modifyRecord(db, table, columnList, valueList, postgresqlScope.primaryKey.data[0].attname, pkValue, function(){ //Request to modify a tuple
              if(postgresqlScope.successRequest){
                buttonAreaScope.display();
                if(rowSelected != null) document.getElementById(rowSelected).style.backgroundColor = "";
                if(currentRowSelected != null) document.getElementById(currentRowSelected).style.backgroundColor = "";
                rowSelected = null;
              }
              else{
                console.log(postgresqlScope.modifyRequest);
                alert("Error on getPrimaryKey request, check console logs.");
              }
            });
          }
          else{
            console.log(postgresqlScope.primaryKey);
            alert("Error on getPrimaryKey request, check console logs.");
          }
        });

        treeDatabaseAreaScope.setDisplayTo("nothing");
        document.getElementById('addButton').disabled = false;
        document.getElementById('modifyButton').disabled = false;
      }
    }
  }

  $scope.cancelRecord = function(){
    if(confirm("Are you sure you want to cancel ?")){

      treeDatabaseAreaScope.setDisplayTo("nothing");
      document.getElementById('addButton').disabled = false;
      document.getElementById('modifyButton').disabled = false;
    }
  }

  $scope.checkIfIsReference = function(att){
    var ret = false;

    if(currentTableSelected != null){
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

    if(currentTableSelected != null){
      $scope.references.splice(0, $scope.references.length);
      for(let i=0; i<postgresqlScope.valuesOfConstraint.length; i++){
        if(att === postgresqlScope.valuesOfConstraint[i].name){
          for(let j=0; j<postgresqlScope.valuesOfConstraint[i].values.length; j++){
            if(postgresqlScope.valuesOfConstraint[i].values[j].id != val)
              $scope.references.push(postgresqlScope.valuesOfConstraint[i].values[j].id);
          }
          break;
        }
      }
    }
    return $scope.references;
  };

  $scope.setIdForToolTips = function(val, column){
    ret = "";
    let theID = "m"+column+val;
    columnsDisplayScope.row_ids.push({
      id : theID,
      column_name : column,
      value : val
    });
    for(let i=0; i<columnsDisplayScope.row_ids.length; i++){
      if(columnsDisplayScope.checkIfIsReference(columnsDisplayScope.row_ids[i].column_name)){
        if(document.getElementById(columnsDisplayScope.row_ids[i].id) != null)
          ret = columnsDisplayScope.getInfoForFK(columnsDisplayScope.row_ids[i].column_name,columnsDisplayScope.row_ids[i].value);
      }
    }
    return ret;
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
});

app.controller('treeDatabaseViewsAreaController', function($scope, postgresqlFactory){
  $scope.databases = []; //This array will be use to by jtree

  var postgresScope = postgresqlFactory.getScope();
  //treeDatabaseAreaFactory.setScope($scope);

  $scope.ready = false; //Wait to load page
  $scope.displayNothing = true;
  $scope.displayAdd = false;
  $scope.displayModify = false;

  $scope.setDisplayTo = function(type){
    if(type === "nothing"){
      $scope.displayNothing = true;
      $scope.displayAdd = false;
      $scope.displayModify = false;
    }
    else if(type === "add"){
      $scope.displayNothing = false;
      $scope.displayAdd = true;
      $scope.displayModify = false;
    }
    else if(type === "modify"){
      $scope.displayNothing = false;
      $scope.displayAdd = false;
      $scope.displayModify = true;
    }
    else console.log("Wrong type for setDisplayTo");
  }

  if(!$scope.ready){
    postgresScope.getDBName(function(){ //We do the request and we define the callback function
      if(postgresScope.successRequest){
        for(let i=0;i<postgresScope.dbArray.data.length;i++){
          if(!exceptionDB.includes(postgresScope.dbArray.data[i].datname)){
            postgresScope.getTableName(postgresScope.dbArray.data[i].datname, function(){ //We do the same thing for this request
              if(postgresScope.successRequest){
                $scope.databases.push({
                  name : postgresScope.dbArray.data[i].datname,
                  table : postgresScope.tableArray.data
                });
              }
              else{
                alert("Error on getTableName request, check console logs.");
              }
              $(function() {
                $('#treeDatabaseArea').jstree(); //Activating jtree
              });
            });
          }
        }
        $scope.ready = true;
      }
      else{
        console.log(postgresScope.dbArray);
        alert("Error on getDBName request, check console logs.");
      }
    });
  }
});
