app.controller('chartDisplayController', function($scope, postgresqlFactory){
  var postgresScope = postgresqlFactory.getScope();
  $scope.readyDB = false;
  $scope.readyValues = false;
  $scope.readyDBChart = false;

  $scope.dbColors = [];
  $scope.databases = [];
  $scope.tables = [];

  $scope.getRGBA = function(){
    ret = [];
    temp = 'rgba(';
    for(let j=0; j<3; j++)
      temp += (Math.floor(Math.random()*256))+', ';
    ret.push(temp+'0.2)');
    ret.push(temp+'1)');
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
    if(!$scope.readyValues && $scope.readyDB){
      for(let i=0; i<$scope.databases.length; i++){
        for(let j=0; j<$scope.databases[i].table.length; j++){
          postgresScope.getAllValues($scope.databases[i].name, $scope.databases[i].table[j].table_name, function(){
            if($scope.successRequest){
              $scope.tables.push({
                db : $scope.databases[i].name,
                name : $scope.databases[i].table[j].table_name,
                values : postgresScope.columnValues.data
              });
              if(i == $scope.databases.length-1)
                 $scope.readyValues = true;
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

    $scope.readyDBChart = true;
  };

  $scope.loadChartNbTuplesInTable = function(db){
    canvas = document.getElementById("nbTuplesInTable");
    canvas.id = canvas.id+db;
    var ctx = document.getElementById("nbTuplesInTable"+db);
    console.log(ctx);
    var labels = [];
    var data = [];
    var backgroundColor = [];
    var borderColor = [];
    var color = $scope.getRGBA();

    for(let i=0; i<$scope.tables.length; i++){
      if($scope.tables[i].db == db){
        for(let j=0; j<$scope.dbColors.length; j++){
          if($scope.tables[i].db == $scope.dbColors[j].db_name)
            color = $scope.dbColors[j].color;
        }
        labels.push($scope.tables[i].name.substring(0,9));
        data.push($scope.tables[i].values.length);
        backgroundColor.push(color[0]);
        borderColor.push(color[1]);
      }
    }

    /*var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              datasets: [
                {
                  label: 'this year',
                  backgroundColor: '#26B99A',
                  data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                },
                {
                  label: 'previous year',
                  backgroundColor: '#03586A',
                  data: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
                }
              ]
            }
    });*/
    var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: labels,
          datasets: [{
              label: 'Number of record(s)',
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
