const SensorValue = require('./SensorValue');

async function getLatestTemperatureAndHumidity() {
    try {
        const temperature = await SensorValue.findOne({ sensor_type: 'temperature' }).sort({ timestamp: -1 }).exec();
        const humidity = await SensorValue.findOne({ sensor_type: 'humidity' }).sort({ timestamp: -1 }).exec();
        return { temperature: temperature.value, humidity: humidity.value };
    } catch (error) {
        console.error(`Error fetching latest temperature and humidity: ${error}`);
        throw error;
    }
}


module.exports = {
    getLatestTemperatureAndHumidity
}