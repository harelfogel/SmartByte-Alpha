

const { default: axios } = require("axios");
require('dotenv').config();
const TOKEN = process.env.SMARTTHINGS_TOKEN;
const URL = 'https://api.smartthings.com/v1';

const smartThingsGetDevices = async () => {
    const deviceId= process.env.DEVICE_ID;
    try {
        const response = await axios.get(`${URL}/devices/${deviceId}`, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            }
        })

        console.log({response: response.data})
        return response.data;
    }
    catch(err) {
        console.log("Can't get SmartThings devices: ", err)
    }
}

const switchWasherWater = async (deviceId, status) => {
    const command = {
        component: 'main',
        capability: 'switch',
        command: status ? "on" : 'off',
        arguments: []
    };
        try{
            console.log({command, deviceId})
        const response = await axios.post(`${URL}/devices/${deviceId}/commands`, {
            commands: [{ ...command }]
        },
        { headers: {
            'Authorization': `Bearer ${TOKEN}`
        }})
        await addingDataToCsv()()
        return response;
    }
    catch(err) {
        console.log(`Can't switch status to washer water: ${err}` )
    }
}

const getLaundryDetails = async () => {
    try {
        const deviceId= process.env.DEVICE_ID;
        const response = await axios.get(`${URL}/devices/${deviceId}/status`, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            }
        });

        const temperature = response.data.components.main['custom.washerWaterTemperature'].washerWaterTemperature.value;
        const rinse = response.data.components.main['custom.washerRinseCycles'].washerRinseCycles.value;
        const spin = response.data.components.main['custom.washerSpinLevel'].washerSpinLevel.value.toString();

        return { temperature, rinse, spin };
    } catch (err) {
        console.log("Can't get laundry details: ", err);
    }
};


module.exports = {
    smartThingsGetDevices,
    switchWasherWater,
    getLaundryDetails
}