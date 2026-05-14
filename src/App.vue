<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Toaster } from 'vue-sonner'
import VAlert from '@/components/common/VAlert.vue'
import { useGlobalAlert } from '@/composables/useGlobalAlert'
import { useSuratKeluarStore } from '@/stores/surat_keluar'
import { useSettingsPreferenceStore } from '@/stores/settingsPreference'
import { useAuthStore } from '@/stores/users/auth'

const route = useRoute()

const { alertState, closeAlert } = useGlobalAlert()
const suratKeluarStore = useSuratKeluarStore()
const settingsPreferenceStore = useSettingsPreferenceStore()
const authStore = useAuthStore()

const applyPreferenceByAuthStatus = async () => {
  if (!authStore.accessToken) {
    settingsPreferenceStore.applyPublicDefaultPreference()
    return
  }

  settingsPreferenceStore.applySavedPreference()

  try {
    await settingsPreferenceStore.fetchPreference()
  } catch (error) {
    console.error('Gagal mengambil preference dari database:', error)
  }
}

onMounted(() => {
  applyPreferenceByAuthStatus()
})

watch(
  () => route.fullPath,
  () => {
    applyPreferenceByAuthStatus()
  }
)
</script>

<template>
  <div class="app-shell min-h-screen w-full font-sans">
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

    <VAlert
      v-if="suratKeluarStore.alertState.show"
      :type="suratKeluarStore.alertState.type"
      :title="suratKeluarStore.alertState.title"
      :message="suratKeluarStore.alertState.message"
      @close="suratKeluarStore.closeAlert"
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

.app-shell {
  min-height: 100vh;
  background: var(--app-bg);
  color: var(--app-text);
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    font-size 0.2s ease;
}
</style>