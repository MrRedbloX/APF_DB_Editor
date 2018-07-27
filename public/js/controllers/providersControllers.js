app.controller('mainProvidersController', function($scope){
  $scope.selectedProvider = null;

  $scope.awsProvider = "AWS";
  $scope.azureProvider = "Azure";
  $scope.fcaProvider = "FCA";
  $scope.feProvider = "FE";

  $scope.checkProvider = function(){
    $scope.selectedProvider = ((window.location.href.split('?')[1]).split('&')[0]).split('=')[1];
  };
});

app.controller('awsProviderController', function($scope){
  $scope.controller = "AWS";
});

app.controller('azureProviderController', function($scope){
  $scope.controller = "Azure";
});

app.controller('fcaProviderController', function($scope){
  $scope.controller = "FCA";
});

app.controller('feProviderController', function($scope){
  $scope.controller = "Flexible Engine";
});
