const SensorValue = require('../models/SensorValue');
const _ = require("lodash");

async function getLatestSensorValues() {
    try {
        const temperature = await SensorValue.findOne({ sensor_type: 'temperature' }).sort({ timestamp: -1 }).exec();
        const humidity = await SensorValue.findOne({ sensor_type: 'humidity' }).sort({ timestamp: -1 }).exec();
        const distance = await SensorValue.findOne({ sensor_type: 'distance' }).sort({ timestamp: -1 }).exec();
        return { temperature: _.get(temperature,'value'), humidity: _.get(humidity,'value'), distance: _.get(distance,'value') };
    } catch (error) {
        console.error(`Error fetching latest temperature and humidity and distance: ${error}`);
        throw error;
    }
}

module.exports = {
    getLatestSensorValues
}