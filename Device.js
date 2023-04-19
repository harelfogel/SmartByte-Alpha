const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  device_id: {
    type: String,
    required: true
  },
  state: {
    type: String,
    default: false
  },
  name: {
    type: String,
    default: true
  },
  threshold: {  
    type: Number,
    default: 0.6
  },
  mode: {
    type: mongoose.Schema.Types.Mixed, // Flexible field to store different sets of properties
    default: {}
  }
});

const Device = mongoose.model('devices', deviceSchema);

module.exports = Device;
