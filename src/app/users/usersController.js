var mongoose = require('mongoose');
require('./user');
var User = mongoose.model('User');
//var exports = module.exports;
exports.register = function (req, res) {
    var user = new User();
    
    user.name = req.body.name;
    user.mail = req.body.mail;
    user.setPassword(req.body.password);

    user.save( function(err) {
        console.log(err);
        var token;
        res.status(200);
        res.json({
        });
      });
}