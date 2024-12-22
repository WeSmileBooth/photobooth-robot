import { ref } from 'vue'

const ws = ref<WebSocket | null>(null)
const isConnected = ref(false)

export function useWebsocket() {
    const setupWebsocket = async () => {
        return new Promise((resolve, reject) => {
          if (ws.value?.readyState === WebSocket.OPEN) {
            resolve(true);
            return;
          }
      
          ws.value = new WebSocket('ws://localhost:5080');
      
          ws.value.onopen = () => {
            console.log('Connected to server');
            isConnected.value = true;
            resolve(true);
          };
      
          ws.value.onerror = (error) => {
            console.error('WebSocket error:', error);
            isConnected.value = false;
            reject(error);
          };
        });
      };

    const sendMessage = async (type: string, payload: any) => {
        if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
          await setupWebsocket()  
        }
        
        console.log('Sending message:', type);   
        console.log('Connected:', isConnected.value);     
        if (ws.value && isConnected.value) {
          try {
            ws.value.send(JSON.stringify({ type, payload }));
            return true;
          } catch (error) {
            console.log(error);
            return false;
          }
        }
        
        return false;  // Added return false if not connected
      };

    return {
        isConnected,
        setupWebsocket,
        sendMessage
    }
}