//Here we construct the various requests on the databases
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
app.get('/db/getColumnConstraint', function(req,res){
    dbOperations.getColumnConstraint(req,res);
});
app.get('/db/getColumnName', function(req,res){
    dbOperations.getColumnName(req,res);
});
app.get('/db/getAllValues', function(req,res){
    dbOperations.getAllValues(req,res);
});
app.get('/db/getValuesOf', function(req,res){
    dbOperations.getValuesOf(req,res);
});
app.get('/db/addRecord', function(req,res){
    dbOperations.addRecord(req,res);
});
app.get('/db/modifyRecord', function(req,res){
    dbOperations.modifyRecord(req,res);
});
app.get('/db/getPrimaryKey', function(req,res){
    dbOperations.getPrimaryKey(req,res);
});
app.get('/db/delRecord', function(req,res){
    dbOperations.delRecord(req,res);
});

app.engine('php', phpExpress.engine);
app.set('view engine', 'php');

// routing all .php file to php-express
app.all(/.+\.php$/, phpExpress.router);

app.set('port', process.env.PORT || 3001);
app.use(express.static(__dirname));
app.listen(app.get('port'), function () {
    //console.log('Express server listening on port ' + app.get('port'));
});
