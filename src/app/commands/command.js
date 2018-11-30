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
        type: String,
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
commandSchema.methods.copyFromJSON = function (json) {
    var command = JSON.parse(json);

    this.name = command.name;
    for (let parameter in command.parameters)
    {

    }
    

    return (hash === this.password);
};
//Creamos el modelo
mongoose.model('Command', commandSchema);