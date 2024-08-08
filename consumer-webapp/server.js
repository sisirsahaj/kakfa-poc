const { Kafka } = require('kafkajs');
const WebSocket = require('ws');
const express = require('express');
const http = require('http');

// Kafka setup
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'] // Adjust according to your Kafka broker configuration
});

const consumer = kafka.consumer({ groupId: 'test-group' });

// Express and WebSocket setup
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
  console.log('A new client connected');
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
});

// Function to broadcast messages to all connected WebSocket clients
const broadcastMessage = (message) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

// Kafka consumer
const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'my-topic', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(message);
      data = {
        deviceId: message.key.toString(),
        value: message.value.toString(),
      }
      console.log(data);      
      // Broadcast message to all WebSocket clients
      broadcastMessage(JSON.stringify(data));
    },
  });
};

run().catch(console.error);

// Start the server
const PORT = 3001;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));