const Suggestion = require('./Suggestion');

const getSuggestions = async () => {
  try {
    const suggestions = await Suggestion.find();
    return { statusCode: 200, data: suggestions };
  } catch (error) {
    console.error(`Error getting suggestions: ${error}`);
    return { statusCode: 500, data: 'Internal server error' };
  }
};

module.exports = {
  getSuggestions,
};