app.controller('chartDisplayController', function($scope, postgresqlFactory){
  var postgresScope = postgresqlFactory.getScope();
  $scope.ready = false;
  $scope.databases = [];

  $scope.loadDB = function(){
    if(!$scope.ready){
      postgresScope.getDBName(function(){ //We do the request and we define the callback function
        if(postgresScope.successRequest){
          temp = [];
          for(let i=0;i<postgresScope.dbArray.data.length;i++){
            if(!exceptionDB.includes(postgresScope.dbArray.data[i].datname))
              temp.push(postgresScope.dbArray.data[i].datname);
          }
          for(let i=0; i<temp.length; i++){
            postgresScope.getTableName(temp[i], function(){ //We do the same thing for this request
              if(postgresScope.successRequest){
                $scope.databases.push({
                  name : temp[i],
                  table : postgresScope.tableArray.data
                });
                if(i == temp.length-1) $scope.ready = true;
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

  $scope.loadChart = function(){
    var ctx = $("#nbTablesInDB");
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
          },
          events: ['click']
      }
    });
  };
});
