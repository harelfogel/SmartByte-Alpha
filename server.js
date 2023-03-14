import express from 'express';
import {
    homeConnectAuth,
    homeConnectToken
} from './controllers/homeConnect.js'
import { smartThingsGetDevices, switchWasherWater } from './controllers/smartThings2.js';
import {testFn} from './common/utils.js';
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
// server.get('/smartthings',function(req,res){
//     getClientDetails();
//     res.json({message:`Welcome to smartthings details`});
// });

server.get('/homeConnect', (req,res) => {
     homeConnectAuth();
    res.json({message: 'Welcome to Home Connect'})
})

server.get('/homeConnect/callback', (req,res) => {
    // console.log("callback", req.query)
    homeConnectToken(req, res);
    res.json({message: 'token'})
})



server.get('/smartthings2/devices', async (req, res) => {
    const deviceId = req.query.deviceId || '';
    console.log("Yovel id", deviceId)
    const response = await smartThingsGetDevices(deviceId);
    res.json(response)
})



server.post('/smartthings2/devices/:deviceId/switch', async (req, res) => {
    console.log("SWITCH")
    const deviceId = req.url.split('/')[3];
    const status = req.body.status;
    switchWasherWater(deviceId,status)
    res.json({})
})





/* Start listening at your defined PORT */
server.listen(PORT, () => console.log(`Server is up and running on port ${PORT}`));