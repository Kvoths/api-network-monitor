//Importamos la librería de mongoose y la de crypto
var mongoose = require('mongoose');

//Se define un esquema para la base de datos
var Schema = mongoose.Schema;

var parameterSchema = new Schema({
    name: {
        type: String,
        required: "The parameter's name is required"
    },
    value: {
        type: any,
        required: "The parameter's value is required"
    }
});

var commandSchema = new Schema({
    name: {
        type: String,
        required: "The command's name is required"
    },
    parameters: {
        type: [parameterSchema],
        validate: {
            validator: function(v) {
                return (v.length > 0);
            },
            msg: 'You must insert at least one parameter'
        }
    },
});

//Métodos
//Comprueba que el argumento password coincide con la password
commandSchema.methods.checkPassword = function (password) {
    var hash = crypto.scrypt(password, this.salt, 64, (err, derivedKey) => {
        if (err) throw err;
        console.log(derivedKey.toString('hex'));
    });

    return (hash === this.password);
};

//Genera la salt, la concatena con la pass y realiza el hash
commandSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(256).toString('hex');

    //this.password = crypto.scrypt(password, this.salt, 64, algo);
    this.password = crypto.scryptSync(password, this.salt, 256).toString('hex');
};

//Comprueba la pass
commandSchema.methods.checkPassword = function (password) {
    var hash = crypto.scryptSync(password, this.salt, 256).toString('hex');
    return (hash === this.password);
};

//Generamos el token JWT
commandSchema.methods.generateToken = function (password) {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
  
    return jwt.sign({
      _id: this._id,
      mail: this.email,
      name: this.name,
      exp: parseInt(expiry.getTime() / 1000),
    }, 'MY_SECRET');
};

//Creamos el modelo
mongoose.model('Command', commandSchema);