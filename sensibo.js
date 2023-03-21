const { default: axios } = require("axios");
const SensorValue = require('./models/SensorValue');

const switchAcState = async (state) => {
    console.log('switchAcState')
    try{
        const response= await axios.post(`https://home.sensibo.com/api/v2/pods/${process.env.SENSIBO_DEVICE_ID}/acStates?apiKey=${process.env.SENSIBO_API_KEY}`,{
           "acState":{
               "on": state
           }
        })
        console.log({response})
    } catch(err){
        console.log(err+"Ivalid read from Sensibo");
    }
}


const getAcState = async () => {
    try{
        const response= await axios.get(`https://home.sensibo.com/api/v2/pods/${process.env.SENSIBO_DEVICE_ID}/acStates?apiKey=${process.env.SENSIBO_API_KEY}`)
        const state = response.data.result[0].acState;
        console.log({response})
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
    console.log(`parseSensorAndWriteToMongo`)
    // Fetch the current temperature and humidity values
    const response = await getSensiboSensors();
    const data = response.data.result[0];
    const { temperature, humidity } = data;
    const temperatureValue = `VAR temperature=${temperature.toFixed(1)}`;
    const humidityValue = `VAR humidity=${humidity.toFixed(1)}`;
    const temperatureDocument = new SensorValue({ value: temperatureValue });
    const humidityDocument = new SensorValue({ value: humidityValue });
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
    removeAllSensorValues
}