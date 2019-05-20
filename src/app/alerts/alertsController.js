const mongoose = require('mongoose');
const mailsController = require('../mails/mailsController');
const commandsController = require('../commands/commandsController');
require('./alert');

var Alert = mongoose.model('Alert');

exports.save = function (req, res, next) {
    let alert = new Alert();
    let user_id = req.payload._id;
    
    alert.name = req.body.name;
    alert.description = req.body.description;
    alert.min = req.body.min;
    alert.max = req.body.max;
    alert.user = user_id;
    alert.save( function(err) {
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

    Alert.findById(id,  function(err, alert) {
        if (err) {
            return next(err);
        }

        alert.name = req.body.name;
        alert.description = req.body.description;
        alert.min = req.body.min;
        alert.max = req.body.max;
        alert.user = user_id;
        alert.save( function(err) {
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

    Alert.find( {user: user_id}, function(err, probes) {
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
    
    Alert.deleteOne( {'_id': id, user: user_id}, function(err, probes) {
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

    Alert.findOne({_id: id, user: user_id},  function(err, alert) {
        if (err) {
            return next(err);
        }

        res.status(200);
        res.json(alert);
    });
};

exports.checkAlert = function (command, result) {
    let body = `
        <div>
            <h2>Datos de la sonda</h2>
            <p>Id de la sonda: ${command.probe._id}</p>
            <p>Nombre de la sonda: ${command.probe.name}</p>
            <p>Ip de la sonda: ${command.probe.ip}</p>
        </div>
        <div>
            <h2>Comando ejecutado</h2>
            <p>${command.toString()}</p>
        </div>
        <div>
            <h2>Resultados</h2>
            ${result.toList()}
        </div>
    `;

    Alert.findById(command.alert, function(err, alert) {
        if (err) {
            return next(err);
        }
        
        let sendMail = false;

        switch (result.type) {
            case 'ping':
                if (result.results.avg < alert.min || result.results.avg > alert.max) {
                    sendMail = true;
                }

                break;
            case 'tcpdump':
                if (result.results.num_packets_per_secon < alert.min || result.results.num_packets_per_secon > alert.max) {
                    sendMail = true;
                }

                break;
            case 'iperf':
                if (result.results.avg < alert.min || result.results.avg > alert.max) {
                    sendMail = true;
                }

                break;
        }

        if (sendMail) {
            mailsController.sendEmail(command.probe.user.mail, 'CONTROLADOR - RESULTADO FUERA DEL INTERVALO ESTABLECIDO', body);
        }
    });
};