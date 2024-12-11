<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue';
// import { useImageStore } from '../store/imageStore';

// Get access to our image store
// const imageStore = useImageStore();

const imageUrl = computed(() => {
  // if (imageStore.tempImage) {
  //   return window.URL.createObjectURL(imageStore.tempImage) // Using window.URL explicitly
  // }
  return '/wesmile-logo.png'
})

onMounted(() => {
  // When the component mounts, we'll get the stored image and create a URL for it
  const storedImage = imageStore.getTempImage;
  if (storedImage) {
    // Create a URL that we can use in our img elements
    imageUrl.value = URL.createObjectURL(storedImage);
  }
  
  // Clean up the created URL when the component unmounts
  onUnmounted(() => {
  if (imageUrl.value && imageUrl.value.startsWith('blob:')) {
    window.URL.revokeObjectURL(imageUrl.value)
  }
})
});

// Function to handle saving the image
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Top image - reduced flex-1 to flex-none and added specific height -->
    <div class="flex-none h-[45vh] flex items-center justify-center">
      <img 
        :src="imageUrl"
        alt="WeSmile Logo" 
        class="max-h-full w-auto rounded-2xl shadow-lg object-contain"
      />
    </div>


  </div>
</template>