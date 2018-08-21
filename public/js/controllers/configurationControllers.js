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
      value : exceptionDB
    },
    {
      name: "readOnlyDB",
      description: "The database(s) in read only mode : ",
      type: "list",
      value : exceptionDB
    },
    {
      name: "displayName",
      description: "The list of names displayed in foreign keys instead of the ID : ",
      type: "list",
      value : exceptionDB
    },
    {
      name: "exceptionTables",
      description: "The tables which start with the following element(s) will not be displayed in Dashboard : ",
      type: "list",
      value : exceptionDB
    },
    {
      name: "exceptionDB",
      description: "The database(s) not displayed in DB Management and Dashboard : ",
      type: "list",
      value : exceptionDB
    },
    {
      name: "waitFor",
      description: "The time in ms the application will wait to prevent from network issues is : ",
      type : "input",
      value : waitFor
    }
  ];
});
