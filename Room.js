const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: "",
  },
  devices: {
    type: [String],
    default: [],
  },
});

const Room = mongoose.model("rooms", roomSchema);

module.exports = Room;
