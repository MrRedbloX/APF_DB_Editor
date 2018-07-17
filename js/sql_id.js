var conString = "postgres://postgres:postgres@10.237.169.202:5432/";

module.exports = {
  getDBName: function(req, res) {
        var pg = require('pg');

        var client = new pg.Client(conString+"test");

        client.connect(function(err,client) {
          if(err){
           console.log("Not able to get connection : "+ err);
           res.status(400).send(err);
          }
          else{
            console.log("Connection successful");
            client.query("SELECT datname FROM pg_database ORDER BY datname;" ,function(err,result) {
              client.end(); // closing the connection;
              if(err){
                 console.log(err);
                 res.status(400).send(err);
              }
              else res.status(200).send(result.rows);
            });
          }
        });
  }

};
