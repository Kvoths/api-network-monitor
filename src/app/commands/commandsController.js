const mongoose = require('mongoose');
const cron = require('node-cron');
const { spawn } = require('child_process');
const axios = require('axios');
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
    command.save( function(err, command) {
        if (err)
            return next(err);
        //this.createCron(command);
        this.sendCommandToProbe(command);
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
        command.save( function(err) {
            if (err) {
                return next(err);
            }
            
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
    let expr, dividedString, values;
    switch (command_name) {
        case 'ping':
            //Si la última línea del ping es rtt significa que ha tenido éxito el ping
            expr = 'rtt min/avg/max/mdev = ';
            dividedString = output.split(expr);
            if (typeof dividedString[1] !== 'undefined') {
                values = dividedString[1].replace(' ms\n', '');
                values = values.split('/');
                values = {
                    "min": values[0],
                    "avg": values[1],
                    "max": values[2],
                    "mdev": values[3],
                    "duration": duration
                };
                this.saveResult(command_id, 'ping', values);
            }
            break;
        case 'tcpdump':
            expr = ' packets captured';
            dividedString = output.split(expr);
            expr = '\n';
            dividedString = dividedString[0].split(expr);
            let num_packets = dividedString[dividedString.length - 1];
            
            if (!isNaN(num_packets)) {
                values = {
                    "num_packets": num_packets,
                    "duration": duration,
                    "num_packets_per_secon": (num_packets / duration)
                };
                this.saveResult(command_id, 'tcpdump', values);
            }

            break;
        default:
            console.log(`The command ${command_name} is not yet implemented.`);
    }
}

saveResult = function (command_id, type, values) {
    var result = new Result();
    result.command = command_id;
    result.type = type;
    result.results = values;
    result.save( function(err) {
        if (err)
            return next(err);
        return true;
    });
}

sendCommandToProbe = function (command) {
    console.log('hola');

    Probe.findById(command.probe, function(err, probe) {
        if (err)
            return next(err);
        let url = 'http://' + probe.ip + ':' + probe.port + '/commands';

        axios.post(url, command)
        .then((res) => {
            console.log(`statusCode: ${res.statusCode}`)
            console.log(res)
        })
        .catch((error) => {
            console.error(error)
        });
    });
}

createCron = function (command) {
    let time = command.time;
    let cronString = time.minute + ' ' + time.hour + ' ' + time.dayMonth + ' ' + time.month + ' ' + time.dayWeek;  

    cron.schedule(cronString, () => {
        this.execAuto(command);
    });
}

execAuto = function (command) {
    var commandParams = [];

    for (var i = 0; i < command.parameters.length; i++)
    {
        var parameter = command.parameters[i];
        commandParams.push(parameter['name']);

        if (parameter['value'] !== undefined && parameter['value'] !== null && parameter['value'] !== "")
            commandParams.push(parameter['value']);
    }
    
    commandSpawn = spawn(command.name, commandParams);
    this.getCommandOutput(commandSpawn, command.duration).then( output => saveCommandOutput (command._id, command.name, output, command.duration));
}

exports.exec = function (req, res, next) {
    var command_id = req.params.id;
    
    if (command_id.match(/^[0-9a-fA-F]{24}$/)) {
        Command.findById (command_id, function (err, command) {
            if ( err )
                return next(err);
            if ( command === null )
                return next("The command id doesn't exist on the database");
            
            var commandParams = [];

            for (var i = 0; i < command.parameters.length; i++)
            {
                var parameter = command.parameters[i];
                commandParams.push(parameter['name']);

                if (parameter['value'] !== undefined && parameter['value'] !== null && parameter['value'] !== "")
                    commandParams.push(parameter['value']);
            }
            
            commandSpawn = spawn(command.name, commandParams);
            this.getCommandOutput(commandSpawn, command.duration).then( output => saveCommandOutput (command._id, command.name, output, command.duration));
            
        });
    } else {
        next('Invalid id');
    }
}