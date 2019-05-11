//Importamos la librería de mongoose y la de crypto
const mongoose = require('mongoose');
//Se define un esquema para la base de datos
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var resultSchema = new Schema({
    id_on_probe: {
        type: ObjectId
    },
    type: {
        type: String,
        required: "The result's type is required"
    },
    date: {
        type: Date,
        default: Date.now,
    },
    command: { 
        type: ObjectId,
        ref: 'Command',
        required: 'The command that outputs the result is required'
    },
    results: {}
});

//Métodos

//Creamos el modelo
mongoose.model('Result', resultSchema);