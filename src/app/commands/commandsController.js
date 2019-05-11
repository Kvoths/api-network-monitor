const mongoose = require('mongoose');
const cron = require('node-cron');
const { spawn } = require('child_process');
const mqttController = require('../mqtt/mqttController');

require('./command');
require('./result');
var Probe = require('../probes/probe');

// var Parameter = mongoose.model('Command');
var Command = mongoose.model('Command');
var Result = mongoose.model('Result');
//var exports = module.exports;
exports.getCommandsAvailableTypes = function (req, res, next) {
    let results = [
        {
            'name': 'Medir latencia y congestión',
            'value': 'ping'
        },
        {
            'name': 'Medir tasa de paquetes por segundo',
            'value': 'tcpdump'
        }
    ];

    res.status(200);
    res.json(results);
}

exports.list = function (req, res, next) {

    Command.find( function(err, commands) {
        if (err) {
            return next(err);
        }

        res.status(200);
        res.json(commands);
    });
}


exports.getById = function (req, res, next) {
    let id = req.params.id;

    Command.findById(id,  function(err, command) {
        if (err) {
            return next(err);
        }

        res.status(200);
        res.json(command);
    });
};

exports.save = function (req, res, next) {
    var command = new Command();
    
    command.name = req.body.name;
    command.parameters = req.body.parameters;
    command.time = req.body.time;
    command.duration = req.body.duration;
    command.probe = req.body.probe;
    command.active = req.body.active;
    command.save( function(err, command) {
        if (err) {
            return next(err);
        }

        sendCommandToProbe(command);
        res.status(204);
        res.json({
        });
    });
}

exports.update = function (req, res, next) {
    let id = req.params.id;

    Command.findById(id,  function(err, command) {
        if (err) {
            return next(err);
        }

        command.name = req.body.name;
        command.parameters = req.body.parameters;
        command.time = req.body.time;
        command.duration = req.body.duration;
        command.probe = req.body.probe;
        command.active = req.body.active;
        command.save( function(err) {
            if (err) {
                return next(err);
            }

            sendCommandToProbe(command);            
            res.status(204);
            res.json({});
        });
    });
}

exports.delete = function (req, res, next) {
    let id = req.params.id;
    
    Command.deleteOne( {'_id': id}, function(err, command) {
        if (err) {
            return next(err);
        }

        res.status(204);
        res.json({});
    });
}

exports.listByProbe = function (req, res, next) {
    let probe_id = req.params.probe_id;

    Command.find( { 'probe': probe_id}, function(err, commands) {
        if (err) {
            return next(err);
        }

        res.status(200);
        res.json(commands);
    });
}

exports.getResults = function (req, res, next) {
    Result.find( function ( err, results ) {
        res.status(200);
        res.json(results);
    });
}

exports.getResultsByCommand = function (req, res, next) {
    let command_id = req.params.id;

    Result.find( {'command': command_id}, function ( err, results ) {
        res.status(200);
        res.json(results);
    });
}

exports.getResultsByCommandBetweenDates = function (req, res, next) {
   let command_id = req.params.id;
   let start_date = req.query.start_date;
   let end_date = req.query.end_date;
   console.log(start_date);
   console.log(end_date);
   Result.find({
       'command': command_id,
       'date': {
           $gte: new Date(start_date),
           $lte: new Date(end_date)
        }
    }, function ( err, results ) {
       res.status(200);
       res.json(results);
   });
}

exports.processMessage = function (topic, message) {
    try {    
        let result = JSON.parse(message);
        saveResult (result);
    } catch (e) {
        console.log(message);
    }
}

saveResult = function (result) {
    let new_result = new Result();
    new_result.id_on_probe = result._id;
    new_result.command = result.command;
    new_result.type = result.type;
    new_result.results = result.results;
    new_result.save( function(err) {
        if (err) {
            console.log(err);            
        }

        console.log('Resultado guardado correctamente.');
        return true;
    
    });
}

sendCommandToProbe = function (command) {
    let message = JSON.stringify(command);
    mqttController.sendMessage(`probe/${command.probe}/command/${command._id}`, message);
}