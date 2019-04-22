const mongoose = require('mongoose');
const { spawn } = require('child_process');
require('./probe');

var Probe = mongoose.model('Probe');

exports.save = function (req, res, next) {
    var probe = new Probe();
    
    probe.name = req.body.name;
    probe.ip = req.body.ip
    probe.port = req.body.port
    probe.active = req.body.active
    probe.save( function(err) {
        if (err)
            return next(err);
        
        res.status(204);
        res.json({});
    });
}

exports.list = function (req, res, next) {
    Probe.find( function(err, probes) {
        if (err)
            return next(err);
        var algo = JSON.stringify(probes); 
        res.status(200);
        res.json(probes);
    });
}