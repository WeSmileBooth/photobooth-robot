import { defineStore } from 'pinia';
import { storage } from '../firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export const useImageStore = defineStore('image', {
  state: () => ({
    tempImage: null,
    uploadStatus: '',
    transformedImageUrl: '',
  }),
  
  actions: {
    setTempImage(imageBlob) {
      this.tempImage = imageBlob;
    },
    
    clearTempImage() {
      this.tempImage = null;
      this.transformedImageUrl = '';
      this.uploadStatus = '';
    },

    async uploadImage() {
      if (!this.tempImage) {
        console.error('No image to upload');
        return null;
      }

      try {
        this.uploadStatus = 'uploading';
        console.log('Uploading image...');
        const filename = `captures/${Date.now()}-photo.png`;
        const imageRef = storageRef(storage, filename);
        
        await uploadBytes(imageRef, this.tempImage);
        const url = await getDownloadURL(imageRef);
        
        this.transformedImageUrl = url;
        this.uploadStatus = 'success';
        console.log('Upload complete:', url);
        return url;
      } catch (error) {
        console.error('Upload error:', error);
        this.uploadStatus = 'error';
        throw error;
      }
    }
  }
});