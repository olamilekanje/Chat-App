// websocket.js
const WebSocket = require('ws');
const http = require('http');
const utils = require('./validations/utils'); // Import the utils file

const server = http.createServer(); // Create the server
const wss = new WebSocket.Server({ server }); // Create the WebSocket server


wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      // Use the isValidMessage helper function from utils
      if (!utils.helpers.isValidMessage(data)) {
        console.error('Invalid message received');
        return;
      }

      // Use the logger function from utils
      utils.logger(`Received message: ${message}`);

      // Broadcast the message to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
         client.send(JSON.stringify(data)); // Broadcast the valid message
        }
      });
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});