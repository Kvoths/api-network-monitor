//Este módulo es el encargado de gestionar usuarios
const express = require('express');
const router = express.Router();
//Importamos el controlador de Usuario
const commandsController = require('./commandsController');

//Ruta para registrar usuario
router.get('/', commandsController.list);
router.post('/', commandsController.save);
router.post('/execution/:id', commandsController.exec);

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