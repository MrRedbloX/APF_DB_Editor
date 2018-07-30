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
    let ret = false;
    $scope.tenants = [];
    $scope.readyCheckProvider = false;
    postgresScope.query($scope.database, $scope.tenant_table, "*", $scope.tenantFkProvider, $scope.selectedProviderId, function(){
      if(postgresScope.successRequest){
        $scope.tenants = postgresScope.queryRequest.data;
        $scope.readyQueryTenants = true;
        console.log($scope.tenants);
        ret = true;
      }
      else{
        console.log(postgresScope.queryRequest);
        alert("Error on query request, check console logs.");
      }
    });
    return ret;
  };

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

  $scope.readyQueryTenants = false;

  $scope.queryTenantsBis = function(){
    $scope.readyQueryTenants = mainProvidersScope.queryTenants($scope.controller);
  }

  $scope.loadJSTreeBis = function(){
    mainProvidersScope.loadJSTree($scope.controller);
  }
});

app.controller('azureProviderController', function($scope, mainProvidersFactory){
  console.log("AzureContr");
  $scope.controller = "Azure";
  var mainProvidersScope = mainProvidersFactory.getScope();
  $scope.tenants = mainProvidersScope.tenants;

  $scope.readyQueryTenants = false;

  $scope.queryTenantsBis = function(){
    console.log("Start");
    $scope.readyQueryTenants = false;
    $scope.readyQueryTenants = mainProvidersScope.queryTenants($scope.controller);
    console.log($scope.readyQueryTenants);
  }

  $scope.loadJSTreeBis = function(){
    mainProvidersScope.loadJSTree($scope.controller);
  }
});

app.controller('fcaProviderController', function($scope, mainProvidersFactory){
  $scope.controller = "FCA";
  var mainProvidersScope = mainProvidersFactory.getScope();
  $scope.tenants = mainProvidersScope.tenants;

  $scope.queryTenantsBis = function(){
    mainProvidersScope.queryTenants($scope.controller);
  }

  $scope.loadJSTreeBis = function(){
    mainProvidersScope.loadJSTree($scope.controller);
  }
});

app.controller('feProviderController', function($scope, mainProvidersFactory){
  $scope.controller = "Flexible Engine";
  var mainProvidersScope = mainProvidersFactory.getScope();
  $scope.tenants = mainProvidersScope.tenants;

  $scope.queryTenantsBis = function(){
    mainProvidersScope.queryTenants($scope.controller);
  }

  $scope.loadJSTreeBis = function(){
    mainProvidersScope.loadJSTree($scope.controller);
  }
});
