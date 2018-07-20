app.controller('chartDisplayController', function($scope, postgresqlFactory){
  var postgresScope = postgresqlFactory.getScope();
  $scope.ready = false;
  $scope.databases = [];

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
    if(!$scope.ready){
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
                //console.log(tables);
                for(let j=0; j<postgresScope.tableArray.data.length; j++){
                  console.log(j);
                  console.log(postgresScope.tableArray.data.length);
                  postgresScope.getAllValues(db[i], postgresScope.tableArray.data[j].table_name, function(){
                    if(postgresScope.successRequest){
                      //console.log(j);
                      //console.log(tables.length);
                      //console.log(tables[j]);
                      postgresScope.tableArray.data[j]['nbValues'] = postgresScope.columnValues.data.length;
                      if(j == postgresScope.tableArray.data.length-1){
                        $scope.databases.push({
                          name : db[i],
                          table : postgresScope.tableArray.data
                        });
                      }
                      if(i == db.length-1) $scope.ready = true;
                    }
                    else {
                      console.log(postgresScope.columnValues);
                      alert("Error on getAllValues request, check console logs.");
                    }
                  });
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
