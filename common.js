const { default: axios } = require("axios");
const Function = require("./Function");
const SensorValue = require("./SensorValue");
const { switchAcState, checkForDegrees } = require("./sensibo");


const removeSensorValueByType = async (sensorType) => {
    try {
        const response = await SensorValue.deleteMany({sensor_type: sensorType});
        console.log(`${sensorType} has been deleted`)
    } catch(e) {
        console.log(e)
    }
}

const getFunctionsFromDB =  async () => {
    try {
        const functions = await Function.find();
        const response = await Function.deleteMany({});
        console.log(response.data);
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
            response = await checkForDegrees(func)
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
    console.log({state})
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