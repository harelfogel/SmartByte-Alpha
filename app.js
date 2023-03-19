require('dotenv').config();
const getClientDetails= require('./smartThings');
const express = require('express');

const { switchAcState, getAcState } = require('./smartThings');
const cors = require("cors");

const { json } = require('express');
const { homeConnectAuth, homeConnectToken } = require('./homeConnect.js');
const { smartThingsGetDevices, switchWasherWater } = require('./smartThings2.js');
const { checkforUserDistance } = require('./location.js');
const server = express();
const port = process.env.PORT || 3001;
server.use(express.json());
server.use(cors({origin: true}));


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

server.get('/homeConnect', (req,res) => {
     homeConnectAuth();
    res.json({message: 'Welcome to Home Connect'})
})

server.get('/homeConnect/callback', (req,res) => {
    // console.log("callback", req.query)
    homeConnectToken(req, res);
    res.json({message: 'token'})
})

// server.post('/sensibo', async (req,res) => {
//     console.log("sensibo")
//     const state = req.body.state;
//     await switchAcState(state);
// })

server.post('/sensibo', async (req,res) => {
    console.log("sensibo")
    const state = req.body.state;
    await switchAcState(state);
    res.json({statusCode: 200})
})

server.get('/sensibo', async (req,res) => {
    console.log("sensibo get acState")
    const state = await getAcState();
    res.json({state})
})




server.get('/smartthings/v2/devices', async (req, res) => {
    const deviceId = req.query.deviceId || '';
    console.log("Yovel id", deviceId)
    const response = await smartThingsGetDevices(deviceId);
    res.json(response)
})


server.post('/smartthings/v2/switch', async (req,res) => {
    console.log("smart things SWITCH", req.body.state)

    // const response = await switchWasherWater(req.body.state)
})

server.post('/smartthings/v2/devices/:deviceId/switch', async (req, res) => {
    console.log("SWITCH")
    const deviceId = req.url.split('/')[4];
    const status = req.body.status;
    const response = await switchWasherWater(deviceId,status)
    res.json(response.data)
})

server.post('/location', async (req,res) => {
    // console.log(req.body)
    const distance = checkforUserDistance(req.body.location);
    res.json({distance})
})

server.listen(port, () => console.log(`listening on port ${port}!`));