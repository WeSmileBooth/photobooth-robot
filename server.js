import express from 'express';
import { WebSocketServer } from 'ws';
import * as ngrok from '@ngrok/ngrok';
import dotenv from 'dotenv';


const PORT = 5080;
const HOST = '0.0.0.0';

dotenv.config();


// Setup Express
const app = express();
app.use(express.static('dist'));

// Create server
const server = app.listen(PORT, HOST, () => {
    console.log(`🤖 Server running on http://${HOST}:${PORT}`);
   // console.log('🤖 for outside access ws://145.93.145.95:5080')
});

const wss = new WebSocketServer({ server });

async function setupNgrokTunnel() {
    try {
        const listener = await ngrok.connect({
            addr: PORT,
            authtoken: process.env.NGROK_AUTHTOKEN
        });
        const publicUrl = listener.url();
        console.log(`🌍 Ngrok tunnel established at: ${publicUrl}`);
        app.set('ngrokUrl', publicUrl);  // Store for use in QR code generation
        return publicUrl;
    } catch (error) {
        console.error('Failed to establish ngrok tunnel:', error);
        console.log('💡 Tip: Make sure NGROK_AUTHTOKEN is set in your environment');
        return null;
    }
}

setupNgrokTunnel();




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

