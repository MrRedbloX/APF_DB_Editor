var initFileName = '../init.d';

module.exports = {
  getValuesOfVar: function(req, res) {
    var fs = require('fs');
    console.log(__dirname);
    fs.readFile(initFileName, (err, data) => {
      if(err){
        res.status(400).send(err);
        throw err;
      }
      res.status(200).send(data);
    });
  }
}
