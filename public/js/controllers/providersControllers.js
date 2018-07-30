app.controller('mainProvidersController', function($scope, mainProvidersFactory){
  mainProvidersFactory.setScope($scope);
  $scope.selectedProvider = null;

  $scope.awsProvider = "AWS";
  $scope.azureProvider = "Azure";
  $scope.fcaProvider = "FCA";
  $scope.feProvider = "FE";

  $scope.checkProvider = function(){
    $scope.selectedProvider = ((window.location.href.split('?')[1]).split('&')[0]).split('=')[1];
  };

  $scope.queryTenant = function(provider){

  };
});

app.controller('awsProviderController', function($scope){
  $scope.controller = "AWS";
  $scope.tenants = [];
});

app.controller('azureProviderController', function($scope){
  $scope.controller = "Azure";
  $scope.tenants = [];
});

app.controller('fcaProviderController', function($scope){
  $scope.controller = "FCA";
  $scope.tenants = [];
});

app.controller('feProviderController', function($scope){
  $scope.controller = "Flexible Engine";
  $scope.tenants = [];
});
