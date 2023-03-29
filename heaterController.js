const { default: axios } = require("axios");
const Device = require("./Device");



const TUYA_URL = 'https://tuyaapi.onrender.com'


const switchHeaterState = async (value) => {
    console.log({value})
    try {
        const response = await axios.post(`${TUYA_URL}/control`, {
            code: "switch_1",
            value
        })
        await Device.updateOne({device_id: '061751378caab5219d31'}, {state: value ? 'on' : 'off'});
        return response.data;
    }catch(err) {
        console.log(err)
    }

}



module.exports = {
    switchHeaterState
}

