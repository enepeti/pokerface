var _ = require("lodash");
var config = require('./config');

var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var _ = require("lodash");
var bodyparser = require("body-parser");
var io = require("socket.io")(http.Server(app));

var data_access_layer = require('./models/dal/mongodb');
var dal = new data_access_layer(config);

process.on('uncaughtException', function(error) {
    console.log("Uncaught exception in master. Terminating.");
    console.log(error);

    process.exit(1);
});

app.set('port', config.port);
app.set('views', path.join(__dirname, '../../views'));
app.use(express.static(path.join(__dirname, '../../public')));

//Initial Express setup
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));

app.get('/', function(req, res){
   res.sendfile('./views/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
});

http.createServer(app).listen(app.get('port'), function() {
    console.log("Core started on port " + app.get('port'));
});