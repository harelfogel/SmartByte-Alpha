const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  rule: {
    type: String,
    required: true
  },
  normalizedRule: {
    type: String,
    required: true
  },
  isStrict: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  id: {
    type: String,
    required: true
  }
});

const Rule = mongoose.model('rules', ruleSchema);

module.exports = Rule;
