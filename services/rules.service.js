const Rule = require("../models/Rule");
const { ObjectId } = require("bson");
const { getSensors } = require("./sensors.service");
const { createRegexPattern } = require("../utils/utils");
const { getUsers } = require("./users.service");
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


const validateSensor = async (rule) => {
  const parsedRule = rule.split(" ");
  const usersResponse = await getUsers();
  const users = usersResponse.data.map(({fullName}) => fullName.split(' ')[0]);

  const sensorsResponse = await getSensors();
  const sensors = sensorsResponse.map(({ name }) => name);


  const sensorsFromRuleString = [];

  parsedRule.forEach((word, idx) => {
    if (word === 'AND' || word === 'IF') {
      sensorsFromRuleString.push(parsedRule[idx + 1]);
    }
  })

  let invalidSensor = null;

  sensorsFromRuleString.forEach(sensor => {
    if(!users.includes(sensor) && !sensors.includes(sensor)) {
     invalidSensor = sensor;
    }
  })

  if(invalidSensor) {
    return {
      statusCode: 400,
      message: `We don't recognize ${invalidSensor}`
    }
  }

  return {
    statusCode: 200,
    message: `All sensors are valid`
  }
  
}

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


const replaceWords = (rule, map) => {
  Object.entries(map).forEach(item => {
    const regex = new RegExp(item[0], 'g');
    rule = rule.replace(regex, item[1]);
  })
  return rule;
}


const validateNormalizedRule = (rule) => {

}

const createUserDistanceMap = (users) => {
  return users.reduce((map, user) => {
    map[user] = `${user}_distance`;
    return map;
  }, {})


  
}

const ruleFormatter = async (rule) => {



  const usersResponse = await getUsers();
  const users = usersResponse.data.map(({fullName}) => fullName.split(' ')[0]);
  const usersMap = createUserDistanceMap(users);


  const homeMap = {home: '0.001'}

  // replace operator
  const operators = {
    above: ">",
    below: "<",
    ["is not"]: "!=",
    is: "==",
  };

  const seasons = {
    winter: 1,
    spring: 2,
    summer: 3,
    fall: 4
  }

  const hours = {
    morning: 1,
    afternoon: 2,
    evening: 3
  }

  rule = replaceWords(rule, operators);
  rule = replaceWords(rule, seasons);
  rule = replaceWords(rule, hours);
  rule = replaceWords(rule, usersMap);
  rule = replaceWords(rule, homeMap);



  //add (" ")
  const index = rule.indexOf("TURN") + 4;
  rule = rule.slice(0, index) + `("` + rule.slice(index + 1,rule.length) + `")`;

  
  return rule;

};

const insertRuleToDB = async (rule, isStrict) => {
  try {
    const formattedRule = await ruleFormatter(rule);
    const ruleValidation = await validateRule(formattedRule);
    const sensorsValidation = await validateSensor(rule);



    if(sensorsValidation.statusCode === 400) {
      return {
        statusCode: sensorsValidation.statusCode,
        message: sensorsValidation.message
      }
    }

    if (ruleValidation.statusCode === 400) {
      return {
        statusCode: ruleValidation.statusCode,
        message: ruleValidation.message,
      };
    }
  
    const newRule = new Rule({ rule: formattedRule, normalizedRule: rule, isStrict });
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
