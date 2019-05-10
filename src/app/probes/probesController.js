const mongoose = require('mongoose');
const { spawn } = require('child_process');
require('./probe');

var Probe = mongoose.model('Probe');

exports.save = function (req, res, next) {
    var probe = new Probe();
    
    probe.name = req.body.name;
    probe.ip = req.body.ip;
    probe.port = req.body.port;
    probe.active = req.body.active;
    probe.save( function(err) {
        if (err) {
            return next(err);
        }
        
        res.status(204);
        res.json({});
    });
}

exports.update = function (req, res, next) {
    let id = req.params.id;

    Probe.findById(id,  function(err, probe) {
        if (err) {
            return next(err);
        }

        probe.name = req.body.name;
        probe.ip = req.body.ip;
        probe.port = req.body.port;
        probe.active = req.body.active;
        probe.save( function(err) {
            if (err) {
                return next(err);
            }
            
            res.status(204);
            res.json({});
        });
    });
}

exports.list = function (req, res, next) {
    Probe.find( function(err, probes) {
        if (err) {
            return next(err);
        }

        res.status(200);
        res.json(probes);
    });
}

exports.delete = function (req, res, next) {
    let id = req.params.id;
    
    Probe.deleteOne( {'_id': id}, function(err, probes) {
        if (err) {
            return next(err);
        }

        res.status(204);
        res.json({});
    });
}

exports.getById = function (req, res, next) {
    let id = req.params.id;

    Probe.findById(id,  function(err, probe) {
        if (err) {
            return next(err);
        }

        res.status(200);
        res.json(probe);
    });
};