// stores/displayStore.ts
import { defineStore } from 'pinia'

export const useDisplayStore = defineStore('display', {
  state: () => ({
    currentDisplay: 'idle'
  }),
  actions: {
    setDisplay(display: string) {
      this.currentDisplay = display
    }
  }
})