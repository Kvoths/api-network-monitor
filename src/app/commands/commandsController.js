const mongoose = require('mongoose');
const { spawn } = require('child_process');
require('./command');
// var Parameter = mongoose.model('Command');
var Command = mongoose.model('Command');
//var exports = module.exports;
exports.save = function (req, res, next) {
    var command = new Command();
    
    command.name = req.body.name;
    command.parameters = req.body.parameters
    command.time = req.body.time
    command.duration = req.body.duration
    command.save( function(err) {
        if (err)
            next(err);
        
        res.status(204);
        res.json({
        });
    });
}

exports.exec = function (req, res, next) {
    var command = req.body;
    var commandString = command.name;
    for (let index in command.parameters)
    {
        var parameter = command.parameters[index];

        if (parameter['value'] === undefined || parameter['value'] === null)
            parameter['value'] = '';
        commandString += ` ${parameter['name']} ${parameter['value']}`;
    }

    const spawnOptions = {
        shell: true
    }

    spawn(commandString, spawnOptions).stdout.on('data', function (data) {
        console.log('stdout: ' + data.toString());
      });
      
    spawn(commandString, spawnOptions).stderr.on('data', function (data) {
        console.log('stderr: ' + data.toString());
    });
      
    spawn(commandString, spawnOptions).on('exit', function (code) {
        console.log('child process exited with code ' + code.toString());
    });
    /*command.name = req.body.name;
    command.parameters = req.body.parameters
    command.save( function(err) {
        if (err)
            next(err);
        
        res.status(204);
        res.json({
        });
    });*/
}