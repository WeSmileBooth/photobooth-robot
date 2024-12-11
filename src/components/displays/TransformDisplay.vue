<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Vue3Lottie } from 'vue3-lottie';
import { useImageStore } from '../../store/imageStore';

const imageStore = useImageStore();
const countdown = ref(4);
const countdownInterval = ref(null);

onMounted(async () => {
  console.log('TransformDisplay mounted');
  
  // Start upload as soon as component mounts
  try {
    await imageStore.uploadImage();
  } catch (error) {
    console.error('Upload failed:', error);
    // Handle error - maybe emit an event or show error state
  }

  // Start countdown
  countdownInterval.value = setInterval(() => {
    if (countdown.value <= 0) {
      clearInterval(countdownInterval.value);
      console.log('Image generation complete! Navigating to review page...');
      return;
    }
    
    console.log(`Image generating, ready in ${countdown.value} seconds...`);
    countdown.value--;
  }, 1000);
});

onUnmounted(() => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
  }
});
</script>

<template>
  <div>
    <lottie
      animation-link="https://lottie.host/9a999697-9e06-4773-905c-b16506d427ce/8yvtLXk1am.json"
      class="fixed inset-0 scale-100 z-1 flex justify-center items-center"
    />
    
    <!-- Optional: Add upload status indicator -->
    <div v-if="imageStore.uploadStatus === 'uploading'"
         class="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
      Uploading image...
    </div>
    
    <div v-if="imageStore.uploadStatus === 'error'"
         class="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-500 bg-opacity-50 text-white px-4 py-2 rounded-lg">
      Upload failed. Please try again.
    </div>
  </div>
</template>