var initFileName = '../init.d';

module.exports = {
  getValuesOfVar: function(req, res) {
    fetch(initFileName).then(function(response){
      if(response.status !== 200) throw response.status;
      return response.status;
    }).then(function(file_content){
      res.status(200).send(file_content);
    }).catch(function(status){
      res.status(400).send(status);
    });
  }
}
