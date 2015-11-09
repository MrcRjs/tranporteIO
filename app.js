
/**
 * Module dependencies.
 */

var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var app = module.exports = express.createServer();
var io = require('socket.io')(app);

// Configuration

app.configure(function(){
  app.set('views', './views');
  app.set('view options', {layout: false});
  app.set('view engine', 'jade');
  
  app.use(logger('dev'));
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));

});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

io.on('connection', function (socket){
  console.log('A new User Connected');
  
  socket.on('BusAlert', function (msg){
      io.emit('BusAlert', msg);
  })


})

require('./routes/routes_www')(app);

app.listen(4000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
