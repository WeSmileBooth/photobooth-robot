import { defineStore } from 'pinia';
import { storage } from '../firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useSession } from './sessionStore';

const session = useSession()

export const useImageStore = defineStore('image', {
  state: () => ({
    tempImage: null,
    uploadStatus: '',
    originalImageUrl:'',
    transformedImageUrl: '',
    isPolling: false,
    pollingAttempts: 0,
  }),
  
  actions: {
    setTempImage(imageBlob) {
      this.tempImage = imageBlob;
      this.originalImageUrl = '';
      this.transformedImageUrl = '';
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
        const filename = `${session.data.value?.id}/before`;
        console.log('Uploading original image to:', filename);

        const imageRef = storageRef(storage, filename);
        await uploadBytes(imageRef, this.tempImage);
        const url = await getDownloadURL(imageRef);
        console.log('Original image uploaded successfully to:', url);

        this.originalImageUrl = url;
        this.uploadStatus = 'uploaded';
        return url;
      } catch (error) {
        console.error('Upload error:', error);
        this.uploadStatus = 'error';
        throw error;
      }
    },

    async checkProcessedImage(): Promise<string | null> {
      if (!session.data.value?.id) {
        console.error('No user session ID');
        return null;
      }

      try {
        const processedImagePath = `${session.data.value.id}/after`;
        console.log('Checking for processed image at:', processedImagePath);
        
        const processedImageRef = storageRef(storage, processedImagePath);
        const url = await getDownloadURL(processedImageRef);
        console.log('Found processed image at:', url);
        return url;
      } catch (error: any) {
        if (error.code === 'storage/object-not-found') {
          console.log('Processed image not found yet at:', `${session.data.value.id}/after`);
          return null;
        }
        console.error('Error checking processed image:', error);
        return null;
      }
    },

    startProcessing() {
      this.uploadStatus = 'processing';
      console.log('Image processing started');
    },

    async startPollingForProcessedImage(maxAttempts: number = 120, intervalMs: number = 1000) {
      console.log('Starting to poll for processed image...');
      this.isPolling = true;
      this.pollingAttempts = 0;
      
      return new Promise((resolve, reject) => {
          const checkInterval = setInterval(async () => {
              if (this.pollingAttempts >= maxAttempts) {
                  clearInterval(checkInterval);
                  this.isPolling = false;
                  reject(new Error('Polling timeout - image processing took too long'));
                  return;
              }

              try {
                  const imageUrl = await this.checkProcessedImage();
                  
                  if (imageUrl) {
                      clearInterval(checkInterval);
                      this.isPolling = false;
                      this.transformedImageUrl = imageUrl;
                      this.uploadStatus = 'success';
                      resolve(imageUrl);
                      return;
                  }

                  console.log(`Polling attempt ${this.pollingAttempts + 1}/${maxAttempts}: Image not ready yet`);
                  this.pollingAttempts++;
                  
              } catch (error) {
                  clearInterval(checkInterval);
                  this.isPolling = false;
                  reject(error);
              }
          }, intervalMs);
      });
    }
  }
});