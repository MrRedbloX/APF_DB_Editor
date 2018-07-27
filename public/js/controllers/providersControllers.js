app.controller('mainProvidersController', function($scope){
  $scope.selectedProvider = null;

  $scope.checkProvider = function(){
    let provider = ((window.location.href.split('?')[1]).split('&')[0]).split('=')[1];

    if(provider == "AWS")
      selectedProvider = "awsProviderController";
    else if(provider == "Azure")
      selectedProvider = "azureProviderController";
    else if(provider == "FCA")
      selectedProvider = "fcaProviderController";
    else if(provider == "FE")
      selectedProvider = "feProviderController";
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
