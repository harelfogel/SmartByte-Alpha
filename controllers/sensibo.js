import axios from "axios";


export const switchAcState = async () => {
    try{
        const response= await axios.post(`https://home.sensibo.com/api/v2/pods/${process.env.DEVICE_ID}/acStates?apiKey=${process.env.SENSIBO_API_KEY}`,{
           "acState":{
               "on":state
           }
        })
    } catch(err){
        console.log(err+"Ivalid read from Sensibo");
    }
}