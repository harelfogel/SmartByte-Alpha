require("dotenv").config();
const getClientDetails = require("./smartThings.js");
const express = require("express");
const connectDB = require("./config");
const {
  switchAcState,
  getAcState,
  getSensiboSensors,
  parseSensorAndWriteToMongo,
  removeAllSensorValues,
  updateAcMode,
  updateSensiboMode,
} = require("./sensibo.js");
const cors = require("cors");
const { homeConnectAuth, homeConnectToken } = require("./homeConnect.js");
const {
  smartThingsGetDevices,
  switchWasherWater,
} = require("./smartThings2.js");
const { checkforUserDistance } = require("./location.js");
const {
  removeSensorValueByType,
  getFunctionsFromDB,
  getHeaterState,
  activateDevices,
} = require("./common.js");
const {
  insertRuleToDB,
  getAllRules,
  setRuleActive,
  deleteRuleById,
} = require("./rules.service.js");
const { switchHeaterState } = require("./heaterController.js");

const {
  getSuggestions,
  addSuggestionsToDatabase,
  updateSuggestions,
  addSuggestionMenually,
  deleteSuggestion,
  updateRulesForExistingSuggestions,
} = require("./suggestions.service.js");
const { getDevices, updateDeviceModeInDatabase } = require("./devices.service.js");
const {
  callBayesianScript,
  runBayesianScript,
  addingDataToCsv,
} = require("./machineLearning.js");
const { getCurrentSeasonAndHour } = require("./time.service.js");
const { signInUser, registerUser } = require("./users.service");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const schedule = require("node-schedule");

const {connectToWs} = require("./ws.js");

const { getLatestSensorValues } = require("./sensorValues.service.js");
const { response } = require("express");
const Device = require("./Device.js");

require("dotenv").config();

const server = express();
const port = process.env.PORT || 3001;
server.use(express.json());
server.use(cors({ origin: true }));

// Connect to MongoDB
connectDB();

connectToWs();

//Handle get requests
server.get("/", function (req, res) {
  res.json({ message: `Welcome to SmartByte server` });
});

/* Handle POST requests */
server.post("/", function (req, res, next) {
  console.log(req);
  smartapp.handleHttpCallback(req, res);
});

// --------------------------------- Sign up ---------------------------------

server.post("/register", async (req, res) => {
  const { fullName, email, password, role } = req.body;
  const response = await registerUser(fullName, email, password, role);
  res.status(response.status).json({ message: response.message });
});

// --------------------------------- Sign in ---------------------------------

server.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const response = await signInUser(email, password);

  if (response.status === 200) {
    res
      .status(200)
      .json({
        message: response.message,
        token: response.token,
        user: response.user,
      });
  } else {
    res.status(response.status).json({ message: response.message });
  }
});

// --------------------------------- test yovel ---------------------------------
server.post("/test", async (req, res) => {
  let response;
  try {
    response = await activateDevices(req.body.func);
    // console.log({response})
    res.status(response.statusCode).json(response.data);
  } catch (err) {
    res.status(400).json(response.data);
  }
});

// --------------------------------- Rules ---------------------------------
server.get("/rules", async (req, res) => {
  const response = await getAllRules();
  res.status(response.statusCode).json(response.data);
});

// Define the route for adding a new rule
server.post("/rules", async (req, res) => {
  console.log(req.body);
  const { rule, isStrict } = req.body;
  const response = await insertRuleToDB(rule, isStrict);
  res.status(response.statusCode).send(response.message);
});

server.post("/rules/:id", async (req, res) => {
  const { isActive } = req.body;
  const id = req.params.id;
  const response = await setRuleActive(id, isActive);
  return res.status(response.statusCode).send(response.message);
});

