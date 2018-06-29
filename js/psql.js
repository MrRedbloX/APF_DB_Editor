module.exports = {
  getRecords: function(req, res) {
        var pg = require('pg');
        //You can run command "heroku config" to see what is Database URL from Heroku belt
        var conString = "postgres://192.168.133.136:5432/"+req.query.db;
        var client = new pg.Client(conString);
        client.connect();
        var query = await client.query("select * from "+req.query.table);
        res.rows.forEach(row=>{
          result.addRow(row);
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.write(JSON.stringify(result.rows, null, "    ") + "\n");
          res.end();
        });
        await client.end();

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
