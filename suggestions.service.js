const Suggestion = require("./Suggestion");
const axios = require("axios");
const { getLatestSensorValues } = require("./sensorValues.service");
const { getCurrentSeasonAndHour } = require("./time.service");
const { convertSeasonToNumber, discretizeDistance, discretizeHour, discretizeHumidity, discretizeTemperature } = require("./utils");

const temperatureMap = {
  1: 15,
  2: 20,
  3: 27,
  4: 35
}
const generateRule = (suggestion) => {
  const { device, evidence, state } = suggestion;
  const isAcDevice = device.toLowerCase() === 'ac';
  const conditions = Object.entries(evidence).map(condition => {
    const [key, value] = condition;
    return `${key} < ${temperatureMap[value]}`;
  }).join(' AND ');

  const action = `("${device} ${state}")`;

  const generatedRule = `IF ${conditions} THEN TURN${action}`;
  return generatedRule;

}

async function updateRulesForExistingSuggestions() {
  try {
    // Fetch suggestions without a 'rule' key
    const suggestionsWithoutRule = await Suggestion.find({ rule: { $exists: false } });

    // Iterate through the suggestions and generate a rule for each
    for (const suggestion of suggestionsWithoutRule) {
      const rule = generateRule(suggestion); // Use the generateRule function to generate the rule
      await Suggestion.updateOne({ id: suggestion.id }, { $set: { rule: rule } }); // Update the suggestion with the generated rule
    }
  } catch (error) {


    console.error(`Error updating rules for existing suggestions: ${error}`);
  }

}





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
  try {
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
      temperature: discretizeTemperature(parseFloat(currentTemperature)),
      humidity: discretizeHumidity(parseFloat(currentHumidity)),
      distance_from_house: discretizeDistance(parseFloat(currentDistance)),
      season: convertSeasonToNumber(season),
      hour: discretizeHour(hour),
    };


    // Call the recommend_device function with the evidence
    const response = await axios.post("http://localhost:5000/recommend_device", {
      devices: devices,
      evidence: evidence,
    });

    const recommendedDevices = response.data;
    // Add the suggestions to the MongoDB database
    for (const recommendedDevice of recommendedDevices) {
      if (recommendedDevice.recommendation === "on") {
        const deviceName = recommendedDevice.variables[0]; // Extract the device name from the variables array
    
        const suggestionData = {
          device: deviceName,
          evidence: {
            Temperature: evidence.temperature,
            distance: evidence.distance_from_house,
            humidity: evidence.humidity,
          },
          state: "on",
        };
    
        const rule = generateRule(suggestionData);
    
        // Check if a suggestion with the same rule already exists in the database
        const existingSuggestion = await Suggestion.findOne({ rule: rule });
    
        // If a suggestion with the same rule doesn't exist, save the new suggestion
        if (!existingSuggestion) {
          const suggestion = new Suggestion({
            id: Math.floor(10000000 + Math.random() * 90000000),
            ...suggestionData,
            rule,  // Add the rule property
          });
          console.log({suggestion});
          await suggestion.save();
        }
      }
    }
    
  } catch (error) {
    console.error('Error while making request to Python server:', error);
  }
}


const addSuggestionMenually = async (suggestion) => {
  try {
    const newSuggestion = new Suggestion(suggestion);
    newSuggestion.id = Math.floor(10000000 + Math.random() * 90000000);
    const response = await newSuggestion.save();
    return { statusCode: 200, data: response.data };
  } catch (err) {
    return { statusCode: 404, data: "Cant Add Suggestion - " + err.message };
  }
};

const updateSuggestions = async (key, value) => {
  try {
    const response = await Suggestion.updateMany(
      {},
      { [key]: value },
      { multi: true }
    );
    return { statusCode: 200, data: response.data };
  } catch (error) {
    console.log(`Error updating suggestion: ${error}`);
    return { statusCode: 500, data: "Internal server error" };
  }
};

const deleteSuggestion = async (id) => {
  try {
    const response = await Suggestion.deleteOne({ id: id });
    return { statusCode: 200, data: response.data };
  } catch (error) {
    return { statusCode: 400, data: "Cannot delete rule: " + error.message };
  }
};

module.exports = {
  getSuggestions,
  addSuggestionsToDatabase,
  addSuggestionMenually,
  updateSuggestions,
  deleteSuggestion,
  updateRulesForExistingSuggestions,
  generateRule
};
