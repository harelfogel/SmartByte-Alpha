const SensorValue = require("../models/SensorValue");
const _ = require("lodash");
const { SENSORS } = require("../utils/common");

const getLatestSensorValues = async () => {
  return _.reduce(
    Object.values(SENSORS),
    async (accPromise, curr) => {
      acc = await accPromise;
      const value = await SensorValue.findOne({ sensor_type: curr })
        .sort({ timestamp: -1 })
        .exec();
      return {
        ...acc,
        [curr]: _.get(value, "value", null),
      };
    },
    {}
  );
};

module.exports = {
  getLatestSensorValues
};
