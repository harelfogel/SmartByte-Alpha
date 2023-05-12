const Device = require("./Device")

const getDevices = async () => {
  try {
    const devices = await Device.find();
    return devices;
  }
  catch (err) {
    console.log(err);
  }
}

const updateDeviceModeInDatabase = async (deviceId, mode) => {
  try {
    const result = await Device.updateOne({ device_id: deviceId }, { $set: { state: 'on', mode } });
    if (result.modifiedCount === 1) {
      console.log('Device mode and state updated successfully in the database');
      return true;
    } else {
      console.log('No device was found with the provided device_id');
      return false;
    }
  } catch (error) {
    console.error('Error updating device mode and state in the database:', error);
    return false;
  }
};





module.exports = {
  getDevices,
  updateDeviceModeInDatabase
}