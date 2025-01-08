<script setup>
import { ref, onMounted, onUnmounted, inject } from "vue";
import QRCode from "qrcode";
import { useSession } from "../../stores/sessionStore";

// Configuration
const CONFIG = {
  title: "WeSmile Photobooth",
  subtitle: "Create your AI-powered photo masterpiece",
  instructions: [
    "Scan the QR code with your phone",
    "Answer a few fun questions",
    "Strike your best pose",
    "Get your AI-transformed masterpiece!",
  ],
  qrCode: {
    width: 500,
    margin: 0,
    colors: {
      dark: "#000000",
      light: "#ffffff",
    },
  },
};

const qrCodeSvg = ref("");
const isQRCodeLoading = ref(true);
const error = ref(null);
const session = useSession();

async function generateQRCode() {
  session.create();
  const sessionId = session.data.value.id;

  console.log(session.data.value.id);

  const response = await fetch("/server");
  const ngrokUrl = await response.text();

  //Depending on the url will be different
  const mobileAppUrl = `http://192.168.1.248:5173/?session=${sessionId}&ngrok=${ngrokUrl}`;

  try {
    isQRCodeLoading.value = true;
    error.value = null;

    console.log(mobileAppUrl);

    const qrCode = await QRCode.toString(mobileAppUrl, {
      type: "svg",
      width: CONFIG.qrCode.width,
      margin: CONFIG.qrCode.margin,
      color: CONFIG.qrCode.colors,
    });

    qrCodeSvg.value = qrCode;

    if (window.ws?.readyState === WebSocket.OPEN) {
      window.ws.send(
        JSON.stringify({
          type: "SESSION_CREATED",
          payload: {
            sessionId,
            timestamp: Date.now(),
          },
        })
      );
    }
  } catch (err) {
    console.error("Error generating QR code:", err);
    error.value = "Failed to generate QR code. Please refresh the page.";
  } finally {
    isQRCodeLoading.value = false;
  }
}

let qrCodeRefreshInterval;

onMounted(async () => {
  generateQRCode();
  qrCodeRefreshInterval = setInterval(generateQRCode, 5 * 60 * 1000); // Refresh every 5 minutes
});

onUnmounted(() => {
  if (qrCodeRefreshInterval) {
    clearInterval(qrCodeRefreshInterval);
  }
});
</script>

<template>
  <div class="absolute inset-0 bg-gradient-to-b from-blue-50 to-white flex flex-col">
    <!-- Header Section -->
    <header class="text-center pt-12 md:pt-16">
      <h1 class="text-5xl md:text-7xl font-bold text-gray-800 mb-4">
        {{ CONFIG.title }}
      </h1>
      <p class="text-2xl md:text-4xl text-gray-600">
        {{ CONFIG.subtitle }}
      </p>
    </header>

    <!-- Main Content Section -->
    <main class="flex-1 flex flex-col items-center justify-center gap-16 md:gap-20 px-8">
      <!-- QR Code Section -->
      <div v-if="isQRCodeLoading" class="animate-pulse w-64 md:w-96 h-64 md:h-96 bg-gray-300 rounded-lg">
      </div>
      <div v-else-if="error" class="text-red-500 text-2xl md:text-3xl text-center">
        {{ error }}
      </div>
      <div v-else class="bg-white p-10 md:p-12 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
        <div class="w-64 md:w-96 h-64 md:h-96 flex items-center justify-center" v-html="qrCodeSvg">
        </div>
        <p class="text-center mt-8 text-gray-700 text-2xl md:text-3xl font-medium">
          Scan to begin your experience
        </p>
      </div>

      <!-- Instructions Section -->
      <div class="w-full max-w-4xl md:max-w-5xl px-4">
        <div class="bg-white rounded-2xl shadow-md p-10 md:p-12">
          <h2 class="text-4xl md:text-5xl font-semibold text-gray-800 mb-10">
            How it works:
          </h2>
          <div class="space-y-8 md:space-y-10">
            <div v-for="(instruction, index) in CONFIG.instructions" :key="index" class="flex items-center space-x-8">
              <div
                class="w-16 md:w-20 h-16 md:h-20 bg-blue-500 text-white rounded-full flex items-center justify-center text-3xl md:text-4xl font-bold">
                {{ index + 1 }}
              </div>
              <p class="flex-1 text-gray-700 text-2xl md:text-3xl text-left">
                {{ instruction }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>



    <!-- Footer Section -->
    <footer class="text-center text-gray-500 py-10 md:py-12">
      <p class="text-2xl md:text-3xl">
        Waiting for the next artistic masterpiece...
      </p>
    </footer>
  </div>
</template>