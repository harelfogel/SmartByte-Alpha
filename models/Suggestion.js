const mongoose = require('mongoose');

const EvidenceSchema = new mongoose.Schema({
  type: String,
  value: Number,
});

const SuggestionSchema = new mongoose.Schema({
  id: String,
  device: String,
  evidence: [EvidenceSchema],
  mode: String,
  state: String,
  rule: String,
  is_new: Boolean,
});

const Suggestion = mongoose.model('suggestions', SuggestionSchema);
module.exports = Suggestion;
