app.controller('chartDisplayController', function($scope, postgresqlFactory){
  var postgresScope = postgresqlFactory.getScope();
  $scope.readyDB = false;
  $scope.readyValues = false;
  $scope.readyDBChart = false;
  $scope.readyMemory = false;
  $scope.readyChartSondeTenant = false;

  $scope.dbColors = [];
  $scope.databases = [];
  $scope.chartsSondeTenant = [];

  $scope.getRGBA = function(){
    ret = [];
    temp = 'rgba(';
    for(let j=0; j<3; j++)
      temp += (Math.floor(Math.random()*256))+', ';
    ret.push(temp+'0.2)');
    ret.push(temp+'1)');
    return ret;
  };

  $scope.splitTheTableName = function(table){
    return (table.split('_'))[0];
  }

  $scope.loadDB = function(){
    console.log("Start loading db");
    if(!$scope.readyDB){
      postgresScope.getDBName(function(){ //We do the request and we define the callback function
        if(postgresScope.successRequest){
          db = [];
          for(let i=0;i<postgresScope.dbArray.data.length;i++){
            if(!exceptionDB.includes(postgresScope.dbArray.data[i].datname))
              db.push(postgresScope.dbArray.data[i].datname);
          }
          for(let i=0; i<db.length; i++){
            postgresScope.getTableName(db[i], async function(){ //We do the same thing for this request
              if(postgresScope.successRequest){
                $scope.databases.push({
                  name : db[i],
                  table : postgresScope.tableArray.data
                });
                if(i == db.length-1){
                  await sleep(waitFor);
                  console.log("Finish loading db");
                  $scope.readyDB = true;
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

  $scope.loadTableValues = function(){
    console.log("Start loading values");
    if(!$scope.readyValues && $scope.readyDB){
      for(let i=0; i<$scope.databases.length; i++){
        for(let j=0; j<$scope.databases[i].table.length; j++){
          postgresScope.getAllValues($scope.databases[i].name, $scope.databases[i].table[j].table_name, async function(){
            if($scope.successRequest){
              $scope.databases[i].table[j].values = postgresScope.columnValues.data;
              if(i == $scope.databases.length-1 && j == $scope.databases[i].table.length-1){
                await sleep(waitFor);
                console.log("Finish loading values");
                $scope.readyValues = true;
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

  $scope.loadDbMemory = function(){
    if($scope.readyDB){
      for(let i=0; i<$scope.databases.length; i++){
        postgresScope.getDbMemory($scope.databases[i].name, async function(){
          if(postgresScope.successRequest){
            $scope.databases[i].size = (parseInt(postgresScope.dbMemoryRequest.data[0].pg_database_size)/1000000).toFixed(2);
            if(i == $scope.databases.length-1){
              await sleep(waitFor);
              $scope.readyMemory = true;
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

  $scope.loadChartNbTablesInDB = function(){
    var ctx = $("#nbTablesInDB");
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
    });

    $scope.readyDBChart = true;
  };

  $scope.loadChartNbTuplesInTable = function(db){
    canvas = document.getElementById("nbTuplesInTable");
    canvas.id = canvas.id+db;
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

  $scope.loadSondeTenant = function(){
    console.log("Start loading chart");
    var idTenant = [];
    var labels = [];
    var datasets = [];
    var workingTables = [];

    for(let i=0; i<$scope.databases.length; i++){
      if($scope.databases[i].name == "sonde"){
        for(let j=0; j<$scope.databases[i].table.length; j++){
          if($scope.databases[i].table[j].table_name == "tenant_table"){
            for(let k=0; k<$scope.databases[i].table[j].values.length; k++){
              idTenant.push($scope.databases[i].table[j].values[k].uuid);
              labels.push($scope.databases[i].table[j].values[k].tenant_name);
            }
          }
          else if($scope.databases[i].table[j].table_name == 'sg_table' || $scope.databases[i].table[j].table_name == 'subnet_table' || $scope.databases[i].table[j].table_name == 'ecs_table')
            workingTables.push($scope.databases[i].table[j]);
        }
        break;
      }
    }
    var backgroundColor;
    var borderColor;
    var color;
    var data;
    var nbData;
    var label = "";

    for(let j=0; j<workingTables.length; j++){
      backgroundColor = [];
      borderColor = [];
      color = $scope.getRGBA();
      data = [];
      for(let i=0; i<idTenant.length; i++){
        nbData = 0;
        for(let k=0; k<workingTables[j].values.length; k++){
          if(workingTables[j].values[k].tenant_uuid == idTenant[i])
            nbData++;
        }
        data.push(nbData);
        backgroundColor.push(color[0]);
        borderColor.push(color[1]);
      }
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
    for(let i=0; i<datasets.length; i++){
      $scope.chartsSondeTenant.push({
        labels : labels,
        datasets : datasets[i]
      });
    }
    $scope.readyChartSondeTenant = true;
    console.log("Finish loading chart");
  };

  $scope.loadChartSondeTenant = function(chart){
    console.log("Start displaying");
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

    console.log("Finish displaying");
  };
});
