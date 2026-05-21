<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VCard from '@/components/common/VCard.vue'
import VButton from '@/components/common/VButton.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VAlert from '@/components/common/VAlert.vue'
import type { AlertType } from '@/composables/useGlobalAlert'
import VTab from '@/components/common/VTab.vue'
import { useSettingsPreferenceStore } from '@/stores/settingsPreference'
import type { ThemePreference, TextSizePreference } from '@/stores/settingsPreference'
import {
  Bell,
  CheckCircle2,
  Laptop,
  Eye,
  FileText,
  Mail,
  Monitor,
  RotateCcw,
  Save,
  XCircle,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/users/auth'

const authStore = useAuthStore()
const settingsStore = useSettingsPreferenceStore()

const isDarkMode = ref(false)

// Track if security tab has been loaded
let securityLoaded = false
let themeObserver: MutationObserver | null = null

const activeTab = computed({
  get: () => settingsStore.activeTab,
  set: (val) => {
    settingsStore.activeTab = val
    if (val === 'security' && !securityLoaded) {
      fetchSecurityData()
      securityLoaded = true
    }
  }
})

const form = reactive<{
  theme: ThemePreference
  default_home_page: string
  text_size: TextSizePreference
  notify_email: boolean
  notify_letter_status: boolean
}>({
  theme: 'LIGHT',
  default_home_page: '/profile',
  text_size: 'DEFAULT',
  notify_email: true,
  notify_letter_status: true,
})

const alert: { visible: boolean; type: AlertType; title: string; message: string } = reactive({
  visible: false,
  type: 'success',
  title: '',
  message: '',
})

const tabOptions = [
  { label: 'Preference', value: 'preference' },
  { label: 'Security', value: 'security' },
]

const preference = computed(() => settingsStore.preference)
const homePageOptions = computed(() => settingsStore.homePageOptions)
const textSizeOptions = computed(() => settingsStore.textSizeOptions)

const isDirty = computed(() => {
  if (!preference.value) return false

  return (
    form.theme !== preference.value.theme ||
    form.default_home_page !== preference.value.default_home_page ||
    form.text_size !== preference.value.text_size ||
    form.notify_email !== preference.value.notify_email ||
    form.notify_letter_status !== preference.value.notify_letter_status
  )
})

const isDarkPreview = computed(() => form.theme === 'DARK')

const textPreviewClass = computed(() => {
  if (form.text_size === 'SMALL') return 'text-[length:var(--app-font-xs)]'
  if (form.text_size === 'LARGE') return 'text-[length:var(--app-font-md)]'
  return 'text-[length:var(--app-font-base)]'
})

const headingPreviewClass = computed(() => {
  if (form.text_size === 'SMALL') return 'text-[length:var(--app-font-md)]'
  if (form.text_size === 'LARGE') return 'text-[length:var(--app-font-xl)]'
  return 'text-[length:var(--app-font-lg)]'
})

const syncThemeMode = () => {
  isDarkMode.value = document.documentElement.classList.contains('dark')
}

const syncFormWithPreference = () => {
  if (!preference.value) return

  form.theme = preference.value.theme
  form.default_home_page = preference.value.default_home_page
  form.text_size = preference.value.text_size
  form.notify_email = preference.value.notify_email
  form.notify_letter_status = preference.value.notify_letter_status
}

const showAlert = (type: AlertType, message: string, title = '') => {
  alert.visible = true
  alert.type = type
  alert.title = title
  alert.message = message
}

const handleSelectTheme = (theme: ThemePreference) => {
  form.theme = theme
}

const handleResetDefault = () => {
  form.theme = 'LIGHT'
  form.default_home_page = '/profile'
  form.text_size = 'DEFAULT'
  form.notify_email = true
  form.notify_letter_status = true
}

const handleCancel = () => {
  syncFormWithPreference()
}

const handleSave = async () => {
  try {
    await settingsStore.updatePreference({
      theme: form.theme,
      default_home_page: form.default_home_page,
      text_size: form.text_size,
      notify_email: form.notify_email,
      notify_letter_status: form.notify_letter_status,
    })

    showAlert('success', 'Preference berhasil disimpan.', 'Berhasil')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Preference gagal disimpan.'
    showAlert('error', message, 'Gagal')
  }
}

onMounted(async () => {
  syncThemeMode()

  themeObserver = new MutationObserver(() => {
    syncThemeMode()
  })

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })

  await settingsStore.fetchPreference()
  syncFormWithPreference()
})

onBeforeUnmount(() => {
  if (themeObserver) themeObserver.disconnect()
})

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()

  // Jika karena suatu hal perbedaan waktunya minus (misal beda zona waktu server), anggap baru saja
  if (diff < 0) return 'baru saja'

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'baru saja'
  if (minutes < 60) return `${minutes} menit yang lalu`
  if (hours < 24) return `${hours} jam yang lalu`
  return `${days} hari yang lalu`
}

const formatDeviceName = (userAgent?: string | null) => {
  if (!userAgent) return 'Perangkat Tidak Dikenal'

  let os = 'Unknown OS'
  if (userAgent.includes('Win')) os = 'Windows PC'
  else if (userAgent.includes('Mac')) os = 'Mac OS'
  else if (userAgent.includes('Linux')) os = 'Linux'
  else if (userAgent.includes('Android')) os = 'Android'
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS'

  let browser = 'Unknown Browser'
  if (userAgent.includes('Edg/')) browser = 'Microsoft Edge'
  else if (userAgent.includes('OPR/') || userAgent.includes('Opera')) browser = 'Opera'
  else if (userAgent.includes('Chrome')) browser = 'Google Chrome'
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari'
  else if (userAgent.includes('Firefox')) browser = 'Mozilla Firefox'

  return `${os} \u2013 ${browser}`
}

