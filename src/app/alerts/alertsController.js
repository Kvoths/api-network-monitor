const mongoose = require('mongoose');
require('./alert');

var Alert = mongoose.model('Alert');

exports.save = function (req, res, next) {
    let alert = new Alert();
    
    alert.name = req.body.name;
    alert.description = req.body.description;
    alert.min = req.body.min;
    alert.max = req.body.max;
    alert.save( function(err) {
        if (err) {
            return next(err);
        }
        
        res.status(204);
        res.json({});
    });
}

exports.update = function (req, res, next) {
    let id = req.params.id;

    Alert.findById(id,  function(err, alert) {
        if (err) {
            return next(err);
        }

        alert.name = req.body.name;
        alert.description = req.body.description;
        alert.min = req.body.min;
        alert.max = req.body.max;
        alert.save( function(err) {
            if (err) {
                return next(err);
            }
            
            res.status(204);
            res.json({});
        });
    });
}

exports.list = function (req, res, next) {
    Alert.find( function(err, probes) {
        if (err) {
            return next(err);
        }

        res.status(200);
        res.json(probes);
    });
}

exports.delete = function (req, res, next) {
    let id = req.params.id;
    
    Alert.deleteOne( {'_id': id}, function(err, probes) {
        if (err) {
            return next(err);
        }

        res.status(204);
        res.json({});
    });
}

exports.getById = function (req, res, next) {
    let id = req.params.id;

    Alert.findById(id,  function(err, alert) {
        if (err) {
            return next(err);
        }

        res.status(200);
        res.json(alert);
    });
};