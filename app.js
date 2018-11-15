const express = require('express');
const mongoose = require('mongoose');
const config = require( './config').config;
const bodyParser = require('body-parser');
const app = express()
//Modules
var usersApp = require('./src/app/users/');

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
app.get('/', (req, res) => res.send('Hello World!'))

app.listen(config.env.port, () => console.log(`Example app liscochog on port ${config.env.port}!`))