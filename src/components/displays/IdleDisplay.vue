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
  const mobileAppUrl = `http://192.168.0.101:5173/?session=${sessionId}&ngrok=${ngrokUrl}`;

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
  <div
    class="min-h-screen w-full bg-gradient-to-b from-blue-50 to-white flex flex-col justify-between p-4 sm:p-6 md:p-8 lg:p-16"
  >
    <!-- Header Section -->
    <header class="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16">
      <h1
        class="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4"
      >
        {{ CONFIG.title }}
      </h1>
      <p class="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-600">
        {{ CONFIG.subtitle }}
      </p>
    </header>

    <!-- Main Content Section -->
    <main
      class="flex-grow flex flex-col items-center justify-center space-y-6 sm:space-y-8 md:space-y-12 lg:space-y-16"
    >
      <!-- QR Code Section -->
      <div
        v-if="isQRCodeLoading"
        class="animate-pulse w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-64 lg:h-64 bg-gray-300 rounded-lg"
      ></div>
      <div
        v-else-if="error"
        class="text-red-500 text-base sm:text-lg md:text-xl lg:text-2xl text-center"
      >
        {{ error }}
      </div>
      <div
        v-else
        class="bg-white p-4 sm:p-6 md:p-8 lg:p-12 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg transform transition-all hover:shadow-xl"
      >
        <div
          class="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-64 lg:h-64 flex items-center justify-center mx-auto"
          v-html="qrCodeSvg"
        ></div>
        <p
          class="text-center mt-2 sm:mt-3 md:mt-4 lg:mt-6 text-gray-700 text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium"
        >
          Scan to begin your experience
        </p>
      </div>

      <!-- Instructions Section -->
      <div class="w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <div
          class="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-md p-4 sm:p-6 md:p-8 lg:p-12"
        >
          <h2
            class="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-semibold text-gray-800 mb-4 sm:mb-6 md:mb-8"
          >
            How it works:
          </h2>
          <div class="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
            <div
              v-for="(instruction, index) in CONFIG.instructions"
              :key="index"
              class="flex items-center space-x-3 sm:space-x-4 md:space-x-6"
            >
              <div
                class="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold"
              >
                {{ index + 1 }}
              </div>
              <p
                class="text-gray-700 text-lg sm:text-xl md:text-2xl lg:text-3xl"
              >
                {{ instruction }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer Section -->
    <footer class="text-center text-gray-500 mt-6 sm:mt-8 md:mt-12 lg:mt-16">
      <p class="text-lg sm:text-xl md:text-2xl">
        Waiting for the next artistic masterpiece...
      </p>
    </footer>
  </div>
</template>
