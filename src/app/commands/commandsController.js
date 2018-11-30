var mongoose = require('mongoose');
require('./command');
// var Parameter = mongoose.model('Command');
var Command = mongoose.model('Command');
//var exports = module.exports;
exports.save = function (req, res, next) {
    var command = new Command();
    
    command.name = req.body.name;
    command.parameters = req.body.parameters
    command.save( function(err) {
        if (err)
            next(err);
        
        res.status(204);
        res.json({
        });
    });
}
