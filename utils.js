function discretizeTemperature(temperature) {
    if (temperature <= 15) return 1;
    if (temperature <= 20) return 2;
    if (temperature <= 27) return 3;
    return 4;
  }
  
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

  module.exports={
    discretizeTemperature,
    discretizeDistance,
    discretizeHour,
    discretizeHour,
    discretizeHumidity,
    convertSeasonToNumber
  }