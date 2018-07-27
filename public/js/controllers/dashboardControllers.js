//The following controllers will be handle the dashboard area

//This one is for all the chart display and process
app.controller('chartDisplayController', function($scope, postgresqlFactory, buttonAreaFactory){
  var postgresScope = postgresqlFactory.getScope();
  var buttonAreaScope;

  //These bool will tell if a specific process has finish
  $scope.readyDB = false;
  $scope.readyValues = false;
  $scope.readyDBChart = false;
  $scope.readyMemory = false;
  $scope.readyChartSondeTenant = false;

  $scope.dbColors = []; //Will make the relation between a database and the color used to display the database info in the chart
  $scope.databases = []; //Will contains the databases info
  $scope.chartsSondeTenant = []; //This array will contains labels and data for the tenant display
  $scope.relTenantIdName = []; //This array will contains the id and the name of every tenant

  //Allows to randomly generate a color for the chart (return a table with a color for the background and a color for the border)
  $scope.getRGBA = function(){
    ret = [];
    temp = 'rgba(';
    for(let j=0; j<3; j++)
      temp += (Math.floor(Math.random()*256))+', ';
    ret.push(temp+'0.2)');
    ret.push(temp+'1)');
    return ret;
  };

  //Simply return the table name without the word table
  $scope.splitTheTableName = function(table){
    return (table.split('_'))[0];
  }

  //Allows to stop the process for a specific time
  $scope.wait = async function(){
    await sleep(waitFor);
  }

  //From a name return the id of a tenant
  $scope.getIdTenantFromName = function(tenant_name){
    var ret;
    for(let i=0; i<$scope.relTenantIdName.length; i++){
      if($scope.relTenantIdName[i].name == tenant_name){
        ret = $scope.relTenantIdName[i].id;
        break;
      }
    }
    return ret;
  }

  //From a tenant name return if one already exists with the same name
  $scope.checkIdNameTenant = function(tenant_name){
    ret = false;
    for(let i=0;i<$scope.relTenantIdName.length;i++){
      if($scope.relTenantIdName[i].name == tenant_name){
        ret = true;
        break;
      }
    }
    return ret;
  };

  //Allows to load the databases and tables info
  $scope.loadDB = function(){
    if(!$scope.readyDB){
      postgresScope.getDBName(function(){ //We do the request and we define the callback function
        if(postgresScope.successRequest){
          db = [];
          for(let i=0;i<postgresScope.dbArray.data.length;i++){
            if(!exceptionDB.includes(postgresScope.dbArray.data[i].datname))
              db.push(postgresScope.dbArray.data[i].datname);
          }
          for(let i=0; i<db.length; i++){
            postgresScope.getTableName(db[i], function(){ //We do the same thing for this request
              if(postgresScope.successRequest){
                $scope.databases.push({
                  name : db[i],
                  table : postgresScope.tableArray.data
                });
                if(i == db.length-1){ //We make sure we are in the last tour
                  while($scope.databases[i] == null || $scope.databases[i].table == null) $scope.wait(); //Prevent from bad loading
                  $scope.readyDB = true; //We say the loading has finish
                  $scope.loadTableValues(); //We load the table values
                  $scope.loadChartNbTablesInDB(); //And we load the chart
                }
              }
              else{
                console.log(postgresScope.tableArray);
                alert("Error on getTableName request, check console logs.");
              }
            });
          }
        }
        else{
          console.log(postgresScope.dbArray);
          alert("Error on getDBName request, check console logs.");
        }
      });
    }
  };

  //Load the values of tables
  $scope.loadTableValues = function(){
    if(!$scope.readyValues && $scope.readyDB){
      for(let i=0; i<$scope.databases.length; i++){
        for(let j=0; j<$scope.databases[i].table.length; j++){
          postgresScope.getAllValues($scope.databases[i].name, $scope.databases[i].table[j].table_name, function(){
            if($scope.successRequest){
              $scope.databases[i].table[j].values = postgresScope.columnValues.data;
              if(i == $scope.databases.length-1 && j == $scope.databases[i].table.length-1){
                while($scope.databases[i].table[j].values == null) $scope.wait(); //Prevent from bad loading
                $scope.readyValues = true; //We say the values are ready
                $scope.loadSondeTenant(); //Now we can load the tenant process
                $scope.loadDbMemory(); //And the memory process
              }
            }
            else{
              console.log(postgresScope.columnValues);
              alert("Error on getAllValues request, check console logs.");
            }
          });
        }
      }
    }
  };

  //Allows to load information of specific tables regarding the tenants (this is a unique process based on a specific client request)
  $scope.loadSondeTenant = function(){
    var idTenant = []; //Will contains the id of tenants
    var labels = []; //Will contains the displayed labels
    var datasets = []; //Will contains the displayed datas
    var workingTables = []; //Will contains all the wanted tables for faster query

    for(let i=0; i<$scope.databases.length; i++){
      if($scope.databases[i].name == "sonde"){ //We focus on sonde database
        for(let j=0; j<$scope.databases[i].table.length; j++){
          if($scope.databases[i].table[j].table_name == "tenant_table"){ // We push all the needed info of a tenant
            for(let k=0; k<$scope.databases[i].table[j].values.length; k++){
              idTenant.push($scope.databases[i].table[j].values[k].uuid);
              if($scope.checkIdNameTenant($scope.databases[i].table[j].values[k].tenant_name)){
                labels.push($scope.databases[i].table[j].values[k].tenant_name+"#"+$scope.databases[i].table[j].values[k].uuid);
                $scope.relTenantIdName.push({
                  id : $scope.databases[i].table[j].values[k].uuid,
                  name : $scope.databases[i].table[j].values[k].tenant_name+"#"+$scope.databases[i].table[j].values[k].uuid
                });
              }
              else{
                labels.push($scope.databases[i].table[j].values[k].tenant_name);
                $scope.relTenantIdName.push({
                  id : $scope.databases[i].table[j].values[k].uuid,
                  name : $scope.databases[i].table[j].values[k].tenant_name
                });
              }
            }
          }
          //Here we check the wanted tables (you can add a condition here if the client wants to add another table)
          else if($scope.databases[i].table[j].table_name == 'sg_table' || $scope.databases[i].table[j].table_name == 'subnet_table' || $scope.databases[i].table[j].table_name == 'ecs_table')
            workingTables.push($scope.databases[i].table[j]);
        }
        break;
      }
    }
    var backgroundColor; //Will contains the colors of the background charts
    var borderColor; //Will contains the colors of the border charts
    var color; //The var used to retrivied the random color
    var data; //Will contains the displayed datas
    var nbData; //This var will increment to count the number of data
    var label = ""; //This var will contains the displayed label

    for(let j=0; j<workingTables.length; j++){
      backgroundColor = [];
      borderColor = [];
      color = $scope.getRGBA();
      data = [];
      for(let i=0; i<idTenant.length; i++){
        nbData = 0;
        for(let k=0; k<workingTables[j].values.length; k++){
          if(workingTables[j].values[k].tenant_uuid == idTenant[i]) //For the querying table and tenant, we check if this tenant is in this table
            nbData++;
        }
        data.push(nbData);
        backgroundColor.push(color[0]);
        borderColor.push(color[1]);
      }
      //We set the display name
      if(workingTables[j].table_name == 'sg_table') label = "Security Group";
      else if(workingTables[j].table_name == 'subnet_table') label = "Subnet";
      else if(workingTables[j].table_name == 'ecs_table') label = "Elastic Cloud Server";
      datasets.push({
        label: label,
        data: data,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1
      });
    }
    //And here we push for a table the regarding data;
    for(let i=0; i<datasets.length; i++){
      $scope.chartsSondeTenant.push({
        labels : labels,
        datasets : datasets[i]
      });
    }
    $scope.readyChartSondeTenant = true;
  };

  //Simply load the databases memory
  $scope.loadDbMemory = function(){
    if($scope.readyDB){
      for(let i=0; i<$scope.databases.length; i++){
        postgresScope.getDbMemory($scope.databases[i].name, function(){
          if(postgresScope.successRequest){
            $scope.databases[i].size = (parseInt(postgresScope.dbMemoryRequest.data[0].pg_database_size)/1000000).toFixed(2);
            if(i == $scope.databases.length-1){
              $scope.readyMemory = true;
              $scope.loadChartDbMemory();
            }
          }
          else{
            console.log(postgresScope.dbMemoryRequest);
            alert("Error on getDbMemory request, check console logs.");
          }
        });
      }
    }
  };

  //Load the chart which display the number of tables in a database
  $scope.loadChartNbTablesInDB = function(){
    var ctx = $("#nbTablesInDB"); //We get the canvas
    var labels = [];
    var data = [];
    var backgroundColor = [];
    var borderColor = [];

    for(let i=0; i<$scope.databases.length; i++){
      labels.push($scope.databases[i].name);
      data.push($scope.databases[i].table.length);
      rgba = $scope.getRGBA();
      backgroundColor.push(rgba[0]);
      borderColor.push(rgba[1]);
      $scope.dbColors.push({
        db_name : $scope.databases[i].name,
        color : rgba
      });
    }

    var myChart = new Chart(ctx, {
      type: 'pie',
      data: {
          labels: labels,
          datasets: [{
              label: 'Number of table(s)',
              data: data,
              backgroundColor: backgroundColor,
              borderColor: borderColor,
              borderWidth: 1
          }]
      },
    }); //We create the chart

    $scope.readyDBChart = true;
  };

  //Load for a table the number of tuple in it
  $scope.loadChartNbTuplesInTable = function(db){
    canvas = document.getElementById("nbTuplesInTable");
    canvas.id = canvas.id+db; //We get the canvas and change its id in order to have multiple ones
    var ctx = document.getElementById("nbTuplesInTable"+db);
    var labels = [];
    var data = [];
    var backgroundColor = [];
    var borderColor = [];
    var color = $scope.getRGBA();


    for(let i=0; i<$scope.databases.length; i++){
      for(let y=0; y<$scope.databases[i].table.length; y++){
        if($scope.databases[i].name == db && !isInExceptionTables($scope.databases[i].table[y].table_name)){
          for(let j=0; j<$scope.dbColors.length; j++){
            if($scope.databases[i].name == $scope.dbColors[j].db_name)
              color = $scope.dbColors[j].color;
          }
          while($scope.databases[i].table[j].values == null) $scope.wait();
          labels.push($scope.splitTheTableName($scope.databases[i].table[y].table_name));
          data.push($scope.databases[i].table[y].values.length);
          backgroundColor.push(color[0]);
          borderColor.push(color[1]);
        }
      }
    }
    var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: labels,
          datasets: [{
              label: 'Number of record(s) in '+db,
              data: data,
              backgroundColor: backgroundColor,
              borderColor: borderColor,
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero:true
                  }
              }]
          }
      }
    });
  };

  //Load the memory chart
  $scope.loadChartDbMemory = function(){
    var ctx = $("#dbMemory");
    var labels = [];
    var data = [];
    var backgroundColor = [];
    var borderColor = [];
    var color = $scope.getRGBA();
    for(let i=0; i<$scope.databases.length; i++){
      for(let j=0; j<$scope.dbColors.length; j++){
        if($scope.databases[i].name == $scope.dbColors[j].db_name)
          color = $scope.dbColors[j].color;
      }
      labels.push($scope.databases[i].name);
      data.push($scope.databases[i].size);
      backgroundColor.push(color[0]);
      borderColor.push(color[1]);
    }

    var myChart = new Chart(ctx, {
      type: 'pie',
      data: {
          labels: labels,
          datasets: [{
              label: 'Memory of database(s) in Mb',
              data: data,
              backgroundColor: backgroundColor,
              borderColor: borderColor,
              borderWidth: 1
          }]
      },
    });

  };

  //Load the tenant chart from a labels and datasets info in var chart
  $scope.loadChartSondeTenant = function(chart){
    canvas = document.getElementById("sondeTenant");
    canvas.id = canvas.id+chart.datasets.label;
    var ctx = document.getElementById("sondeTenant"+chart.datasets.label);

    var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: chart.labels,
          datasets: [chart.datasets]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero:true
                  }
              }]
          }
      }
    });

    //Here we handle the click on the chart and we redirect to database management with a partial view of the wanted table
    canvas.onclick = function(evt){
      var activePoints = myChart.getElementsAtEvent(evt);
      if(activePoints.length > 0){
        window.location = "#!/db_management";
        $scope.wait();
        buttonAreaScope = buttonAreaFactory.getScope();
        while(buttonAreaScope == null){ //We do that to prevent from async issues
          $scope.wait();
          buttonAreaScope = buttonAreaFactory.getScope();
        }
        let table;
        if(activePoints[0]._model.datasetLabel == "Elastic Cloud Server") table = "ecs_table";
        else if(activePoints[0]._model.datasetLabel == "Security Group") table = "sg_table";
        else if(activePoints[0]._model.datasetLabel == "Subnet") table = "subnet_table";
        tableSelected = "sonde;"+table;
        buttonAreaScope.display("tenant_uuid", $scope.getIdTenantFromName(activePoints[0]._model.label));
      }
    };
  };
});
