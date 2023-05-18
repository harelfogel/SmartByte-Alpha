const WebSocket = require("ws");

const clients = [];

const connectToWs = () => {
  const wss = new WebSocket.Server({ port: 8080 });

  wss.on("connection", (ws) => {
    clients.push(ws);

    // Send a JSON string instead of plain text
    ws.send(JSON.stringify({ message: "Hello, client!" }));
  });
};

module.exports = { connectToWs, clients };
