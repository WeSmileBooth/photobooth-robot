export class WebSocketManager {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.messageHandlers = new Map();
  }

  connect() {
    this.ws = new WebSocket(this.url);
    this.setupEventListeners();
    return this.ws;
  }

  setupEventListeners() {
    this.ws.onopen = () => {
      console.log('🤖 Robot UI Connected!');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Message received:', data);
        
        const handler = this.messageHandlers.get(data.type);
        if (handler) {
          handler(data.payload);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };
  }

  registerHandler(messageType, handler) {
    this.messageHandlers.set(messageType, handler);
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}