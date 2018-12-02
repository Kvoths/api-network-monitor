//Este módulo es el encargado de gestionar usuarios
const express = require('express');
const router = express.Router();
//Importamos el controlador de Usuario
const usersController = require('./usersController');

//Ruta para registrar usuario
router.post('/register', usersController.register);
//Ruta para loguar usuarios
router.post('/login', usersController.login);

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