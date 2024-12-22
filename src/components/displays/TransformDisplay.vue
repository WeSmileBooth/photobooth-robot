<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue';
import { Vue3Lottie } from 'vue3-lottie';
import { useImageStore } from '../../stores/imageStore';
import * as api from '../../service/modal';
import { useWebsocket } from '../../service/websocket';

const imageStore = useImageStore();
const processingStatus = ref('waiting');
const { sendMessage } = useWebsocket();


onMounted(async () => {
    console.log('Starting image generation process...');
    try {
        // First, upload the original image
        processingStatus.value = 'uploading';
        await imageStore.uploadImage();
        console.log('Upload complete, submitting to Modal API...');
        
        // Then submit to Modal API
        processingStatus.value = 'submitting';
        await api.submitPrompt();
        console.log('Prompt submitted, starting processing...');
        
        // Mark as processing and start polling
        imageStore.startProcessing();
        processingStatus.value = 'processing';
        
        try {
            // This will keep polling until the image is found
            try {
                await imageStore.startPollingForProcessedImage();
            } catch (error) {
                console.error('Processing failed:', error);
                processingStatus.value = 'error';
                return;
            }

            
            // If we get here, the image was found and loaded
            console.log('Processing complete! Image ready for review.');
            processingStatus.value = 'complete';
            
            sendMessage('GENERATION_COMPLETE',{
                    originalImageUrl: imageStore.originalImageUrl,
                    transformedImageUrl: imageStore.transformedImageUrl
                })
            
            
        } catch (error) {
            console.error('Processing failed:', error);
            processingStatus.value = 'error';
        }
    } catch (error) {
        console.error('Initial process failed:', error);
        processingStatus.value = 'error';
    }
});
</script>

<template>
    <div>
        <Vue3Lottie
            animation-link="https://lottie.host/9a999697-9e06-4773-905c-b16506d427ce/8yvtLXk1am.json"
            class="fixed inset-0 scale-100 z-1 flex justify-center items-center"
        />
        
        <!-- Status messages based on actual processing state -->
        <div 
            class="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg"
        >
            <span v-if="processingStatus === 'waiting'">
                Preparing to process image...
            </span>
            <span v-if="processingStatus === 'uploading'">
                Uploading image...
            </span>
            <span v-if="processingStatus === 'submitting'">
                Submitting for processing...
            </span>
            <span v-if="processingStatus === 'processing'">
                Processing your image...
            </span>
            <span v-if="processingStatus === 'error'" class="text-red-500">
                Something went wrong. Please try again.
            </span>
        </div>
    </div>
</template>