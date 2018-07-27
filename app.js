//Here we construct the various requests on the databases
var express = require('express'),
    http = require('http'),
    request = require('request'),
    bodyParser = require('body-parser'),
    app = express();

var loginOperations = require('./server/js/requests/login.js');
var dbOperations = require("./server/js/requests/psql.js");
var webOperations = require("./server/js/requests/web.js");
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
app.post('/db/addRecord', function(req,res){
    dbOperations.addRecord(req,res);
});
app.post('/db/modifyRecord', function(req,res){
    dbOperations.modifyRecord(req,res);
});
app.get('/db/getPrimaryKey', function(req,res){
    dbOperations.getPrimaryKey(req,res);
});
app.post('/db/delRecord', function(req,res){
    dbOperations.delRecord(req,res);
});
app.get('/db/query', function(req,res){
    dbOperations.query(req,res);
});
app.get('/login/getIdFromMD5', function(req,res){
    loginOperations.getIdFromMD5(req,res);
});
app.post('/login/addLogin', function(req,res){
    loginOperations.addLogin(req,res);
});
app.get('/web/getAnnuaire', function(req, res){
    webOperations.getAnnuaire(req,res);
});
app.get('/login/getTheMd5', function(req, res){
    loginOperations.getTheMd5(req,res);
});
app.get('/db/getDbMemory', function(req, res){
    dbOperations.getDbMemory(req,res);
});
app.get('/login/getIdFromMd5NameMail', function(req,res){
    loginOperations.getIdFromMd5NameMail(req,res);
});
app.post('/login/sendConfirmEmail', function(req,res){
    loginOperations.sendConfirmEmail(req,res);
});
app.get('/login/getAdminFromId', function(req,res){
    loginOperations.getAdminFromId(req,res);
});

app.set('port', process.env.PORT || 3001);
app.use(express.static(__dirname));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.listen(app.get('port'), function () {
    //console.log('Express server listening on port ' + app.get('port'));
});
