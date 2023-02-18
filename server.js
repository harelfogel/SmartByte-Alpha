require('dotenv').config();
const getClientDetails= require('./controllers/smartthings.js');
const express = require('express');
const server = express();
const PORT = 8080;
server.use(express.json());

/* Handle POST requests */
server.post('/', function (req, res, next) {
    console.log(req);
    smartapp.handleHttpCallback(req, res);
});

//Handle get requests
server.get('/',function(req,res){
    res.json({message:`Welcome to SmartByte server`});
})

//Handle get requests
server.get('/smartthings',function(req,res){
    getClientDetails();
    res.json({message:`Welcome to smartthings details`});
});

/* Start listening at your defined PORT */
server.listen(PORT, () => console.log(`Server is up and running on port ${PORT}`));