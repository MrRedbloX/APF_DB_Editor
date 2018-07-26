var http = require("http");
module.exports = {
  getAnnuaire: function(req, res){

    http.get(req.query.lien, (resp) => {
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
