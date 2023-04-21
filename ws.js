const WebSocket = require("ws");
const moment = require("moment");
const { addNewSuggestion } = require("./suggestions.service");

const clients = [];

const connectToWs = () => {
  const wss = new WebSocket.Server({ port: 8080 });

  wss.on("connection", (ws) => {
    console.log("Client connected");
    clients.push(ws);

    ws.send("Welcome to the WebSocket Server!");
  });

  wss.clients.forEach((client) => {
    client.send("Hello, client!");
  });

};

module.exports = { connectToWs, clients };
