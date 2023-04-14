const axios = require('axios');
const { getLatestSensorValues } = require('./sensorValues.service');
const { getCurrentSeasonAndHour } = require('./time.service');
const { getDevices } = require('./devices.service.js');
const { DateTime } = require('luxon');





function classifyHour(hour) {
    if (hour >= 0 && hour < 12) {   // morning
      return 1;  
    } else if (hour >= 12 && hour < 18) { // afternoon
      return 2;
    } else {   //evening
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

  console.log({evidence});
  console.log(requestData.devices);
  try {
    const response = await axios.post('http://127.0.0.1:5000/recommend_device', {
      devices: requestData.devices,
      evidence: evidence,
    });

    return response.data;
  } catch (error) {
    console.error(`Python API error: ${error}`);
    throw error;
  }
}

async function runBayesianScript() {
  console.log('Baysian Script is called!');
  try {
    const devices = ["heater_switch", "lights", "ac_status", "fan", "laundry_machine"];
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
    console.log(recommendation); // Do something with the recommendation
  } catch (error) {
    console.error(`Error getting recommendation: ${error}`);
  }
}

async function addingDataToCsv() {
  console.log("Adding data to csv file")
  try {
    const devices = await getDevices();
    const ac_status = devices[1].state;
    const heater_switch = devices[2].state
    const laundry_machine = devices[0].state
    const { season } = getCurrentSeasonAndHour()
    const timestamp = getRoundedDate()
    const {temperature,humidity,distance}= await getLatestSensorValues();
    const requestData = {
      timestamp,
      ac_status,
      heater_switch,
      laundry_machine,
      temperature: extractValueFromString(temperature),
      humidity: extractValueFromString(humidity),
      distance: extractValueFromString(distance),
      season,
    };
    try {
      const response = await axios.post('http://127.0.0.1:5000/update_data', {
        data: requestData
      });
      return response.data;
    } catch (error) {
      console.error(`Python API error: ${error}`);
      throw error;
    }
  } catch (error) {
    console.error(`Error Adding data to csv: ${error}`);
  }
}

function getRoundedDate() {
  let now = DateTime.local().setZone('Asia/Jerusalem');
  let desiredHours = [8, 12, 14, 18, 20];
  let currentHour = now.hour;

  // Calculate the index of the closest desired hour
  let closestIndex = desiredHours.reduce((prev, curr, index) => {
    let prevDiff = Math.abs(prev - currentHour);
    let currDiff = Math.abs(curr - currentHour);
    return currDiff < prevDiff ? index : prev;
  }, 0);

  // Round to the previous closest desired hour
  let closestHour = desiredHours[closestIndex];
  if (closestHour > currentHour) {
    closestIndex = closestIndex > 0 ? closestIndex - 1 : desiredHours.length - 1;
    closestHour = desiredHours[closestIndex];
  }

  // Format the date as a string in the desired format
  let roundedDate = now.set({ hour: closestHour, minute: 0, second: 0, millisecond: 0 });
  let formattedDate = roundedDate.toFormat('yyyy-MM-dd HH:mm:ss');

  return formattedDate;
}

function extractValueFromString(str) {
  const regex = /\d+\.\d+/;
  const match = str.match(regex);
  if (match) {
    return match[0];
  } else {
    return null;
  }
}


module.exports = {
    callBayesianScript,
    runBayesianScript,
    addingDataToCsv
}

