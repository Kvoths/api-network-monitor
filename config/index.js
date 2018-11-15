//Obtenemos el environment. En caso de no existir el valor por defecto es development
const env = process.env.NODE_ENV || 'development';
//Importamos la carpeta del environmet correspondiente
exports.config = require(`./env/${env}`);