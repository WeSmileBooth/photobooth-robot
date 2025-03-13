import { defineStore } from "pinia";
import { ref } from "vue";

export const usePromptStore = defineStore("prompt", () => {
  const prompt = ref("");

  function setPrompt(newPrompt) {
    prompt.value = newPrompt;
  }

  return {
    prompt,
    setPrompt,
  };
});
