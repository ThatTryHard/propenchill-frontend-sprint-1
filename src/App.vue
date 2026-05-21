<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toaster } from 'vue-sonner'
import { Bell, ChevronRight, Clock3 } from 'lucide-vue-next'
import VAlert from '@/components/common/VAlert.vue'
import VButton from '@/components/common/VButton.vue'
import VModal from '@/components/common/VModal.vue'
import { useGlobalAlert } from '@/composables/useGlobalAlert'
import { useSuratKeluarStore } from '@/stores/surat_keluar'
import { useSettingsPreferenceStore } from '@/stores/settingsPreference'
import { useAuthStore } from '@/stores/users/auth'
import type { ActivityLogItem } from '@/stores/activity_logs'

const route = useRoute()
const router = useRouter()

const { alertState, closeAlert, showAlert } = useGlobalAlert()
const suratKeluarStore = useSuratKeluarStore()
const settingsPreferenceStore = useSettingsPreferenceStore()
const authStore = useAuthStore()

const lastFetchedToken = ref<string | null>(null)
const LETTER_STATUS_NOTIFICATION_KEY = 'last_letter_status_notification_id'
const isNotificationPanelOpen = ref(false)
const notificationItems = ref<ActivityLogItem[]>([])
const notificationLoading = ref(false)
const notificationError = ref<string | null>(null)

const notificationStorageKey = () => {
  const identity = authStore.user?.email || authStore.user?.nama || authStore.role || 'guest'
  return `${LETTER_STATUS_NOTIFICATION_KEY}:${identity}`
}

const getLastSeenNotificationId = () => {
  return Number(localStorage.getItem(notificationStorageKey()) || '0')
}

const setLastSeenNotificationId = (value: number) => {
  if (!value || Number.isNaN(value)) return
  localStorage.setItem(notificationStorageKey(), String(value))
}

const shouldShowStatusNotifications = computed(() => {
  return Boolean(authStore.accessToken && settingsPreferenceStore.preference?.notify_letter_status)
})

const notificationUnreadCount = computed(() => {
  const lastSeenId = getLastSeenNotificationId()
  return notificationItems.value.filter((item) => Number(item.id || 0) > lastSeenId).length
})

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
    await loadLetterNotifications({ announceLatest: true })
  } catch (error) {
    console.error('Gagal mengambil preference dari database:', error)
  }
}

