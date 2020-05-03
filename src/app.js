const express = require('express');
const routerAccount = require('./router/account');
const app = express();

app.use(express.json());

app.use('/account', routerAccount);

app.use('/', (req, res) => {
    res.status(200).send('Server ok!')
});

module.exports = app;