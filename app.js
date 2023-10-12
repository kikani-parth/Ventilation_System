const WebSocket = require('websocket');
const http = require('http');
const express = require('express');
const mqtt = require('mqtt');
const path = require("path");
const db = require('./db');
const {read} = require("./db");
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
        ws.on('message', async (message) => {
            try {
                let data = JSON.parse(message.utf8Data);

                // If data contains an auto field, it is a MQTT message
                if ('auto' in data) {
                    // Check if ws is defined and then publish the MQTT data
                    if (ws && ws.readyState === ws.OPEN) {
                        // Send the received WebSocket message to MQTT
                        console.log(data);
                        client.publish('controller/settings', message.utf8Data);
                    }
                }
                // Check if the received message is from the date & time picker
                else if ('startDate' in data) {
                    // Convert start and end time to seconds
                    const startTimeInSeconds = Math.floor(new Date(data.startDate + 'T' + data.startTime) / 1000);
                    const endTimeInSeconds = Math.floor(new Date(data.endDate + 'T' + data.endTime) / 1000);

                    // Query based on the user's date and time selection
                    const query = {
                        _id: {
                            $gte: db.ObjectId.createFromTime(startTimeInSeconds),
                            $lte: db.ObjectId.createFromTime(endTimeInSeconds)
                        }
                    };

                    // Retrieve data from MongoDB based on the query
                    const filteredData = await read(query);

                    // Check if the requested data is available in MongoDB
                    if (filteredData.length === 0) {
                        ws.send(JSON.stringify({rangeError: 'No data found for the selected range'}));
                    } else {
                        // Send the filtered data to the client
                        ws.send(JSON.stringify(filteredData));
                    }
                }
                // Else, the received message contains sample nr
                else {
                    const samplenr = {nr: parseInt(data.nr)};
                    const result = await db.collection.findOne(samplenr);

                    // Check if the requested document exists
                    if (!result) {
                        ws.send(JSON.stringify({nrError: 'No data found for the requested sample nr'}));
                    } else {
                        // Send the result to the client
                        ws.send(JSON.stringify(result));
                    }
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
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
const brokerUrl = 'mqtt://192.168.1.60:1883';      //classroom->"192.168.1.254"

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
    //Store the data in MongoDB
    const data = JSON.parse(message.toString());
    db.store(data);
});

/* Routes */

//Live page
app.get('/live', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public/live.html'));
});

// Charts page
app.get('/charts', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public/charts.html'));
});


// Start the server
server.listen(port, () => {
    console.log('Server is running on port:', port);
});