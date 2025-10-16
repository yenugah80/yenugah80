const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose'); // Assuming MongoDB, change if using another DB
const { scheduleJob } = require('node-schedule'); // For job scheduling

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Database connection
mongoose.connect('mongodb://localhost:27017/yourdbname', { // Update with your DB details
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Database connected successfully');
})
.catch(err => {
  console.error('Database connection error:', err);
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    console.log('Received:', message);
    // Handle incoming messages
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Job Scheduler example
scheduleJob('* * * * *', () => {
  console.log('Job running every minute');
  // Add your job logic here
});

// Start the Express server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
