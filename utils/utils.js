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


const mapHour = (value) => {
  if (value === 1) return 'morning (before 12 PM)';
  if (value === 2) return 'afternoon (12 PM - 6 PM)';
  return 'evening (after 6 PM)';
};

const checkIfHour = (value) => {
  if (value === "morning") return 1;
  if (value === 'afternoon') return 2;
  if (value === 'evening') return 3;
  else return value;
}

const mapHumidity = (value) => {
  if (value === 1) return 'below 30%';
  if (value === 2) return '30-60%';
  if (value === 3) return '60-90%';
  return 'above 90%';
};


const mapSeason = (value) => {
  if (value === 1) return 'winter';
  if (value === 2) return 'spring';
  if (value === 3) return 'summer';
  return 'fall';
};




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




module.exports = {
  discretizeTemperature,
  discretizeDistance,
  discretizeHour,
  discretizeHour,
  discretizeHumidity,
  convertSeasonToNumber,
  mapHour,
  mapHumidity,
  mapSeason,
  checkIfHour,
  createRegexPattern,
  discretizSoil,
  replaceWords
}