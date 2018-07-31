app.controller('mainProvidersController', function($scope, $route, mainProvidersFactory, postgresqlFactory, azureProviderFactory, awsProviderFactory, fcaProviderFactory, feProviderFactory){
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
  $scope.ecs_table = "ecs_table";
  $scope.vpc_table = "vpc_table";
  $scope.sg_table = "sg_table";
  $scope.kp_table = "kp_table";
  $scope.subnet_table = "subnet_table";

  $scope.displayRessources = false;
  $scope.selectedTenant = null;
  $scope.selectedTenantID = null;

  $scope.providerScope = null;

  $scope.ressourcesNames = ["ECS", "VPC", "SG", "KP"];
  $scope.ressources = [];
  $scope.objectsNames = ["Subnet", "Rule"];
  $scope.objects = {};

  $scope.readyCheckProvider = false;

  $scope.checkProvider = function(){
    $scope.readyCheckProvider = false;
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

  $scope.loadJSTreeAndSetListener = function(id, mode){
    $(function() {
      let treeView = $("#"+id);
      treeView.jstree()
      .on('select_node.jstree', function(e, data){
        if(mode == "Tenant"){
          $scope.getRessources(data.node.text);
        }
      });
    });
  }

  $scope.loadJSTree= function(id){
    $(function() {
      let treeView = $("#"+id);
      treeView.jstree();
    });
  }

  $scope.getRessources = function(tenant){
    $scope.ressources = [];
    $scope.objects = {};
    let split = tenant.split(" / ");
    $scope.selectedTenant = split[0];
    postgresScope.query($scope.database, $scope.tenant_table, "uuid,tenant_region", "tenant_name", "'"+$scope.selectedTenant+"'", async function(){
      if(postgresScope.successRequest){
        for(let i=0; i<postgresScope.queryRequest.data.length; i++){
          if(postgresScope.queryRequest.data[i].tenant_region == split[1]){
            $scope.selectedTenantID = postgresScope.queryRequest.data[i].uuid;

            for(let j=0; j<$scope.ressourcesNames.length; j++)
              await $scope.queryRessources($scope.ressourcesNames[j]);

            $scope.displayRessources = true;
            break;
          }
        }
      }
      else{
        console.log(postgresScope.queryRequest);
        alert("Error on query request, check console logs.");
      }
    });
  };

  $scope.queryRessources = function(res){
    if(res == "ECS") return new Promise((resolve, reject) => $scope.queryECS(resolve, reject, res));
    else if(res == "VPC") return new Promise((resolve, reject) => $scope.queryVPC(resolve, reject, res));
    else if(res == "SG") return new Promise((resolve, reject) => $scope.querySG(resolve, reject, res));
    else if(res == "KP") return new Promise((resolve, reject) => $scope.queryKP(resolve, reject, res));
    else return new Promise(reject => {
      console.log("Hundle ressource");
      reject();
    });
  };

  $scope.queryECS = function(resolve, reject, res){
    let values = [];
    postgresScope.query($scope.database, $scope.ecs_table, "*", "tenant_uuid", $scope.selectedTenantID, function(){
      if(postgresScope.successRequest){
        for(let i=0; i<postgresScope.queryRequest.data.length; i++){
          values.push({
            id : postgresScope.queryRequest.data[i].uuid,
            name : postgresScope.queryRequest.data[i].ecs_name
          });
          if(i == postgresScope.queryRequest.data.length-1){
            $scope.ressources.push({
              name : "Elastic Cloud Server(s)",
              nameBis : res,
              imgPath : "ressources_ecs.png",
              values : values
            });
          }
        }
        resolve();
      }
      else{
        console.log(postgresScope.queryRequest);
        reject();
        alert("Error on query request, check console logs.");
      }
    });
  };

  $scope.queryVPC = function(resolve, reject, res){
    let values = [];
    postgresScope.query($scope.database, $scope.vpc_table, "*", "tenant_uuid", $scope.selectedTenantID, async function(){
      if(postgresScope.successRequest){
        for(let i=0; i<postgresScope.queryRequest.data.length; i++){
          values.push({
            id : postgresScope.queryRequest.data[i].uuid,
            name : postgresScope.queryRequest.data[i].vpc_name
          });
          await $scope.queryObjects("Subnet", postgresScope.queryRequest.data[i].uuid, postgresScope.queryRequest.data[i].vpc_name);
          if(i == postgresScope.queryRequest.data.length-1){
            $scope.ressources.push({
              name : "Virtual Private Cloud(s)",
              nameBis : res,
              imgPath : "ressources_vpc.png",
              values : values
            });
          }
        }
        resolve();
      }
      else{
        console.log(postgresScope.queryRequest);
        reject();
        alert("Error on query request, check console logs.");
      }
    });
  };

  $scope.querySG = function(resolve, reject, res){
    let values = [];
    postgresScope.query($scope.database, $scope.sg_table, "*", "tenant_uuid", $scope.selectedTenantID, function(){
      if(postgresScope.successRequest){
        for(let i=0; i<postgresScope.queryRequest.data.length; i++){
          values.push({
            id : postgresScope.queryRequest.data[i].uuid,
            name : postgresScope.queryRequest.data[i].sg_name
          });
          if(i == postgresScope.queryRequest.data.length-1){
            $scope.ressources.push({
              name : "Security group(s)",
              nameBis : res,
              imgPath : "ressources_sg.png",
              values : values
            });
          }
        }
        resolve();
      }
      else{
        console.log(postgresScope.queryRequest);
        reject();
        alert("Error on query request, check console logs.");
      }
    });
  };

  $scope.queryKP = function(resolve, reject, res){
    let values = [];
    postgresScope.query($scope.database, $scope.kp_table, "*", "tenant_uuid", $scope.selectedTenantID, function(){
      if(postgresScope.successRequest){
        for(let i=0; i<postgresScope.queryRequest.data.length; i++){
          values.push({
            id : postgresScope.queryRequest.data[i].uuid,
            name : postgresScope.queryRequest.data[i].kp_name
          });
          if(i == postgresScope.queryRequest.data.length-1){
            $scope.ressources.push({
              name : "Key peer(s)",
              nameBis : res,
              imgPath : "ressources_kp.png",
              values : values
            });
          }
        }
        resolve();
      }
      else{
        console.log(postgresScope.queryRequest);
        reject();
        alert("Error on query request, check console logs.");
      }
    });
  };

  $scope.queryObjects = function(type, id, name){
    if(type == "Subnet") return new Promise((resolve, reject) => $scope.querySubnet(resolve, reject, id, name));
    else if(type == "Rule") return new Promise((resolve, reject) => $scope.queryRule(resolve, reject, id, name));
    else return new Promise(reject => {
      console.log("Hundle objects");
      reject();
    });
  };

  $scope.querySubnet = function(resolve, reject, vpc_id, vpc_name){
    let values = [];
    postgresScope.query($scope.database, $scope.subnet_table, "*", "vpc_uuid", vpc_id, function(){
      if(postgresScope.successRequest){
        for(let k=0; k<postgresScope.queryRequest.data.length; k++){
          values.push({
            id : postgresScope.queryRequest.data[k].uuid,
            name : postgresScope.queryRequest.data[k].subnet_name
          });
        }
        $scope.objects[vpc_name] = values;
        //if(values.length > 0 ) vpc_name = vpc_name+" subnet(s)";
        resolve();
      }
      else{
        console.log(postgresScope.queryRequest);
        reject();
        alert("Error on query request, check console logs.");
      }
    });
  };

  $scope.queryRule = function(resolve, reject){
    resolve();
  };

  $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
    for(let j=0; j<$scope.ressourcesNames.length; j++)
      $//scope.loadJSTree("treeTenant"+$scope.ressourcesNames[j]);
  });
});

