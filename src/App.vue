<script setup>
import { ref, onMounted, onUnmounted, provide } from 'vue';
import IdleDisplay from './components/displays/IdleDisplay.vue';
import CaptureDisplay from './components/displays/CaptureDisplay.vue';
import TransformDisplay from './components/displays/TransformDisplay.vue';
import ReviewDisplay from './components/displays/ReviewDisplay.vue';
import { useWebsocket } from './service/websocket';

const currentDisplay = ref('idle');
const ws = ref(null);
const currentComponentRef = ref(null);
const {setupWebsocket, addMessageHandler} = useWebsocket();

onMounted(async () => {
  await setupWebsocket()

  addMessageHandler((data) => {
        if (data.type === 'DISPLAY_UPDATE') {
            currentDisplay.value = data.payload.display;
        } else if (data.type === 'RETAKE') {
            currentComponentRef.value.startCapture();
        }
    });
});

// onMounted(() => {
//   ws.value = new WebSocket('ws://localhost:5080');
//   console.log('WebSocketManager created');

//   // Connection opened
//   ws.value.onopen = () => {
//         console.log('Connected to robot server');
//     };

//      // Listen for messages
//      ws.value.onmessage = (event) => {
//         try {
//             const data = JSON.parse(event.data);
//             console.log('Message received:', data);  
//             // Update display based on received message
//             if (data.type == 'DISPLAY_UPDATE') {
//                 currentDisplay.value = data.payload.display;
//             } else if (data.type == 'RETAKE') {
//               currentComponentRef.value.startCapture()
//             }
//         } catch (error) {
//             console.error('Error processing message:', error);
//         }
//     };
// });

// Cleanup
onUnmounted(() => {
    if (ws.value) {
        ws.value.close();
    }
});
</script>

<template>
  <div>
    <component 
      :is="currentDisplay === 'idle' ? IdleDisplay :
           currentDisplay === 'capture' ? CaptureDisplay :
           currentDisplay === 'transform' ? TransformDisplay :
           currentDisplay === 'review' ? ReviewDisplay : null"
      ref="currentComponentRef"
    />
  </div>
</template>