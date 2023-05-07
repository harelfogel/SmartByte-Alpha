const Suggestion = require("./Suggestion");
const axios = require("axios");
const { getLatestSensorValues } = require("./sensorValues.service");
const { getCurrentSeasonAndHour } = require("./time.service");
const { convertSeasonToNumber, discretizeDistance, discretizeHour, discretizeHumidity, discretizeTemperature } = require("./utils");
const { clients } = require("./ws");

const calculateStats = (evidenceValues) => {
  const n = evidenceValues.length;
  const mean = evidenceValues.reduce((sum, value) => sum + value, 0) / n;
  const median = n % 2 === 0 ? (evidenceValues[n / 2 - 1] + evidenceValues[n / 2]) / 2 : evidenceValues[(n - 1) / 2];
  const variance = evidenceValues.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / (n - 1);
  const stdDev = Math.sqrt(variance);
  return { mean, median, stdDev };
};


const getActualEvidenceValue = async (strongestEvidence) => {
  const latestSensorValues = await getLatestSensorValues(); // Get the latest sensor values
  const { season, hour } = getCurrentSeasonAndHour(); // Get the current season and hour

  const actualValues = {
    temperature: latestSensorValues.temperature,
    humidity: latestSensorValues.humidity,
    distance_from_house: latestSensorValues.distance,
    season: season,
    hour: hour,
  };
  return [actualValues[strongestEvidence.evidence]];
};

const mapEvidenceValue = (evidenceType) => {
  const evidenceMaps = {
    hour: { 1: 'morning', 2: 'afternoon', 3: 'evening' },
    temperature: { 1: 15, 2: 20, 3: 25, 4: 27 },
    humidity: { 1: 30, 2: 60, 3: 90, 4: 100 },
    distance_from_house: { 1: 0.01, 2: 20, 3: 100 },
    season: { 1: 'winter', 2: 'spring', 3: 'summer', 4: 'fall' },
  };
  if (evidenceType in evidenceMaps) {
    return evidenceMaps[evidenceType];
  }

  return undefined;
};




const getStrongestEvidence = (evidence) => {
  const strongestEvidence = evidence.reduce((prev, current) =>
    prev.value > current.value ? prev : current
  );
  return strongestEvidence;
};

const getComparisonOperator = (evidence, evidenceValues) => {
  const stats = calculateStats(evidenceValues);
  const comparisonOperators = ["<", ">", "<=", ">="];

  // Calculate quartiles
  const sortedValues = evidenceValues.slice().sort((a, b) => a - b);
  const lowerQuartile = sortedValues[Math.floor(sortedValues.length * 0.25)];
  const upperQuartile = sortedValues[Math.floor(sortedValues.length * 0.75)];

  // Determine which comparison operator to use based on the median
  let chosenOperator;
  if (evidence === 'season' || evidence === 'hour') {
    if (stats.median === stats.mode) {
      chosenOperator = "==";
    } else {
      chosenOperator = "!=";
    }
  } else {
    if (stats.median < lowerQuartile + (upperQuartile - lowerQuartile) * 0.25) {
      chosenOperator = Math.random() < 0.5 ? ">" : ">=";
    } else if (stats.median > lowerQuartile + (upperQuartile - lowerQuartile) * 0.75) {
      chosenOperator = Math.random() < 0.5 ? "<" : "<=";
    } else {
      chosenOperator = Math.random() < 0.5 ? "<=" : ">=";
    }
  }
  return chosenOperator;
};


const generateRule = async (suggestion) => {
  const { device, strongest_evidence, state } = suggestion;
  // Get strongest evidence
  const strongestEvidence = getStrongestEvidence(strongest_evidence);
  const mappedValue = mapEvidenceValue(strongestEvidence.evidence);
  const actualValue = await getActualEvidenceValue(strongestEvidence);
  if (!strongestEvidence.evidence || !mappedValue) {
    console.error("Error: Undefined values encountered in strongest evidence or mapped value");
    return;
  }
  // Get comparison operator
  const comparisonOperators = getComparisonOperator(strongestEvidence.evidence, actualValue);
  const operator = comparisonOperators[Math.floor(Math.random() * comparisonOperators.length)];

  // Get the lower boundary of the current mapping
  const discretizedActualValue = discretizeValue(strongestEvidence.evidence, actualValue); // <-- Added this line
  const value = mappedValue[discretizedActualValue.toString()];
  const conditions = `${strongestEvidence.evidence} ${comparisonOperators} ${value}`;
  const action = `("${device} ${state}")`;

  const generatedRule = `IF ${conditions} THEN TURN${action}`;
  return generatedRule;
};

// Add this new function for discretizing the actual value
const discretizeValue = (evidenceType, actualValue) => {
  switch (evidenceType) {
    case 'temperature':
      return discretizeTemperature(actualValue);
    case 'humidity':
      return discretizeHumidity(actualValue);
    case 'distance_from_house':
      return discretizeDistance(actualValue);
    case 'hour':
      return discretizeHour(actualValue);
    case 'season':
      return convertSeasonToNumber(actualValue);
    default:
      return undefined;
  }
};


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
    console.log('imhere is the add suggestion to the db');
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
        console.log(recommendedDevice.strongest_evidence[0].evidence);
        const deviceName = recommendedDevice.variables[0]; // Extract the device name from the variables array
        const suggestionData = {
          device: deviceName,
          strongest_evidence: [
            {
              evidence: recommendedDevice.strongest_evidence[0].evidence,
              value: recommendedDevice.strongest_evidence[0].value,
            },
          ],
          state: "on",
        };
        const rule = await generateRule(suggestionData);
        console.log({ rule });

        // Check if a suggestion with the same rule already exists in the database
        const existingSuggestion = await Suggestion.findOne({ rule: rule });

        // If a suggestion with the same rule doesn't exist, save the new suggestion
        if (!existingSuggestion) {
          clients.forEach(client => {
            client.send('New Suggestion Added!');
          })
          const suggestion = new Suggestion({
            id: Math.floor(10000000 + Math.random() * 90000000),
            ...suggestionData,
            rule,  // Add the rule property
            is_new: true
          });
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
