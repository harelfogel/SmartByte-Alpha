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
  if (rule.includes('season')) {
    if (rule.includes('winter')) {
      rule = rule.replace('winter', '1');
    } else if (rule.includes('spring')) {
      rule = rule.replace('spring', '2');
    } else if (rule.includes('summer')) {
      rule = rule.replace('summer', '3');
    } else if (rule.includes('autumn')) {
      rule = rule.replace('autumn', '4');
    } else {
      console.log('No specific condition matched.');
    }
  }
  const sensor = parsedRule[1].split(operator)[0];



  if (!/^(temperature|distance|humidity|hour|season)$/i.test(sensor)) {
    return {
      statusCode: 400,
      message:
        "Rule must contain one of theses sensor's parameters: temperature, distance, humidity,hour or season",
    };
  }

  if (!/THEN TURN\(".*"\)$/i.test(rule)) {
    return {
      statusCode: 400,
      message: "Rule must contain 'THEN TURN(...)' after the condition",
    };
  }



  return {
    statusCode: 200,
    message: "Rule validated successfully",
  };
};

// IF Temperature<10 THEN TURN("ac on 22")

const insertRuleToDB = async (rule, isStrict) => {
  try {
    const ruleValidation = validateRule(rule);
    console.log({ ruleValidation })
    if (ruleValidation.statusCode === 400) {
      return {
        statusCode: ruleValidation.statusCode,
        message: ruleValidation.message,
      };
    }

    console.log({ isStrict });
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
};
