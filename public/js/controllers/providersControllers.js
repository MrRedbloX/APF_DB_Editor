app.controller('mainProvidersController', function($scope, mainProvidersFactory, postgresqlFactory){
  mainProvidersFactory.setScope($scope);
  var postgresScope = postgresqlFactory.getScope();
  $scope.selectedProvider = null;

  $scope.awsProvider = "AWS";
  $scope.azureProvider = "Azure";
  $scope.fcaProvider = "FCA";
  $scope.feProvider = "FE";

  $scope.database = "sonde";
  $scope.tenant_table = "tenant_table";
  $scope.provider_table = "provider_table";
  $scope.foreign_key = "provider_uuid";

  $scope.checkProvider = function(){
    $scope.selectedProvider = ((window.location.href.split('?')[1]).split('&')[0]).split('=')[1];

    queryVar = $scope.selectedProvider;
    if($scope.selectedProvider == $scope.feProvider) queryVar = "Flexible Engine";

    postgresScope.query($scope.database, $scope.provider_table, "uuid", "name", queryVar, function(){
      if(postgresScope.successRequest){

      }
      else{
        console.log(postgresScope.queryRequest);
        alert("Error on query request, check console logs.");
      }
    });
  };

  $scope.queryTenants = function(provider){
    postgresScope.query($scope.database, $scope.tenant_table, "*", )
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
