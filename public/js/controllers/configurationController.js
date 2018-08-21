app.controller('configurationController', function($scope){
  $scope.variables = [
    {
      name: "waitFor",
      description: "The time in ms the application will wait to prevent from network issues is : ",
      type : "int",
      value : waitFor
    }
  ];
});
