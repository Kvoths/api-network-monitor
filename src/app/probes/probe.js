//Importamos la librería de mongoose y la de crypto
const mongoose = require('mongoose');
//Se define un esquema para la base de datos
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var probeSchema = new Schema({
    name: {
        type: String,
        required: "The probe's name is required"
    },
    ip: {
        type: String,
        required: "The probe's ip is required"
    },
    active: {
        type: Boolean,
        required: "The probe's active is required"
    },
    user: { 
        type: ObjectId,
        ref: 'User',
        required: "The probe's propietary is required"
    }
});

//Métodos

//Creamos el modelo
module.exports = mongoose.model('Probe', probeSchema);