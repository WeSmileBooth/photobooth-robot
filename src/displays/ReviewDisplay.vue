<script setup>
import { onMounted, onUnmounted, ref, computed } from "vue";
import { useImageStore } from "../stores/imageStore";

const imageStore = useImageStore();

// Compute URL for original image
const originalImageUrl = computed(() => {
  if (imageStore.originalImageUrl) {
    return imageStore.originalImageUrl;
  } else if (imageStore.tempImage) {
    // Fallback to blob URL if we only have the tempImage
    return window.URL.createObjectURL(imageStore.tempImage);
  }
  return "/wesmile-logo.png";
});

// Compute URL for processed image
const processedImageUrl = computed(() => {
  return imageStore.transformedImageUrl || "/wesmile-logo.png";
});

// Track whether images are loaded
const isOriginalLoaded = ref(false);
const isProcessedLoaded = ref(false);

onMounted(() => {
  // Check if we already have images in the store
  if (imageStore.originalImageUrl || imageStore.tempImage) {
    isOriginalLoaded.value = true;
  }
  if (imageStore.transformedImageUrl) {
    isProcessedLoaded.value = true;
  }
});

// Clean up any blob URLs when the component unmounts
onUnmounted(() => {
  if (originalImageUrl.value?.startsWith("blob:")) {
    window.URL.revokeObjectURL(originalImageUrl.value);
  }
});

// Handle image load events
const handleOriginalLoad = () => {
  isOriginalLoaded.value = true;
};

const handleProcessedLoad = () => {
  isProcessedLoaded.value = true;
};
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Original image -->
    <div class="flex-none h-[45vh] flex items-center justify-center p-4">
      <img
        :src="originalImageUrl"
        alt="Original Image"
        class="max-h-full w-auto rounded-2xl shadow-lg object-contain transition-opacity duration-300"
        :class="{
          'opacity-0': !isOriginalLoaded,
          'opacity-100': isOriginalLoaded,
        }"
        @load="handleOriginalLoad"
      />
    </div>

    <!-- Processed image -->
    <div class="flex-none h-[45vh] flex items-center justify-center p-4">
      <img
        :src="processedImageUrl"
        alt="Processed Image"
        class="max-h-full w-auto rounded-2xl shadow-lg object-contain transition-opacity duration-300"
        :class="{
          'opacity-0': !isProcessedLoaded,
          'opacity-100': isProcessedLoaded,
        }"
        @load="handleProcessedLoad"
      />
    </div>
  </div>
</template>
