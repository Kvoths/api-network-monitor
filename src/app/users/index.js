//Este módulo es el encargado de gestionar usuarios
var express = require('express');
var router = express.Router();
//Importamos el controlador de Usuario
var usersController = require('./usersController');

//Ruta para registrar usuario
router.get('/:id', usersController.register);
router.post('/', function(req, res) {
  console.log('Crear un usuario');
});

module.exports = router;