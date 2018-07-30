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

  $scope.queryTenants = function(provider){
    console.log(provider);
  };
});

app.controller('awsProviderController', function($scope, mainProvidersFactory){
  $scope.controller = "AWS";
  $scope.tenants = [];
  var mainProvidersScope = mainProvidersFactory.getScope();

  $scope.queryTenants = mainProvidersScope.queryTenants($scope.controller);
});

app.controller('azureProviderController', function($scope, mainProvidersFactory){
  $scope.controller = "Azure";
  $scope.tenants = [];

  $scope.queryTenants = mainProvidersScope.queryTenants($scope.controller);
});

app.controller('fcaProviderController', function($scope, mainProvidersFactory){
  $scope.controller = "FCA";
  $scope.tenants = [];

  $scope.queryTenants = mainProvidersScope.queryTenants($scope.controller);
});

app.controller('feProviderController', function($scope, mainProvidersFactory){
  $scope.controller = "Flexible Engine";
  $scope.tenants = [];

  $scope.queryTenants = mainProvidersScope.queryTenants($scope.controller);
});
