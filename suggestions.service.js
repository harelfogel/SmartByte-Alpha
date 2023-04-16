const Suggestion = require("./Suggestion");

const getSuggestions = async () => {
  try {
    const suggestions = await Suggestion.find();
    return { statusCode: 200, data: suggestions };
  } catch (error) {
    console.error(`Error getting suggestions: ${error}`);
    return { statusCode: 500, data: "Internal server error" };
  }
};

// const updateSuggestions = async (id, key = "isNew", value = false) => {
//   try {
//     console.log({id, key, value});
//     const response = await Suggestion.updateOne({ id: '72849164' }, { isNew: false });
//     console.log(response);
//     return { statusCode: 200, data: response.data };
//   } catch (error) {
//     console.log(`Error updating suggestion: ${error}`);
//     return { statusCode: 500, data: "Internal server error" };
//   }
// };

const updateSuggestions = async (key, value) => {
  try {
    console.log({ key, value });
    const response = await Suggestion.updateMany(
      {},
      { [key]: value },
      { multi: true }
    );
    console.log({ response });
    return { statusCode: 200, data: response.data };
  } catch (error) {
    console.log(`Error updating suggestion: ${error}`);
    return { statusCode: 500, data: "Internal server error" };
  }
};

const addNewSuggestion = async (suggestion) => {
  try {
    console.log({ suggestion });
    const newSuggestion = new Suggestion({ suggestion });
    newSuggestion.id = Math.floor(10000000 + Math.random() * 90000000);
    console.log({newSuggestion})
    // await newSuggestion.save();

    return {
      statusCode: 200,
      message: "Suggestion added successfully",
    };
  } catch (error) {
    return { statusCode: 400, data: "Can't add suggestion: " + error.message };
  }
};

// newRule.id = Math.floor(10000000 + Math.random() * 90000000);

module.exports = {
  getSuggestions,
  updateSuggestions,
  addNewSuggestion,
};
