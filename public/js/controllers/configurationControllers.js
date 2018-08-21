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
      name: "waitFor",
      description: "The time in ms the application will wait to prevent from network issues is : ",
      type : "input",
      value : waitFor
    }
  ];
});
