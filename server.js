import express from "express";
import { WebSocketServer } from "ws";
import * as ngrok from "@ngrok/ngrok";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

// Then use the env variable
const authtoken = process.env.NGROK_AUTHTOKEN;

const PORT = 5080;
const HOST = "0.0.0.0";
let serverUrl = "";

// Setup Express
const app = express();
app.use(express.static("dist"));

// Enable CORS for all routes
app.use(cors());

// Create server
const server = app.listen(PORT, HOST, async () => {
  console.log(`🤖 Server running on http://${HOST}:${PORT}`);

  const listener = await ngrok.forward({
    addr: PORT,
    authtoken: authtoken,
    proto: "http",
  });

  serverUrl = listener.url().replace("https:", "wss:");

  console.log(`🚀 Ngrok tunnel created: ${listener.url()}`);
});

const wss = new WebSocketServer({ server });

app.get("/server", (req, res) => {
  console.log("recieved request");
  res.send(serverUrl);
});

// Broadcasting function
function broadcast(message) {
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(message));
  });
}

// Handle connections
wss.on("connection", (ws) => {
  // When receiving any message, broadcasting it to all clients
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Received:", data);
      broadcast(data);
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });
});
