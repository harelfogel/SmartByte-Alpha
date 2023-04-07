const axios = require('axios');


function classifyHour(hour) {
    if (hour >= 0 && hour < 12) {
      return 1;
    } else if (hour >= 12 && hour < 18) {
      return 2;
    } else {
      return 3;
    }
  }
  
  function classifyTemperature(temperature) {
    if (temperature <= 15) {
      return 1;
    } else if (temperature > 15 && temperature <= 20) {
      return 2;
    } else if (temperature > 20 && temperature <= 25) {
      return 3;
    } else {
      return 4;
    }
  }
  
  function classifyHumidity(humidity) {
    if (humidity <= 30) {
      return 1;
    } else if (humidity > 30 && humidity <= 60) {
      return 2;
    } else if (humidity > 60 && humidity <= 90) {
      return 3;
    } else {
      return 4;
    }
  }
  
  function classifyDistance(distance) {
    if (distance <= 0.01) {
      return 1;
    } else if (distance > 0.01 && distance <= 20) {
      return 2;
    } else {
      return 3;
    }
  }
  
  function classifySeason(season) {
    const seasonMapping = {
      winter: 1,
      spring: 2,
      summer: 3,
      fall: 4,
    };
    return seasonMapping[season];
  }
  


async function callBayesianScript(requestData) {
  // Classify numerical values into categorical values
  const evidence = {
    hour: classifyHour(requestData.hour),
    temperature: classifyTemperature(requestData.temperature),
    humidity: classifyHumidity(requestData.humidity),
    distance_from_house: classifyDistance(requestData.distance_from_house),
    season: classifySeason(requestData.season),
  };

  try {
    const response = await axios.post('http://127.0.0.1:5000/recommend_device', {
      device: requestData.device,
      evidence: evidence,
    });

    return response.data;
  } catch (error) {
    console.error(`Python API error: ${error}`);
    throw error;
  }
}

module.exports = {
    callBayesianScript
}

