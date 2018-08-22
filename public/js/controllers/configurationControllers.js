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
      name: "forbiddenChar",
      description: "The forbidden character(s) when the user wants to add/modify a record : ",
      type: "list",
      value : forbiddenChar
    },
    {
      name: "waitFor",
      description: "The time in ms the application will wait to prevent from network issues is : ",
      type : "input",
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

  $scope.deleteValue = function(name, value){
    alert("Key Press");
  };
});
