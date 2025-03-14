<script setup>
import { ref, onMounted, onUnmounted, inject } from "vue";
import { useIntervalFn } from "@vueuse/core";
import { useImageStore } from "../stores/imageStore";
import { useWebsocket } from "../service/websocket";
const video = ref(null);
const capturedImageUrl = ref(null);
const count = ref(6);
const isInitializing = ref(true);
const imageStore = useImageStore();
const { sendMessage } = useWebsocket();

const CAMERA_CONFIG = {
  width: 500,
  height: 500,
  countdownStart: 6,
  videoConstraints: {
    width: { ideal: 500 },
    height: { ideal: 500 },
    facingMode: "environment",
  },
};

function snapshotImage(src) {
  const canvas = document.createElement("canvas");
  canvas.width = CAMERA_CONFIG.width;
  canvas.height = CAMERA_CONFIG.height;
  const context = canvas.getContext("2d");

  const scale = Math.max(
    CAMERA_CONFIG.width / src.videoWidth,
    CAMERA_CONFIG.height / src.videoHeight
  );
  const scaledWidth = src.videoWidth * scale;
  const scaledHeight = src.videoHeight * scale;
  const x = (CAMERA_CONFIG.width - scaledWidth) / 2;
  const y = (CAMERA_CONFIG.height - scaledHeight) / 2;

  context.drawImage(src, x, y, scaledWidth, scaledHeight);
  count.value = CAMERA_CONFIG.countdownStart;
  return canvas;
}

async function takePhoto() {
  const _video = video.value;
  if (!_video) {
    console.log("No video element found");
    return;
  }

  try {
    const photo = snapshotImage(_video);
    const blob = await new Promise((resolve) => {
      photo.toBlob(resolve, "image/png");
    });
    capturedImageUrl.value = URL.createObjectURL(blob);

    // Store in Pinia first
    imageStore.setTempImage(blob);
    console.log("Image taken");
  } catch (error) {
    console.error("Photo capture error:", error);
  }
}

const initCamera = async () => {
  console.log("Initializing robot camera");
  try {
    const permissionStatus = await navigator.permissions.query({
      name: "camera",
    });
    console.log(navigator.mediaDevices);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: CAMERA_CONFIG.videoConstraints,
      audio: false,
    });
    console.log(video.value);
    if (video.value) {
      video.value.srcObject = stream;
      console.log(stream);
      await video.value.play();
      if (isInitializing.value) {
        isInitializing.value = false;
        startCapture();
      }
    }
  } catch (error) {
    console.error("Robot camera start error:", error);
  }
};

const countdown = useIntervalFn(async () => {
  if (count.value === 0) {
    await takePhoto();
    console.log("MEssage sent");
    sendMessage("COUNTER_UPDATE", {
      count: 0,
      isComplete: true,
    });
    return countdown.pause();
  }
  count.value--;
  sendMessage("COUNTER_UPDATE", {
    count: count.value,
    isComplete: false,
  });
}, 1000);

function startCapture() {
  if (capturedImageUrl.value) {
    URL.revokeObjectURL(capturedImageUrl.value);
  }
  capturedImageUrl.value = null;
  imageStore.clearTempImage();
  count.value = CAMERA_CONFIG.countdownStart;
  countdown.resume();
}

defineExpose({ startCapture });

onMounted(async () => {
  console.log("Robot CaptureDisplay mounted");
  await initCamera();
});

onUnmounted(() => {
  console.log("Robot CaptureDisplay unmounting");
  if (video.value && video.value.srcObject) {
    const stream = video.value.srcObject;
    stream.getTracks().forEach((track) => track.stop());
    video.value.srcObject = null;
  }
  if (capturedImageUrl.value) {
    URL.revokeObjectURL(capturedImageUrl.value);
  }
});
</script>

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
