app.controller('mainProvidersController', function($scope, mainProvidersFactory, postgresqlFactory, azureProviderFactory){
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

    postgresScope.query($scope.database, $scope.provider_table, "uuid", "name", "'"+queryVar+"'", function(){
      if(postgresScope.successRequest){
        $scope.selectedProviderId = postgresScope.queryRequest.data[0].uuid;
        $scope.readyCheckProvider = true;

        $scope.tenants = [];
        postgresScope.query($scope.database, $scope.tenant_table, "*", $scope.tenantFkProvider, $scope.selectedProviderId, function(){
          if(postgresScope.successRequest){
            //$scope.tenants = postgresScope.queryRequest.data;
            let providerScope = null;
            if($scope.selectedProvider == $scope.awsProvider){
              providerScope = awsProviderFactory.getScope();
              while(providerScope == null) providerScope = awsProviderFactory.getScope();
            }
            else if($scope.selectedProvider == $scope.azureProvider){
              providerScope = azureProviderFactory.getScope();
              console.log(providerScope);
              while(providerScope == null) providerScope = azureProviderFactory.getScope();
            }
            else if($scope.selectedProvider == $scope.fcaProvider){
              providerScope = fcaProviderFactory.getScope();
              while(providerScope == null) providerScope = fcaProviderFactory.getScope();
            }
            else if($scope.selectedProvider == $scope.feProvider){
              providerScope = feProviderFactory.getScope();
              while(providerScope == null) providerScope = feProviderFactory.getScope();
            }
            providerScope.setTenants(postgresScope.queryRequest.data);
            console.log($scope.tenants);
          }
          else{
            console.log(postgresScope.queryRequest);
            alert("Error on query request, check console logs.");
          }
        });
      }
      else{
        console.log(postgresScope.queryRequest);
        alert("Error on query request, check console logs.");
      }
    });
  };

  $scope.loadJSTree = function(provider){
    console.log("Load");
    $(function() {
      $('#treeTenants'+provider).jstree(); //Activating jtree
    });
  }
  $scope.getReadyTenants = function(){
    return $scope.readyQueryTenants;
  }
});

app.controller('awsProviderController', function($scope, mainProvidersFactory){
  $scope.controller = "AWS";
  var mainProvidersScope = mainProvidersFactory.getScope();
  $scope.tenants = [];

  $$scope.setTenants = function(tenants){
    $scope.tenants = tenants;
  }

  $scope.loadJSTreeBis = function(){
    mainProvidersScope.loadJSTree($scope.controller);
  }
});

app.controller('azureProviderController', function($scope, mainProvidersFactory, azureProviderFactory){
  $scope.controller = "Azure";
  azureProviderFactory.setScope($scope);
  var mainProvidersScope = mainProvidersFactory.getScope();
  $scope.tenants = [];

  $scope.readyTenants = mainProvidersScope.getReadyTenants();

  $scope.setTenants = function(tenants){
    $scope.tenants = tenants;
    $scope.loadJSTreeBis();
  }

  $scope.loadJSTreeBis = function(){
    mainProvidersScope.loadJSTree($scope.controller);
  }
});

app.controller('fcaProviderController', function($scope, mainProvidersFactory){
  $scope.controller = "FCA";
  var mainProvidersScope = mainProvidersFactory.getScope();
  $scope.tenants = [];

  $scope.setTenants = function(tenants){
    $scope.tenants = tenants;
  }

  $scope.loadJSTreeBis = function(){
    mainProvidersScope.loadJSTree($scope.controller);
  }
});

app.controller('feProviderController', function($scope, mainProvidersFactory){
  $scope.controller = "Flexible Engine";
  var mainProvidersScope = mainProvidersFactory.getScope();
  $scope.tenants = [];

  $scope.setTenants = function(tenants){
    $scope.tenants = tenants;
  }

  $scope.loadJSTreeBis = function(){
    mainProvidersScope.loadJSTree($scope.controller);
  }
});
