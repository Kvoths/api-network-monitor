//Este módulo es el encargado de gestionar usuarios
const express = require('express');
const router = express.Router();
//Importamos el controlador de Usuario
const alertsController = require('./alertsController');

//Rutas de comandos
router.get('/', alertsController.list);
router.get('/:id', alertsController.getById);
router.post('/', alertsController.save);
router.put('/:id', alertsController.update);
router.delete('/:id', alertsController.delete);

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