<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>

<template>
  <div class="min-h-screen w-full">
    <Toaster position="top-center" richColors />
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
