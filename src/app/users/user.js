//Importamos la librería de mongoose y la de crypto
var mongoose = require('mongoose');
var crypto = require('crypto');
//Se define un esquema para la base de datos
var Schema = mongoose.Schema;

var SomeModelSchema = new Schema({
    user: {
        type: String,
        required: 'A username is required'
    },
    mail: {
        type: String,
        required: 'An email is required',
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        minlength: [10, 'A password of at least 10 characters is required']
    }
});