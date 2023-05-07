const { default: axios } = require("axios");
const Device = require("./Device");
const { updateDeviceModeInDatabase } = require("./devices.service");
const SensorValue = require("./SensorValue");

const test = 0;
const analyzeFunc = async (func) => {
  try {
    const forPattern = /\b(for)\b/;
    const isWithDuration = forPattern.test(func);
    let durationString;
    let time, units, durationInMiliSeconds;
    if (isWithDuration) {
      durationString = func.split(" for ")[1];
      time = parseInt(durationString.substring(0, durationString.indexOf(" ")));
      units = durationString.split(" ")[1];
      if(units !== "minutes" && units !== "hours"){
        throw new Error("Units has to be minutes or hours");
      }
      durationInMiliSeconds =
        units === "minutes" ? time * 60 * 1000 : time * 60 * 60 * 1000;
    }

    let response;
    const state = func.split(" ")[1];

    if (state !== "on" && state !== "off") {
      throw new Error("Invalid state");
    }
    const boolState = state === "on";
    const numberPattern = /\d+/g;
    const matches = func.match(numberPattern);
    console.log({ matches });
    let degrees = null;
    if (
      matches &&
      (matches.length > 1 || (matches.length > 0 && !isWithDuration))
    ) {
      degrees = matches[0];
    }
    console.log({ degrees });
    if (degrees) {
      // const degrees = matches[0];
      if (degrees > 30 || degrees < 16) {
        throw new Error("Degrees has to be between 16 and 30");
      }
      response = await switchAcState(boolState, parseInt(degrees));
    } else {
      response = await switchAcState(boolState);
    }
    if(isWithDuration){
      //turn ac off after a duration
      setTimeout( async () => {
        console.log('Turning off');
        response = await switchAcState(false);
        console.log({response})
      }, durationInMiliSeconds)
    }
    return response;
  } catch (err) {
    console.log(err);
    return { statusCode: 403, data: err.message };
  }
};

const validateDegree = (degree) => {
  if (degree > 30 || degree < 16) {
    return false;
  }
  return true;
};

const switchAcState = async (state, temperature = null) => {
  // console.log("switchAcState")
  // console.log({state, temperature})
  console.log({ temperature });
  try {
    if (!temperature || validateDegree(temperature)) {
      const response = await axios.post(
        `https://home.sensibo.com/api/v2/pods/${process.env.SENSIBO_DEVICE_ID}/acStates?apiKey=${process.env.SENSIBO_API_KEY}`,
        {
          acState: {
            on: state,
            targetTemperature: temperature,
          },
        }
      );
      await Device.updateOne(
        { device_id: "9EimtVDZ" },
        { state: state ? "on" : "off" }
      );
      await addingDataToCsv()
      return { statusCode: 200, data: response.data.result };
    } else {
      throw new Error("Temperature has to be between 16 and 30");
    }
  } catch (err) {
    // console.log(err).message;
    return { statusCode: 403, data: err.message };
  }
};

const getAcState = async () => {
  try {
    const response = await axios.get(
      `https://home.sensibo.com/api/v2/pods/${process.env.SENSIBO_DEVICE_ID}/acStates?apiKey=${process.env.SENSIBO_API_KEY}`
    );
    const state = response.data.result[0].acState;
    return state;
  } catch (err) {
    console.log(err + " Invalid read from Sensibo");
  }
};

const getSensiboSensors = async () => {
  try {
    const response = await axios.get(
      `https://home.sensibo.com/api/v2/pods/${process.env.SENSIBO_DEVICE_ID}/measurements?fields=temperature,humidity&apiKey=${process.env.SENSIBO_API_KEY}`
    );
    return response;
  } catch (err) {
    console.log(err);
  }
};

const parseSensorAndWriteToMongo = async () => {
  try {
    console.log(`parseSensorAndWriteToMongo`);
    // Fetch the current temperature and humidity values
    const response = await getSensiboSensors();
    const data = response.data.result[0];
    const { temperature, humidity } = data;
    const temperatureValue = `VAR temperature=${temperature.toFixed(1)}`;
    const humidityValue = `VAR humidity=${humidity.toFixed(1)}`;
    const temperatureDocument = new SensorValue({
      value: temperatureValue,
      sensor_type: "temperature",
    });
    const humidityDocument = new SensorValue({
      value: humidityValue,
      sensor_type: "humidity",
    });

    await Promise.all([temperatureDocument.save(), humidityDocument.save()]);

    // console.log(`Temperature: ${temperature} Humidity: ${humidity} saved to database.`);
  } catch (error) {
    console.error(error);
  }
};

const removeAllSensorValues = async () => {
  try {
    console.log(`removeAllSensorValues`);
    const result = await SensorValue.deleteMany({});
    //console.log(`Removed ${result.deletedCount} documents from the sensor_values collection.`);
  } catch (error) {
    console.error(error);
  }
};

const updateAcMode = async (mode) => {
  try {
    const response = await axios.patch(
      `https://home.sensibo.com/api/v2/pods/${process.env.SENSIBO_DEVICE_ID}/acStates?apiKey=${process.env.SENSIBO_API_KEY}`,
      {
        acState: {
          on: true,
          mode: mode,
        },
      }
    );
    return { statusCode: 200, data: response.data.result };
  } catch (err) {
    return { statusCode: 403, data: err.message };
  }
};

const updateSensiboMode = async (deviceId, mode) => {
  try {
    const response = await axios.post(`https://home.sensibo.com/api/v2/pods/${deviceId}/acStates?apiKey=${process.env.SENSIBO_API_KEY}`, {
      acState: {
        on: true,
        mode,
      },
    });
    const updateDB=await updateDeviceModeInDatabase(deviceId,mode);
    
    if((response.status==200) && updateDB){
      await addingDataToCsv()
      return { success: true, data: response.data };
    }

  } catch (error) {
    console.error("Error updating Sensibo mode:", error);
    return { success: false, message: "Error updating mode" };
  }
};

module.exports = {
  switchAcState,
  getAcState,
  getSensiboSensors,
  parseSensorAndWriteToMongo,
  removeAllSensorValues,
  analyzeFunc,
  updateAcMode,
  updateSensiboMode,
};
