<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
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

const lastFetchedToken = ref<string | null>(null)

const publicDefaultRouteNames = [
  'home',
  'login',
  'register',
  'password-reset',
  'verify-otp',
  'set-new-password',
  'verify-email',
]

const isPublicDefaultRoute = () => {
  return (
    route.meta.publicDefault === true ||
    publicDefaultRouteNames.includes(String(route.name || ''))
  )
}

const applyPreferenceByAuthStatus = async () => {
  if (isPublicDefaultRoute()) {
    settingsPreferenceStore.applyPublicDefaultPreference()
    return
  }

  if (!authStore.accessToken) {
    settingsPreferenceStore.applyPublicDefaultPreference()
    lastFetchedToken.value = null
    return
  }

  settingsPreferenceStore.applySavedPreference()

  if (
    lastFetchedToken.value === authStore.accessToken &&
    settingsPreferenceStore.preference
  ) {
    return
  }

  try {
    await settingsPreferenceStore.fetchPreference()
    lastFetchedToken.value = authStore.accessToken
  } catch (error) {
    console.error('Gagal mengambil preference dari database:', error)
  }
}

onMounted(() => {
  applyPreferenceByAuthStatus()
})

watch(
  () => [route.fullPath, authStore.accessToken],
  () => {
    applyPreferenceByAuthStatus()
  },
)
</script>

<template>
  <div
    class="
      min-h-screen w-full
      bg-[var(--app-bg)] text-[var(--app-text)]
      font-[var(--font-sans)] text-[length:var(--app-font-base)]
      transition-[background-color,color,font-size] duration-200 ease-in-out
    "
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
      :type="alertState.type as any"
      :title="alertState.title"
      :message="alertState.message"
      @close="closeAlert"
    />

    <VAlert
      v-if="suratKeluarStore.alertState.show"
      :type="suratKeluarStore.alertState.type as any"
      :title="suratKeluarStore.alertState.title"
      :message="suratKeluarStore.alertState.message"
      @close="suratKeluarStore.closeAlert"
    />

    <router-view />
  </div>
</template>