type ConnectedDeviceSession = {
  id: number
  user_agent?: string | null
  is_current?: boolean
  last_active?: string | null
  ip_address?: string | null
}

// Security data
const securityData = reactive({
  recoveryEmail: '',
  loadingRecoveryEmail: false,
  activeSessionsCount: 0,
  sessions: [] as ConnectedDeviceSession[],
  loadingSessions: false,
})

const showRecoveryEmailForm = ref(false)
const recoveryEmailForm = reactive({
  email: '',
})
const recoveryEmailErrors = reactive({
  email: '',
})

const showDevicesModal = ref(false)

const fetchSecurityData = async () => {
  try {
    securityData.loadingRecoveryEmail = true
    const recoveryResponse = await fetch('/api/settings/recovery-email/', {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    })
    if (recoveryResponse.ok) {
      const recoveryData = await recoveryResponse.json()
      securityData.recoveryEmail = recoveryData.recovery_email || ''
    }
  } catch {
    console.error('Failed to fetch recovery email')
  } finally {
    securityData.loadingRecoveryEmail = false
  }

  try {
    securityData.loadingSessions = true
    const devicesResponse = await fetch('/api/settings/connected-devices/', {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    })
    if (devicesResponse.ok) {
      const devicesData = await devicesResponse.json()
      securityData.activeSessionsCount = devicesData.active_sessions_count || 0
      securityData.sessions = devicesData.sessions || []
    }
  } catch {
    console.error('Failed to fetch sessions')
  } finally {
    securityData.loadingSessions = false
  }
}

const openRecoveryEmailForm = () => {
  recoveryEmailForm.email = securityData.recoveryEmail
  recoveryEmailErrors.email = ''
  showRecoveryEmailForm.value = true
}

const closeRecoveryEmailForm = () => {
  showRecoveryEmailForm.value = false
  recoveryEmailForm.email = ''
  recoveryEmailErrors.email = ''
}

const saveRecoveryEmail = async () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (recoveryEmailForm.email && !emailRegex.test(recoveryEmailForm.email)) {
    recoveryEmailErrors.email = 'Format email tidak valid.'
    return
  }

  try {
    const response = await fetch('/api/settings/recovery-email/', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.accessToken}`,
      },
      body: JSON.stringify({ recovery_email: recoveryEmailForm.email }),
    })

    const data = await response.json()

    if (response.ok) {
      securityData.recoveryEmail = data.recovery_email || ''
      showRecoveryEmailForm.value = false
      showAlert('success', data.message || 'Email pemulihan berhasil diperbarui.', 'Berhasil')
    } else {
      recoveryEmailErrors.email = data.error || 'Gagal menyimpan email pemulihan.'
    }
  } catch {
    showAlert('error', 'Terjadi kesalahan. Silakan coba lagi.', 'Gagal')
  }
}

const closeDevicesModal = () => {
  showDevicesModal.value = false
}

const logoutSession = async (sessionId: number) => {
  try {
    const response = await fetch('/api/settings/connected-devices/', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.accessToken}`,
      },
      body: JSON.stringify({ session_id: sessionId }),
    })

    if (response.ok) {
      securityData.sessions = securityData.sessions.filter((session) => session.id !== sessionId)
      securityData.activeSessionsCount--
      showAlert('success', 'Perangkat berhasil dilogout.', 'Berhasil')
    }
  } catch {
    showAlert('error', 'Gagal melogout perangkat.', 'Gagal')
  }
}

const handleChangePassword = () => {
  window.location.href = '/settings/change-password'
}
</script>

