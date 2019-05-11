//Este módulo es el encargado de gestionar la comunicación con mqtt
const mqtt = require('mqtt');
const commandController = require('../commands/commandsController');
//const commandController = require('./src/app/commands/commandsController');
let client  = mqtt.connect(`mqtt://${(process.env.MOSQUITTO_URL) ? process.env.MOSQUITTO_URL : 'localhost'}`);
 
client.on('connect', function () {
  client.subscribe(`master`  , function (err) {
    if (!err) {
      client.publish(`master`, 'Hello mqtt');
    } else {
        console.log(err);
    }
  })
});

client.on('message', function (topic, message) {
  // message is Buffer
  commandController.processMessage(topic, message);
  console.log('Mensaje recibido');
  //client.end();
});
