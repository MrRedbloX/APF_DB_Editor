var exceptionDB = ['postgres', 'template0', 'template1']; //The databases that will not be displayed
var exceptionColumns = ['uuid']; //The columns that will not be displayed
var readOnlyDB = ['sonde']; //Contains the read only databases
var displayName = ['name', 'tenant_name'];
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


//Each controller manage a view in the html
app.controller('treeDatabaseAreaController', function($scope, postgresqlFactory, treeDatabaseAreaFactory){
  $scope.databases = []; //This array will be use to by jtree

  var postgresScope = postgresqlFactory.getScope();
  treeDatabaseAreaFactory.setScope($scope);

  $scope.ready = false; //Wait to load page
  $scope.displayNothing = true;
  $scope.displayAdd = false;
  $scope.displayModify = false;
  $scope.displayRelations = false;

  $scope.setDisplayTo = function(type){
    if(type === "nothing"){
      $scope.displayNothing = true;
      $scope.displayAdd = false;
      $scope.displayModify = false;
      $scope.displayRelations = false;
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
      $scope.displayRelations = false;
    }
    else if(type === "relations"){
      $scope.displayNothing = false;
      $scope.displayAdd = false;
      $scope.displayModify = false;
      $scope.displayRelations = true;
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

  $scope.setNameForReferences = function(fk_column_name, pk, theName, db, table){
    for(let i=0; i<$scope.tuples.length; i++){
      for(let j=0; j<$scope.tuples[i].values.length; j++){
        str = fk_column_name+JSON.stringify($scope.tuples[i].values)+$scope.tuples[i].values[j];
        if(document.getElementById(str) != null){
          postgresqlScope.query(db, table, theName, pk, $scope.tuples[i].values[j], function(){
            if(postgresqlScope.successRequest){
              console.log(postgresqlScope.queryRequest);
            }
            else{
              console.log(postgresScope.queryRequest);
              alert("Error on query request, check console logs.");
            }
          });
        }
      }
    }
  };
});

app.controller('buttonAreaController', function($scope, columnsDisplayFactory, postgresqlFactory, buttonAreaFactory, treeDatabaseAreaFactory){

  buttonAreaFactory.setScope($scope);
  var postgresScope = postgresqlFactory.getScope();
  var columnsDisplayScope = columnsDisplayFactory.getScope();
  var treeDatabaseAreaScope = treeDatabaseAreaFactory.getScope();
  var isReadOnly = false;
  var currentTableSelected = tableSelected;
  var currentRowSelected = rowSelected;

  //Here we manage the displayability of the buttons
  if(document.getElementById("displayButton") != null) document.getElementById("displayButton").disabled = true;
  if(document.getElementById("addButton") != null) document.getElementById("addButton").disabled = true;
  if(document.getElementById("modifyButton") != null) document.getElementById("modifyButton").disabled = true;
  if(document.getElementById("deleteButton") != null) document.getElementById("deleteButton").disabled = true;
  if(document.getElementById("clearButton") != null) document.getElementById("clearButton").disabled = false;
  if(document.getElementById("showRelationsButton") != null) document.getElementById("showRelationsButton").disabled = true;

  //When we click on display
  $scope.display = function(){
    currentTableSelected = tableSelected;
    currentRowSelected = rowSelected;
    var columnsDisplayScope = columnsDisplayFactory.getScope();
    treeDatabaseAreaScope.displayNothing = true;
    treeDatabaseAreaScope.displayAdd = false;
    treeDatabaseAreaScope.displayModify = false;
    if(currentRowSelected != null) document.getElementById(currentRowSelected).style.backgroundColor = "";
    rowSelected = null;
    columnsDisplayScope.row_ids = [];
    columnsDisplayScope.clearTooltips();

    if(currentTableSelected != null){
      let temp = currentTableSelected.split(';');
      let db = temp[0];
      isReadOnly = checkIfReadOnlyDB(db);
    }

    document.getElementById("columnsDisplayArea").style.display = "block";

    if(isReadOnly){
      if(document.getElementById("addButton") != null) document.getElementById("addButton").disabled = true;
      if(document.getElementById("modifyButton") != null) document.getElementById("modifyButton").disabled = true;
      if(document.getElementById("deleteButton") != null) document.getElementById("deleteButton").disabled = true;
      if(document.getElementById("showRelationsButton") != null) document.getElementById("showRelationsButton").disabled = true;
    }
    else{
      if(document.getElementById("modifyButton") != null) document.getElementById("modifyButton").disabled = true;
      if(document.getElementById("deleteButton") != null) document.getElementById("deleteButton").disabled = true;
      if(document.getElementById("showRelationsButton") != null) document.getElementById("showRelationsButton").disabled = true;
    }
    if(currentTableSelected != null){
      let temp = currentTableSelected.split(';'); //We retrieve the db and the table names
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
              for(let i=0; i<postgresScope.columnConstraint.data.length; i++){
                let temp = [];
                postgresScope.getValuesOf(db,postgresScope.columnConstraint.data[i].foreign_table_name,"*", function(){ //And we get their values
                  if(postgresScope.successRequest){
                    for(let j=0; j<postgresScope.valuesOf.data.length; j++){
                      let theName = null;
                      for(let k=0; k<displayName.length; k++){
                        if(postgresScope.valuesOf.data[j][displayName[k]] != null){
                          theName = postgresScope.valuesOf.data[j][displayName[k]];
                          break;
                        }
                      }
                      temp.push({
                        id : postgresScope.valuesOf.data[j][postgresScope.columnConstraint.data[i].foreign_column_name],
                        name : theName,
                        records : postgresScope.valuesOf.data[j]
                      });
                      //columnsDisplayScope.setNameForReferences(postgresScope.columnConstraint.data[i].column_name, postgresScope.columnConstraint.data[i].foreign_column_name, theName, db, table);
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
    if(!isReadOnly){
      if(document.getElementById("addButton") != null) document.getElementById('addButton').disabled = true;
      if(document.getElementById("modifyButton") != null) document.getElementById("modifyButton").disabled = true;
      if(document.getElementById("deleteButton") != null) document.getElementById("deleteButton").disabled = true;
      if(document.getElementById("showRelationsButton") != null) document.getElementById("showRelationsButton").disabled = true;

      treeDatabaseAreaScope.setDisplayTo("add");
      busy = true;
    }
  };

  //When we want to modify a tuple
  $scope.modify = function(){

    //Same as add we only manage graphical constraints, the actions are handle in modifyRowAreaController
    if(!isReadOnly){
      if(document.getElementById("addButton") != null) document.getElementById('addButton').disabled = true;
      if(document.getElementById("modifyButton") != null) document.getElementById("modifyButton").disabled = true;
      if(document.getElementById("deleteButton") != null) document.getElementById("deleteButton").disabled = true;
      if(document.getElementById("showRelationsButton") != null) document.getElementById("showRelationsButton").disabled = true;

      treeDatabaseAreaScope.setDisplayTo("modify");
      busy = true;
    }
  }

  //When we want to delete a tuple
  $scope.delete = function(){
    currentRowSelected = rowSelected;
    currentTableSelected = tableSelected;
    if(confirm('Do you want to delete this record ?')){
      if(currentTableSelected != null){
        let temp = currentTableSelected.split(';');
        let db = temp[0];
        let table = temp[1];

        postgresScope.getPrimaryKey(db, table, function(){ //We retrieve the primary key of the table (for now we only handle a single pk)
          if(postgresScope.successRequest){
            for(let i=0; i<columnsDisplayScope.columns.length; i++){
              if(postgresScope.primaryKey.data[0].attname === columnsDisplayScope.columns[i].column_name){
                var pkValue = JSON.parse(currentRowSelected)[i];
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
    if(document.getElementById("columnsDisplayArea") != null) document.getElementById("columnsDisplayArea").style.display = "none";
    if(!isReadOnly){
      if(document.getElementById("addButton") != null) document.getElementById("addButton").disabled = true;
      if(document.getElementById("modifyButton") != null) document.getElementById("modifyButton").disabled = true;
      if(document.getElementById("deleteButton") != null) document.getElementById("deleteButton").disabled = true;

      if(treeDatabaseAreaScope != null) treeDatabaseAreaScope.setDisplayTo("nothing");
    }
    rowSelected = null;
  };

  $scope.showRelations = function(){
    if(!isReadOnly){
      if(document.getElementById("addButton") != null) document.getElementById('addButton').disabled = true;
      if(document.getElementById("modifyButton") != null) document.getElementById("modifyButton").disabled = true;
      if(document.getElementById("deleteButton") != null) document.getElementById("deleteButton").disabled = true;
    }
    busy = true;
    if(document.getElementById("showRelationsButton") != null) document.getElementById("showRelationsButton").disabled = true;
    treeDatabaseAreaScope.setDisplayTo("relations");
  }
});

app.controller('addRowAreaController', function($scope, columnsDisplayFactory, postgresqlFactory, buttonAreaFactory, treeDatabaseAreaFactory){

  var columnsDisplayScope = columnsDisplayFactory.getScope();
  var postgresqlScope = postgresqlFactory.getScope();
  var buttonAreaScope = buttonAreaFactory.getScope();
  var treeDatabaseAreaScope = treeDatabaseAreaFactory.getScope();

  var currentTableSelected = tableSelected;
  var currentRowSelected = rowSelected;

  columnsDisplayScope.row_ids = [];
  $scope.references = [];

  $scope.attributes = []; //This will be use to display the name of columns
  for(let i=0;i<columnsDisplayScope.columns.length;i++){
    if(!exceptionColumns.includes(columnsDisplayScope.columns[i].column_name))
      $scope.attributes.push(columnsDisplayScope.columns[i]);
  };

  if(currentTableSelected != null){
    for(let z=0; z<$scope.attributes.length; z++){
      let temp = [];
      for(let i=0; i<postgresqlScope.valuesOfConstraint.length; i++){
        if($scope.attributes[z].column_name == postgresqlScope.valuesOfConstraint[i].name){
          for(let j=0; j<postgresqlScope.valuesOfConstraint[i].values.length; j++){
            if(postgresqlScope.valuesOfConstraint[i].values[j].name != null)
              theName = postgresqlScope.valuesOfConstraint[i].values[j].name;
            else
              theName = postgresqlScope.valuesOfConstraint[i].values[j].id;
            temp.push( {
              id : postgresqlScope.valuesOfConstraint[i].values[j].id,
              name : theName
            });
          }
          break;
        }
      }
      let obj = {};
      obj[$scope.attributes[z].column_name] = temp;
      $scope.references.push(obj);
    }
  }

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
               if($scope.attributes[j].data_type.toLowerCase().includes("int")) valueList.push(parseInt(elt.options[elt.selectedIndex].value));
               else
                  valueList.push(elt.options[elt.selectedIndex].value);
            }
         }
       }
        postgresqlScope.addRecord(db, table, columnList, valueList, function(){ //Request to save a record in db
          if(postgresqlScope.successRequest){
            buttonAreaScope.display();
            if(currentRowSelected != null){
              if(document.getElementById("modifyButton") != null) document.getElementById("modifyButton").disabled = true;
              if(document.getElementById("deleteButton") != null) document.getElementById("deleteButton").disabled = true;
              if(currentRowSelected != null) document.getElementById(currentRowSelected).style.backgroundColor = "";
              if(currentRowSelected != null) document.getElementById(currentRowSelected).style.backgroundColor = "";
              rowSelected = null;
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
      document.getElementById('modifyButton').disabled = false;
      busy = false;
    }
  };

  //If we want to cancel
  $scope.cancelRecord = function(){

    if(confirm("Are you sure you want to cancel ?")){

      treeDatabaseAreaScope.setDisplayTo("nothing");
      document.getElementById('addButton').disabled = false;
      document.getElementById('modifyButton').disabled = true;
      if(currentRowSelected != null) document.getElementById(currentRowSelected).style.backgroundColor = "";
      if(currentRowSelected != null) document.getElementById(currentRowSelected).style.backgroundColor = "";
      rowSelected = null;
      busy = false;

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

  if(currentTableSelected != null){
    for(let z=0; z<$scope.attributes.length; z++){
      let temp = [];
      for(let i=0; i<postgresqlScope.valuesOfConstraint.length; i++){
        if($scope.attributes[z].name.column_name == postgresqlScope.valuesOfConstraint[i].name){
          for(let j=0; j<postgresqlScope.valuesOfConstraint[i].values.length; j++){
            if(postgresqlScope.valuesOfConstraint[i].values[j].name != null)
              theName = postgresqlScope.valuesOfConstraint[i].values[j].name;
            else
              theName = postgresqlScope.valuesOfConstraint[i].values[j].id;
            temp.push( {
              id : postgresqlScope.valuesOfConstraint[i].values[j].id,
              name : theName
            });
          }
          break;
        }
      }
      let obj = {};
      obj[$scope.attributes[z].name.column_name] = temp;
      $scope.references.push(obj);
    }
  }

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
               if($scope.attributes[j].name.data_type.toLowerCase().includes("int")) valueList.push(parseInt(elt.options[elt.selectedIndex].value));
               else valueList.push(elt.options[elt.selectedIndex].value);
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
                document.getElementById('modifyButton').disabled = true;
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
        busy = false;
      }
    }
  }

  $scope.cancelRecord = function(){
    if(confirm("Are you sure you want to cancel ?")){

      treeDatabaseAreaScope.setDisplayTo("nothing");
      document.getElementById('addButton').disabled = false;
      document.getElementById('modifyButton').disabled = true;
      if(rowSelected != null) document.getElementById(rowSelected).style.backgroundColor = "";
      if(currentRowSelected != null) document.getElementById(currentRowSelected).style.backgroundColor = "";
      rowSelected = null;
      busy = false;
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

  $scope.addLogin = function(id,md5,email,callback){
    $http({
      method: 'GET',
      url: '/db/addLogin?id='+md5+"&md5="+md5+"&email="+email
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

app.controller('relationsAreaController', function($scope, postgresqlFactory, columnsDisplayFactory, treeDatabaseAreaFactory){
  var postgresScope = postgresqlFactory.getScope();
  var columnsDisplayScope = columnsDisplayFactory.getScope();
  var treeDatabaseAreaScope = treeDatabaseAreaFactory.getScope();

  currentTableSelected = tableSelected;
  currentRowSelected = rowSelected;
  $scope.relationsData = [];
  $scope.tables = [];
  $scope.ready = false;

  if(currentTableSelected != null){
    let temp = currentTableSelected.split(';'); //We retrieve the db and the table names
    let db = temp[0];
    let table = temp[1];
    var primaryKey;

    postgresScope.getPrimaryKey(db, table, function(){
      if(postgresScope.successRequest){
        for(let i=0; i<columnsDisplayScope.columns.length; i++){
          if(postgresScope.primaryKey.data[0].attname == columnsDisplayScope.columns[i].column_name){
            var pkValue = JSON.parse(currentRowSelected)[i];
            break;
          }
        }
        for(let j=0; j<treeDatabaseAreaScope.databases.length; j++){
          if(treeDatabaseAreaScope.databases[j].name == db){
            for(let k=0; k<treeDatabaseAreaScope.databases[j].table.length; k++){
              if(treeDatabaseAreaScope.databases[j].table[k].table_name != table){
                postgresScope.getColumnConstraint(db, treeDatabaseAreaScope.databases[j].table[k].table_name, function(){
                  if(postgresScope.successRequest){
                    for(let l=0; l<postgresScope.columnConstraint.data.length; l++){
                      if(postgresScope.columnConstraint.data[l].foreign_table_name == table && postgresScope.columnConstraint.data[l].foreign_column_name == postgresScope.primaryKey.data[0].attname){
                        postgresScope.getPrimaryKey(db, postgresScope.columnConstraint.data[l].table_name, function(){
                          if(postgresScope.successRequest){
                            postgresScope.query(db, postgresScope.columnConstraint.data[l].table_name, postgresScope.primaryKey.data[0].attname, postgresScope.columnConstraint.data[l].column_name, pkValue, function(){
                              if(postgresScope.successRequest){
                                $scope.relationsData.push({
                                  table_name : treeDatabaseAreaScope.databases[j].table[k].table_name,
                                  values : postgresScope.queryRequest
                                });
                                for(let i=0; i<$scope.relationsData.length; i++){
                                  if($scope.tables.indexOf($scope.relationsData[i].table_name) <= -1) $scope.tables.push($scope.relationsData[i].table_name)
                                }
                              }
                              else{
                                console.log(postgresScope.queryRequest);
                                alert("Error on query request, check console logs.")
                              }
                            });
                          }
                        });
                        break;
                      }
                    }
                  }
                  else{
                    console.log(postgresScope.columnConstraint);
                    alert("Error on getColumnConstraint request, check console logs.")
                  }
                });
              }
            }
            break;
          }
        }
        busy = false;
        if(document.getElementById("showRelationsButton") != null) document.getElementById("showRelationsButton").disabled = false;
        $scope.ready = true;
        console.log($scope.relationsData);
      }
      else{
        console.log(postgresScope.primaryKey);
        alert("Error on getPrimaryKey request, check console logs.")
      }
    });
  }
});

app.controller('loginController', function($scope, postgresqlFactory){
  var id_ok = "63e780c3f321d13109c71bf81805476e";

  $scope.verif_cook = function(){
    if(document.cookie == id_ok){
      window.location="/";
      localStorage['apf_project_db_editor_login'] = '1';
    }
  }

  $scope.iden = function() {
    var tab="azertyuiopqsdfghjklmwxcvbnAZERTYUIOPQSDFGHJKLMWXCVBN0123456789_$&#@";
    var user= document.getElementById("user").value;
    var pass= document.getElementById("pass").value;
    var rm= document.getElementById("check");
    var userpass = user + pass;

    var MD5 = function(d){result = M(V(Y(X(d),8*d.length)));return result.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_}
    var result = MD5(userpass);

    //$scope.check_login(result);
    /*if(result == id_ok){
      if(rm.checked == true){
        document.cookie =result;
      }
      window.location="/";
      localStorage['apf_project_db_editor_login'] = '1';
    }
    else{
      alert("incorrect password");
    }*/

  }

  $scope.clear_cache = function(){
    localStorage['apf_project_db_editor_login'] = '0';
    document.cookie = '';
    window.location="#!/login"
  }

  $scope.verifco = function(){
    var ok = localStorage['apf_project_db_editor_login'];
    if(ok != 1){
      window.location="#!/login";
    }
  }

  $scope.isLoggedOn = function(){
    ret = false;
    if(localStorage['apf_project_db_editor_login'] == 1)
      ret = true;

    return ret;
  }

  var postgresScope = postgresqlFactory.getScope();

  $scope.check_login = function(md5) {
    postgresScope.getIdFromMD5(md5, function(){
      if(postgresScope.successRequest){
        if(postgresScope.queryLogin.data.length > 0){
          $scope.id_exist =  true;
        }
        else {
          $scope.id_exist =  false;
        }
      }
      else {
        console.log(postgresScope.queryLogin);
        alert("Error on getIdFromMD5 request, check console logs.");
      }
<<<<<<< HEAD
=======
      console.log($scope.id_exist);
      if($scope.id_exist == true){
        if(rm.checked == true){
          document.cookie = md5;
        }
        window.location="/";
        localStorage['apf_project_db_editor_login'] = '1';
      }
      else{
        alert("incorrect password");
      }
>>>>>>> eb4f3bfc58db341d2a70d5a06bdb35d6852036f5
    });
    console.log($scope.id_exist);
  }
});

app.controller('signupController', function($scope, postgresqlFactory){

});
