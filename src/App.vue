<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { WebSocketManager } from './WebSocketManager';
import IdleDisplay from './components/displays/IdleDisplay.vue';
import CaptureDisplay from './components/displays/CaptureDisplay.vue';
import TransformDisplay from './components/displays/TransformDisplay.vue';
import ReviewDisplay from './components/displays/ReviewDisplay.vue';

const MESSAGE_TYPES = {
  DISPLAY_UPDATE: 'DISPLAY_UPDATE',
  START_CAPTURE: 'START_CAPTURE',
  RETAKE_CAPTURE: 'RETAKE_CAPTURE',
  START_TRANSFORM: 'START_TRANSFORM',
  SHOW_REVIEW: 'SHOW_REVIEW'
};

const currentDisplay = ref('idle');
const captureDisplay = ref(null);
const wsManager = ref(null);

onMounted(() => {
  wsManager.value = new WebSocketManager('ws://localhost:5080');
  console.log('WebSocketManager created');
  
  // Register message handlers
  wsManager.value.registerHandler(MESSAGE_TYPES.DISPLAY_UPDATE, (payload) => {
    currentDisplay.value = payload.display;
  });
  
  wsManager.value.registerHandler(MESSAGE_TYPES.START_CAPTURE, () => {
    currentDisplay.value = 'capture';
  });
  
  wsManager.value.registerHandler(MESSAGE_TYPES.RETAKE_CAPTURE, () => {
    if (captureDisplay.value) {
      captureDisplay.value.startCapture();
    }
  });
  
  wsManager.value.registerHandler(MESSAGE_TYPES.START_TRANSFORM, () => {
    currentDisplay.value = 'transform';
  });
  
  wsManager.value.registerHandler(MESSAGE_TYPES.SHOW_REVIEW, () => {
    currentDisplay.value = 'review';
  });

  wsManager.value.connect();
});

onUnmounted(() => {
  if (wsManager.value) {
    wsManager.value.close();
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
      ref="captureDisplay"
    />
  </div>
</template>