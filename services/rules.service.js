const Rule = require("../models/Rule");
const { ObjectId } = require("bson");
const { getSensors } = require("./sensors.service");
const { createRegexPattern } = require("../utils/utils");
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

const validateRule = async (rule) => {
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

  const room = rule.split("in ")[1];

  const sensorsResponse = await getSensors();
  const sensors = sensorsResponse.map(({ name }) => name);

  const sensorsRegex = createRegexPattern(sensors);

  if (!sensorsRegex.test(sensor)) {
    console.log("invalid RULE");
    return {
      statusCode: 400,
      message: `Rule must contain one of theses sensor's parameters: ${sensors
        .map((sensor) => sensor)
        .join(", ")}.`,
    };
  }

  if (
    !/\b(kitchen|living room|dining room|bedroom|bathroom|bedroom)\b/i.test(
      rule
    )
  ) {
    return {
      statusCode: 400,
      message: "You must specify a room",
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
    message: "Rule  validated successfully",
  };
};

const ruleFormatter = (rule) => {
  console.log("RULE FORMATTER")
  const operators = {
    above: ">",
    below: "<",
    ["is not"]: "!=",
    is: "==",
  };

  Object.entries(operators).forEach(operator => {
    rule = rule.replace(operator[0], operator[1]);
  })


  //add (" ")
  const index = rule.indexOf("TURN") + 4;
  rule = rule.slice(0, index) + `("` + rule.slice(index + 1,rule.length) + `")`;
  
  return rule;

};

const insertRuleToDB = async (rule, isStrict) => {
  try {
    rule = ruleFormatter(rule);
    const ruleValidation = await validateRule(rule);
    if (ruleValidation.statusCode === 400) {
      return {
        statusCode: ruleValidation.statusCode,
        message: ruleValidation.message,
      };
    }
    if (rule.includes("season")) {
      if (rule.includes("winter")) {
        rule = rule.replace("winter", "1");
      } else if (rule.includes("spring")) {
        rule = rule.replace("spring", "2");
      } else if (rule.includes("summer")) {
        rule = rule.replace("summer", "3");
      } else if (rule.includes("fall")) {
        rule = rule.replace("fall", "4");
      } else {
        console.log("No specific condition matched.");
      }
    }

    if (rule.includes("hour")) {
      if (rule.includes("morning")) {
        rule = rule.replace("morning", "1");
      } else if (rule.includes("afternoon")) {
        rule = rule.replace("afternoon", "2");
      } else if (rule.includes("evening")) {
        rule = rule.replace("evening", "3");
      } else {
        console.log("No specific condition matched.");
      }
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
    let rule = updateFields?.rule || "";
    if (rule.includes("season")) {
      if (rule.includes("winter")) {
        rule = rule.replace("winter", "1");
      } else if (rule.includes("spring")) {
        rule = rule.replace("spring", "2");
      } else if (rule.includes("summer")) {
        rule = rule.replace("summer", "3");
      } else if (rule.includes("fall")) {
        rule = rule.replace("fall", "4");
      } else {
        console.log("No specific condition matched.");
      }
    }

    if (rule.includes("hour")) {
      if (rule.includes("morning")) {
        rule = rule.replace("morning", "1");
      } else if (rule.includes("afternoon")) {
        rule = rule.replace("afternoon", "2");
      } else if (rule.includes("evening")) {
        rule = rule.replace("evening", "3");
      } else {
        console.log("No specific condition matched.");
      }
    }
    if (rule !== "") {
      const ruleValidation = await validateRule(rule);
      if (ruleValidation.statusCode === 400) {
        return {
          statusCode: ruleValidation.statusCode,
          message: ruleValidation.message,
        };
      }
    }
    updateFields = {
      ...updateFields,
      rule: rule,
    };
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
  validateRule,
};
