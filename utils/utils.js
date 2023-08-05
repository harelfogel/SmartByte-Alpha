// const { SENSORS } = require("./common");

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

const SENSORS = {
  TEMPERATURE: 'temperature',
  HOUR: 'hour',
  HUMIDITY: 'humidity',
  DISTANCE: 'distance',
  SEASON: 'season',
  SOIL: 'soil'
}

const DISCRETIZE_SENSORS_MAP = {
  [SENSORS.TEMPERATURE]: discretizeTemperature,
  [SENSORS.HUMIDITY]: discretizeHumidity,
  [SENSORS.HOUR]: discretizeHour,
  [SENSORS.SOIL]: discretizSoil,
  [SENSORS.DISTANCE]: discretizeDistance,
  [SENSORS.SEASON]: convertSeasonToNumber,
}


const UNDISCRETIZE_SENSORS_MAP = {
  [SENSORS.HOUR]: { 1: "morning", 2: "afternoon", 3: "evening" },
  [SENSORS.TEMPERATURE]: { 1: 15, 2: 20, 3: 25, 4: 27 },
  [SENSORS.HUMIDITY]: { 1: 30, 2: 60, 3: 90, 4: 100 },
  [SENSORS.DISTANCE]: { 1: 0.01, 2: 20, 3: 100 },
  [SENSORS.SEASON]: { 1: "winter", 2: "spring", 3: "summer", 4: "fall" },
};

const returnSeasonNumberByMonth = (currentMonth) =>{
  if (currentMonth >= 3 && currentMonth <= 5) {
    season = 2; // Spring
  } else if (currentMonth >= 6 && currentMonth <= 8) {
    season = 3; // Summer
  } else if (currentMonth >= 9 && currentMonth <= 11) {
    season = 4; // Fall
  } else {
    season = 1; // Winter
  }
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
  DISCRETIZE_SENSORS_MAP,
  UNDISCRETIZE_SENSORS_MAP,
  returnSeasonNumberByMonth
}