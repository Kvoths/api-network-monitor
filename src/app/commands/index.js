//Este módulo es el encargado de gestionar usuarios
var express = require('express');
var router = express.Router();
//Importamos el controlador de Usuario
var commandsController = require('./commandsController');

//Ruta para registrar usuario
router.post('/', commandsController.save);

//Manejadores de errores
router.use(function(err, req, res, next) {
    if (err.name == 'ValidationError')
    {
        res.status(400);
        res.send({
            mensaje: err.message,
            error: err
        });
    }
    else
        next(err);
});

module.exports = router;