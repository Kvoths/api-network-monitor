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
            
            /*const spawnOptions = {
                shell: true,
                timeout: command.duration * 1000
            }*/
            
            commandSpawn = spawn(command.name, commandParams);
            
            setTimeout( function () { 
                //process.kill(-commandSpawn.pid);
                console.log('Timeout, the process will be killed');
                commandSpawn.kill('SIGINT');
                kill(commandSpawn.pid);
                process.kill(commandSpawn.pid, 'SIGINT');
            }, command.duration * 1000);
            
            commandSpawn.stdout.on('data', function (data) {
                if (data != null)
                    console.log('stdout: ' + data.toString());

            });
                
            commandSpawn.stderr.on('data', function (data) {
                if (data != null)
                    console.log('stderr: ' + data.toString());
            });
                
            commandSpawn.on('exit', function (code) {
                if (code != null)
                    console.log('child process exited with code ' + code.toString());
            });


        });
    } else {
        next('Invalid id');
    }
}