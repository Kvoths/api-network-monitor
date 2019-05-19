const mongoose = require('mongoose');
const { spawn } = require('child_process');
const mqttController = require('../mqtt/mqttController');
const alertController = require('../alerts/alertsController');
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
    let user_id = req.payload._id;

    Command.find({user: user_id}, function(err, commands) {
        if (err) {
            return next(err);
        }
        for (command of commands) {
            console.log(command.user);
        }
        res.status(200);
        res.json(commands);
    });
}


exports.getById = function (req, res, next) {
    let id = req.params.id;
    let user_id = req.payload._id;

    Command.findOne({_id: id, user: user_id},  function(err, command) {
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
    command.user = req.payload._id;

    if (req.body.alert) {
        command.alert = req.body.alert;
    }

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
        command.user = req.payload._id;

        if (req.body.alert) {
            command.alert = req.body.alert;
        }
        
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
    let user_id = req.payload._id;

    Command.find( { probe: probe_id, user: user_id}, function(err, commands) {
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

    Command.findById(result.command).
    populate({
        path: 'probe',
        populate: { path: 'user' }
    }).
    exec( function (err, command) {
        if (err) {
            console.log(error);
        }

        if (command.alert) {
            alertController.checkAlert(command, result);
        }
    });

}

sendCommandToProbe = function (command) {
    let message = JSON.stringify(command);
    mqttController.sendMessage(`probe/${command.probe}/command/${command._id}`, message);
}

//Ejecución de comandos
exports.exec = function (command) {
    return new Promise( function(resolve, reject) {
        var commandParams = [];

        for (var i = 0; i < command.parameters.length; i++)
        {
            var parameter = command.parameters[i];
            commandParams.push(parameter['name']);

            if (parameter['value'] !== undefined && parameter['value'] !== null && parameter['value'] !== "")
                commandParams.push(parameter['value']);
        }
        
        commandSpawn = spawn(command.name, commandParams);
        getCommandOutput(commandSpawn, command.duration).then( output => {
            return saveCommandOutput(command._id, command.name, output, command.duration);
        })
        .then( output => {
            resolve(output);
        });
    });
}

getCommandOutput = function (commandSpawn, duration) {
    return new Promise( function(resolve, reject) {
        var output = '';
        
        setTimeout( function () { 
            console.log('Timeout, the process will be killed');
            commandSpawn.kill('SIGINT');
        }, duration * 1000);
        
        commandSpawn.stdout.on('data', function (data) {
            if (data != null) {
                output += data.toString();
            }
        });
            
        commandSpawn.stderr.on('data', function (data) {
            if (data != null) {
                console.log('stderr: ' + data.toString());
                output += data.toString();
            }
        });
            
        commandSpawn.on('exit', function (code) {
            if (code != null) {
                console.log('child process exited with code ' + code.toString());
                resolve(output);
            }
        });
    });
}

saveCommandOutput = function (command_id, command_name, output, duration) {
    return new Promise( function(resolve, reject) {
        let expr, dividedString, values;

        switch (command_name) {
            case 'ping':
                //Si la última línea del ping es rtt significa que ha tenido éxito el ping
                expr = 'rtt min/avg/max/mdev = ';
                dividedString = output.split(expr);
                if (typeof dividedString[1] !== 'undefined') {
                    console.log('Sonda activa');
                    resolve(true);
                } else {
                    console.log('Sonda inactiva');
                    resolve(false);
                }
                break;
        }
    });
}