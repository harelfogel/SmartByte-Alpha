const mqtt = require('mqtt');
require('dotenv').config();

// Configure the connection options
const options = {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
};

// Create a client instance
const client = mqtt.connect('mqtts://' + process.env.MQTT_URL, options);

client.on('connect', function () {
    console.log('MQTT connected');
});

// A helper function for publishing LED control messages
function controlLED(color, state) {
    const topic = 'ledControl';
    const message = JSON.stringify({ color: color, state: state }); // Convert object to JSON string

    client.publish(topic, message, function (err) {
        if (err) {
            console.error('Failed to send message', err);
        } else {
            console.log(`LED control message sent: ${message}`);
        }
    });
}

module.exports = {
    controlLED
}
