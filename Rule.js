const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  rule: {
    type: String,
    required: true
  },
  isStrict: {
    type: Boolean,
    default: false
  }
});

const Rule = mongoose.model('rules', ruleSchema);

module.exports = Rule;
