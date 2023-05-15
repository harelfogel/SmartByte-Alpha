const Rule = require("./Rule");
const { ObjectId } = require("bson");
const checkForDevices = (rule) => {
  const devices = [];
  if (/\b(ac)\b/i.test(rule)) devices.push("ac");
  if (/\b(heater)\b/i.test(rule)) devices.push("heater");
  if (/\b(dishwasher)\b/i.test(rule)) devices.push("dishwasher");
  return devices;
};

const decideOnState = (rule) => {
  return /\b(off)\b/i.test(rule) ? "on" : "off";
};

const validateRule = (rule) => {
  const parsedRule = rule.split(" ");
  if (parsedRule[0] !== "IF") {
    return {
      statusCode: 400,
      message: "Rule must start with IF",
    };
  }
  const operator = /\b(<)\b/i.test(rule)
    ? "<"
    : /\b(>)\b/i.test(rule)
      ? ">"
      : /\b(=)\b/i.test(rule)
        ? "="
        : null;
  // if (!operator) {
  //     return {
  //         statusCode: 400,
  //         message: 'Rule must contain one of theses operators: <, >, ='
  //     }
  // }
  const sensor = parsedRule[1].split(operator)[0];

  if (!/^(temperature|distance|humidity|hour|season)$/.test(sensor)) {
    return {
      statusCode: 400,
      message:
        "Rule must contain one of theses parameters: temperature, distance, humidity,hour or season",
    };
  }

  return {
    statusCode: 200,
    message: "Rule validated successfully",
  };
};

const checkIfRuleIsAlreadyExists = async (rule) => {
  const existingRule = await Rule.findOne({ rule: rule });
  if (existingRule) return true;
  return false;
};

// IF Temperature<10 THEN TURN("ac on 22")

const insertRuleToDB = async (rule, isStrict) => {
  try {
    const ruleValidation = validateRule(rule);
    if (ruleValidation.statusCode === 400) {
      return {
        statusCode: ruleValidation.statusCode,
        message: ruleValidation.message,
      };
    }
    if(checkIfRuleIsAlreadyExists(rule)){
      return { statusCode: 200, message: "rule is already exists" };
    }

    const newRule = new Rule({ rule, isStrict });
    newRule.id = Math.floor(10000000 + Math.random() * 90000000);
    await newRule.save();

    return {
      statusCode: 200,
      message: "Rule added successfully",
    };
  } catch (err) {
    return {
      statusCode: 500,
      message: `Error adding rule - ${err}`,
    };
  }
};

const removeRuleFromDB = async (id) => {
  try {
    console.log("--------Delete Rule--------");
    await Rule.deleteOne({ id: id });
    return {
      statusCode: 200,
      message: "Rule deleted successfully",
    };
  } catch (err) {
    return {
      statusCode: 500,
      message: `Error deleting rule - ${err}`,
    };
  }
};

const backupokdInsertToDb = async (rule, isStrict) => {
  try {
    const devices = checkForDevices(rule);

    let parserRule = rule.split("THEN");
    const state = decideOnState(rule);

    devices.map((device) => {
      parserRule[0] = parserRule[0] + `AND ${device}==${state} `;
    });
    parserRule = parserRule.join("THEN");
    const newRule = new Rule({ rule });
    await newRule.save();

    return {
      statusCode: 200,
      message: "Rule added successfully",
    };
  } catch (err) {
    return {
      statusCode: 500,
      message: `Error adding rule - ${err}`,
    };
  }
};

const getAllRules = async () => {
  try {
    const rules = await Rule.find();
    return {
      statusCode: 200,
      data: rules,
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: `Error fetching rules - ${error}`,
    };
  }
};

const updateRule = async (ruleId, updateFields) => {
  try {
    const rule = updateFields?.rule || "";
    if (rule !== "") {
      const ruleValidation = validateRule(rule);
      if (ruleValidation.statusCode === 400) {
        return {
          statusCode: ruleValidation.statusCode,
          message: ruleValidation.message,
        };
      }
    }
    await Rule.updateOne({ id: ruleId }, { $set: updateFields });
    return {
      statusCode: 200,
      message: "Rule updated successfully",
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: `Error updating rule - ${error}`,
    };
  }
};

async function deleteRuleById(ruleId) {
  try {
    const result = await Rule.deleteOne({ id: ruleId });

    if (result.deletedCount === 1) {
      return { status: 200 };
    } else {
      return { status: 400 };
    }
  } catch (error) {
    console.error("Error deleting rule:", error);
    return { status: 500 };
  }
}

module.exports = {
  insertRuleToDB,
  getAllRules,
  updateRule,
  removeRuleFromDB,
  deleteRuleById,
  checkIfRuleIsAlreadyExists,
};
