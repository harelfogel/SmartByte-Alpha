const Rule = require("./Rule");







const insertRuleToDB = async (rule,isStrict) => {
    console.log({rule})
    try {
        const devices = [];
        if(/\b(ac)\b/i.test(rule))
            devices.push('ac');
        if(/\b(heater)\b/i.test(rule))
            devices.push('heater');
        if(/\b(dishwasher)\b/i.test(rule))
            devices.push('dishwasher');

        let parserRule = rule.split("THEN"); 
        let state;
        if(/\b(on)\b/i.test(rule))  
            state = 'off';         
        else if(/\b(off)\b/i.test(rule))  
            state = 'on';  

        devices.map(device => {
            parserRule[0] = parserRule[0] + `AND ${device}==${state} `
        })
        parserRule = parserRule.join('THEN');
        const newRule = new Rule({ rule: parserRule });
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

module.exports = {
    insertRuleToDB
}