// server.js
import express from 'express';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Create a map to store all active connections
const clients = new Map();

app.use(express.static('dist'));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const server = app.listen(5080, '0.0.0.0', () => {
  console.log('🤖 Server running on port 5080');
});

const wss = new WebSocketServer({ server });

// Broadcast to all clients
function broadcast(message) {
  wss.clients.forEach(client => {
    client.send(JSON.stringify(message));
  });
}

wss.on('connection', (ws) => {
  console.log('Client connected!');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data.type);
      
      switch (data.type) {
        case 'MOBILE_JOIN':
          clients.set(data.payload.sessionId, ws);
          // Broadcast new display state to all clients
          broadcast({
            type: 'DISPLAY_UPDATE',
            payload: { display: 'idle' }
          });
          break;
          
        case 'START_CAPTURE':
          // Broadcast display change to capture mode
          broadcast({
            type: 'DISPLAY_UPDATE',
            payload: { display: 'capture' }
          });
          break;

        case 'RETAKE_CAPTURE':
          broadcast(data);
          break;

        case 'START_TRANSFORM':
          broadcast({
            type: 'DISPLAY_UPDATE',
            payload: { display: 'transform' }
          })
        case 'SHOW_REVIEW':
          broadcast({
            type: 'DISPLAY_UPDATE',
            payload: { display: 'review' }
          });
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    // Remove client from map when they disconnect
    for (const [sessionId, client] of clients.entries()) {
      if (client === ws) {
        clients.delete(sessionId);
        break;
      }
    }
  });
});