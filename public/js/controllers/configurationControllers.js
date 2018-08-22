app.controller('configurationController', function($scope){
  $scope.select = "select";
  $scope.input = "input";
  $scope.list = "list";

  $scope.variables = [
    {
      name: "exceptionDB",
      description: "The database(s) not displayed in DB Management and Dashboard : ",
      type: "list",
      value : exceptionDB
    },
    {
      name: "exceptionColumns",
      description: "The column(s) not used to add/modify a record : ",
      type: "list",
      value : exceptionColumns
    },
    {
      name: "readOnlyDB",
      description: "The database(s) in read only mode : ",
      type: "list",
      value : readOnlyDB
    },
    {
      name: "displayName",
      description: "The list of names displayed in foreign keys instead of the ID : ",
      type: "list",
      value : displayName
    },
    {
      name: "exceptionTables",
      description: "The tables which start with the following element(s) will not be displayed in Dashboard : ",
      type: "list",
      value : exceptionTables
    },
    {
      name: "waitFor",
      description: "The time in ms the application will wait to prevent from network issues is : ",
      type : "input",
      typeBis: 'int',
      value : waitFor
    }
  ];

  $scope.addValue = function(name){
    let val = prompt('Enter the value you want to add');
    if(val != null){
      for(let i=0; i<$scope.variables.length; i++){
        if($scope.variables[i].name == name){
          $scope.variables[i].value.push(val);
          break;
        }
      }
    }
  };

  $scope.modifyValue = function(name, value){
    let val = prompt('Modify the value', value);
    if(val != null){
      for(let i=0; i<$scope.variables.length; i++){
        if($scope.variables[i].name == name){
          for(let j=0; j<$scope.variables[i].value.length; j++){
            if($scope.variables[i].value[j] == value){
              $scope.variables[i].value[j] = val;
              break;
            }
          }
        }
      }
    }
  };

  $scope.deleteValue = function(name, even){
    if(even.originalEvent.keyCode == 46){
      let sel = document.getElementById(name);
      let selectedValues = [];
      for(let i=0; i<sel.options.length; i++){
        if(sel.options[i].selected) selectedValues.push(sel.options[i].value);
      }
      if(selectedValues.length > 0){
        let val = "multiple values";
        if(selectedValues.length == 1 ) val = selectedValues[0];
        if(confirm('Are you sure you want to delete '+val+' ?')){
          for(let i=0; i<$scope.variables.length; i++){
            if($scope.variables[i].name == name){
              for(let j=0; j<selectedValues.length; j++){
                let index = $scope.variables[i].value.indexOf(selectedValues[j]);
                if(index > -1) $scope.variables[i].value.splice(index, 1);
              }
            }
          }
        }
      }
    }
  };

  $scope.saveValues = function(){
    alterInitFile($scope.variables);
    window.location = '#!/configuration';
  };
});
