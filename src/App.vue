<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import VAlert from '@/components/common/VAlert.vue'
import { useGlobalAlert } from '@/composables/useGlobalAlert'

const { alertState, closeAlert } = useGlobalAlert()
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
    <VAlert
      v-if="alertState.show"
      :type="alertState.type"
      :title="alertState.title"
      :message="alertState.message"
      @close="closeAlert"
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
