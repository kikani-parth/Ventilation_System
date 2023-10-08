const WebSocket = require('websocket');
const http = require('http');
const express = require('express');
const mqtt = require('mqtt');
const path = require("path");
const port = 3000;

const app = express();

// Serve static files from the "public" directory
app.use(express.static('public'));

// Create an HTTP server using Express
const server = http.createServer(app);

// Create a WebSocket server by passing the HTTP server
const wss = new WebSocket.server({
    httpServer: server,
    autoAcceptConnections: false });

function originIsAllowed(origin) {
    // Define an array of allowed origins
    const allowedOrigins = ['http://localhost:3000'];

    // Check if the specified origin is in the allowedOrigins array
    return allowedOrigins.includes(origin);
}

// WebSocket server event handlers
wss.on('request', (request) => {
    if (originIsAllowed(request.origin)) {
        // Accept the WebSocket connection
        const ws = request.accept(null, request.origin);
        console.log('Client connected at:', request.origin);

        // Handle incoming messages from clients
        ws.on('message', (message) => {
            console.log('Received: ', message);
            // Send a response back to the client
            ws.send(`Server received: ${message.utf8Data}`);
        });

        // Handle client disconnection
        ws.on('close', () => {
            console.log('Client disconnected');
        });
    } else {
        // Reject the WebSocket connection from unallowed origin
        request.reject();
    }
});


// MQTT broker URL
const brokerUrl = 'mqtt://127.0.0.1:1883';      //localhost

// Creating MQTT client instance
const client = mqtt.connect(brokerUrl);

// Handling mqtt events
client.on('connect', () => {
    console.log('Connected to MQTT broker');

    // Subscribe to the topic
    client.subscribe('controller/status', (err) => {
        if (!err) {
            console.log('Subscribed to controller/status');
        }
    });
});

// Handling incoming messages
client.on('message', (topic, message) => {
    console.log('Received message:', message.toString());
});

app.get('/live', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public/live.html'));
});

// Start the server
server.listen(port, () => {
    console.log('Server is running on port:', port);
});