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

  //Change the display based on the message received
  addMessageHandler((data) => {
        if (data.type === 'DISPLAY_UPDATE') {
            currentDisplay.value = data.payload.display;
        } else if (data.type === 'RETAKE') {
            currentComponentRef.value.startCapture();
        }
    });
});

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