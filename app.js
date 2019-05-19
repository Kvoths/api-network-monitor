require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const https = require('https');
const app = express();
const fs = require('fs');

require('./src/app/mqtt');

//Securizar rutas
const passport = require('passport');
const jwt = require('express-jwt');

const auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'payload'
});

//Modules
require('./config/passport');
const usersApp = require('./src/app/users/');
const commandsApp = require('./src/app/commands/');
const probesApp = require('./src/app/probes/');
const probesController = require('./src/app/probes/probesController');
const alertsApp = require('./src/app/alerts/');
//Certificados
const privateKey  = fs.readFileSync('sslcert/key.pem', 'utf8');
const certificate = fs.readFileSync('sslcert/certificate.pem', 'utf8');
const credentials = {key: privateKey, cert: certificate};

app.use(bodyParser.json());

//Conexion con BD
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true });
mongoose.connection.on('error', () => {
  throw new Error(`Unable to connect to database.`);
});
mongoose.connection.on('connected', () => {
  console.log(`Connected to database.`);
});

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
app.use('/alerts', auth, alertsApp);

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401);
    res.json({"message" : err.name + ": " + err.message});
  } else {
    next(err);
  }
});

app.use(function(err, req, res, next) {
  res.status(500);
  res.send({
      mensaje: err.message,
      error: err
  });
});

probesController.checkActiveProbes();

let httpsServer = https.createServer(credentials, app);
httpsServer.listen(process.env.PORT, () => console.log(`Example app listenning on port ${process.env.PORT}!`));