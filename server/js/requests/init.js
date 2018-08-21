var initFileName = '../init.d';

module.exports = {
  getValueOfVar: function(req, res) {
    fetch(initFileName).then(function(response){
      if(response.status !== 200) throw response.status;
      return response.status;
    }).then(function(file_content){
      console.log(file_content);
    }).catch(function(status){
      console.log('Error '+status);
    });
  }
}
