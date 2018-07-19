var http = require("http");
module.exports = {
  getAnnuaire: function(req, res){

    var options = {
      hostname: req.lien,
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods' : 'GET',
          'Access-Control-Allow-Headers' : 'Origin, Content-Type, X-Auth-Token'
      }
    };

    var req = http.request(options, function(result){

      var output = '';

      result.on('data', function (chunk) {
          output += chunk;
      });

      result.on('end', function() {
          res.status(200).send(output);
      });

    })

    req.on('error', function(err){
      res.status(400).send(err);
    });

    req.end();

    /*if (window.XMLHttpRequest) {
        // code for modern browsers
        xmlhttp = new XMLHttpRequest();
     } else {
        // code for old IE browsers
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        res.status(200).send(this.responseText);
      }
      else{
        res.status(400).send(this.responseText);
      }
    };
    xhttp.open("GET", req.lien , true);
    xhttp.send();

    /*$.ajax({
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
        console.log(data);
        res.status(200).send(data);
      },
      function errorCallback(data) {
        console.log(data);
        res.status(400).send(data);
    });*/
  }
}