<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <section class="settings-page min-h-full px-5 py-5 transition-colors duration-200"
      :class="{ 'is-dark-mode': isDarkMode }">
      <div class="mx-auto max-w-5xl">
        <div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 class="settings-heading text-[length:var(--app-page-title-font)] font-bold">Settings</h1>
            <p class="settings-subtitle mt-1 text-[length:var(--app-page-subtitle-font)] font-medium">
              Pengaturan Sistem
            </p>
          </div>

          <div v-if="isDirty" class="dirty-alert flex max-w-sm items-start gap-2 rounded-2xl border px-4 py-3">
            <div
              class="dirty-icon mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold">
              !
            </div>

            <div>
              <p class="text-[length:var(--app-font-xs)] font-bold">Perubahan belum disimpan</p>
              <p class="mt-0.5 text-[length:var(--app-font-caption)]">
                Simpan perubahan agar pengaturan diterapkan.
              </p>
            </div>
          </div>
        </div>

        <VAlert v-if="alert.visible" :visible="alert.visible" :type="alert.type" :title="alert.title"
          :message="alert.message" class="mb-4" @close="alert.visible = false" />

        <div class="relative z-30 mb-4">
          <VTab v-model="activeTab" :options="tabOptions" />
        </div>

        <VCard v-if="settingsStore.loading" paddingClass="p-4">
          <p class="settings-subtitle text-[length:var(--app-font-sm)]">Memuat settings preference...</p>
        </VCard>

        <div v-else-if="settingsStore.error"
          class="rounded-2xl border border-red-200 bg-red-50 p-4 text-[length:var(--app-font-sm)] text-red-700 shadow-sm">
          {{ settingsStore.error }}
        </div>

        <template v-else>
          <template v-if="activeTab === 'preference'">
            <div class="relative z-40 grid gap-4 lg:grid-cols-[1fr_1fr]">
              <VCard paddingClass="p-4" overflowClass="overflow-visible z-50">
                <div class="mb-4 flex items-start gap-2.5">
                  <div class="icon-box flex h-9 w-9 items-center justify-center rounded-xl">
                    <Monitor class="h-4.5 w-4.5" />
                  </div>

                  <div>
                    <h2 class="card-title text-[length:var(--app-card-title-font)] font-bold">
                      Preferensi Tampilan dan Navigasi
                    </h2>
                    <p class="card-desc mt-0.5 text-[length:var(--app-card-desc-font)]">
                      Atur tampilan antarmuka dan perilaku navigasi sesuai kebutuhan.
                    </p>
                  </div>
                </div>

                <div class="settings-section">
                  <h3 class="settings-title">Tema Tampilan dan Navigasi</h3>
                  <p class="settings-desc">Pilih tema yang nyaman untuk digunakan.</p>

                  <div class="mt-3 grid grid-cols-2 gap-3">
                    <button type="button" class="theme-option"
                      :class="form.theme === 'LIGHT' ? 'theme-option-active' : ''" @click="handleSelectTheme('LIGHT')">
                      <div class="theme-check">
                        <CheckCircle2 v-if="form.theme === 'LIGHT'" class="h-4 w-4 text-[#4A8B50]" />
                      </div>

                      <div>
                        <p class="theme-label text-[length:var(--app-font-sm)] font-bold">Light Mode</p>
                        <p class="theme-desc mt-0.5 text-[length:var(--app-font-caption)]">Tampilan terang</p>
                      </div>
                    </button>

                    <button type="button" class="theme-option"
                      :class="form.theme === 'DARK' ? 'theme-option-active' : ''" @click="handleSelectTheme('DARK')">
                      <div class="theme-check">
                        <CheckCircle2 v-if="form.theme === 'DARK'" class="h-4 w-4 text-[#4A8B50]" />
                      </div>

                      <div>
                        <p class="theme-label text-[length:var(--app-font-sm)] font-bold">Dark Mode</p>
                        <p class="theme-desc mt-0.5 text-[length:var(--app-font-caption)]">Tampilan gelap</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div class="settings-section">
                  <h3 class="settings-title">Halaman Awal Default setelah Login</h3>
                  <p class="settings-desc">Pilih halaman pertama setelah login.</p>

                  <div class="compact-dropdown home-dropdown mt-3">
                    <VDropdown v-model="form.default_home_page" :options="homePageOptions"
                      placeholder="Pilih halaman awal" />
                  </div>
                </div>

                <div class="settings-section border-b-0 pb-0">
                  <h3 class="settings-title">Ukuran Teks</h3>
                  <p class="settings-desc">Sesuaikan ukuran teks di seluruh aplikasi.</p>

                  <div class="compact-dropdown text-dropdown mt-3">
                    <VDropdown v-model="form.text_size" :options="textSizeOptions" placeholder="Pilih ukuran teks" />
                  </div>
                </div>
              </VCard>

              <VCard paddingClass="p-4" overflowClass="overflow-hidden z-10">
                <div class="mb-4 flex items-start gap-2.5">
                  <div class="icon-box flex h-9 w-9 items-center justify-center rounded-xl">
                    <Bell class="h-4.5 w-4.5" />
                  </div>

                  <div>
                    <h2 class="card-title text-[length:var(--app-card-title-font)] font-bold">Preferensi Notifikasi</h2>
                    <p class="card-desc mt-0.5 text-[length:var(--app-card-desc-font)]">
                      Kelola jenis notifikasi yang ingin Anda terima.
                    </p>
                  </div>
                </div>

                <div class="flex flex-col gap-2">
                  <div class="notification-row">
                    <div class="notification-icon">
                      <Mail class="h-4 w-4" />
                    </div>

                    <div class="flex-1">
                      <p class="notification-title">Notifikasi Email</p>
                      <p class="notification-desc">
                        Terima notifikasi melalui email untuk seluruh aktivitas penting.
                      </p>
                    </div>

                    <button type="button" class="notification-toggle"
                      :class="{ 'notification-toggle-off': !form.notify_email }" aria-label="Notifikasi Email"
                      @click="form.notify_email = !form.notify_email"></button>
                  </div>

                  <div class="notification-row">
                    <div class="notification-icon">
                      <FileText class="h-4 w-4" />
                    </div>

                    <div class="flex-1">
                      <p class="notification-title">Status Pengajuan Surat</p>
                      <p class="notification-desc">
                        Dapatkan pemberitahuan saat status pengajuan surat berubah.
                      </p>
                    </div>

                    <button type="button" class="notification-toggle"
                      :class="{ 'notification-toggle-off': !form.notify_letter_status }"
                      aria-label="Status Pengajuan Surat"
                      @click="form.notify_letter_status = !form.notify_letter_status"></button>
                  </div>
                </div>
              </VCard>
            </div>

            <VCard paddingClass="p-4" overflowClass="overflow-hidden z-0" class="relative mt-4">
              <div class="mb-4 flex items-start gap-2.5">
                <div class="icon-box flex h-9 w-9 items-center justify-center rounded-xl">
                  <Eye class="h-4.5 w-4.5" />
                </div>

                <div>
                  <h2 class="card-title text-[length:var(--app-card-title-font)] font-bold">Preview Tampilan</h2>
                  <p class="card-desc mt-0.5 text-[length:var(--app-card-desc-font)]">
                    Pratinjau contoh tampilan sesuai pengaturan saat ini.
                  </p>
                </div>
              </div>

              <div class="grid gap-3 lg:grid-cols-[1fr_1.2fr]">
                <div class="preview-box rounded-2xl border p-3"
                  :class="isDarkPreview ? 'preview-box-dark' : 'preview-box-light'">
                  <p class="preview-label mb-2 text-[length:var(--app-font-xs)] font-semibold">
                    Preview Antarmuka
                  </p>

                  <div class="rounded-xl border p-3 transition-colors duration-200" :class="isDarkPreview
                    ? 'border-[rgba(148,163,184,0.22)] bg-[#173728]'
                    : 'border-[#D4E8DA] bg-[#F3FBF6]'
                    ">
                    <div class="mb-3">
                      <p class="text-[length:var(--app-font-sm)] font-bold text-[#3F9760]">SIMP</p>
                    </div>

                    <div class="grid grid-cols-3 gap-2">
                      <div class="rounded-[10px] p-2"
                        :class="isDarkPreview ? 'bg-[#EDF7F0] text-[#021409]' : 'bg-white text-[#021409]'">
                        <p class="text-[length:var(--app-font-md)] font-bold text-[#3F9760]">32</p>
                        <p class="text-[length:var(--app-font-caption)]">Aktif</p>
                      </div>

                      <div class="rounded-[10px] p-2"
                        :class="isDarkPreview ? 'bg-[#EDF7F0] text-[#021409]' : 'bg-white text-[#021409]'">
                        <p class="text-[length:var(--app-font-md)] font-bold text-[#D1955F]">12</p>
                        <p class="text-[length:var(--app-font-caption)]">Menunggu</p>
                      </div>

                      <div class="rounded-[10px] p-2"
                        :class="isDarkPreview ? 'bg-[#EDF7F0] text-[#021409]' : 'bg-white text-[#021409]'">
                        <p class="text-[length:var(--app-font-md)] font-bold text-[#0EA5A4]">8</p>
                        <p class="text-[length:var(--app-font-caption)]">Selesai</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="preview-box rounded-2xl border p-3"
                  :class="isDarkPreview ? 'preview-box-dark' : 'preview-box-light'">
                  <p class="preview-label mb-2 text-[length:var(--app-font-xs)] font-semibold">Preview Teks</p>

                  <h3 class="font-bold" :class="headingPreviewClass">
                    Ini adalah contoh teks judul
                  </h3>

                  <p class="mt-2 leading-5 opacity-80" :class="textPreviewClass">
                    Ini adalah contoh teks paragraf untuk menggambarkan ukuran teks yang dipilih.
                  </p>

                  <div class="mt-4">
                    <VButton variant="primary" class="!rounded-xl !px-3.5 !py-2 !text-[length:var(--app-button-sm-font)]">
                      Contoh Tombol
                    </VButton>
                  </div>
                </div>
              </div>
            </VCard>

            <div
              class="settings-actions mt-4 flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
              <VButton variant="tertiary" class="!rounded-xl !px-4 !py-2 !text-[length:var(--app-button-lg-font)]" @click="handleResetDefault">
                <template #leftIcon>
                  <RotateCcw class="h-3.5 w-3.5" />
                </template>

                Reset ke Default
              </VButton>

              <div class="flex flex-col gap-2 sm:flex-row">
                <VButton variant="secondary" class="!rounded-xl !px-7 !py-2 !text-[length:var(--app-button-lg-font)]"
                  :disabled="!isDirty || settingsStore.saving" @click="handleCancel">
                  Batal
                </VButton>

                <VButton variant="primary" class="!rounded-xl !px-7 !py-2 !text-[length:var(--app-button-lg-font)]"
                  :disabled="!isDirty || settingsStore.saving" @click="handleSave">
                  <template #leftIcon>
                    <Save class="h-3.5 w-3.5" />
                  </template>

                  {{ settingsStore.saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
                </VButton>
              </div>
            </div>
          </template>

          <div v-else class="security-page">
            <h2 class="security-page-title">Keamanan Akun dan Sistem</h2>

            <!-- Kredensial Login -->
            <VCard paddingClass="p-5" class="mb-4">
              <h3 class="section-heading">Kredensial Login dan Autentikasi</h3>
              <p class="section-desc">
                Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae
                pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu
                aenean sed diam urna tempor.
              </p>

              <div class="mt-4">
                <h4 class="field-label">Ganti Kata Sandi</h4>
                <div class="password-field-row">
                  <div class="password-display">
                    <span class="password-dots">••••••••••••••••••</span>
                    <button type="button" class="ubah-password-btn" @click="handleChangePassword">
                      Ubah Password
                      <span class="edit-icon">✎</span>
                    </button>
                  </div>
                </div>
                <p class="field-hint">Terakhir diubah 11 September 2001</p>
              </div>
            </VCard>

            <!-- Email Pemulihan -->
            <VCard paddingClass="p-5" class="mb-4">
              <h3 class="section-heading">Email Pemulihan</h3>
              <p class="section-desc">
                Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae
                pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu
                aenean sed diam urna tempor.
              </p>

              <div class="mt-4">
                <div v-if="!showRecoveryEmailForm" class="email-field-row">
                  <div class="email-display">
                    <span class="email-value">
                      <span v-if="securityData.loadingRecoveryEmail" class="text-gray-400">Memuat...</span>
                      <span v-else-if="securityData.recoveryEmail">{{ securityData.recoveryEmail }}</span>
                      <span v-else class="placeholder-text">Belum diatur</span>
                    </span>
                    <button type="button" class="ubah-inline-btn" @click="openRecoveryEmailForm">
                      {{ securityData.recoveryEmail ? 'Ubah' : 'Tambah' }}
                    </button>
                  </div>
                </div>

                <div v-else class="recovery-email-form">
                  <input v-model="recoveryEmailForm.email" type="email" class="form-input"
                    placeholder="contoh@email.com" :class="{ 'input-error': recoveryEmailErrors.email }" />
                  <p v-if="recoveryEmailErrors.email" class="error-text">{{ recoveryEmailErrors.email }}</p>
                  <div class="form-inline-actions">
                    <button type="button" class="btn-cancel-sm" @click="closeRecoveryEmailForm">Batal</button>
                    <button type="button" class="btn-save-sm" @click="saveRecoveryEmail">Simpan</button>
                  </div>
                </div>
              </div>
            </VCard>

            <!-- Perangkat Terhubung -->
            <VCard paddingClass="p-5" class="mb-4">
              <h3 class="section-heading">Perangkat Terhubung ( Active Sessions)</h3>
              <p class="section-desc">
                Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae
                pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu
                aenean sed diam urna tempor.
              </p>

              <div class="mt-4 session-list-inline">
                <div v-if="securityData.loadingSessions" class="text-sm text-gray-400">Memuat...</div>
                <div v-else-if="securityData.sessions.length === 0" class="text-sm text-gray-400">
                  Tidak ada perangkat yang terhubung.
                </div>
                <div v-for="session in securityData.sessions" :key="session.id" class="session-item-inline">
                  <div class="session-device-icon">
                    <Monitor class="h-5 w-5" />
                  </div>
                  <div class="session-info-inline">
                    <p class="session-device-name">{{ formatDeviceName(session.user_agent) }}</p>
                    <p class="session-status">
                      Status:
                      <span :class="session.is_current ? 'status-active' : 'status-inactive'">
                        {{ session.is_current ? 'Sedang aktif' : `Aktif ${session.last_active ?
                          formatTimeAgo(session.last_active) : '4 jam yang lalu'}` }}
                      </span>
                    </p>
                  </div>
                  <button v-if="!session.is_current" type="button" class="logout-inline-btn"
                    @click="logoutSession(session.id)">
                    Logout Perangkat
                  </button>
                </div>
              </div>
            </VCard>

            <!-- Actions -->
            <div class="settings-actions mt-4 flex justify-end gap-3 border-t pt-4">
              <VButton variant="secondary" class="!rounded-xl !px-7 !py-2 !text-[length:var(--app-font-sm)]" @click="handleCancel">
                Batal
              </VButton>
              <VButton variant="primary" class="!rounded-xl !px-7 !py-2 !text-[length:var(--app-font-sm)]" @click="handleSave">
                Simpan Perubahan
              </VButton>
            </div>
          </div>
        </template>
      </div>
    </section>
  </DashboardLayout>

  <!-- Recovery Email Modal -->
  <Teleport to="body">
    <div v-if="showRecoveryEmailForm" class="modal-overlay" :class="{ 'is-dark-mode': isDarkMode }" @click.self="closeRecoveryEmailForm">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">Email Pemulihan</h3>
          <button type="button" class="modal-close" @click="closeRecoveryEmailForm">
            <XCircle class="h-5 w-5" />
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-info-text">
            Email pemulihan digunakan untuk memulihkan akun Anda jika Anda lupa kata sandi.
          </p>
          <div class="form-group">
            <label class="form-label" for="recoveryEmail">Alamat Email</label>
            <input id="recoveryEmail" v-model="recoveryEmailForm.email" type="email" class="form-input"
              placeholder="contoh@email.com" :class="{ 'input-error': recoveryEmailErrors.email }" />
            <p v-if="recoveryEmailErrors.email" class="error-text">{{ recoveryEmailErrors.email }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="closeRecoveryEmailForm">Batal</button>
          <button type="button" class="btn-submit" @click="saveRecoveryEmail">Simpan</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Devices Modal -->
  <Teleport to="body">
    <div v-if="showDevicesModal" class="modal-overlay" :class="{ 'dark': isDarkMode }" @click.self="closeDevicesModal">
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">Perangkat Terhubung</h3>
          <button type="button" class="modal-close" @click="closeDevicesModal">
            <XCircle class="h-5 w-5" />
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-info-text mb-4">
            Perangkat berikut yang telah login ke akun Anda. Logout perangkat yang tidak Anda kenali.
          </p>
          <div v-if="securityData.sessions.length === 0" class="empty-state">
            <p>Tidak ada perangkat yang terhubung.</p>
          </div>
          <div v-else class="session-list">
            <div v-for="session in securityData.sessions" :key="session.id" class="session-item">
              <div class="session-icon">
                <Laptop class="h-5 w-5" />
              </div>
              <div class="session-info">
                <p class="session-device">{{ formatDeviceName(session.user_agent) }}</p>
                <p class="session-detail">{{ session.user_agent || 'Perangkat tidak dikenal' }}</p>
                <p class="session-detail">IP: {{ session.ip_address || '-' }}</p>
                <p class="session-detail">Terakhir aktif: {{ session.last_active ? new
                  Date(session.last_active).toLocaleString('id-ID') : '-' }}</p>
              </div>
              <button v-if="!session.is_current" type="button" class="logout-btn" @click="logoutSession(session.id)">
                Logout
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-submit" @click="closeDevicesModal">Tutup</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Security Page Layout */
.security-page-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #021409;
  margin: 0 0 16px;
}

.settings-page.is-dark-mode .security-page-title {
  color: #f8fafc;
}

/* Section heading & desc */
.section-heading {
  font-size: 0.95rem;
  font-weight: 700;
  color: #3f9760;
  margin: 0 0 6px;
}

.section-desc {
  font-size: 0.8rem;
  color: rgba(2, 20, 9, 0.6);
  line-height: 1.55;
  margin: 0;
}

.settings-page.is-dark-mode .section-desc {
  color: rgba(248, 250, 252, 0.6);
}

/* Field label */
.field-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #021409;
  margin: 0 0 10px;
}

.settings-page.is-dark-mode .field-label {
  color: #f8fafc;
}

/* Password field */
.password-field-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.password-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1.5px solid rgba(2, 20, 9, 0.18);
  border-radius: 12px;
  padding: 12px 16px;
  background: white;
}

