const mongoose = require('mongoose');
const passport = require('passport');
require('./user');
const User = mongoose.model('User');
//var exports = module.exports;
exports.register = function (req, res, next) {
    var user = new User();
    
    user.name = req.body.name;
    user.mail = req.body.mail;
    user.setPassword(req.body.password);

    user.save( function(err) {
        if (err) {
            next(err);
            return;
        }
        
        var token = user.generateToken();
        res.status(200);
        res.json({
            "token": token
        });
    });
}

exports.login = function (req, res, next) {
    passport.authenticate('local', function(err, user, info){
        let token;
    
        // If Passport throws/catches an error
        if (err) {
          res.status(404).json(err);
          return;
        }
    
        // If a user is found
        if(user){
          token = user.generateToken();
          res.status(200);
          res.json({
            "token" : token
          });
        } else {
          // If user is not found
          res.status(401).json(info);
        }
      })(req, res);
}