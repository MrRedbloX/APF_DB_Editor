app.controller('configurationController', function($scope){
  $scope.select = "select";
  $scope.int = "int";
  
  $scope.variables = [
    {
      name: "waitFor",
      description: "The time in ms the application will wait to prevent from network issues is : ",
      type : "int",
      value : 1
    }
  ];
});
