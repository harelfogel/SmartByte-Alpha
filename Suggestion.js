const mongoose = require('mongoose');

const SuggestionSchema = new mongoose.Schema({
  id: String,
  device: String,
  evidence: {
    Temperature: Number,
    distance: Number,
    humidity: Number,
  },
  mode: String,
  state: String,
  is_new: Boolean
});

const Suggestion = mongoose.model('suggestions', SuggestionSchema);
module.exports = Suggestion;