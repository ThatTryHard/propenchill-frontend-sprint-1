<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>

<template>
  <div class="h-screen w-screen overflow-hidden">
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
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
