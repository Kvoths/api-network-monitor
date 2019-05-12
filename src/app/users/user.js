//Importamos la librería de mongoose y la de crypto
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

//Se define un esquema para la base de datos
const Schema = mongoose.Schema;

var userSchema = new Schema({
    name: {
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
        required: 'A password is required',
        minlength: [10, 'A password of at least 10 characters is required']
    },
    salt: {
        type: String,
    }
});

//Métodos
//Comprueba que el argumento password coincide con la password
userSchema.methods.checkPassword = function (password) {
    var hash = crypto.scrypt(password, this.salt, 64, (err, derivedKey) => {
        if (err) throw err;
        console.log(derivedKey.toString('hex'));
    });

    return (hash === this.password);
};

//Genera la salt, la concatena con la pass y realiza el hash
userSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(256).toString('hex');

    //this.password = crypto.scrypt(password, this.salt, 64, algo);
    this.password = crypto.scryptSync(password, this.salt, 256).toString('hex');
};

//Comprueba la pass
userSchema.methods.checkPassword = function (password) {
    var hash = crypto.scryptSync(password, this.salt, 256).toString('hex');
    return (hash === this.password);
};

//Generamos el token JWT
userSchema.methods.generateToken = function (password) {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
  
    return jwt.sign({
      _id: this._id,
      mail: this.email,
      name: this.name,
      exp: parseInt(expiry.getTime() / 1000),
    }, process.env.JWT_SECRET);
};

//Creamos el modelo
module.exports = mongoose.model('User', userSchema);