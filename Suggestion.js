const mongoose = require('mongoose');

const SuggestionSchema = new mongoose.Schema({
  device: String,
  evidence: {
    Temperature: Number,
    distance: Number,
    humidity: Number,
  },
  mode: String,
  state: String,
});

module.exports = mongoose.model('suggestions', SuggestionSchema);