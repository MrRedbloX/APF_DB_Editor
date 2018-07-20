var http = require("http");
module.exports = {
  getAnnuaire: function(req, res){

    var options = {
      hostname: req.query.lien,
      method: 'GET',
      
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
