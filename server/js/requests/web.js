var http = require("http");
module.exports = {
  //Query Orange calendar to find if a user who wants to register is in the calendar
  getAnnuaire: function(req, res){
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