.settings-page.is-dark-mode .password-display {
  background: rgba(248, 250, 252, 0.06);
  border-color: rgba(248, 250, 252, 0.2);
}

.password-dots {
  font-size: 1rem;
  color: rgba(2, 20, 9, 0.5);
  letter-spacing: 2px;
}

.settings-page.is-dark-mode .password-dots {
  color: rgba(248, 250, 252, 0.5);
}

.ubah-password-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #3f9760;
  border: 1.5px solid #3f9760;
  border-radius: 8px;
  padding: 6px 12px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.ubah-password-btn:hover {
  background: rgba(63, 151, 96, 0.08);
}

.edit-icon {
  font-size: 0.9rem;
}

.field-hint {
  font-size: 0.75rem;
  color: rgba(2, 20, 9, 0.5);
  margin: 6px 0 0;
}

.settings-page.is-dark-mode .field-hint {
  color: rgba(248, 250, 252, 0.5);
}

/* Email field */
.email-field-row {
  display: flex;
  flex-direction: column;
}

.email-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1.5px solid rgba(2, 20, 9, 0.18);
  border-radius: 12px;
  padding: 12px 16px;
  background: white;
}

.settings-page.is-dark-mode .email-display {
  background: rgba(248, 250, 252, 0.06);
  border-color: rgba(248, 250, 252, 0.2);
}

