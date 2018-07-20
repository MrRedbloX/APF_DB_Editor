var http = require("http");
module.exports = {
  getAnnuaire: function(req, res){

    var options = {
      hostname: req.query.lien,
      //url: "http://annuaire.sso.infra.ftgroup/persons?searchType=PERSON_COMPLEX&personCriteria.sn=guitton&personCriteria.givenName=alois",
      method: 'GET',
      qs:{
        'searchType':'PERSON_COMPLEX',
        'personCriteria.sn' : 'guitton',
        'personCriteria.givenName' : 'alois',
        'personCriteria.mail': 'alois.guitton@orange.com'
      },
      headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods' : 'GET',
          'Access-Control-Allow-Headers' : 'Origin, Content-Type, X-Auth-Token'
      }
    };

    var request = http.request(options, function(result){

      var output = '';

      result.on('data', function (chunk) {
          output += chunk;
      });

      result.on('end', function() {
          res.status(200).send(output);
      });

    })

    request.on('error', function(err){
      res.status(400).send(err);
    });

    request.end();
  }
}
