module.exports{
  getAnnuaire: function(req, res){

    $http({
      method: 'GET',
      url: req.lien,
      dataType: 'jsonp',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods' : 'GET',
        'Access-Control-Allow-Headers' : 'Origin, Content-Type, X-Auth-Token'
      }
    })
    .then(
      function successCallback(data) {
        res.status(200).send(data);
      },
      function errorCallback(data) {
        console.log(data);
        res.status(400).send(data);
    });
  }
}
