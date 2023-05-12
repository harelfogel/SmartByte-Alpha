const { default: axios } = require("axios");
const Function = require("./Function");
const SensorValue = require("./SensorValue");
const { switchAcState, analyzeFunc } = require("./sensibo");


const removeSensorValueByType = async (sensorType) => {
    try {
        const response = await SensorValue.deleteMany({sensor_type: sensorType});
    } catch(e) {
        console.log(e)
    }
}

const getFunctionsFromDB =  async () => {
    try {
        const functions = await Function.find();
        const response = await Function.deleteMany({});
        functions.map(async (func) => {
            await activateDevices(func.function.toLowerCase())
        })
    }catch(e){
        console.log(e);
    }
}

const activateDevices = async (func) => {
    const acPattern = /\b(ac)\b/;
    const heaterPattern = /\b(heater)\b/;

    try {
        let response;
        if (acPattern.test(func)) {
            // switchAcState(true);
            response = await analyzeFunc(func)
        } else if (heaterPattern.test(func)) {
            response = switchHeaterState(true);
        }

        return response;

    }catch(err){
        console.log(err + " activateDevices");
    }


}


const getHeaterState = async () => {
    const SERVER_URL = 'https://tuyaapi.onrender.com'
    const response = await axios.get(`${SERVER_URL}/status`)
    const state = response.data.result[0].value;
}


const switchHeaterState = async (state) => {
    const SERVER_URL = 'https://tuyaapi.onrender.com'
    const currentState = getHeaterState();
    if(currentState == state) return;
    const response = await axios.post(`${SERVER_URL}/control`, {
        code: "switch_1",
        value: state
    })
    
}



module.exports = {
    removeSensorValueByType,
    getFunctionsFromDB,
    getHeaterState,
    activateDevices
}