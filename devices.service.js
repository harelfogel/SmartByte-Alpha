const Device = require("./Device")



const getDevices = async () => {
    try {
        const devices = await Device.find();
        return devices;
    }
    catch(err) {
        console.log(err);
    }
}



module.exports = {
    getDevices
}