.email-value {
  font-size: 0.9rem;
  color: rgba(2, 20, 9, 0.7);
}

.placeholder-text {
  color: rgba(2, 20, 9, 0.4);
}

.settings-page.is-dark-mode .email-value {
  color: rgba(248, 250, 252, 0.7);
}

.ubah-inline-btn {
  font-size: 0.82rem;
  font-weight: 600;
  color: #3f9760;
  border: 1.5px solid #3f9760;
  border-radius: 8px;
  padding: 6px 14px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.ubah-inline-btn:hover {
  background: rgba(63, 151, 96, 0.08);
}

/* Recovery email form */
.recovery-email-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid rgba(2, 20, 9, 0.18);
  border-radius: 12px;
  font-size: 0.9rem;
  color: #021409;
  background: white;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input::placeholder {
  color: rgba(2, 20, 9, 0.4);
}

.form-input:focus {
  outline: none;
  border-color: #3f9760;
  box-shadow: 0 0 0 3px rgba(63, 151, 96, 0.12);
}

.form-input.input-error {
  border-color: #ef4444;
}

.settings-page.is-dark-mode .form-input {
  background: rgba(248, 250, 252, 0.08);
  border-color: rgba(248, 250, 252, 0.2);
  color: #f8fafc;
}

.error-text {
  font-size: 0.78rem;
  color: #ef4444;
  margin: 0;
}

.form-inline-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.btn-cancel-sm {
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 500;
  color: rgba(2, 20, 9, 0.65);
  background: transparent;
  border: 1px solid rgba(2, 20, 9, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel-sm:hover {
  background: rgba(2, 20, 9, 0.05);
}

.btn-save-sm {
  padding: 8px 20px;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  color: white;
  background: #3f9760;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save-sm:hover {
  background: #2d7a4a;
}

/* Session list inline */
.session-list-inline {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.session-item-inline {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(232, 243, 235, 0.5);
  border: 1px solid rgba(63, 151, 96, 0.12);
}

.settings-page.is-dark-mode .session-item-inline {
  background: rgba(248, 250, 252, 0.06);
  border-color: rgba(248, 250, 252, 0.12);
}

.session-device-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #3f9760;
  color: white;
  flex-shrink: 0;
}

.session-info-inline {
  flex: 1;
  min-width: 0;
}

.session-device-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: #021409;
  margin: 0 0 2px;
}

.settings-page.is-dark-mode .session-device-name {
  color: #f8fafc;
}

.session-status {
  font-size: 0.78rem;
  color: rgba(2, 20, 9, 0.6);
  margin: 0;
}

.settings-page.is-dark-mode .session-status {
  color: rgba(248, 250, 252, 0.6);
}

.status-active {
  color: #3f9760;
  font-weight: 600;
}

.status-inactive {
  color: rgba(2, 20, 9, 0.6);
}

.settings-page.is-dark-mode .status-inactive {
  color: rgba(248, 250, 252, 0.6);
}

.settings-page.is-dark-mode .status-active {
  color: #ffffff;
}

.settings-page.is-dark-mode .logout-inline-btn {
  color: #ffffff;
}

.settings-page.is-dark-mode .logout-inline-btn:hover {
  color: rgba(255, 255, 255, 0.7);
}

.logout-inline-btn {
  font-size: 0.78rem;
  font-weight: 600;
  color: #3f9760;
  background: transparent;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: opacity 0.2s;
}

.logout-inline-btn:hover {
  opacity: 0.7;
}

/* Actions bar */
.settings-actions {
  border-color: rgba(2, 20, 9, 0.1);
}

.settings-page.is-dark-mode .settings-actions {
  border-color: rgba(248, 250, 252, 0.14);
}

.settings-page {
  background: var(--app-bg);
  color: var(--app-text);
}

.settings-heading {
  color: var(--app-heading);
}

.settings-subtitle {
  color: var(--app-subtext);
}

.card-title,
.settings-title,
.notification-title,
.theme-label {
  color: #021409;
}

.card-desc,
.settings-desc,
.notification-desc,
.theme-desc {
  color: rgba(2, 20, 9, 0.72);
}

.settings-page.is-dark-mode .card-title,
.settings-page.is-dark-mode .settings-title,
.settings-page.is-dark-mode .notification-title,
.settings-page.is-dark-mode .theme-label {
  color: #f8fafc;
}

.settings-page.is-dark-mode .card-desc,
.settings-page.is-dark-mode .settings-desc,
.settings-page.is-dark-mode .notification-desc,
.settings-page.is-dark-mode .theme-desc {
  color: rgba(248, 250, 252, 0.72);
}

.icon-box,
.notification-icon {
  background: rgba(232, 243, 235, 0.85);
  color: #3f9760;
}

.settings-page.is-dark-mode .icon-box,
.settings-page.is-dark-mode .notification-icon {
  background: rgba(248, 250, 252, 0.14);
  color: #f8fafc;
}

.settings-page.is-dark-mode .icon-box :deep(svg),
.settings-page.is-dark-mode .notification-icon :deep(svg),
.settings-page.is-dark-mode .theme-check :deep(svg) {
  color: #f8fafc;
  stroke: #f8fafc;
}

.settings-page.is-dark-mode .theme-check {
  background: rgba(248, 250, 252, 0.14);
  border: 1px solid rgba(248, 250, 252, 0.18);
}

.dirty-alert {
  background: #fff7ed;
  color: #7a4a16;
  border-color: rgba(209, 149, 95, 0.4);
}

.dirty-icon {
  color: #d1955f;
  border-color: #d1955f;
}

.settings-section {
  border-bottom: 1px solid rgba(2, 20, 9, 0.14);
  padding: 14px 0;
}

.settings-page.is-dark-mode .settings-section {
  border-bottom-color: rgba(248, 250, 252, 0.16);
}

.settings-title {
  font-size: 0.9rem;
  font-weight: 700;
}

.settings-desc {
  margin-top: 3px;
  font-size: 0.78rem;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 16px;
  border: 1px solid transparent;
  padding: 10px;
  text-align: left;
  transition: all 0.2s ease;
}

.theme-option:hover {
  background: rgba(232, 243, 235, 0.55);
}

.theme-option-active {
  background: rgba(232, 243, 235, 0.8);
  border-color: rgba(74, 139, 80, 0.25);
}

.settings-page.is-dark-mode .theme-option:hover {
  background: rgba(232, 243, 235, 0.1);
}

.settings-page.is-dark-mode .theme-option-active {
  background: rgba(232, 243, 235, 0.16);
  border-color: rgba(199, 225, 208, 0.35);
}

.theme-check {
  display: flex;
  height: 30px;
  width: 30px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #f1f5f9;
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.5),
    inset 0 -1px 2px rgba(0, 0, 0, 0.08);
}

.notification-row {
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(2, 20, 9, 0.14);
  padding: 16px 0;
}

.settings-page.is-dark-mode .notification-row {
  border-bottom-color: rgba(248, 250, 252, 0.16);
}

.notification-row:last-child {
  border-bottom: 0;
}

.notification-title {
  font-size: 0.85rem;
  font-weight: 700;
}

.notification-desc {
  margin-top: 2px;
  font-size: 0.78rem;
}

.notification-toggle {
  position: relative;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #3f9760, #0c4923);
  box-shadow:
    inset 0 -1px 2px rgba(0, 0, 0, 0.25),
    inset 0 1px 2px rgba(255, 255, 255, 0.35);
  cursor: pointer;
  transition:
    background 0.2s ease,
    opacity 0.2s ease;
}

.notification-toggle::after {
  content: '';
  position: absolute;
  top: 3px;
  right: 3px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #f8fafc;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  transition:
    right 0.2s ease,
    left 0.2s ease;
}

.notification-toggle-off {
  background: #cbd5e1;
}

.notification-toggle-off::after {
  right: auto;
  left: 3px;
}

.preview-box-light {
  background: #ffffff;
  color: #111827;
  border-color: #e2e8f0;
}

.preview-box-dark {
  background: #021409;
  color: #f8fafc;
  border-color: rgba(148, 163, 184, 0.28);
}

.preview-label {
  color: inherit;
  opacity: 0.7;
}

.settings-actions {
  border-color: var(--app-border);
}

.compact-dropdown {
  position: relative;
}

.home-dropdown {
  z-index: 60;
}

.text-dropdown {
  z-index: 20;
}

.compact-dropdown :deep(.relative.w-full.font-sans) {
  font-size: 0.85rem;
}

.compact-dropdown :deep(.rounded-\[12px\]) {
  border-radius: 12px;
}

.compact-dropdown :deep(.px-\[19px\]) {
  padding-left: 14px;
  padding-right: 14px;
}

.compact-dropdown :deep(.py-\[14px\]) {
  padding-top: 10px;
  padding-bottom: 10px;
}

.compact-dropdown :deep(.text-\[16px\]) {
  font-size: 0.85rem;
}

.compact-dropdown :deep(.w-\[24px\]) {
  width: 18px;
}

.compact-dropdown :deep(.h-\[24px\]) {
  height: 18px;
}

/* Security Tab Styles */
.security-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #3f9760 0%, #2d7a4a 100%);
  border-radius: 16px 16px 0 0;
}