const loadLetterNotifications = async ({ announceLatest = false } = {}) => {
  if (!authStore.accessToken || !settingsPreferenceStore.preference?.notify_letter_status) {
    notificationItems.value = []
    notificationError.value = null
    return
  }

  try {
    notificationLoading.value = true
    notificationError.value = null

    const response = await fetch('/api/activity-logs/my-notifications/?limit=5', {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      notificationItems.value = []
      return
    }

    const result = await response.json()
    let items = Array.isArray(result?.data?.items) ? (result.data.items as ActivityLogItem[]) : []
    const latestId = Number(result?.data?.latest_id || items[0]?.id || 0)

    // Filter to show only notifications from the past 3 hours
    const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000
    items = items.filter((item) => {
      if (!item.created_at) return false
      const itemTime = new Date(item.created_at).getTime()
      return itemTime >= threeHoursAgo
    })

    notificationItems.value = items

    if (!items.length) {
      return
    }

    const lastSeenId = getLastSeenNotificationId()
    const newestNotification = items.find((item) => Number(item.id || 0) > lastSeenId) || null

    if (announceLatest && newestNotification && latestId > lastSeenId) {
      showAlert(
        'information',
        newestNotification.description || 'Ada pembaruan status pengajuan surat.',
        newestNotification.title || 'Status pengajuan surat berubah',
      )
      setLastSeenNotificationId(latestId)
    }
  } catch (error) {
    notificationError.value = error instanceof Error ? error.message : 'Gagal memuat notifikasi.'
    console.error('Gagal memuat notifikasi status surat:', error)
  } finally {
    notificationLoading.value = false
  }
}

const formatNotificationTime = (value?: string) => {
  if (!value) return 'baru saja'

  const diff = Date.now() - new Date(value).getTime()

  if (Number.isNaN(diff) || diff < 0) return 'baru saja'

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'baru saja'
  if (minutes < 60) return `${minutes} menit yang lalu`
  if (hours < 24) return `${hours} jam yang lalu`
  return `${days} hari yang lalu`
}

const resolveNotificationPath = (item: ActivityLogItem) => {
  const role = String(authStore.role || '').toUpperCase()
  const suratType = String(item.surat_type || '')
  const suratId = String(item.surat_id || '')
  const action = String(item.action || '')

  if (!suratType || !suratId) {
    if (role === 'ADMIN') return '/admin/activity-logs'
    if (role === 'KEPSEK') return '/kepsek/activity-logs'
    return '/status'
  }

  if (action === 'disposition_added' && suratType === 'surat_masuk') {
    if (role === 'ADMIN') return `/admin/surat-masuk/${suratId}`
    if (role === 'KEPSEK') return `/kepsek/surat-masuk/${suratId}`
    if (['BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK'].includes(role)) {
      return `/department-teachers/surat-masuk/${suratId}`
    }
  }

  if (role === 'ADMIN') {
    return `/admin/activity-logs/${suratType}/${suratId}`
  }

  if (role === 'KEPSEK') {
    return `/kepsek/activity-logs/${suratType}/${suratId}`
  }

  if (suratType === 'surat_keluar') {
    return `/surat-keluar/detail/${suratId}`
  }

  if (suratType === 'surat_masuk') {
    return `/department-teachers/surat-masuk/${suratId}`
  }

  return '/status'
}

const handleOpenNotificationPanel = async () => {
  isNotificationPanelOpen.value = true
  await loadLetterNotifications({ announceLatest: false })

  const latestId = notificationItems.value[0]?.id
  if (latestId) {
    setLastSeenNotificationId(Number(latestId))
  }
}

const handleNotificationClick = (item: ActivityLogItem) => {
  isNotificationPanelOpen.value = false
  router.push(resolveNotificationPath(item))
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

watch(
  () => settingsPreferenceStore.preference?.notify_letter_status,
  (enabled) => {
    if (enabled) {
      loadLetterNotifications({ announceLatest: false })
      return
    }

    isNotificationPanelOpen.value = false
    notificationItems.value = []
    notificationError.value = null
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

    <button
      v-if="shouldShowStatusNotifications"
      type="button"
      class="fixed right-4 top-4 z-[70] flex h-11 w-11 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-text)] shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-transform duration-200 hover:scale-[1.03] hover:bg-[var(--app-soft-card)]"
      aria-label="Buka notifikasi status surat"
      @click="handleOpenNotificationPanel"
    >
      <Bell class="h-5 w-5" />

      <span
        v-if="notificationUnreadCount > 0"
        class="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--app-accent)] px-1 text-[10px] font-bold text-white"
      >
        {{ notificationUnreadCount }}
      </span>
    </button>

    <VModal
      v-model:isOpen="isNotificationPanelOpen"
      title="Notifikasi Status Surat"
      description="Perubahan status terakhir yang relevan dengan akun Anda."
      maxWidthClass="max-w-[560px]"
      scrollBehavior="modal"
      :showAsset="false"
    >
      <div class="flex flex-col gap-4">
        <div
          v-if="notificationLoading"
          class="rounded-[18px] border border-[var(--app-border)] bg-[var(--app-soft-card)] px-4 py-3 text-[length:var(--app-font-sm)] text-[var(--app-subtext)]"
        >
          Memuat notifikasi...
        </div>

        <div
          v-else-if="notificationError"
          class="rounded-[18px] border border-[var(--app-border)] bg-[var(--app-soft-card)] px-4 py-3 text-[length:var(--app-font-sm)] text-[var(--app-subtext)]"
        >
          {{ notificationError }}
        </div>

        <template v-else>
          <div
            v-if="notificationItems.length === 0"
            class="rounded-[18px] border border-[var(--app-border)] bg-[var(--app-soft-card)] px-4 py-3 text-[length:var(--app-font-sm)] text-[var(--app-subtext)]"
          >
            Belum ada notifikasi status surat.
          </div>

          <button
            v-for="item in notificationItems"
            :key="item.id"
            type="button"
            class="flex w-full items-start gap-3 rounded-[18px] border border-[var(--app-border)] bg-[var(--app-card)] px-4 py-3 text-left transition-colors duration-200 hover:bg-[var(--app-soft-card)]"
            @click="handleNotificationClick(item)"
          >
            <div class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
              <Clock3 class="h-4.5 w-4.5" />
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-[length:var(--app-font-sm)] font-semibold text-[var(--app-heading)]">
                    {{ item.title || 'Status pengajuan surat berubah' }}
                  </p>
                  <p class="mt-1 text-[length:var(--app-font-sm)] leading-[1.5] text-[var(--app-subtext)]">
                    {{ item.description || 'Lihat detail perubahan status di halaman surat.' }}
                  </p>
                </div>

                <ChevronRight class="mt-1 h-4.5 w-4.5 shrink-0 text-[var(--app-muted)]" />
              </div>

              <div class="mt-2 text-[length:var(--app-font-xs)] text-[var(--app-muted)]">
                {{ formatNotificationTime(item.created_at) }}
              </div>
            </div>
          </button>
        </template>

        <div class="flex items-center justify-end gap-2 pt-1">
          <VButton variant="tertiary" @click="loadLetterNotifications({ announceLatest: false })">
            Muat Ulang
          </VButton>
          <VButton variant="secondary" @click="isNotificationPanelOpen = false">
            Tutup
          </VButton>
        </div>
      </div>
    </VModal>

    <router-view />
  </div>
</template>
