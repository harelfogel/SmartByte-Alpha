const Sensor = require('./Sensor');

const getSensors = async () => {
    try {
        const sensors = await Sensor.find();
        return sensors;
    } catch (error) {
        console.error(error);
        return null;
    }
}

module.exports = { getSensors };
