//Importamos la librería de mongoose y la de crypto
const mongoose = require('mongoose');
//Se define un esquema para la base de datos
const Schema = mongoose.Schema;

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
commandSchema.methods.execCommand = function () {
    var commandString = this.name;

    this.name = command.name;
    for (let parameter in command.parameters)
    {

    }
    

};
//Creamos el modelo
mongoose.model('Command', commandSchema);