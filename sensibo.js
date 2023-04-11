const { default: axios } = require("axios");
const Device = require("./Device");
const SensorValue = require('./SensorValue');

const test = 0;
const checkForDegrees = async (func) => {
  try{
    let response;
    const state = func.split(' ')[1];
    
    if(state !== 'on' && state!== 'off'){
      throw new Error('Invalid state');
    }
    const boolState = state === 'on';
    const numberPattern = /\d+/;
    const matches = func.match(numberPattern);
    if (matches && matches.length > 0) {
      const degrees = matches[0];
      if(degrees > 30 || degrees < 16){
        throw new Error('Degrees has to be between 16 and 30');
      }
      response = await switchAcState(boolState,parseInt(degrees));
    } else {
      response = await switchAcState(boolState);
    }
    return response;
    
  }catch(err){
    return {statusCode: 403, data: err.message}
  }
}

const switchAcState = async (state, temperature = null) => {
    console.log("switchAcState")
    console.log({state, temperature})

    try{
        const response = await axios.post(`https://home.sensibo.com/api/v2/pods/${process.env.SENSIBO_DEVICE_ID}/acStates?apiKey=${process.env.SENSIBO_API_KEY}`,{
           "acState":{
              "on": state,
              "targetTemperature": temperature
              
           }
        })
        console.log("AC changed ", state)
        await Device.updateOne({device_id: '9EimtVDZ'}, {state: state ? 'on' : 'off'});
        console.log(response.data)
        return {statusCode: 200, data: response.data.result};

    } catch(err){
        console.log(err+" Invalid read from Sensibo");
        return {statusCode: 403, data: err.message};
    }

}


const getAcState = async () => {
    try{
        const response= await axios.get(`https://home.sensibo.com/api/v2/pods/${process.env.SENSIBO_DEVICE_ID}/acStates?apiKey=${process.env.SENSIBO_API_KEY}`)
        const state = response.data.result[0].acState;
        return state;
    } catch(err){
        console.log(err + " Ivalid read from Sensibo");
    }
}


const getSensiboSensors= async() =>{
    try{
        const response= await axios.get(`https://home.sensibo.com/api/v2/pods/${process.env.SENSIBO_DEVICE_ID}/measurements?fields=temperature,humidity&apiKey=${process.env.SENSIBO_API_KEY}`);
        return response;

    } catch(err){
        console.log(err);
    }
}




const parseSensorAndWriteToMongo = async () => {
  try {
    console.log(`parseSensorAndWriteToMongo`);
    // Fetch the current temperature and humidity values
    const response = await getSensiboSensors();
    const data = response.data.result[0];
    const { temperature, humidity } = data;
    const temperatureValue = `VAR temperature=${temperature.toFixed(1)}`;
    const humidityValue = `VAR humidity=${humidity.toFixed(1)}`;
    const temperatureDocument = new SensorValue({ value: temperatureValue, sensor_type: 'temperature' });
    const humidityDocument = new SensorValue({ value: humidityValue, sensor_type: 'humidity' });
    
    await Promise.all([temperatureDocument.save(), humidityDocument.save()]);

    // console.log(`Temperature: ${temperature} Humidity: ${humidity} saved to database.`);
  } catch (error) {
    console.error(error);
  }
};



const removeAllSensorValues = async () => {
    try {
      console.log(`removeAllSensorValues`)
      const result = await SensorValue.deleteMany({});
      //console.log(`Removed ${result.deletedCount} documents from the sensor_values collection.`);
    } catch (error) {
      console.error(error);
    }
  };



module.exports = {
    switchAcState,
    getAcState,
    getSensiboSensors,
    parseSensorAndWriteToMongo,
    removeAllSensorValues,
    checkForDegrees
}