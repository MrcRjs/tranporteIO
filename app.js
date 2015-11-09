/**
 * Module dependencies.
 */
var MongoClient   = require('mongodb').MongoClient;
var assert        = require('assert');
var gps           = require("gps-tracking");
var express       = require('express');
var bodyParser    = require('body-parser');
var logger        = require('morgan');
var routes        = require('./routes');

var app           = module.exports = express.createServer();
var io            = require('socket.io')(app);

var mongourl = 'mongodb://localhost:27017/gps';

// Configuration
app.configure(function(){
  app.set('views', './views');
  app.set('view options', {layout: false});
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  
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

var options = {
  'debug'                 : false,
  'port'                  : 8090,
  'device_adapter'        : "TK103"
}

MongoClient.connect(mongourl, function(err, db) {
  assert.equal(null, err);
  console.log("Conectado a DB correctamente");

  var collections = {
    'pings': db.collection('pings')
  };

  io.on('connection', function(socket) {
    collections.pings.find({}).sort({inserted: -1}).limit(300).toArray(function(err, docs) {
      assert.equal(err, null);
      socket.emit('positions', {
        positions: docs
      });

    });
  });

  var server = gps.server(options, function(device, connection) {

    device.on("connected",function(data) {

      console.log("Se ha conectado un nuevo dispositivo");
      return data;

    });

    device.on("login_request",function(device_id, msg_parts) {

      console.log('Necesito transmitir mi posición. Mi id es ' + device_id);

      this.login_authorized(true); 

      console.log( device_id + " aceptado!");

    });
    

    device.on("ping",function(data) {
      data.uid = this.getUID();
      io.emit('ping', data);

      console.log("Mi posición: " + data.latitude + ", " + data.longitude + " (" + this.getUID() + ")");

      var data_to_insert = data;
      data_to_insert.uid = this.getUID();

      collections.pings.insert(data_to_insert);

      //Información del dispositivo, velocidad, gasolina, RPM, luces, puertas, etc
      //console.log(data);

      return data;

    });

     device.on("alarm",function(alarm_code, alarm_data, msg_data) {
      console.log("Emergencia: " + alarm_code + " (" + alarm_data.msg + ")");
    }); 

    connection.on('data', function(data) {
      console.log(data.toString()); 
    })

  });
});

io.on('connection', function (socket){
  console.log('A new User Connected');
  
  socket.on('BusAlert', function (msg){
      io.emit('BusAlert', msg);
  })


})

require('./routes/routes_www')(app);
app.get('/', routes.index);

app.listen(4000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
