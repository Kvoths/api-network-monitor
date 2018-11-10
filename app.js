const express = require('express')
const app = express()
const port = 3000

var usersApp = require('./src/app/users/');
app.use('/users', usersApp);
app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app liscochog on port ${port}!`))