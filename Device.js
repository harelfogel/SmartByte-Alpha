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
  }
});

const Device = mongoose.model('devices', deviceSchema);

module.exports = Device;
