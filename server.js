import express from 'express';
import { WebSocketServer } from 'ws';

const PORT = 5080;
const HOST = '0.0.0.0';

// Setup Express
const app = express();
app.use(express.static('dist'));

// Create server
const server = app.listen(PORT, HOST, () => {
    console.log(`🤖 Server running on http://${HOST}:${PORT}`);
   // console.log('🤖 for outside access ws://145.93.145.95:5080')
});

const wss = new WebSocketServer({ server });

// Broadcasting function
function broadcast(message) {
    wss.clients.forEach(client => {
        client.send(JSON.stringify(message));
    });
}

// Handle connections
wss.on('connection', (ws) => {
    console.log('Client connected!');
    
    // When receiving any message, broadcasting it to all clients
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received:', data);
            broadcast(data); 
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });
});

