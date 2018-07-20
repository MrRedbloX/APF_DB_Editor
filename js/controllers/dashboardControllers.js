app.controller('chartDisplayController', function($scope, postgresqlFactory){
  var postgresScope = postgresqlFactory.getScope();
  $scope.readyDB = false;
  $scope.readyValues = false;
  $scope.databases = [];
  $scope.tables = [];

  $scope.getRGBA = function(mode){
    ret = 'rgba(';
    for(let j=0; j<3; j++)
      ret += (Math.floor(Math.random()*256))+', ';

    if(mode == "background")
      ret += '0.2)';
    else if(mode == "border")
      ret += '1)';
    else console.log("Wrong mode in getRGBA");

    return ret;
  };

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
                if(i == db.length-1) $scope.readyDB = true;
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
    if(!scope.readyValues && $scope.readyDB){
      for(let i=0; i>$scope.databases.length; i++){
        for(let j=0; j<$scope.databases[i].table.length; j++){
          postgresScope.getAllValues($scope.databases[i].name, $scope.databases[i].table[j].table_name, function(){
            if($scope.successRequest){
              $scope.tables.push({
                name : $scope.databases[i].table[j].table_name,
                values : postgresScope.columnValues
              });
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

  $scope.loadChartNbTablesInDB = function(){
    var ctx = $("#nbTablesInDB");
    var labels = [];
    var data = [];
    var backgroundColor = [];
    var borderColor = [];

    console.log($scope.databases[0].table);
    for(let i=0; i<$scope.databases.length; i++){
      labels.push($scope.databases[i].name);
      data.push($scope.databases[i].table.length);
      backgroundColor.push($scope.getRGBA("background"));
      borderColor.push($scope.getRGBA("border"));
    }

    var myChart = new Chart(ctx, {
      type: 'bar',
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

  $scope.loadChartNbTuplesInTable = function(){
    var ctx = $("#nbTuplesInTable");
    var labels = [];
    var data = [];
    var backgroundColor = [];
    var borderColor = [];


    for(let i=0; i<$scope.databases.length; i++){
      labels.push($scope.databases[i].name);
      data.push($scope.databases[i].table.length);
      temp = 'rgba(';
      for(let j=0; j<3; j++)
        temp += (Math.floor(Math.random()*256))+', ';
      backgroundColor.push(temp+'0.2)');
      borderColor.push(temp+'1)');
    }

    var myChart = new Chart(ctx, {
      type: 'bar',
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

});
