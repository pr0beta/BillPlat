// required modules
var express = require('express'),
    express_resource = require('express-resource'),
    mongoose = require('mongoose'),
    fs = require('fs'),
    io = require('socket.io'),
    crypto = require('crypto');

var options = {
 key: fs.readFileSync('privatekey.pem').toString(),
 cert: fs.readFileSync('certificate.pem').toString()
}

var app = express.createServer(options);

// initialization
app.set('view options', {
  layout: false
})

app.configure(function() {
  app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res){
  res.render('index.jade', {title: 'My Site'});
});

app.listen(3000);