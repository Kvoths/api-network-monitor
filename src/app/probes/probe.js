//Importamos la librería de mongoose y la de crypto
const mongoose = require('mongoose');
//Se define un esquema para la base de datos
const Schema = mongoose.Schema;

var probeSchema = new Schema({
    name: {
        type: String,
        required: "The probe's name is required"
    },
    ip: {
        type: String,
        required: "The probe's name is required"
    },
    port: {
        type: Number,
        required: "The probe's port is required"
    },
    active: {
        type: Boolean,
        required: "The probe's active is required"
    }
});

//Métodos

//Creamos el modelo
mongoose.model('Probe', probeSchema);