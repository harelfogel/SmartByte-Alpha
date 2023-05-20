const { removeSensorValueByType } = require("../utils/common");
const SensorValue = require("../models/SensorValue");


const returnDistanceBetween2Coordinates = (first, second) => {
    return Math.sqrt((Math.pow(first.lat - second.lat, 2)) + (Math.pow(first.lng - second.lng, 2)))
}


const checkforUserDistance = async (userLocation) => {
    const { lat, lng } = userLocation;
    const houseLocation = {
        lat: 32.0766887,
        lng: 34.8002835
    }


    const distance = returnDistanceBetween2Coordinates(userLocation, houseLocation);
    const value = `VAR distance = ${distance.toFixed(8)}`;

    await removeSensorValueByType('distance');
    const distanceDocument = new SensorValue({ value, sensor_type: 'distance' });
    await Promise.all([distanceDocument.save()]);
    return distance;
}




module.exports = {
    checkforUserDistance
}

//(5,3),(6,7) => 4.123