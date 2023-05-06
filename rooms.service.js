const Room = require("./Room");



const getRooms = async () => {
    try {
      const rooms = await Room.find();
      return {
        statusCode: 200,
        data: rooms,
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: `Error fetching rules - ${error}`,
      };
    }
  };

  module.exports = {
    getRooms
  }