require('dotenv').config();
const getClientDetails = require('./smartThings.js');
const express = require('express');
const connectDB = require('./config');
const { switchAcState, getAcState, getSensiboSensors, parseSensorAndWriteToMongo, removeAllSensorValues } = require('./sensibo.js');
const cors = require("cors");

const { json } = require('express');
const { homeConnectAuth, homeConnectToken } = require('./homeConnect.js');
const { smartThingsGetDevices, switchWasherWater } = require('./smartThings2.js');
const { checkforUserDistance } = require('./location.js');
const Rule = require('./Rule');
const { removeSensorValueByType, getFunctionsFromDB, getHeaterState } = require('./common.js');
const { insertRuleToDB,getAllRules, setRuleActive } = require('./rules.service.js');
const { switchHeaterState } = require('./heaterController.js');
const { getDevices } = require('./devices.service.js');

const server = express();
const port = process.env.PORT || 3001;
server.use(express.json());
server.use(cors({ origin: true }));

// Connect to MongoDB
connectDB();



//Handle get requests
server.get('/', function (req, res) {
    res.json({ message: `Welcome to SmartByte server` });
})

/* Handle POST requests */
server.post('/', function (req, res, next) {
    console.log(req);
    smartapp.handleHttpCallback(req, res);
});



 // --------------------------------- Rules ---------------------------------
server.get('/rules', async (req, res) => {
    const response = await getAllRules();
    res.status(response.statusCode).json(response.data);
  });

// Define the route for adding a new rule
server.post('/rules', async (req, res) => {
    console.log(req.body)
    const { rule, isStrict } = req.body;
    const response = await insertRuleToDB(rule,isStrict);
    res.status(response.statusCode).send(response.message)
});

server.post('/rules/:id', async (req, res) => {
    const {isActive} = req.body;
    const id = req.params.id;
    const response = await setRuleActive(id,isActive);
    return res.status(response.statusCode).send(response.message);
});


 // --------------------------------- SmartThings- Laundry ---------------------------------

//Handle get requests
server.get('/smartthings', function (req, res) {
    getClientDetails();
    res.json({ message: `Welcome to smartthings details` });
});

server.get('/homeConnect', (req, res) => {
    homeConnectAuth();
    res.json({ message: 'Welcome to Home Connect' })
})

server.get('/homeConnect/callback', (req, res) => {
    // console.log("callback", req.query)
    homeConnectToken(req, res);
    res.json({ message: 'token' })
})


 // --------------------------------- Sensibo- AC ---------------------------------

server.post('/sensibo', async (req, res) => {
    console.log("-----------sensibo---------------")
    const state = req.body.state;
    await switchAcState(state);
    res.json({ statusCode: 200 })
})

server.get('/sensibo', async (req, res) => {
    console.log("sensibo get acState")
    const state = await getAcState();
    res.json({ state })
})

server.get('/temperature', async (req, res) => {
    const response = await getSensiboSensors();
    res.json(response.data.result);
})


 // --------------------------------- Tuya- Heater ---------------------------------

server.post('/heater', async (req, res) => {
    const {value} = req.body;
    const response = await switchHeaterState(value);
    res.json({ response })
})

server.get('/smartthings/v2/devices', async (req, res) => {
    const deviceId = req.query.deviceId || '';
    const response = await smartThingsGetDevices(deviceId);
    res.json(response)
})


server.post('/smartthings/v2/switch', async (req, res) => {
    console.log("smart things SWITCH", req.body.state)

    // const response = await switchWasherWater(req.body.state)
})

server.post('/smartthings/v2/devices/:deviceId/switch', async (req, res) => {
    const deviceId = req.url.split('/')[4];
    const status = req.body.status;
    const response = await switchWasherWater(deviceId, status)
    res.json(response.data)
})

 // --------------------------------- Location ---------------------------------

server.post('/location', async (req, res) => {
    // console.log(req.body)
    const distance = await checkforUserDistance(req.body.location);
    res.json({ distance })
})
 // --------------------------------- Devices ---------------------------------

server.get('/devices',async (req,res) => {
   const devices = await getDevices();
    return res.json(devices);
})

// getHeaterState();


// setInterval(async() => {
//     // removeAllSensorValues();
//     await removeSensorValueByType('temperature');
//     await removeSensorValueByType('humidity');
//     await parseSensorAndWriteToMongo();
//     await getFunctionsFromDB();

// }, 20000);



server.listen(port, () => console.log(`listening on port ${port}`));