const express = require('express');
const mongoose = require('mongoose');
const config = require( './config').config;
const bodyParser = require('body-parser');
const app = express()
//Modules
const usersApp = require('./src/app/users/');
const commandsApp = require('./src/app/commands/');
const probesApp = require('./src/app/probes/');

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

//Routes
app.use('/users', usersApp);
app.use('/commands', commandsApp);
app.use('/probes', probesApp);
app.get('/', (req, res) => res.send('Hello World!'))

app.use(function(err, req, res, next) {
  res.status(500);
  res.send({
      mensaje: err.message,
      error: err
  });
});

app.listen(config.env.port, () => console.log(`Example app listenning on port ${config.env.port}!`));