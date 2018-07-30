var displayRessources;
var selectedTenant;
var selectedTenantID;

function getRessources(id){
  console.log("getRessources")
  let split = id.split(";");
  displayRessources = true;
  selectedTenant = split[1];
  selectedTenantID = split[0];
}

app.controller('mainProvidersController', function($scope, mainProvidersFactory, postgresqlFactory, azureProviderFactory, awsProviderFactory, fcaProviderFactory, feProviderFactory){
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

  $scope.displayRessources = displayRessources;
  $scope.selectedTenant = selectedTenant;
  $scope.selectedTenantID = selectedTenantID;

  $scope.providerScope = null;

  $scope.ressources = [
    {
      name : "ECS",
      values : []
    },
    {
      name : "VPC",
      values : []
    },
    {
      name : "SG",
      values : []
    },
    {
      name : "KP",
      values : []
    }
  ];

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
            if($scope.selectedProvider == $scope.awsProvider){
              $scope.providerScope = awsProviderFactory.getScope();
              while($scope.providerScope == null) $scope.providerScope = awsProviderFactory.getScope();
            }
            else if($scope.selectedProvider == $scope.azureProvider){
              $scope.providerScope = azureProviderFactory.getScope();
              while($scope.providerScope == null) $scope.providerScope = azureProviderFactory.getScope();
            }
            else if($scope.selectedProvider == $scope.fcaProvider){
              $scope.providerScope = fcaProviderFactory.getScope();
              while($scope.providerScope == null) $scope.providerScope = fcaProviderFactory.getScope();
            }
            else if($scope.selectedProvider == $scope.feProvider){
              $scope.providerScope = feProviderFactory.getScope();
              while($scope.providerScope == null) $scope.providerScope = feProviderFactory.getScope();
            }
            
            $scope.providerScope.setTenants(postgresScope.queryRequest.data);
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

  $scope.loadJSTree = function(id){
    $(function() {
      let treeView = $("#"+id);
      treeView.jstree()
      .on('ready.jstree', function(){
        treeView.jstree('open_all');
      })
      .on('select_node.jstree', function(e, data){
        $scope.getRessources(data.node.text);
      });
    });
  }

  $scope.getRessources = function(tenant){

  };

});

app.controller('awsProviderController', function($scope, mainProvidersFactory, awsProviderFactory){
  $scope.controller = "AWS";
  awsProviderFactory.setScope($scope);
  var mainProvidersScope = mainProvidersFactory.getScope();
  $scope.tenants = [];

  $scope.setTenants = function(tenants){
    $scope.tenants = tenants;
    mainProvidersScope.loadJSTree("treeTenants"+$scope.controller);
  }

  $scope.getRessources = function(){
    console.log("OK");
  }
});

app.controller('azureProviderController', function($scope, mainProvidersFactory, azureProviderFactory){
  $scope.controller = "Azure";
  azureProviderFactory.setScope($scope);
  var mainProvidersScope = mainProvidersFactory.getScope();
  $scope.tenants = [];

  $scope.setTenants = function(tenants){
    $scope.tenants = tenants;
    mainProvidersScope.loadJSTree("treeTenants"+$scope.controller);
  }

});

app.controller('fcaProviderController', function($scope, mainProvidersFactory, fcaProviderFactory){
  $scope.controller = "FCA";
  var mainProvidersScope = mainProvidersFactory.getScope();
  fcaProviderFactory.setScope($scope);
  $scope.tenants = [];

  $scope.setTenants = function(tenants){
    $scope.tenants = tenants;
    mainProvidersScope.loadJSTree("treeTenants"+$scope.controller);
  }
});

app.controller('feProviderController', function($scope, mainProvidersFactory, feProviderFactory){
  $scope.controller = "Flexible Engine";
  $scope.controllerBis = "FE";
  var mainProvidersScope = mainProvidersFactory.getScope();
  feProviderFactory.setScope($scope);
  $scope.tenants = [];

  $scope.setTenants = function(tenants){
    $scope.tenants = tenants;
    mainProvidersScope.loadJSTree("treeTenants"+$scope.controllerBis);
  }
});
