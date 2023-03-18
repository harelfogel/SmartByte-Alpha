const { default: axios } = require("axios");

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

module.exports = {
    switchAcState,
    getAcState
}