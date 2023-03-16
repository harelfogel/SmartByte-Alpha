const { default: axios } = require("axios");

const switchAcState = async () => {
    console.log('switchAcState')
    try{
        const response= await axios.post(`https://home.sensibo.com/api/v2/pods/${process.env.SENSIBO_DEVICE_ID}/acStates?apiKey=${process.env.SENSIBO_API_KEY}`,{
           "acState":{
               "on":false
           }
        })
        console.log({response})
    } catch(err){
        console.log(err+"Ivalid read from Sensibo");
    }
}

module.exports = {
    switchAcState
}