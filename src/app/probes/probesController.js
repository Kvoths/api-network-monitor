const mongoose = require('mongoose');
require('./probe');
const commandsController = require('../commands/commandsController');
const cron = require('node-cron');

var Probe = mongoose.model('Probe');

exports.save = function (req, res, next) {
    var probe = new Probe();
    let user_id = req.payload._id;
    
    probe.name = req.body.name;
    probe.ip = req.body.ip;
    probe.active = req.body.active;
    probe.user = user_id;
    probe.save( function(err) {
        if (err) {
            return next(err);
        }
        
        res.status(204);
        res.json({});
    });
}

exports.update = function (req, res, next) {
    let id = req.params.id;
    let user_id = req.payload._id;

    Probe.findById(id,  function(err, probe) {
        if (err) {
            return next(err);
        }

        probe.name = req.body.name;
        probe.ip = req.body.ip;
        probe.active = req.body.active;
        probe.user = user_id;
        probe.save( function(err) {
            if (err) {
                return next(err);
            }
            
            res.status(204);
            res.json({});
        });
    });
}

exports.list = function (req, res, next) {
    let user_id = req.payload._id;

    Probe.find({user: user_id}, function(err, probes) {
        if (err) {
            return next(err);
        }

        res.status(200);
        res.json(probes);
    });
}

exports.delete = function (req, res, next) {
    let id = req.params.id;
    let user_id = req.payload._id;
    
    Probe.deleteOne( {'_id': id, user: user_id}, function(err, probes) {
        if (err) {
            return next(err);
        }

        res.status(204);
        res.json({});
    });
}

exports.getById = function (req, res, next) {
    let id = req.params.id;
    let user_id = req.payload._id;

    Probe.findOne({_id: id, user: user_id},  function(err, probe) {
        if (err) {
            return next(err);
        }

        res.status(200);
        res.json(probe);
    });
};

exports.checkActiveProbes = function () {
    console.log('Estableciendo control de sondas activas');
    let cronString = '*/5 * * * *'; 

    cron.schedule(cronString, () => {
        console.log('Comprobando sondas activas');

        let command = {
            name: "ping",
            duration: 5
        };

        Probe.find(function (err, probes) {
            for (probe of probes) {
                let auxProbe = probe;
                let parameter = {
                    name: probe.ip,
                    value: ""
                };

                command.parameters = [parameter];
                commandsController.exec(command).then(
                    reachable => {
                        if (reachable === true) {
                            console.log('Activando sonda:' + auxProbe._id);
                        } else {
                            console.log('Desactivando sonda:' + auxProbe._id);
                        }

                        auxProbe.active = reachable;
                        auxProbe.save();
                    }
                );
            }
        });
    });

};