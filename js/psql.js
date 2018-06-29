var pg = require('pg');

var connectToServer = function(ip,port){
  let connectionString = "postgres://"+ip+":"+port;
  var pgClient = new pg.Client(connectionString);
  pgClient.connect();
  return pgClient;
}

var connectToDB = function(ip,port,dbName){
  let connectionString = "postgres://"+ip+":"+port+"/"+dbName;
  var pgClient = new pg.Client(connectionString);
  pgClient.connect();
  return pgClient;
}

var closeConnection = function(pgClient){
  pgClient.end();
}

var getDBName = function(pgClient){
  var query = pgClient.query("SELECT datname FROM pg_database");
  console.log(query);
}