app.controller('awsProviderController', function($scope, mainProvidersFactory, awsProviderFactory){
  $scope.controller = "AWS";
  awsProviderFactory.setScope($scope);
  var mainProvidersScope = mainProvidersFactory.getScope();
  $scope.tenants = [];

  $scope.setTenants = function(tenants){
    $scope.tenants = tenants;
    mainProvidersScope.loadJSTreeAndSetListener("treeTenants"+$scope.controller, "Tenant");
  }
});

app.controller('azureProviderController', function($scope, mainProvidersFactory, azureProviderFactory){
  $scope.controller = "Azure";
  azureProviderFactory.setScope($scope);
  var mainProvidersScope = mainProvidersFactory.getScope();
  $scope.tenants = [];

  $scope.setTenants = function(tenants){
    $scope.tenants = tenants;
    mainProvidersScope.loadJSTree("treeTenants"+$scope.controller, "Tenant");
  }

});

app.controller('fcaProviderController', function($scope, mainProvidersFactory, fcaProviderFactory){
  $scope.controller = "FCA";
  var mainProvidersScope = mainProvidersFactory.getScope();
  fcaProviderFactory.setScope($scope);
  $scope.tenants = [];

  $scope.setTenants = function(tenants){
    $scope.tenants = tenants;
    mainProvidersScope.loadJSTree("treeTenants"+$scope.controller, "Tenant");
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
    mainProvidersScope.loadJSTree("treeTenants"+$scope.controllerBis, "Tenant");
  }
});
