var http = require("http");
module.exports = {
  getAnnuaire: function(req, res){

    console.log(req.query.lien);personCriteria.givenName=
    lien = req.query.lien+"&personCriteria.sn="+req.query.personCriteriaN+"&personCriteria.givenName="+req.query.personCriteriaP+"&personCriteria.mail="+req.query.personCriteriaM;

    http.get(lien, (resp) => {
      var data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        res.status(200).send(data);
      });

    }).on("error", (err) => {
      res.status(400).send(err);
    });
  }
}
