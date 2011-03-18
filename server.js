// required modules
var express = require('express');
var express_resource = require('express-resource');
var mongoose = require('mongoose');
var fs = require('fs');
var io= require('socket.io');
var crypto = require('crypto');

var options = {
 key: fs.readFileSync('privatekey.pem').toString(),
 cert: fs.readFileSync('certificate.pem').toString()
}

var app = express.createServer(options);
// var app = express.createServer();

// initialization
app.set('view options', {
  layout: false
})

app.get('/', function(req, res){
  res.render('index.jade', {title: 'My Site'});
});

app.listen(3000);