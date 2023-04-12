const WebSocket = require('ws');


const connectToWs = () => {

    
    const wss = new WebSocket.Server({ port: 8080 });
    
    wss.on('connection', (ws) => {
        console.log('Client connected');
        
        ws.send('Welcome to the WebSocket Server!');
    })
    
    wss.clients.forEach((client) => {
        client.send('Hello, client!');
    });

    // setInterval(() => {
    //     wss.clients.forEach((client) => {
    //         client.send('Hello, client!');
    //     });
    // },3000)
    
}

module.exports = connectToWs;