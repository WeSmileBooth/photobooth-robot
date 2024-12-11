// server.js
import express from 'express';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

// Constants
const DISPLAY_STATES = {
  IDLE: 'idle',
  CAPTURE: 'capture',
  TRANSFORM: 'transform',
  REVIEW: 'review'
};

const MESSAGE_TYPES = {
  MOBILE_JOIN: 'MOBILE_JOIN',
  START_CAPTURE: 'START_CAPTURE',
  RETAKE_CAPTURE: 'RETAKE_CAPTURE',
  START_TRANSFORM: 'START_TRANSFORM',
  SHOW_REVIEW: 'SHOW_REVIEW',
  DISPLAY_UPDATE: 'DISPLAY_UPDATE'
};

// Server setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 5080;
const HOST = '0.0.0.0';

class WebSocketHandler {
  constructor() {
    this.clients = new Map();
    this.app = express();
    this.setupExpress();
    this.server = this.createServer();
    this.wss = this.createWebSocketServer();
  }

  setupExpress() {
    this.app.use(express.static('dist'));
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  createServer() {
    return this.app.listen(PORT, HOST, () => {
      console.log(`🤖 Server running on port ${PORT}`);
    });
  }

  createWebSocketServer() {
    const wss = new WebSocketServer({ server: this.server });
    wss.on('connection', this.handleConnection.bind(this));
    return wss;
  }

  broadcast(message) {
    this.wss.clients.forEach(client => {
      client.send(JSON.stringify(message));
    });
  }

  updateDisplay(display) {
    this.broadcast({
      type: MESSAGE_TYPES.DISPLAY_UPDATE,
      payload: { display }
    });
  }

  handleMessage(ws, message) {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data.type);

      const messageHandlers = {
        [MESSAGE_TYPES.MOBILE_JOIN]: () => {
          this.clients.set(data.payload.sessionId, ws);
          this.updateDisplay(DISPLAY_STATES.IDLE);
        },
        [MESSAGE_TYPES.START_CAPTURE]: () => {
          this.updateDisplay(DISPLAY_STATES.CAPTURE);
        },
        [MESSAGE_TYPES.RETAKE_CAPTURE]: () => {
          this.broadcast(data);
        },
        [MESSAGE_TYPES.START_TRANSFORM]: () => {
          this.updateDisplay(DISPLAY_STATES.TRANSFORM);
        },
        [MESSAGE_TYPES.SHOW_REVIEW]: () => {
          this.updateDisplay(DISPLAY_STATES.REVIEW);
        }
      };

      const handler = messageHandlers[data.type];
      if (handler) {
        handler();
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  handleConnection(ws) {
    console.log('Client connected!');
    
    ws.on('message', (message) => this.handleMessage(ws, message));
    
    ws.on('close', () => {
      for (const [sessionId, client] of this.clients.entries()) {
        if (client === ws) {
          this.clients.delete(sessionId);
          break;
        }
      }
    });
  }
}

// Start the server
new WebSocketHandler();