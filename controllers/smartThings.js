require('dotenv').config();
const { SmartThingsClient } = require('@smartthings/core-sdk');

module.exports = getClientDetails = async () => {
    const stClient = new SmartThingsClient({
        accessToken: process.env.SMART_THINGS_TOKEN
    });

    const deviceId = process.env.DEVICE_ID;
    const commandObj = {
        component: 'main',
        capability: 'switch',
        command: 'on',
        arguments: []
    };
    stClient.devices.executeCommand(deviceId, { commands: [{ component: commandObj.component, capability: commandObj.capability, command: commandObj.command, arguments: commandObj.arguments }] })
        .then((res) => {
            console.log('im in res');
            console.log(res);
        })
        .catch((err) => {
            console.error(err);
        });

        return stClient.devices; 
} 
