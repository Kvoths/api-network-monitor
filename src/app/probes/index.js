//Este módulo es el encargado de gestionar usuarios
const express = require('express');
const router = express.Router();
//Importamos el controlador de Usuario
const probesController = require('./probesController');

//Ruta para registrar usuario
router.get('/', probesController.list);
router.get('/find/:id', probesController.getById);
router.post('/:id', probesController.save);
router.put('/:id', probesController.update);

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