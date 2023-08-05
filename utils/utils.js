const { SENSORS } = require("./common");

const discretizeTemperature = (temperature) => {
  if (temperature <= 15) {
    return 1;
  } else if (temperature > 15 && temperature <= 20) {
    return 2;
  } else if (temperature > 20 && temperature <= 25) {
    return 3;
  } else if (temperature > 25 && temperature <= 32) {
    return 4;
  }
};


function discretizeHumidity(humidity) {
  if (humidity <= 30) return 1;
  if (humidity <= 60) return 2;
  if (humidity <= 90) return 3;
  return 4;
}

function discretizeDistance(distance) {
  if (distance <= 0.01) return 1;
  if (distance <= 20) return 2;
  return 3;
}

function discretizeHour(hour) {
  if (hour <= 12) return 1;
  if (hour <= 18) return 2;
  return 3;
}

function discretizSoil(soil) {
  if (soil < 2200) return 1;
  return 2;
}

function convertSeasonToNumber(season) {
  const seasonMapping = {
    'winter': 1,
    'spring': 2,
    'summer': 3,
    'fall': 4
  };
  return seasonMapping[season];
}


const checkIfHour = (value) => {
  if (value === "morning") return 1;
  if (value === 'afternoon') return 2;
  if (value === 'evening') return 3;
  else return value;
}


const createRegexPattern = (words) => {
  let regexPattern = '^(' + words.join('|') + ')$';
  const regex = new RegExp(regexPattern, 'i');
return regex;
}



const replaceWords = (rule, map) => {
  Object.entries(map).forEach((item) => {
    const regex = new RegExp(item[0], "g");
    rule = rule.replace(regex, item[1]);
  });
  return rule;
};

const DISCRETIZE_SENSORS_MAP = {
  [SENSORS.TEMPERATURE]: discretizeTemperature,
  [SENSORS.HUMIDITY]: discretizeHumidity,
  [SENSORS.HOUR]: discretizeHour,
  [SENSORS.SOIL]: discretizSoil,
  [SENSORS.DISTANCE]: discretizeDistance,
  [SENSORS.SEASON]: convertSeasonToNumber,
}




module.exports = {
  discretizeTemperature,
  discretizeDistance,
  discretizeHour,
  discretizeHour,
  discretizeHumidity,
  convertSeasonToNumber,
  checkIfHour,
  createRegexPattern,
  discretizSoil,
  replaceWords,
  DISCRETIZE_SENSORS_MAP
}