var initFileName = '../init.d';

module.exports = {
  getValuesOfVar: function(req, res) {
    var fs = require('fs');
    fs.readFile(initFileName, 'r', (err, data) => {
      if(err){
        res.status(400).send(err);
        throw err;
      }
      res.status(200).send(data);
    });
  }
}
