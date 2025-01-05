import { StorageSerializers, useStorage } from "@vueuse/core";
import { ref } from "vue";

export function useSession() {
  const data = useStorage<{
    id: string;
    prompt: string[];
    jobId: string | null;
    status: "waiting" | "connected" | "completed";
    connectedAt: number | null;
    lastActivity: number;
  } | null>("session", null, localStorage, {
    serializer: StorageSerializers.object,
  });

  function create() {
    data.value = {
      id: Math.random().toString(36).slice(-6),
      prompt: [],
      jobId: null,
      status: "waiting",
      connectedAt: null,
      lastActivity: Date.now(),
    };
    console.log("📝 New session created:", data.value.id);
  }

  function destroy() {
    if (data.value) {
      console.log("🗑️ Session destroyed:", data.value.id);
    }
    data.value = null;
  }

  function handleMobileConnection() {
    if (data.value) {
      data.value.status = "connected";
      data.value.connectedAt = Date.now();
      data.value.lastActivity = Date.now();
      console.log("📱 Mobile connected to session:", data.value.id);
    }
  }

  function updateActivity() {
    if (data.value) {
      data.value.lastActivity = Date.now();
    }
  }

  function isActive() {
    return data.value?.status === "connected";
  }

  function complete() {
    if (data.value) {
      data.value.status = "completed";
      console.log("✅ Session completed:", data.value.id);
    }
  }

  return {
    data,
    create,
    destroy,
    handleMobileConnection,
    updateActivity,
    isActive,
    complete,
  };
}
