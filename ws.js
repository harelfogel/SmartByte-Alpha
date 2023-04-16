const WebSocket = require("ws");
const moment = require("moment");
const { addNewSuggestion } = require("./suggestions.service");

const connectToWs = () => {
  const wss = new WebSocket.Server({ port: 8080 });

  wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.send("Welcome to the WebSocket Server!");
  });

  wss.clients.forEach((client) => {
    client.send("Hello, client!");
  });

//   setInterval(() => {
//     wss.clients.forEach(async (client) => {
//       const newsuggestion = {
//         device: "Laundy",
//         evidence: {
//           distance: 1,
//         },
//         state: "on",
//       };
//       const response = await addNewSuggestion(newsuggestion);
//       console.log({ response });
//       client.send("New Rule Suggestion!");
//     });
//   }, 3000);
};

module.exports = connectToWs;
