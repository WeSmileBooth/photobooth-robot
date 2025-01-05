import express from "express";
import { WebSocketServer } from "ws";
import * as ngrok from "@ngrok/ngrok";

const PORT = 5080;
const HOST = "0.0.0.0";
let serverUrl = "";

// Setup Express
const app = express();
app.use(express.static("dist"));

// Create server
const server = app.listen(PORT, HOST, async () => {
  console.log(`🤖 Server running on http://${HOST}:${PORT}`);

  const listener = await ngrok.forward({
    addr: PORT,
    authtoken: "2ZUVTOVHYlmmcpff6KHArWo5evi_85PZqytQeRmJo6dvXnDhK",
    proto: "http",
  });

  serverUrl = listener.url().replace("https:", "wss:");

  console.log(`🚀 Ngrok tunnel created: ${listener.url()}`);
});

const wss = new WebSocketServer({ server });

app.get("/server", (req, res) => {
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
      broadcast(data);
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });
});
