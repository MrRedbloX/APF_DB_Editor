var conString = "postgres://postgres:postgres@10.239.238.69:5432/";

module.exports = {
  getDBName: function(req, res) {
        var pg = require('pg');

        var client = new pg.Client(conString+"postgres");

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
        var client = new pg.Client(conString+req.query.db);

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
        var client = new pg.Client(conString+req.query.db);

        client.connect(function(err,client) {
          if(err){
           console.log("Not able to get connection : "+ err);
           res.status(400).send(err);
          }
          else{
            console.log("Connection successful");
            client.query("SELECT column_name, data_type, is_identity, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '"+req.query.table+"';", function(err,result){
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
        var client = new pg.Client(conString+req.query.db);

        client.connect(function(err,client) {
          if(err){
           console.log("Not able to get connection : "+ err);
           res.status(400).send(err);
          }
          else{
            console.log("Connection successful");
            client.query("SELECT tc.table_schema, tc.constraint_name, tc.table_name, kcu.column_name, ccu.table_schema AS foreign_table_schema, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name FROM information_schema.table_constraints AS tc JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema WHERE constraint_type = 'FOREIGN KEY' AND tc.table_name = '"+req.query.table+"';", function(err,result) {
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
        var client = new pg.Client(conString+req.query.db);

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

  getValuesOf: function(req, res) {
      var pg = require('pg');
      var client = new pg.Client(conString+req.query.db);

      client.connect(function(err,client) {
        if(err){
         console.log("Not able to get connection : "+ err);
         res.status(400).send(err);
        }
        else{
          console.log("Connection successful");
          client.query("SELECT "+req.query.att+" FROM "+req.query.table+";" , function(err,result) {
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

  addRecord: function(req, res) {
      var pg = require('pg');
      var client = new pg.Client(conString+req.query.db);

      client.connect(function(err,client) {
        if(err){
         console.log("Not able to get connection : "+ err);
         res.status(400).send(err);
        }
        else{
          console.log("Connection successful");

          columnList = JSON.parse(req.query.column_list);
          valueList = JSON.parse(req.query.value_list);
          columns = "";
          values = "";

          for(i=0; i<columnList.length; i++)
            columns += columnList[i]+",";
          for(j=0; j<valueList.length; j++)
            values += "'"+valueList[j]+"',";

          columns = columns.substring(0, columns.length-1);
          values = values.substring(0, values.length-1);

          client.query("INSERT INTO "+req.query.table+"("+columns+") VALUES ("+values+");" , function(err,result) {
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

  modifyRecord: function(req, res) {
      var pg = require('pg');
      var client = new pg.Client(conString+req.query.db);

      client.connect(function(err,client) {
        if(err){
         console.log("Not able to get connection : "+ err);
         res.status(400).send(err);
        }
        else{
          console.log("Connection successful");

          columnList = JSON.parse(req.query.column_list);
          valueList = JSON.parse(req.query.value_list);
          columns = "";
          values = "";

          for(i=0; i<columnList.length; i++)
            columns += columnList[i]+",";
          for(j=0; j<valueList.length; j++)
            values += "'"+valueList[j]+"',";

          columns = columns.substring(0, columns.length-1);
          values = values.substring(0, values.length-1);

          client.query("UPDATE "+req.query.table+"SET ("+columns+") = ("+values+") WHERE "+req.query.pkKey+" = "+req.query.pkValue+";" , function(err,result) {
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

  getPrimaryKey: function(req, res) {
        var pg = require('pg');
        var client = new pg.Client(conString+req.query.db);

        client.connect(function(err,client) {
          if(err){
           console.log("Not able to get connection : "+ err);
           res.status(400).send(err);
          }
          else{
            console.log("Connection successful");
            client.query("SELECT a.attname, format_type(a.atttypid, a.atttypmod) AS data_type FROM pg_index i JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey) WHERE i.indrelid = "+req.query.table+"::regclass AND i.indisprimary;" , function(err,result) {
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


};
