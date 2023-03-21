const mongoose = require('mongoose');

const SensorValueSchema = new mongoose.Schema({
  value: String,
  timestamp: { type: Date, default: Date.now }
});

const SensorValue = mongoose.model('sensor_values', SensorValueSchema);

module.exports = SensorValue;
