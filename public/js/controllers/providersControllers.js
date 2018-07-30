app.controller('mainProvidersController', function($scope, mainProvidersFactory, postgresqlFactory){
  mainProvidersFactory.setScope($scope);
  var postgresScope = postgresqlFactory.getScope();
  $scope.selectedProvider = null;

  $scope.controller = "Test";

  $scope.awsProvider = "AWS";
  $scope.azureProvider = "Azure";
  $scope.fcaProvider = "FCA";
  $scope.feProvider = "FE";

  $scope.database = "sonde";
  $scope.tenant_table = "tenant_table";
  $scope.provider_table = "provider_table";
  $scope.tenantFkProvider = "provider_uuid";

  $scope.tenants = [];

  $scope.readyCheckProvider = false;
  $scope.readyQueryTenants = false;

  $scope.checkProvider = function(){
    $scope.selectedProvider = ((window.location.href.split('?')[1]).split('&')[0]).split('=')[1];

    let queryVar = $scope.selectedProvider;
    if($scope.selectedProvider == $scope.feProvider) queryVar = "Flexible Engine";
    queryVar = "'"+queryVar+"'";

    postgresScope.query($scope.database, $scope.provider_table, "uuid", "name", queryVar, function(){
      if(postgresScope.successRequest){
        $scope.selectedProviderId = postgresScope.queryRequest.data[0].uuid;
        $scope.readyCheckProvider = true;
      }
      else{
        console.log(postgresScope.queryRequest);
        alert("Error on query request, check console logs.");
      }
    });
  };

  $scope.queryTenants = function(provider){
    $scope.tenants = [];
    $scope.readyCheckProvider = false;
    postgresScope.query($scope.database, $scope.tenant_table, "*", $scope.tenantFkProvider, $scope.selectedProviderId, function(){
      if(postgresScope.successRequest){
        $scope.tenants = postgresScope.queryRequest.data;
        $scope.readyQueryTenants = true;
        console.log($scope.tenants);
      }
      else{
        console.log(postgresScope.queryRequest);
        alert("Error on query request, check console logs.");
      }
    });
  };

  $scope.getQueryTenants = function(provider){
    return $scope.queryTenants(provider);
  }

  $scope.loadJSTree = function(provider){
    console.log("Load");
    $(function() {
      $('#treeTenants'+provider).jstree(); //Activating jtree
    });

    $scope.readyQueryTenants = false;
  }
});

app.controller('awsProviderController', function($scope, mainProvidersFactory){
  $scope.controller = "AWS";
  var mainProvidersScope = mainProvidersFactory.getScope();
  $scope.tenants = mainProvidersScope.tenants;

  $scope.queryTenants = mainProvidersScope.getQueryTenants($scope.controller);

  /*$scope.loadJSTree = mainProvidersScope.loadJSTree($scope.controller);*/
});

app.controller('azureProviderController', function($scope, mainProvidersFactory){
  $scope.controller = "Azure";
  var mainProvidersScope = mainProvidersFactory.getScope();
  $scope.tenants = mainProvidersScope.tenants;

  $scope.queryTheTenants = mainProvidersScope.queryTenants($scope.controller);

  $scope.loadJSTree = mainProvidersScope.loadJSTree($scope.controller);
});

app.controller('fcaProviderController', function($scope, mainProvidersFactory){
  $scope.controller = "FCA";
  var mainProvidersScope = mainProvidersFactory.getScope();
  $scope.tenants = mainProvidersScope.tenants;

  $scope.queryTenants = mainProvidersScope.queryTenants($scope.controller);

  $scope.loadJSTree = mainProvidersScope.loadJSTree($scope.controller);
});

app.controller('feProviderController', function($scope, mainProvidersFactory){
  $scope.controller = "Flexible Engine";
  var mainProvidersScope = mainProvidersFactory.getScope();
  $scope.tenants = mainProvidersScope.tenants;

  $scope.queryTenants = mainProvidersScope.queryTenants($scope.controller);

  $scope.loadJSTree = mainProvidersScope.loadJSTree($scope.controller);
});
