const Rule = require("./Rule");

const checkForDevices = (rule) => {
    const devices = [];
    if (/\b(ac)\b/i.test(rule))
        devices.push('ac');
    if (/\b(heater)\b/i.test(rule))
        devices.push('heater');
    if (/\b(dishwasher)\b/i.test(rule))
        devices.push('dishwasher');
    return devices;
}

const decideOnState = (rule) => {
    return (/\b(off)\b/i.test(rule) ? 'on' : 'off')
}

const validateRule = (rule) => {
    console.log({rule});
    const parsedRule = rule.split(' ');
    console.log({parsedRule});
    if(parsedRule[0] !== 'IF'){
        return {
            statusCode: 400,
            message: 'Rule must start with IF'
        }
    }
    const operator = 
        /\b(<)\b/i.test(rule) ? '<' :
        /\b(>)\b/i.test(rule) ? '>' : 
        /\b(=)\b/i.test(rule) ? '=' : null;
    if(!operator) {
        return {
            statusCode: 400,
            message: 'Rule must contain one of theses operators: <, >, ='
        }
    }
    const sensor = parsedRule[1].split(operator)[0];
    console.log({sensor});
    if(sensor !== 'Temperature' && sensor !== 'distance' && sensor !== 'Humidity') {
        return {
            statusCode: 400,
            message: 'Rule must contain one of theses sensors: Temperature, distance, Humidity'
        }
    }

    return {
        statusCode: 200,
        message: 'Rule validated successfully'
    }
}

// IF Temperature<10 THEN TURN("ac on 22")

const insertRuleToDB = async (rule) => {
    try {
        const ruleValidation = validateRule(rule);
        if(ruleValidation.statusCode === 400) {
            return {
                statusCode: ruleValidation.statusCode,
                message: ruleValidation.message
            }
        }
        const newRule = new Rule({ rule });
        newRule.id = Math.floor(10000000 + Math.random() * 90000000);
        await newRule.save();

        return {
            statusCode: 200,
            message: 'Rule added successfully'
        }
    } catch (err) {
        return {
            statusCode: 500,
            message: `Error adding rule - ${err}`
        }
    }
}


const backupokdInsertToDb = async (rule, isStrict) => {
    try {
        const devices = checkForDevices(rule);

        let parserRule = rule.split("THEN"); 
        const state = decideOnState(rule);

        devices.map(device => {
            parserRule[0] = parserRule[0] + `AND ${device}==${state} `
        })
        parserRule = parserRule.join('THEN');
        const newRule = new Rule({ rule });
        await newRule.save();

        return {
            statusCode: 200,
            message: 'Rule added successfully'
        }
    } catch (err) {
        return {
            statusCode: 500,
            message: `Error adding rule - ${err}`
        }
    }
}


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


  const setRuleActive = async (ruleId, isActive) => {
    try{
        await Rule.updateOne({id: ruleId}, {$set: {isActive: isActive}});
        return {
            statusCode: 200,
            message: 'Rule updated successfully',
        };
    } catch (error) {
        return {
            statusCode: 500,
            message: `Error updating rule - ${error}`,
        };
    }
  }


module.exports = {
    insertRuleToDB,
    getAllRules,
    setRuleActive
}