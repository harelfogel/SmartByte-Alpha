const axios = require('axios');
const { getLatestSensorValues } = require('../services/sensorValues.service');
const { getCurrentSeasonAndHour } = require('../services/time.service');
require('dotenv').config();
const { getDevices } = require('../services/devices.service.js');
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
  try {
    const response = await axios.post(`${process.env.PYTHON_SERVER_URL}/recommend_device`, {
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
    // reall values
    const devices = await getDevices();
    const ac_status = devices[1].state;
    const heater_switch = devices[2].state
    const laundry_machine = devices[0].state
    const { season } = getCurrentSeasonAndHour()
    const timestamp = getRoundedDate()
    const { temperature, humidity, distance } = await getLatestSensorValues()

    // random values
    const lights = getRandomOnOffValue()
    const fan = getRandomOnOffValue()
    const ac_temperature = getRandomValue(30, 16, 1)
    const ac_mode = ac_temperature > 25 ? "heat" : "cool"
    const ac_energy = getRandomValue(5, 100, 1)
    const ac_duration = getRandomValue(50, 200, 1)
    const heater_energy = getRandomValue(50, 200, 2)
    const heater_duration = getRandomValue(30, 100, 1)
    const lights_energy = getRandomValue(30, 100, 2)
    const lights_duration = getRandomValue(30, 300, 1)
    const laundry_energy = getRandomValue(30, 100, 1)
    const laundry_duration = getRandomValue(30, 100, 1)
    const requestData = {
      timestamp,
      lights,
      fan,
      ac_status,
      ac_temperature,
      ac_mode,
      heater_switch,
      laundry_machine,
      temperature: extractValueFromString(temperature),
      humidity: extractValueFromString(humidity),
      distance: extractValueFromString(distance),
      season,
      ac_energy,
      ac_duration,
      heater_energy,
      heater_duration,
      lights_energy,
      lights_duration,
      laundry_energy,
      laundry_duration
    };
    try {
      const response = await axios.post('http://127.0.0.1:5000/update_data', {
        data: requestData
      });
      console.log("Added data to csv file ended succussfully")
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

function getRandomOnOffValue() {
  return ['on', 'off'][Math.floor(Math.random() * 2)];
}

function getRandomValue(maxVal, minVal, numberAfterTheDot) {
  let randomFloat = Math.random() * (maxVal - minVal) + minVal;
  return Number(randomFloat.toFixed(numberAfterTheDot));
}


module.exports = {
  callBayesianScript,
  runBayesianScript,
  addingDataToCsv,
  classifyHour
}

