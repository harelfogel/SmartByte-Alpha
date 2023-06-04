const WebSocket = require("ws");

const clients = [];

const connectToWs = () => {
  const wss = new WebSocket.Server({ port: 8080 });

  wss.on("connection", (ws) => {
    clients.push(ws);
    // console.log("Yovel", clients)

    // Send a JSON string instead of plain text
    // ws.send(JSON.stringify({ message: "Hello, client!" }));
    ws.send('Welcome to the WebSocket Server!');
  });

  wss.clients.forEach((client) => {
    client.send('Hello, client!');
});
console.log("ws connected")
};

module.exports = { connectToWs, clients };
