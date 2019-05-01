const mongoose = require('mongoose');
const { spawn } = require('child_process');
require('./command');
require('./result');
// var Parameter = mongoose.model('Command');
var Command = mongoose.model('Command');
var Result = mongoose.model('Result');
//var exports = module.exports;
exports.save = function (req, res, next) {
    var command = new Command();
    
    command.name = req.body.name;
    command.parameters = req.body.parameters;
    command.time = req.body.time;
    command.duration = req.body.duration;
    command.probe = req.body.probe;
    command.save( function(err) {
        if (err)
            return next(err);
        
        res.status(204);
        res.json({
        });
    });
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

                if (parameter['value'] !== undefined && parameter['value'] !== null)
                    commandParams.push(parameter['value']);
            }
            
            commandSpawn = spawn(command.name, commandParams);
            this.getCommandOutput(commandSpawn, command.duration).then( output => saveCommandOutput (command._id, command.name, output, command.duration));
            
        });
    } else {
        next('Invalid id');
    }
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

exports.listByProbe = function (req, res, next) {
    let probe_id = req.query.probe_id;
    Command.find( { 'probe': probe_id}, function(err, commands) {
        if (err) {
            return next(err);
        }

        res.status(200);
        res.json(commands);
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