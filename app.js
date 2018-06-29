var express = require('express'),
    http = require('http'),
    request = require('request'),
    bodyParser = require('body-parser'),
    app = express();
var dbOperations = require("./psql.js");
var logFmt = require("logfmt");
app.set('views', __dirname) ;
app.get('/' , function(req,res) {
    res.sendfile('index.html');
} );
app.get('/db/readRecords', function(req,res){
    dbOperations.getRecords(req,res);
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
