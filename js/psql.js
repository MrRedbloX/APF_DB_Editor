module.exports = {
  getDBName: function(req, res) {
        var pg = require('pg');
        //You can run command "heroku config" to see what is Database URL from Heroku belt
        var conString = "postgres://postgres:postgres@192.168.133.136:5432/postgres";
        var client = new pg.Client(conString);

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
  },
  getTableName: function(req, res) {
        var pg = require('pg');
        //You can run command "heroku config" to see what is Database URL from Heroku belt
        var conString = "postgres://postgres:postgres@192.168.133.136:5432/"+req.query.db;
        var client = new pg.Client(conString);

        client.connect(function(err,client) {
          if(err){
           console.log("Not able to get connection : "+ err);
           res.status(400).send(err);
          }
          else{
            console.log("Connection successful");
            client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" ,function(err,result) {
              client.end(); // closing the connection;
              if(err){
                 console.log(err);
                 res.status(400).send(err);
              }
              else res.status(200).send(result.rows);
            });
          }
        });
    },

    getColumnName: function(req, res) {
          var pg = require('pg');
          //You can run command "heroku config" to see what is Database URL from Heroku belt
          var conString = "postgres://postgres:postgres@192.168.133.136:5432/"+req.query.db;
          var client = new pg.Client(conString);

          client.connect(function(err,client) {
            if(err){
             console.log("Not able to get connection : "+ err);
             res.status(400).send(err);
            }
            else{
              console.log("Connection successful");
              client.query("SELECT column_name,data_type,is_identity,is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '"+req.query.table+"';" ,function(err,result) {
                client.end(); // closing the connection;
                if(err){
                   console.log(err);
                   res.status(400).send(err);
                }
                else res.status(200).send(result.rows);
              });
            }
          });
      },

      getColumnConstraint: function(req, res) {
            var pg = require('pg');
            //You can run command "heroku config" to see what is Database URL from Heroku belt
            var conString = "postgres://postgres:postgres@192.168.133.136:5432/"+req.query.db;
            var client = new pg.Client(conString);

            client.connect(function(err,client) {
              if(err){
               console.log("Not able to get connection : "+ err);
               res.status(400).send(err);
              }
              else{
                console.log("Connection successful");
                client.query("SELECT R.TABLE_NAMEFROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE u inner join INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS FK on U.CONSTRAINT_CATALOG = FK.UNIQUE_CONSTRAINT_CATALOG and U.CONSTRAINT_SCHEMA = FK.UNIQUE_CONSTRAINT_SCHEMA and U.CONSTRAINT_NAME = FK.UNIQUE_CONSTRAINT_NAME inner join INFORMATION_SCHEMA.KEY_COLUMN_USAGE R ON R.CONSTRAINT_CATALOG = FK.CONSTRAINT_CATALOG AND R.CONSTRAINT_SCHEMA = FK.CONSTRAINT_SCHEMA AND R.CONSTRAINT_NAME = FK.CONSTRAINT_NAME WHERE U.COLUMN_NAME = '"+req.query.column+"' AND U.TABLE_CATALOG = '"+req.query.db+"' AND U.TABLE_SCHEMA = 'public' AND U.TABLE_NAME = '"+req.query.table+"';" , function(err,result) {
                  client.end(); // closing the connection;
                  if(err){
                     console.log(err);
                     res.status(400).send(err);
                  }
                  else res.status(200).send(result.rows);
                });
              }
            });
      },

      getAllValues: function(req, res) {
            var pg = require('pg');
            //You can run command "heroku config" to see what is Database URL from Heroku belt
            var conString = "postgres://postgres:postgres@192.168.133.136:5432/"+req.query.db;
            var client = new pg.Client(conString);

            client.connect(function(err,client) {
              if(err){
               console.log("Not able to get connection : "+ err);
               res.status(400).send(err);
              }
              else{
                console.log("Connection successful");
                client.query("SELECT * FROM "+req.query.table , function(err,result) {
                  client.end(); // closing the connection;
                  if(err){
                     console.log(err);
                     res.status(400).send(err);
                  }
                  else res.status(200).send(result.rows);
                });
              }
            });
      },

    addRecord : function(req, res){
        var pg = require('pg');
        var conString = process.env.DATABASE_URL ||  "postgres://postgres:Welcome123@localhost:5432/postgres";
        var client = new pg.Client(conString);
        client.connect();
        var query = client.query("insert into employee (firstName,lastName,email,mobile) "+
                                "values ('"+req.query.fName+"','"+req.query.lName+"','"+
                                    req.query.email+"','"+req.query.mbl+"')");
        query.on("end", function (result) {
            client.end();
            res.write('Success');
            res.end();
        });
    },
     delRecord : function(req, res){
        var pg = require('pg');
        var conString = "postgres://postgres:Welcome123@localhost:5432/postgres";
        var client = new pg.Client(conString);
        client.connect();
        var query = client.query( "Delete from employee Where id ="+req.query.id);
        query.on("end", function (result) {
            client.end();
            res.write('Success');
            res.end();
        });
    }
  };
