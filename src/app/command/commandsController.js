var mongoose = require('mongoose');
require('./command');
var Command = mongoose.model('Command');
//var exports = module.exports;
exports.register = function (req, res, next) {
    var command = new Command();
    
    command.name = req.body.name;
    command.mail = req.body.mail;
    command.setPassword(req.body.password);

    command.save( function(err) {
        if (err)
            next(err);
        
        var token = command.generateToken();
        res.status(200);
        res.json({
            "token": token
        });
    });
}

exports.login = function (req, res, next) {
    Command.findOne({ mail: req.body.mail}, function (err, command) {
        if (err)
            next(err);

        if (command && command.checkPassword(req.body.password))
        {
            var token = command.generateToken();
            res.status(200);
            res.json({
                "token": token
            });
        }
        else
        {
            next('Mail or password incorrect');
        }
    });
}