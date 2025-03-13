<script setup>
import { ref, onMounted, onUnmounted, provide } from "vue";
import IdleDisplay from "./displays/IdleDisplay.vue";
import CaptureDisplay from "./displays/CaptureDisplay.vue";
import QuizDisplay from "./displays/QuizDisplay.vue";
import TransformDisplay from "./displays/TransformDisplay.vue";
import ReviewDisplay from "./displays/ReviewDisplay.vue";
import { useWebsocket } from "./service/websocket";
import { useSession } from "./stores/sessionStore";
import { usePromptStore } from "./stores/promptStore";
import { toast, Toaster } from "vue-sonner";

const currentDisplay = ref("idle");
const ws = ref(null);
const currentComponentRef = ref(null);
const { setupWebsocket, addMessageHandler } = useWebsocket();
const session = useSession();
const promptStore = usePromptStore();

onMounted(async () => {
  await setupWebsocket();

  //Change the display based on the message received
  addMessageHandler((data) => {
    if (data.type === "DISPLAY_UPDATE") {
      currentDisplay.value = data.payload.display;
    } else if (data.type === "RETAKE") {
      currentComponentRef.value.startCapture();
    } else if (data.type === "MOBILE_CONNECTED") {
      const sessionId = data.payload.id;

      // If no active session, create one
      if (!session.data.value) {
        session.create();
        console.log(
          "📱 New mobile connected, created session:",
          session.data.value.id
        );
        return;
      }

      // If session exists, check if it's the same session reconnecting
      if (session.data.value.id === sessionId) {
        console.log("📱 Mobile reconnected to session:", sessionId);
        toast.success(`📱 Mobile connected to session: ${sessionId}`);
        return;
      }

      console.log(
        "⚠️ Cannot connect: Active session in progress:",
        session.data.value.id
      );
    } else if (data.type === "PROMPT_UPDATE") {
      promptStore.setPrompt(data.payload.prompt);
      console.log("Prompt updated:", promptStore.data.value);
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
  <div class="fixed inset-0 w-full h-full">
    <component
      :is="
        currentDisplay === 'idle'
          ? IdleDisplay
          : currentDisplay === 'capture'
          ? CaptureDisplay
          : currentDisplay === 'quiz'
          ? QuizDisplay
          : currentDisplay === 'transform'
          ? TransformDisplay
          : currentDisplay === 'review'
          ? ReviewDisplay
          : null
      "
      ref="currentComponentRef"
    />
    <Toaster position="top-right" />
  </div>
</template>
