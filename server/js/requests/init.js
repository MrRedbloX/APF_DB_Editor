var initFileName = __dirname+'/../../init.d';

module.exports = {
  getValuesOfVar: function(req, res) {
    var fs = require('fs')
    fs.readFile(initFileName, (err, data) => {
      if(err){
        res.status(400).send(err);
        throw err;
      }
      res.status(200).send(data);
    });
  },

  writeInInitFile: function(req, res) {
    var fs = require('fs')
    fs.writeFile(initFileName, req.query.content, (err) => {
      if(err){
        res.status(400).send(err);
        throw err;
      }
      res.status(200).send(data);
    });
  }
}
