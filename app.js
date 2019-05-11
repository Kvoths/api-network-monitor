const express = require('express');
const mongoose = require('mongoose');
const config = require( './config').config;
const bodyParser = require('body-parser');
const https = require('https');
const app = express();
const fs = require('fs');
require('./src/app/mqtt');

//Securizar rutas
const passport = require('passport');
const jwt = require('express-jwt');

process.env.jwt_secret = config.env.jwt_secret;
const auth = jwt({
  secret: process.env.jwt_secret,
  userProperty: 'payload'
});

//Modules
const usersApp = require('./src/app/users/');
require('./config/passport');
const commandsApp = require('./src/app/commands/');
const probesApp = require('./src/app/probes/');
//Certificados
const privateKey  = fs.readFileSync('sslcert/key.pem', 'utf8');
const certificate = fs.readFileSync('sslcert/certificate.pem', 'utf8');
const credentials = {key: privateKey, cert: certificate};

app.use(bodyParser.json());

//Conexion con BD
mongoose.connect(config.env.db, { useNewUrlParser: true });
mongoose.connection.on('error', () => {
  throw new Error(`Unable to connect to database.`);
});
mongoose.connection.on('connected', () => {
  console.log(`Connected to database.`);
});

if (config.env === 'development') {
  mongoose.set('debug', true);
}

//Hack para habilitar cross origin
app.use(passport.initialize());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

//Routes
app.use('/', usersApp);
app.use('/', auth, commandsApp);
app.use('/probes', auth, probesApp);

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401);
    res.json({"message" : err.name + ": " + err.message});
  }
});

app.use(function(err, req, res, next) {
  res.status(500);
  res.send({
      mensaje: err.message,
      error: err
  });
});

let httpsServer = https.createServer(credentials, app);
httpsServer.listen(config.env.port, () => console.log(`Example app listenning on port ${config.env.port}!`));