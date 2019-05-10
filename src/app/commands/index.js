//Este módulo es el encargado de gestionar usuarios
const express = require('express');
const router = express.Router();
//Importamos el controlador de Usuario
const commandsController = require('./commandsController');

//Rutas de resultados
router.get('/commands/results', commandsController.getResults);
router.get('/commands/:id/results', commandsController.getResultsByCommand);
router.get('/commands/:id/results/byDate', commandsController.getResultsByCommandBetweenDates);

//Rutas de comandos
router.get('/commands/', commandsController.list);
router.get('/probes/:probe_id/commands', commandsController.listByProbe);
router.get('/commands/availableTypes', commandsController.getCommandsAvailableTypes);
router.get('/commands/:id', commandsController.getById);
router.post('/commands/', commandsController.save);
router.put('/commands/:id', commandsController.update);
router.delete('/commands/:id', commandsController.delete);


//router.post('/commands/execution/:id', commandsController.exec);

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