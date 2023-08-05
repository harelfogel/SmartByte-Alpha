const SensorValue = require('../models/SensorValue');
const _ = require("lodash");
const { SENSORS } = require('../utils/common');

async function getLatestSensorValues() {
    try {
        const temperature = await SensorValue.findOne({ sensor_type: 'temperature' }).sort({ timestamp: -1 }).exec();
        const humidity = await SensorValue.findOne({ sensor_type: 'humidity' }).sort({ timestamp: -1 }).exec();
        const distance = await SensorValue.findOne({ sensor_type: 'distance' }).sort({ timestamp: -1 }).exec();
        const soil = await SensorValue.findOne({ sensor_type: 'soil' }).sort({ timestamp: -1 }).exec();
        const season = await SensorValue.findOne({ sensor_type: 'season' }).sort({ timestamp: -1 }).exec();
        const hour = await SensorValue.findOne({ sensor_type: 'hour' }).sort({ timestamp: -1 }).exec();
        return { 
            [SENSORS.TEMPERATURE]: _.get(temperature,'value'),
            [SENSORS.HUMIDITY]: _.get(humidity,'value'), 
            [SENSORS.DISTANCE]: _.get(distance,'value'), 
            [SENSORS.SOIL]: _.get(soil,'value'), 
            [SENSORS.SEASON]: _.get(season, 'value'), 
            [SENSORS.HOUR]: _.get(hour, 'value')
        };
    } catch (error) {
        console.error(`Error fetching latest temperature and humidity and distance: ${error}`);
        throw error;
    }
}

module.exports = {
    getLatestSensorValues
}