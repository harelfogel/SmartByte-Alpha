const Device = require("../models/Device");
const RoomDevice = require("../models/RoomDevice");
const Room = require("../models/Room");

const getDevices = async () => {
  try {
    const devices = await Device.find();
    return devices;
  } catch (err) {
    console.log(err);
  }
};

const updateDeviceModeInDatabase = async (deviceId, mode) => {
  try {
    const result = await Device.updateOne(
      { device_id: deviceId },
      { $set: { state: "on", mode } }
    );
    if (result.modifiedCount === 1) {
      console.log("Device mode and state updated successfully in the database");
      return true;
    } else {
      console.log("No device was found with the provided device_id");
      return false;
    }
  } catch (error) {
    console.error(
      "Error updating device mode and state in the database:",
      error
    );
    return false;
  }
};

const getDeviceByName = async (name) => {
  try {
    const device = await Device.findOne({ name: name.toLowerCase() });
    if (device) {
      return {
        statusCode: 200,
        data: device,
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      message: err.message,
    };
  }
};

const addDeviceToRoom = async (deviceId, deviceName, roomId, deviceState) => {
  try {
    const roomDeviceData = {
      room_id: roomId,
      device_id: deviceId,
      state: deviceState,
      device_name: deviceName,
    };

    const newRoomDevice = new RoomDevice({ ...roomDeviceData });
    newRoomDevice.id = Math.floor(10000000 + Math.random() * 90000000);
    await newRoomDevice.save();

    return {
      statusCode: 200,
      data: "Device added successfully",
    };
  } catch (err) {
    return {
      statusCode: 500,
      message: err.message,
    };
  }
};

const getDevicesByRoomId = async (roomId) => {
  try {
    const devices = await Device.aggregate([
      {
        $lookup: {
          from: "rooms-devices",
          localField: "device_id",
          foreignField: "device_id",
          as: "roomDevices",
        },
      },
      {
        $match: {
          "roomDevices.room_id": roomId,
        },
      },
    ]);
    return {
      statusCode: 200,
      data: devices,
    };
  } catch (err) {
    return {
      statusCode: 500,
      message: err.message,
    };
  }
};

const getRoomDevices = async (roomId) => {
  try {
    const devices = await RoomDevice.find({ room_id: roomId });
    return {
      statusCode: 200,
      data: devices,
    };
  } catch (err) {
    return {
      statusCode: 500,
      message: err.message,
    };
  }
};

const setRoomDeviceState = async (id, state) => {
  try {
    const response = await RoomDevice.updateOne(
      { id },
      { state: state ? "on" : "off" }
    );
    console.log(response);

    if (response.modifiedCount === 0) {
      throw new Error("Unable to update room device state");
    }

    return {
      statusCode: 200,
      message: "Room device has been updated",
    };
  } catch (err) {
    return {
      statusCode: 500,
      message: err.message,
    };
  }
};

const createNewDevice = async (device, roomId) => {
  try {
    const { name } = device;
    const newDevice = new Device({
      name,
      state: "off",
    });

    // add device to devices
    const newDeviceId = Math.floor(10000000 + Math.random() * 90000000);
    newDevice.device_id = newDeviceId;
    newDevice.save();

    addDeviceToRoom(newDeviceId, name, roomId, "off");
    return {
      statusCode: 200,
      data: "Device created successfully",
    };
  } catch (err) {
    return {
      statusCode: 500,
      message: err.message,
    };
  }
};

module.exports = {
  getDevices,
  updateDeviceModeInDatabase,
  getDeviceByName,
  addDeviceToRoom,
  getDevicesByRoomId,
  getRoomDevices,
  setRoomDeviceState,
  createNewDevice,
};
