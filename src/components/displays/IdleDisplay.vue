<!-- robot app IdleDisplay -->

<template>
  <div class="h-screen w-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-between p-16">
    <!-- Header Section - Larger text for visibility from a distance -->
    <header class="text-center mb-16">
      <h1 class="text-8xl font-bold text-gray-800 mb-4">WeSmile Photobooth</h1>
      <p class="text-4xl text-gray-600">Create your AI-powered photo masterpiece</p>
    </header>

    <!-- Main Content Section - Centered with large QR code -->
    <main class="flex-grow flex flex-col items-center justify-center space-y-8 md:space-y-12 lg:space-y-16">
  <!-- QR Code Container with responsive sizing -->
  <div class="bg-white p-8 md:p-12 lg:p-16 rounded-3xl shadow-lg transform transition-all hover:shadow-xl">
    <div 
      class="w-[50px] h-[50px] md:w-[150px] md:h-[150px] lg:w-[200px] lg:h-[200px] flex items-center justify-center"
      v-html="qrCodeSvg"
    ></div>
    <p class="text-center mt-4 md:mt-6 lg:mt-8 text-gray-700 text-xl md:text-2xl lg:text-3xl font-medium">
      Scan to begin your experience
    </p>
  </div>

      <!-- Instructions - Large, clear text -->
      <div class="max-w-4xl w-full">
        <div class="bg-white rounded-3xl shadow-md p-12">
          <h2 class="text-4xl font-semibold text-gray-800 mb-8">How it works:</h2>
          <div class="space-y-6">
            <div class="flex items-center space-x-6">
              <div class="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-3xl font-bold">1</div>
              <p class="text-gray-700 text-3xl">Scan the QR code with your phone</p>
            </div>
            <div class="flex items-center space-x-6">
              <div class="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-3xl font-bold">2</div>
              <p class="text-gray-700 text-3xl">Answer a few fun questions</p>
            </div>
            <div class="flex items-center space-x-6">
              <div class="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-3xl font-bold">3</div>
              <p class="text-gray-700 text-3xl">Strike your best pose</p>
            </div>
            <div class="flex items-center space-x-6">
              <div class="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-3xl font-bold">4</div>
              <p class="text-gray-700 text-3xl">Get your AI-transformed masterpiece!</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer Section -->
    <footer class="text-center text-gray-500 mt-16">
      <p class="text-2xl">Waiting for the next artistic masterpiece...</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import QRCode from 'qrcode';

const qrCodeSvg = ref('');

function generateSessionId() {
  return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

async function generateQRCode() {
    const sessionId = generateSessionId();
    const robotIP = window.location.hostname === 'localhost' 
        ? '10.10.10.133'  // Replace with your robot's IP
        : window.location.hostname;
    
    // Update URL to include both session and websocket info
    const mobileAppUrl = `http://145.93.145.185:5173/?session=${sessionId}&robotIp=${robotIP}`;
    
    try {
        const qrCode = await QRCode.toString(mobileAppUrl, {
            type: 'svg',
            width: 500,
            margin: 0,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
        qrCodeSvg.value = qrCode;
        
        // Emit session creation event through WebSocket
        if (window.ws) {
            window.ws.send(JSON.stringify({
                type: 'SESSION_CREATED',
                payload: {
                    sessionId: sessionId,
                    timestamp: Date.now()
                }
            }));
        }
    } catch (err) {
        console.error('Error generating QR code:', err);
    }
}

onMounted(() => {
  generateQRCode();
});
</script>