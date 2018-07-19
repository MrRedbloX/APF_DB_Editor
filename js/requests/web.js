
module.exports = {
  getAnnuaire: function(req, res){

    var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     document.getElementById("demo").innerHTML = this.responseText;
    }
  };
  xhttp.open("GET", "ajax_info.txt", true);
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
