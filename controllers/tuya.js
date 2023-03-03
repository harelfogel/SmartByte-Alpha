const { default: axios } = require("axios");


const turnOnWaterHeater = async () => {
    const headers = {
        sign_method: 'HMAC-SHA256',
        client_id: 'dwgcs3hncxr3w9gpcdk8',
        t: Date.now(),
        mode: 'cors',
        sign: 'FB8775B6EEDD70362C2174C7D9643924AFFDF0529004908199639A28AAC65675',
        access_token: 'e035d1cad98ca07bb83d4bf7b2743dda'
    };

    const body = {
        commands: [
            {code: 'switch_1', value: true}
        ]
    }

    console.log(Date.now());

    // const response = await axios.post('https://openapi.tuyaeu.com/v1.0/devices/061751378caab5219d31/commands',{
    //     headers,
    //     body
    // })
    // console.log({response})
}

module.exports = {
    turnOnWaterHeater
}