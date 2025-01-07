<script setup>
import { Vue3Lottie } from 'vue3-lottie'
</script>
<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-6">
    <!-- Lottie Animation -->
    <Vue3Lottie animation-link="https://lottie.host/9b0b78ef-6066-4987-ad03-617ff7c887f5/2vLuNp1XJj.lottie"
      :height="300" :width="300" class="mb-8" />

    <!-- Text below animation -->
    <h1 class="text-center text-2xl md:text-3xl font-semibold text-gray-800 leading-relaxed">
      Answer the question
      <span class="block text-blue-600 mt-2">on your mobile phone</span>
    </h1>
  </div>
</template>
