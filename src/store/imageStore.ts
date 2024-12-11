import { defineStore } from 'pinia'

interface ImageState {
  tempImage: Blob | null
}

export const useImageStore = defineStore('image', {
  state: (): ImageState => ({
    tempImage: null
  }),
  actions: {
    setTempImage(image: Blob) {
      this.tempImage = image
    },
    clearTempImage() {
      this.tempImage = null
    }
  }
})