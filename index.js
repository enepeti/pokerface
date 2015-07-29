var _ = require("lodash");
var config = require('./config');
var _ = require("lodash");

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require("socket.io")(http);

var bodyparser = require("body-parser");
var path = require('path');

var data_access_layer = require('./models/dal/mongodb');
var dal = new data_access_layer(config);

process.on('uncaughtException', function(error) {
    console.log("Uncaught exception in master. Terminating.");
    console.log(error);

    process.exit(1);
});

app.set('port', config.port);
app.use(express.static(path.join(__dirname, './public')));

//Initial Express setup
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));

app.get('/', function(req, res){
   res.sendfile('./views/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(app.get('port'), function(){
  console.log("Listening on " + app.get('port'));
});