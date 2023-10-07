const WebSocket = require('websocket');
const http = require('http');
const express = require('express');
const port = 3000;

const app = express();

// Create an HTTP server using Express
const server = http.createServer(app);

// Create a WebSocket server by passing the HTTP server
const wss = new WebSocket.server({
    httpServer: server,
    autoAcceptConnections: false });

function originIsAllowed(origin) {
    // Define an array of allowed origins
    const allowedOrigins = ['ws://localhost:3000'];

    // Check if the specified origin is in the allowedOrigins array
    return allowedOrigins.includes(origin);
}

// WebSocket server event handlers
wss.on('request', (request) => {
    if (originIsAllowed(request.origin)) {
        // Accept the WebSocket connection
        const ws = request.accept(null, request.origin);
        console.log('Client connected');

        // Handle incoming messages from clients
        ws.on('message', (message) => {
            console.log('Received: ', message);
            // Send a response back to the client
            ws.send(`Server received: ${message}`);
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

// Start the server
server.listen(port, () => {
    console.log('Server is running on port:', port);
});