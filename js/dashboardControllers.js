app.controller('chartDisplayController', function($scope, postgresqlFactory){
  var postgresScope = postgresqlFactory.getScope();
  $scope.ready = false;
  $scope.databases = [];

  $scope.loadDB = function(){
    if(!$scope.ready){
      postgresScope.getDBName(function(){ //We do the request and we define the callback function
        if(postgresScope.successRequest){
          for(let i=0;i<postgresScope.dbArray.data.length;i++){
            if(!exceptionDB.includes(postgresScope.dbArray.data[i].datname)){
              postgresScope.getTableName(postgresScope.dbArray.data[i].datname, function(){ //We do the same thing for this request
                if(postgresScope.successRequest){
                  $scope.databases.push({
                    name : postgresScope.dbArray.data[i].datname,
                    table : postgresScope.tableArray.data
                  });
                }
                else{
                  console.log(postgresScope.tableArray);
                  alert("Error on getTableName request, check console logs.");
                }
              });
            }
          }
          $scope.ready = true;
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

    for(let i=0; i<$scope.databases.length; i++){
      labels.push($scope.databases[i].name);
      data.push($scope.databases[i].table.length);
    }

    console.log($scope.databases);
    console.log(labels);
    console.log(data);

    var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: labels,
          datasets: [{
              label: 'Number of table(s)',
              data: data,
              /*backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                  'rgba(255,99,132,1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)'
              ],*/
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
