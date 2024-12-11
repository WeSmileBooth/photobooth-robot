// In App.vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import IdleDisplay from './components/displays/IdleDisplay.vue';
import CaptureDisplay from './components/displays/CaptureDisplay.vue';
import TransformDisplay from './components/displays/TransformDisplay.vue';
import ReviewDisplay from './components/displays/ReviewDisplay.vue';

const currentDisplay = ref('idle');
const captureDisplay = ref(null);
const ws = ref(null);


onMounted(() => {
  console.log('🚀 App.vue mounted');
  ws.value = new WebSocket('ws://localhost:5080');

  ws.value.onopen = () => {
    console.log('🤖 Robot UI Connected!');
  };

  ws.value.onmessage = (event) => {
    console.log('📨 Raw message received:', event.data);
    try {
      const data = JSON.parse(event.data);
      console.log('📨 Parsed message:', data);

      switch (data.type) {
        case 'DISPLAY_UPDATE':
          currentDisplay.value = data.payload.display;
          break;
        case 'START_CAPTURE':
          currentDisplay.value = 'capture';
          break;
        case 'RETAKE_CAPTURE':
          if (captureDisplay.value) {
            captureDisplay.value.startCapture();
          }
          break;
        case 'START_TRANSFORM':
          currentDisplay.value = 'transform';
          break;
        case 'SHOW_REVIEW':
          currentDisplay.value = 'review';
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
      console.error('Raw message that caused error:', event.data);
    }
  };

  window.ws = ws.value;
});

onUnmounted(() => {
  if (ws.value) {
    ws.value.close();
  }
});
</script>

<template>
  <div>
    <IdleDisplay v-if="currentDisplay === 'idle'" />
    <CaptureDisplay
      v-if="currentDisplay === 'capture'"
      ref="captureDisplay"
    />
    <TransformDisplay
      v-if="currentDisplay === 'transform'" />
  </div>
    <ReviewDisplay
      v-if="currentDisplay === 'review'"
    />
</template>