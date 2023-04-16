const Suggestion = require("./Suggestion");
const axios = require("axios");
const { getLatestSensorValues } = require("./sensorValues.service");
const { getCurrentSeasonAndHour } = require("./time.service");

const getSuggestions = async () => {
  try {
    const suggestions = await Suggestion.find();
    return { statusCode: 200, data: suggestions };
  } catch (error) {
    console.error(`Error getting suggestions: ${error}`);
    return { statusCode: 500, data: "Internal server error" };
  }
};

async function addSuggestionsToDatabase() {
  const latestSensorValues = await getLatestSensorValues();
  const { season, hour } = getCurrentSeasonAndHour();
  const currentTemperature = latestSensorValues.temperature;
  const currentHumidity = latestSensorValues.humidity;
  const currentDistance = latestSensorValues.distance;

  const devices = [
    "lights",
    "fan",
    "ac_status",
    "heater_switch",
    "laundry_machine",
  ];
  const evidence = {
    temperature: currentTemperature,
    humidity: currentHumidity,
    distance_from_house: currentDistance,
    season: season,
    hour: hour,
  };

  // Call the recommend_device function with the evidence
  const response = await axios.post("http://localhost:5000/recommend_device", {
    devices: devices,
    evidence: evidence,
  });

  const recommendedDevices = response.data;

  // Add the suggestions to the MongoDB database
  for (const recommendedDevice of recommendedDevices) {
    const suggestion = new Suggestion({
      id: Math.floor(10000000 + Math.random() * 90000000),
      device: recommendedDevice.device,
      evidence: {
        Temperature: evidence.temperature,
        distance: evidence.distance_from_house,
        humidity: evidence.humidity,
      },
      state: "on",
    });
    await suggestion.save();
  }
}

const addSuggestionMenually = async (suggestion) => {
  try {
    console.log({ suggestion });
    const newSuggestion = new Suggestion(suggestion);
    newSuggestion.id = Math.floor(10000000 + Math.random() * 90000000);
    console.log({ newSuggestion });
    const response = await newSuggestion.save();
    return { statusCode: 200, data: response.data };
  } catch (err) {
    return { statusCode: 404, data: "Cant Add Suggestion - " + err.message };
  }
};

const updateSuggestions = async (key, value) => {
  try {
    console.log({ key, value });
    const response = await Suggestion.updateMany(
      {},
      { [key]: value },
      { multi: true }
    );
    console.log({ response });
    return { statusCode: 200, data: response.data };
  } catch (error) {
    console.log(`Error updating suggestion: ${error}`);
    return { statusCode: 500, data: "Internal server error" };
  }
};

module.exports = {
  getSuggestions,
  addSuggestionsToDatabase,
  addSuggestionMenually,
  updateSuggestions
};
