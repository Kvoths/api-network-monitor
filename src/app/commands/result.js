//Importamos la librería de mongoose y la de crypto
const mongoose = require('mongoose');
//Se define un esquema para la base de datos
const Schema = mongoose.Schema;

var resultSchema = new Schema({
    //id_command: { type: Schema.Types.ObjectId, ref: 'Command' },
    type: String,
    date: Date,
    results: {}

});

//Métodos

//Creamos el modelo
mongoose.model('Result', resultSchema);