.security-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  flex-shrink: 0;
}

.security-title {
  font-size: 1rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.security-desc {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 4px 0 0;
}

.settings-page.is-dark-mode .security-title,
.settings-page.is-dark-mode .security-desc {
  color: white;
}

.settings-page.is-dark-mode .security-desc {
  color: rgba(255, 255, 255, 0.85);
}

.security-list {
  padding: 8px 20px 16px;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(2, 20, 9, 0.1);
}

.settings-page.is-dark-mode .security-item {
  border-bottom-color: rgba(248, 250, 252, 0.16);
}

.security-item:last-child {
  border-bottom: none;
}

.security-item-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(232, 243, 235, 0.85);
  color: #3f9760;
  flex-shrink: 0;
}

.settings-page.is-dark-mode .item-icon {
  background: rgba(248, 250, 252, 0.14);
  color: #f8fafc;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #021409;
  margin: 0;
}

.item-desc {
  font-size: 0.78rem;
  color: rgba(2, 20, 9, 0.65);
  margin: 3px 0 0;
  line-height: 1.4;
}

.settings-page.is-dark-mode .item-title {
  color: #f8fafc;
}

.settings-page.is-dark-mode .item-desc {
  color: rgba(248, 250, 252, 0.7);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-container.modal-lg {
  max-width: 600px;
}

:global(.dark) .modal-container {
  background: #0f2318;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(2, 20, 9, 0.1);
}

:global(.dark) .modal-header {
  border-bottom-color: rgba(248, 250, 252, 0.16);
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #021409;
  margin: 0;
}

:global(.dark) .modal-title {
  color: #f8fafc;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: transparent;
  color: rgba(2, 20, 9, 0.6);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(2, 20, 9, 0.08);
  color: #021409;
}

:global(.dark) .modal-close {
  color: rgba(248, 250, 252, 0.6);
}

:global(.dark) .modal-close:hover {
  background: rgba(248, 250, 252, 0.12);
  color: #f8fafc;
}

.modal-body {
  padding: 20px 24px;
}

.modal-info-text {
  font-size: 0.85rem;
  color: rgba(2, 20, 9, 0.72);
  margin: 0 0 16px;
  line-height: 1.5;
}

:global(.dark) .modal-info-text {
  color: rgba(248, 250, 252, 0.72);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 20px;
  border-top: 1px solid rgba(2, 20, 9, 0.1);
}

:global(.dark) .modal-footer {
  border-top-color: rgba(248, 250, 252, 0.16);
}

.btn-cancel {
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(2, 20, 9, 0.7);
  background: transparent;
  border: 1px solid rgba(2, 20, 9, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: rgba(2, 20, 9, 0.05);
  border-color: rgba(2, 20, 9, 0.3);
}

:global(.dark) .btn-cancel {
  color: rgba(248, 250, 252, 0.7);
  border-color: rgba(248, 250, 252, 0.2);
}

:global(.dark) .btn-cancel:hover {
  background: rgba(248, 250, 252, 0.08);
  border-color: rgba(248, 250, 252, 0.3);
}

.btn-submit {
  padding: 10px 24px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #3f9760 0%, #2d7a4a 100%);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(63, 151, 96, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(63, 151, 96, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-group {
  margin-top: 16px;
}

.form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #021409;
  margin-bottom: 8px;
}

:global(.dark) .form-label {
  color: #f8fafc;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(2, 20, 9, 0.2);
  border-radius: 12px;
  font-size: 0.9rem;
  color: #021409;
  background: white;
  transition: all 0.2s ease;
}

.form-input::placeholder {
  color: rgba(2, 20, 9, 0.45);
}

.form-input:focus {
  outline: none;
  border-color: #3f9760;
  box-shadow: 0 0 0 3px rgba(63, 151, 96, 0.15);
}

.form-input.input-error {
  border-color: #ef4444;
}

:global(.dark) .form-input {
  background: rgba(248, 250, 252, 0.08);
  border-color: rgba(248, 250, 252, 0.2);
  color: #f8fafc;
}

:global(.dark) .form-input::placeholder {
  color: rgba(248, 250, 252, 0.5);
}

.error-text {
  font-size: 0.78rem;
  color: #ef4444;
  margin: 6px 0 0;
}

:global(.dark) .error-text {
  color: #f87171;
}

/* Session List Styles */
.empty-state {
  text-align: center;
  padding: 24px;
  color: rgba(2, 20, 9, 0.6);
}

:global(.dark) .empty-state {
  color: rgba(248, 250, 252, 0.6);
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.session-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  background: rgba(232, 243, 235, 0.4);
  border: 1px solid rgba(2, 20, 9, 0.08);
}

:global(.dark) .session-item {
  background: rgba(248, 250, 252, 0.06);
  border-color: rgba(248, 250, 252, 0.12);
}

.session-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(63, 151, 96, 0.15);
  color: #3f9760;
  flex-shrink: 0;
}

