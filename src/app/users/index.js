//Este módulo es el encargado de gestionar usuarios
var express = require('express');
var router = express.Router();

router.get('/:login', function(req, res) {
  console.log('Obtener el usuario con login ' + req.params.login);
});
router.post('/', function(req, res) {
  console.log('Crear un usuario');
});

module.exports = router;