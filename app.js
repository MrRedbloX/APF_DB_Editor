var express = require('express'),
    http = require('http'),
    request = require('request'),
    bodyParser = require('body-parser'),
    app = express();
var dbOperations = require("./js/psql.js");
var logFmt = require("logfmt");
app.set('views', __dirname) ;
app.get('/' , function(req,res) {
    res.sendFile(__dirname+'/index.html');
} );
app.get('/db/getDBName', function(req,res){
    dbOperations.getDBName(req,res);
});
app.get('/db/getTableName', function(req,res){
    dbOperations.getTableName(req,res);
});
app.get('/db/getColumnName', function(req,res){
    dbOperations.getColumnName(req,res);
});
app.get('/db/addRecord', function(req,res){
    dbOperations.addRecord(req,res);
});
app.get('/db/delRecord', function(req,res){
    dbOperations.delRecord(req,res);
});

app.set('port', process.env.PORT || 3001);
app.use(express.static(__dirname));
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
