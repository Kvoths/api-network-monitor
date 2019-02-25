//Importamos la librería de mongoose y la de crypto
const mongoose = require('mongoose');
//Se define un esquema para la base de datos
const Schema = mongoose.Schema;

var cronTimeSchema = new Schema({
    minute: {
        type: Number,
        default: '*'
    },
    hour: {
        type: Number,
        default: '*'
    },
    dayMonth: {
        type: Number,
        default: '*'
    },
    month: {
        type: Number,
        default: '*'
    },
    dayWeek: {
        type: Number,
        default: '*'
    }
});

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
    time: {   
        type: cronTimeSchema,
        required: "The time when the command will be executed is required",
    },
    duration: {
        type: Number,
        required: "The duration of the command is required"
    }
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