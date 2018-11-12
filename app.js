const express = require('express')
const app = express()
const port = 3000
//Modules
var usersApp = require('./src/app/users/');

//Routes
app.use('/users', usersApp);
app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app liscochog on port ${port}!`))