server.delete("/rules/:id", async (req, res) => {
  const id = req.params.id;
  try {
    // Assuming you have a function to delete the rule by its ID
    const response = await deleteRuleById(id);
    console.log({ response });

    if (response.status === 200) {
      res.status(200).json({ message: "Rule deleted successfully" });
    } else {
      res.status(400).json({ message: "Error deleting the rule" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// --------------------------------- SmartThings- Laundry ---------------------------------

//Handle get requests
server.get("/smartthings", function (req, res) {
  getClientDetails();
  res.json({ message: `Welcome to smartthings details` });
});

server.get("/homeConnect", (req, res) => {
  homeConnectAuth();
  res.json({ message: "Welcome to Home Connect" });
});

server.get("/homeConnect/callback", (req, res) => {
  // console.log("callback", req.query)
  homeConnectToken(req, res);
  res.json({ message: "token" });
});

// --------------------------------- Sensibo- AC ---------------------------------

server.post("/sensibo", async (req, res) => {
  try {
    console.log("-----------sensibo---------------");
    const state = req.body.state;
    const temperature = req.body.temperature || null;
    console.log({ state, temperature });
    await switchAcState(state, temperature);
    res.json({ statusCode: 200 });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

server.get("/sensibo", async (req, res) => {
  console.log("sensibo get acState");
  const state = await getAcState();
  res.json({ state });
});

server.get("/temperature", async (req, res) => {
  const response = await getSensiboSensors();
  res.json(response.data.result);
});

// server.post("/sensibo/mode", async (req, res) => {
//   try {
//     const mode = req.body.mode;
//     await updateAcMode(mode);
//     res.json({ statusCode: 200 });
//   } catch (err) {
//     return res.status(400).json({ message: err.message });
//   }
  
// });


server.post('/sensibo/mode', async (req, res) => {
  const { deviceId, mode } = req.body;
  const result = await updateSensiboMode(deviceId, mode);

  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(500).json(result);
  }
});


// --------------------------------- Tuya- Heater ---------------------------------

server.post("/heater", async (req, res) => {
  const { value } = req.body;
  const response = await switchHeaterState(value);
  res.json({ response });
});

server.get("/smartthings/v2/devices", async (req, res) => {
  const deviceId = req.query.deviceId || "";
  const response = await smartThingsGetDevices(deviceId);
  res.json(response);
});

server.post("/smartthings/v2/switch", async (req, res) => {
  console.log("smart things SWITCH", req.body.state);

  // const response = await switchWasherWater(req.body.state)
});

server.post("/smartthings/v2/devices/:deviceId/switch", async (req, res) => {
  const deviceId = req.url.split("/")[4];
  const status = req.body.status;
  const response = await switchWasherWater(deviceId, status);
  res.json(response.data);
});

// --------------------------------- Location ---------------------------------

server.post("/location", async (req, res) => {
  // console.log(req.body)
  const distance = await checkforUserDistance(req.body.location);
  res.json({ distance });
});
// --------------------------------- Devices ---------------------------------

server.get("/devices", async (req, res) => {
  const devices = await getDevices();
  return res.json(devices);
});

server.get("/devices_with_thresholds", async (req, res) => {
  const devices = await Device.find({}, { device_id: 1, threshold: 1, _id: 0 });
  return res.json(devices);
});


server.put("/devices/mode", async (req, res) => {
  const { deviceId, mode } = req.body;

  try {
    await updateDeviceModeInDatabase(deviceId, mode);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating mode in the database' });
  }
});



// --------------------------------- Machine Learnign-Recoomnadations ---------------------------------
server.get("/update_data", async (req, res) => {
  try {
    const adding_res = await addingDataToCsv();
    res.status(200).json(adding_res);
  } catch (error) {
    console.error(`Error adding data: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
});

// --------------------------------- Machine Learnign-Recoomnadations ---------------------------------
server.get("/recommend_device", async (req, res) => {
  try {
    const devices = [
      "heater_switch",
      "lights",
      "ac_status",
      "fan",
      "laundry_machine",
    ];
    const { temperature, humidity, distance } = await getLatestSensorValues();
    const { season, hour } = getCurrentSeasonAndHour();
    const requestData = {
      devices,
      distance,
      temperature,
      humidity,
      season,
      hour,
    };

    const recommendation = await callBayesianScript(requestData);
    const recommendationsArray = recommendation.map((item, index) => {
      return {
        device: devices[index],
        state: item.recommendation,
      };
    });
    res.json(recommendationsArray);
  } catch (error) {
    console.error(`Error getting recommendation: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
});


// --------------------------------- Suggestions ---------------------------------
server.get("/suggestions", async (req, res) => {
  try {
    const suggestions = await getSuggestions();
    res.status(200).json(suggestions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching suggestions" });
  }
});

// --------------------------------- Insights-Graph Data ---------------------------------
server.get("/graph-data", async (req, res) => {
  try {
    const device = req.query.device;
    const time_range = req.query.time_range;
    const response = await axios.get(
      `${process.env.PYTHON_SERVER_URL}/graph-data`,
      {
        params: { device, time_range },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching graph data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

server.put("/suggestions", async (req, res) => {
  try {
    // const id = req.params.id;
    Object.entries(req.body).map((suggestion) => {
      [key, value] = suggestion;
      updateSuggestions(key, value);
    });
    console.log({ response });
    res.status(200).send(response.data);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

server.post("/suggestions", async (req, res) => {
  console.log("ADD MANUALLY")
  try {
    const response = await addSuggestionMenually(req.body);
    return res.status(200).send(response.data);
    console.log({ response });
  } catch (err) {}
});

server.delete("/suggestions/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const response = await deleteSuggestion(id);
    return res.status(200).send(response.data);
  }catch(err) {
    return res.status(400).send({ message: err.message });
  }
})

// Schedule the job to run at specific hours
schedule.scheduleJob("0 8,12,14,18,20 * * *", addSuggestionsToDatabase);
// schedule.scheduleJob("0 * * * * *", addSuggestionsToDatabase);

// --------------------------------- Running the ML script ---------------------------------

// const BAYESIAN_SCRIPT_INTERVAL = 600000; // 10 minutes in milliseconds
// setInterval(runBayesianScript, BAYESIAN_SCRIPT_INTERVAL);

// getHeaterState();

// setInterval(async() => {
//     // removeAllSensorValues();
//     await removeSensorValueByType('temperature');
//     await removeSensorValueByType('humidity');
//     await parseSensorAndWriteToMongo();
//     await getFunctionsFromDB();

// }, 20000);

server.listen(port, () => console.log(`listening on port ${port}`));
