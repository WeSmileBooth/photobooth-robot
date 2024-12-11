<script setup>
import { onMounted, onUnmounted } from 'vue';
import { Vue3Lottie as lottie } from "vue3-lottie";

onMounted(() => {
  console.log('Component mounted');
  
  let secondsRemaining = 4;
  
  // Create an interval that fires every second
  const countdownInterval = setInterval(() => {
    // First check if we've reached 0
    if (secondsRemaining <= 0) {
      clearInterval(countdownInterval); // Clean up the interval
      console.log('Image generation complete! Navigating to review page...');
      return;
    }
    
    // Log the current status with remaining time
    console.log(`Image generating, ready in ${secondsRemaining} seconds...`);
    
    // Decrease our counter
    secondsRemaining--;
  }, 1000); // Run every 1000ms (1 second)
  
  // Clean up function to prevent memory leaks
  onUnmounted(() => {
    clearInterval(countdownInterval);
  });
});
</script>

<template>
	<div>
		<lottie
			animation-link="https://lottie.host/9a999697-9e06-4773-905c-b16506d427ce/8yvtLXk1am.json"
			class="fixed inset-0 scale-100 z-1 flex justify-center items-center"
		/>
	</div>
</template>