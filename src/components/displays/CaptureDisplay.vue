<template>
  <div class="h-screen w-screen overflow-hidden m-0 p-0 absolute inset-0">
    <video
      ref="video"
      class="h-[500px] w-[500px] object-cover mx-auto mt-8"
      muted
      autoplay
      playsinline
    />
    <img 
      v-if="capturedImageUrl"
      :src="capturedImageUrl"
      class="h-[500px] w-[500px] object-cover mx-auto mt-8 absolute top-0 left-1/2 -translate-x-1/2"
      alt="Captured photo"
    />
    <span
      v-if="countdown.isActive.value"
      class="text-[15rem] text-green-500 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold"
    >
      {{ count }}
    </span>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useIntervalFn } from '@vueuse/core'
// import { useImageStore } from '../../store/imageStore';


defineExpose({ startCapture })

const video = ref(null)
const capturedImageUrl = ref(null)
const count = ref(6)
const isInitializing = ref(true)
// const ImageStore = useImageStore()


const countdown = useIntervalFn(() => {
  console.log('Countdown:', count.value)
  if (count.value === 0) {
    takePhoto()
    return countdown.pause()
  }
  count.value--
}, 1000)

function startCapture() {
  console.log('Starting new capture')
  capturedImageUrl.value = null // Clear previous photo
  // imageStore.clearTempImage() // Clear the store
  countdown.resume()
}

function snapshotImage(src) {
  const canvas = new OffscreenCanvas(500, 500);
  const context = canvas.getContext("2d");
  
  // Calculate scaling and positioning to get a centered square crop
  const scale = Math.max(500 / src.videoWidth, 500 / src.videoHeight);
  const scaledWidth = src.videoWidth * scale;
  const scaledHeight = src.videoHeight * scale;
  const x = (500 - scaledWidth) / 2;
  const y = (500 - scaledHeight) / 2;

  context.drawImage(src, x, y, scaledWidth, scaledHeight);
  count.value = 6; // Reset countdown
  return canvas;
}

// Initialize camera
const initCamera = async () => {
  console.log('Initializing robot camera')
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 500 },
        height: { ideal: 500 },
        facingMode: 'environment'
      },
      audio: false,
    })
    if (video.value) {
      video.value.srcObject = stream
      console.log('Stream set to video')
      // Only start capture if this is the initial mounting
      if (isInitializing.value) {
        isInitializing.value = false
        startCapture()
      }
    }
  } catch (error) {
    console.error('Robot camera start error:', error)
  }
}

async function takePhoto() {
  console.log('Taking photo')
  const _video = video.value;
  if (!_video) {
    console.log('No video element found')
    return;
  }
  
  try {
    const photo = snapshotImage(_video);
    const blob = await photo.convertToBlob({ type: "image/png" });
    capturedImageUrl.value = URL.createObjectURL(blob);
    // ImageStore.setTempImage(blob)
    console.log('Photo taken successfully')
  } catch (error) {
    console.error('Photo capture error:', error)
  }
}

onMounted(async () => {
  console.log('Robot CaptureDisplay mounted')
  await initCamera()
})

onUnmounted(() => {
  console.log('Robot CaptureDisplay unmounting')
  if (video.value) {
    const stream = video.value.srcObject
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    video.value.srcObject = null
  }
  if (capturedImageUrl.value) {
    URL.revokeObjectURL(capturedImageUrl.value)
  }
})
</script>