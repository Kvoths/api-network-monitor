var mongoose = require('mongoose');
require('./user');
var User = mongoose.model('User');
//var exports = module.exports;
exports.register = function (req, res, next) {
    var user = new User();
    
    user.name = req.body.name;
    user.mail = req.body.mail;
    user.setPassword(req.body.password);

    user.save( function(err) {
        if (err)
            next(err);
        
        var token = user.generateToken();
        res.status(200);
        res.json({
            "token": token
        });
    });
}

exports.login = function (req, res, next) {
    User.findOne({ mail: req.body.mail}, function (err, user) {
        if (err)
            next(err);

        if (user && user.checkPassword(req.body.password))
        {
            var token = user.generateToken();
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