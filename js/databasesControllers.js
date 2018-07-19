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

  $scope.loadDB = function(){
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
                  console.log(postgresScope.tableArray);
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
  }
});

app.controller('columnsDisplayAreaController', function($scope, columnsDisplayFactory, postgresqlFactory){
  columnsDisplayFactory.setScope($scope);
  var postgresqlScope = postgresqlFactory.getScope();
  $scope.row_ids = [];
  $scope.elementIdToSet = [];

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

  $scope.setName = function(column_name, tuple, val){
    id = column_name+";"+JSON.stringify(tuple)+";"+val;
    $scope.elementIdToSet.push({
      id : id,
      column : column_name,
      set : false,
      value : val
    });
  };

  $scope.setNameWithId = function(){
    if(postgresqlScope.valuesOfConstraint != null){
      for(let i=0; i<postgresqlScope.valuesOfConstraint.length; i++){
        for(let j=0; j<$scope.elementIdToSet.length; j++){
          if(postgresqlScope.valuesOfConstraint[i].name == $scope.elementIdToSet[j].column && !$scope.elementIdToSet[j].set){
            for(let k=0; k<postgresqlScope.valuesOfConstraint[i].values.length; k++){
              if(postgresqlScope.valuesOfConstraint[i].values[k].id == $scope.elementIdToSet[j].value){
                if(document.getElementById($scope.elementIdToSet[j].id) != null){
                  document.getElementById($scope.elementIdToSet[j].id).innerHTML = postgresqlScope.valuesOfConstraint[i].values[k].name;
                  $scope.elementIdToSet[j].set = true;
                }
              }
            }
          }
        }
      }
    }
  }

  /*angular.element(document).ready(function(){
    console.log("Table fully loaded");
  });*/
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
    busy = false;
    currentTableSelected = tableSelected;
    currentRowSelected = rowSelected;
    var columnsDisplayScope = columnsDisplayFactory.getScope();
    treeDatabaseAreaScope.setDisplayTo("nothing");
    if(currentRowSelected != null) document.getElementById(currentRowSelected).style.backgroundColor = "";
    rowSelected = null;
    columnsDisplayScope.row_ids = [];
    columnsDisplayScope.elementIdToSet = [];
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
                  let theName = postgresScope.columnValues.data[i][(columnsDisplayScope.columns[j].column_name)];
                  for(let k=0; k<displayName.length; k++){
                    if(postgresScope.columnValues.data[i][displayName[k]] != null){
                      theName = postgresScope.columnValues.data[i][displayName[k]];
                      break;
                    }
                  }
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
                      let queryName = null;
                      for(let k=0; k<displayName.length; k++){
                        if(postgresScope.valuesOf.data[j][displayName[k]] != null){
                          theName = postgresScope.valuesOf.data[j][displayName[k]];
                          queryName = displayName[k];
                          break;
                        }
                      }
                      temp.push({
                        id : postgresScope.valuesOf.data[j][postgresScope.columnConstraint.data[i].foreign_column_name],
                        name : theName,
                        table : postgresScope.columnConstraint.data[i].foreign_table_name,
                        records : postgresScope.valuesOf.data[j]
                      });
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
              columnsDisplayScope.setNameWithId();
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
    if(rowSelected != null) document.getElementById(rowSelected).style.backgroundColor = "";
    rowSelected = null;
    busy = false;
    treeDatabaseAreaScope.setDisplayTo("nothing");
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

app.controller('relationsAreaController', function($scope, postgresqlFactory, columnsDisplayFactory, treeDatabaseAreaFactory){
  var postgresScope = postgresqlFactory.getScope();
  var columnsDisplayScope = columnsDisplayFactory.getScope();
  var treeDatabaseAreaScope = treeDatabaseAreaFactory.getScope();

  $scope.relationsData = [];
  $scope.ready = false;

  $scope.displayRel = function(){
    currentTableSelected = tableSelected;
    currentRowSelected = rowSelected;
    $scope.relationsData = [];
    $scope.ready = false;

    if(currentTableSelected != null){
      let temp = currentTableSelected.split(';'); //We retrieve the db and the table names
      let db = temp[0];
      let table = temp[1];

      postgresScope.getPrimaryKey(db, table, function(){
        if(postgresScope.successRequest){
          var pkName = postgresScope.primaryKey.data[0].attname;
          for(let i=0; i<columnsDisplayScope.columns.length; i++){
            if(pkName == columnsDisplayScope.columns[i].column_name){
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
                      //console.log(treeDatabaseAreaScope.databases[j].table[k].table_name);
                      //console.log(postgresScope.columnConstraint);
                      for(let l=0; l<postgresScope.columnConstraint.data.length; l++){
                        //console.log(postgresScope.columnConstraint.data[l].foreign_table_name+" vs "+table);
                        //console.log(postgresScope.columnConstraint.data[l].foreign_column_name+" vs "+pkName)
                        if(postgresScope.columnConstraint.data[l].foreign_table_name == table && postgresScope.columnConstraint.data[l].foreign_column_name == pkName){
                          col = postgresScope.columnConstraint.data[l].column_name;
                          //console.log("Conditions vérifiées");
                          //console.log("Get pk de : "+postgresScope.columnConstraint.data[l].table_name);
                          postgresScope.getPrimaryKey(db, postgresScope.columnConstraint.data[l].table_name, function(){
                            if(postgresScope.successRequest){
                              //console.log("PK : "+postgresScope.primaryKey.data[0].attname);
                              //console.log("SELECT * FROM "+treeDatabaseAreaScope.databases[j].table[k].table_name+" WHERE "+postgresScope.columnConstraint.data[l].column_name+" = "+pkValue);
                              postgresScope.query(db, treeDatabaseAreaScope.databases[j].table[k].table_name, "*", col, pkValue, function(){
                                if(postgresScope.successRequest){
                                  //console.log("Table : "+postgresScope.columnConstraint.data[l].table_name);
                                  //console.log(postgresScope.queryRequest.data);
                                  let theName = postgresScope.primaryKey.data[0].attname;
                                  if(postgresScope.queryRequest.data.length > 0){
                                    for(let m=0; m<displayName.length; m++){
                                      if(postgresScope.queryRequest.data[0][displayName[m]] != null){
                                        theName = displayName[m];
                                        break;
                                      }
                                    }
                                  }
                                  $scope.relationsData.push({
                                    table_name : treeDatabaseAreaScope.databases[j].table[k].table_name,
                                    values : postgresScope.queryRequest.data,
                                    id : postgresScope.primaryKey.data[0].attname,
                                    name : theName
                                  });
                                  //console.log($scope.relationsData);
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
                        break;
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
          $scope.ready = true;
        }
        else{
          console.log(postgresScope.primaryKey);
          alert("Error on getPrimaryKey request, check console logs.")
        }
      });
    }
  }

  $scope.clear = function(){
    busy = false;
    $scope.relationsData = [];
    $scope.ready = false;
    treeDatabaseAreaScope.setDisplayTo("nothing");
    if(document.getElementById("showRelationsButton") != null) document.getElementById("showRelationsButton").disabled = false;
  };
});
