module.exports{
  getAnnuaire: function(req, res){

    $http({
      method: 'GET',
      url: lien,
      dataType: 'jsonp',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods' : 'GET',
        'Access-Control-Allow-Headers' : 'Origin, Content-Type, X-Auth-Token'
      }
    })
    .then(
      function successCallback(data) {
        $scope.successRequest = true;
        $scope.annuaire = data;
        if(callback) callback();
      },
      function errorCallback(data) {
        $scope.successRequest = false;
        $scope.annuaire = data;
        if(callback) callback();
    });
  }
}
