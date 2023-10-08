const WebSocket = require('websocket');
const http = require('http');
const express = require('express');
const mqtt = require('mqtt');
const path = require("path");
const port = 3000;

const app = express();

// Serve static files from the "public" directory
app.use(express.static('public'));

// Create an HTTP server
const server = http.createServer(app);

// Create a WebSocket server
const wss = new WebSocket.server({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // Allowed origins array
    const allowedOrigins = ['http://localhost:3000'];

    // Check if the specified origin is in the allowedOrigins array
    return allowedOrigins.includes(origin);
}

// WebSocket server event handlers
let ws;
wss.on('request', (request) => {
    if (originIsAllowed(request.origin)) {
        // Accept the WebSocket connection
        ws = request.accept(null, request.origin);
        console.log('Client connected at:', request.origin);

        // Handle incoming messages from clients
        ws.on('message', (message) => {
            console.log('Received: ', message);
        });

        // Handle client disconnection
        ws.on('close', () => {
            console.log('Client disconnected');
            ws = undefined; // Reset the ws variable when the client disconnects
        });
    } else {
        // Reject the WebSocket connection from unallowed origin
        request.reject();
    }
});

/* MQTT */

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

//Handling connections errors
const maxRetries = 3; // Maximum retry attempts
let retryCount = 0;
client.on('error', (error) => {
    console.error('MQTT Error:', error.message);

    if (retryCount < maxRetries) {
        // Retry the connection after a delay
        setTimeout(() => {
            console.log('Retrying MQTT connection...');
            client.reconnect();
        }, 2000);

        retryCount++;
    } else {
        console.error('Max retry attempts reached. Aborting connection.');
    }
});

// Handling incoming messages
client.on('message', (topic, message) => {
    console.log('Received message:', message.toString());

    // Check if ws is defined and then send MQTT data to the WebSocket client
    if (ws && ws.readyState === ws.OPEN) {
        // Send the message as JSON
        ws.send(JSON.stringify({topic, message: message.toString()}));
    }
});


//Live page route
app.get('/live', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public/live.html'));
});


// Start the server
server.listen(port, () => {
    console.log('Server is running on port:', port);
});