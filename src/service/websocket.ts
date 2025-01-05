import { ref } from "vue";

const ws = ref<WebSocket | null>(null);
const isConnected = ref(false);

type MessageHandler = (data: any) => void;
const messageHandlers = new Set<MessageHandler>();

export function useWebsocket() {
  // Add a message handler to the set of handlers that will be called when a message is received
  const addMessageHandler = (handler: MessageHandler) => {
    messageHandlers.add(handler);
  };

  const setupWebsocket = async () => {
    return new Promise(async (resolve, reject) => {
      if (ws.value?.readyState === WebSocket.OPEN) {
        resolve(true);
        return;
      }

      const response = await fetch("/server");
      const url = await response.text();
      console.log("websocket.ts. Server URL:", url);

      ws.value = new WebSocket(url);

      ws.value.onopen = () => {
        console.log("Connected to server");
        isConnected.value = true;
        resolve(true);
      };

      ws.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          messageHandlers.forEach((handler) => handler(data));
        } catch (error) {
          console.error("Error processing message:", error);
        }
      };

      ws.value.onerror = (error) => {
        console.error("WebSocket error:", error);
        isConnected.value = false;
        reject(error);
      };
    });
  };

  const sendMessage = async (type: string, payload: any) => {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
      await setupWebsocket();
    }
    if (ws.value && isConnected.value) {
      try {
        ws.value.send(JSON.stringify({ type, payload }));
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    }

    return false; // Added return false if not connected
  };

  return {
    isConnected,
    setupWebsocket,
    sendMessage,
    addMessageHandler,
  };
}
