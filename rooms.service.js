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

const getRoomById = async (id) => {
  try {
    const room = await Room.findOne({ id: id });
    return { statusCode: 200, data: room };
  } catch (e) {
    return { statusCode: 500, data: e.message };
  }
};

module.exports = {
  getRooms,
  getRoomById,
};
