

// const { default: axios } = require("axios");

import axios from "axios";



const TOKEN = process.env.SMARTTHINGS_TOKEN;
const URL = 'https://api.smartthings.com/v1'

export const smartThingsGetDevices = async (deviceId) => {
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

export const switchWasherWater = async (deviceId, status) => {
    const command = {
        component: 'main',
        capability: 'switch',
        command: status,
        arguments: []
    };
        try{
        const response = await axios.post(`${URL}/devices/${deviceId}/commands`, {
            commands: [{ ...command }]
        },
        { headers: {
            'Authorization': `Bearer ${TOKEN}`
        }})

        console.log("Yovel", {response: response.data.results})
    }
    catch(err) {
        console.log(`Can't switch status to washer water: ${err}` )
    }
}

// module.exports = {
//     smartThingsGetDevices,
//     switchWasherWater
// }