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

const mapTemperature = (value) => {
  if (value === 1) return 'below 15°C';
  if (value === 2) return '15-20°C';
  if (value === 3) return '20-27°C';
  return 'above 27°C';
};

const mapHumidity = (value) => {
  if (value === 1) return 'below 30%';
  if (value === 2) return '30-60%';
  if (value === 3) return '60-90%';
  return 'above 90%';
};

const mapDistance = (value) => {
  if (value === 1) return 'below or equal to 0.01 units';
  if (value === 2) return '0.01-20 units';
  return 'above 20 units';
};

const mapSeason = (value) => {
  if (value === 1) return 'winter';
  if (value === 2) return 'spring';
  if (value === 3) return 'summer';
  return 'fall';
};



module.exports = {
  discretizeTemperature,
  discretizeDistance,
  discretizeHour,
  discretizeHour,
  discretizeHumidity,
  convertSeasonToNumber,
  mapHour,
  mapDistance,
  mapHumidity,
  mapSeason,
  mapTemperature
}