:global(.dark) .session-icon {
  background: rgba(63, 151, 96, 0.2);
  color: #6ee7a0;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-device {
  font-size: 0.9rem;
  font-weight: 600;
  color: #021409;
  margin: 0 0 4px;
}

:global(.dark) .session-device {
  color: #f8fafc;
}

.session-detail {
  font-size: 0.78rem;
  color: rgba(2, 20, 9, 0.6);
  margin: 0 0 2px;
  word-break: break-all;
}

:global(.dark) .session-detail {
  color: rgba(248, 250, 252, 0.6);
}

.logout-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

:global(.dark) .logout-btn {
  color: #f87171;
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
}

:global(.dark) .logout-btn:hover {
  background: rgba(239, 68, 68, 0.25);
}
</style>

<style>
.modal-overlay.is-dark-mode .modal-container {
  background: #0f2318 !important;
}

.modal-overlay.is-dark-mode .modal-header {
  border-bottom-color: rgba(248, 250, 252, 0.16) !important;
}

.modal-overlay.is-dark-mode .modal-title {
  color: #f8fafc !important;
}

.modal-overlay.is-dark-mode .modal-close {
  color: rgba(248, 250, 252, 0.6) !important;
}

.modal-overlay.is-dark-mode .modal-close:hover {
  background: rgba(248, 250, 252, 0.12) !important;
  color: #f8fafc !important;
}

.modal-overlay.is-dark-mode .modal-body {
  color: #f8fafc !important;
}

.modal-overlay.is-dark-mode .modal-info-text {
  color: rgba(248, 250, 252, 0.72) !important;
}

.modal-overlay.is-dark-mode .modal-footer {
  border-top-color: rgba(248, 250, 252, 0.16) !important;
}

.modal-overlay.is-dark-mode .btn-cancel {
  color: rgba(248, 250, 252, 0.7) !important;
  border-color: rgba(248, 250, 252, 0.2) !important;
}

.modal-overlay.is-dark-mode .btn-cancel:hover {
  background: rgba(248, 250, 252, 0.08) !important;
  border-color: rgba(248, 250, 252, 0.3) !important;
}

.modal-overlay.is-dark-mode .form-label {
  color: #f8fafc !important;
}

.modal-overlay.is-dark-mode .form-input {
  background: rgba(248, 250, 252, 0.08) !important;
  border-color: rgba(248, 250, 252, 0.2) !important;
  color: #f8fafc !important;
}

.modal-overlay.is-dark-mode .form-input::placeholder {
  color: rgba(248, 250, 252, 0.5) !important;
}

.modal-overlay.is-dark-mode .error-text {
  color: #f87171 !important;
}
</style>
