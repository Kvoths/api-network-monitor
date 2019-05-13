//Importamos la librería de mongoose y la de crypto
const mongoose = require('mongoose');
//Se define un esquema para la base de datos
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var alertSchema = new Schema({
    name: {
        type: String,
        required: "The alert's name is required"
    },
    description: {
        type: String,
        required: "The alert's name is required"
    },
    min: {   
        type: Number,
        required: "The min value when the alert will be sent is required",
    },
    max: {
        type: Number,
        required: "The min value when the alert will be sent is required"
    },
    user: { 
        type: ObjectId,
        ref: 'User',
        required: "The probe propietary is required"
    }
});

alertSchema.pre('validate', function(next) {
    if (this.min > this.max) {
        let error = new Error('Min value must be greater than max value');
        error.name = 'ValidationError';
        next(error);
    } else {
        next();
    }
});
//Métodos

//Creamos el modelo
mongoose.model('Alert', alertSchema);