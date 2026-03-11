<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>

<template>
  <div
    class="min-h-screen w-full bg-gradient-to-b from-[#fff] to-[#eaf7ef] font-sans text-[#111827]"
  >
    <Toaster
      position="top-center"
      :toastOptions="{
        style: {
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          background: 'transparent',
          boxShadow: 'none',
          border: 'none',
        },
      }"
    />
    <router-view />
  </div>
</template>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  min-height: 100%;
  width: 100%;
}

body {
  overflow-y: auto;
}
</style>
