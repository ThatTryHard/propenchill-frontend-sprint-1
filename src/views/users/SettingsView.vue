<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VCard from '@/components/common/VCard.vue'
import VButton from '@/components/common/VButton.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VAlert from '@/components/common/VAlert.vue'
import VTab from '@/components/common/VTab.vue'
import { useSettingsPreferenceStore } from '@/stores/settingsPreference'
import type { ThemePreference, TextSizePreference } from '@/stores/settingsPreference'
import {
  Bell,
  CheckCircle2,
  Eye,
  FileText,
  Mail,
  Monitor,
  RotateCcw,
  Save,
} from 'lucide-vue-next'

const settingsStore = useSettingsPreferenceStore()

const activeTab = ref('preference')
const isDarkMode = ref(false)

let themeObserver: MutationObserver | null = null

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

const alert = reactive({
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
  if (form.text_size === 'SMALL') return 'text-[0.78rem]'
  if (form.text_size === 'LARGE') return 'text-[1rem]'
  return 'text-[0.9rem]'
})

const headingPreviewClass = computed(() => {
  if (form.text_size === 'SMALL') return 'text-[1rem]'
  if (form.text_size === 'LARGE') return 'text-[1.35rem]'
  return 'text-[1.15rem]'
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

const showAlert = (type: string, message: string, title = '') => {
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
</script>

<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <section
      class="settings-page min-h-full px-5 py-5 transition-colors duration-200"
      :class="{ 'is-dark-mode': isDarkMode }"
    >
      <div class="mx-auto max-w-5xl">
        <div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 class="settings-heading text-[1.7rem] font-bold">Settings</h1>
            <p class="settings-subtitle mt-1 text-[0.95rem] font-medium">
              Pengaturan Sistem
            </p>
          </div>

          <div
            v-if="isDirty"
            class="dirty-alert flex max-w-sm items-start gap-2 rounded-2xl border px-4 py-3"
          >
            <div
              class="dirty-icon mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold"
            >
              !
            </div>

            <div>
              <p class="text-[0.78rem] font-bold">Perubahan belum disimpan</p>
              <p class="mt-0.5 text-[0.72rem]">
                Simpan perubahan agar pengaturan diterapkan.
              </p>
            </div>
          </div>
        </div>

        <VAlert
          v-if="alert.visible"
          :visible="alert.visible"
          :type="alert.type"
          :title="alert.title"
          :message="alert.message"
          class="mb-4"
          @close="alert.visible = false"
        />

        <div class="relative z-30 mb-4">
          <VTab v-model="activeTab" :options="tabOptions" />
        </div>

        <VCard v-if="settingsStore.loading" paddingClass="p-4">
          <p class="settings-subtitle text-[0.85rem]">Memuat settings preference...</p>
        </VCard>

        <div
          v-else-if="settingsStore.error"
          class="rounded-2xl border border-red-200 bg-red-50 p-4 text-[0.85rem] text-red-700 shadow-sm"
        >
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
                    <h2 class="card-title text-[1rem] font-bold">
                      Preferensi Tampilan dan Navigasi
                    </h2>
                    <p class="card-desc mt-0.5 text-[0.78rem]">
                      Atur tampilan antarmuka dan perilaku navigasi sesuai kebutuhan.
                    </p>
                  </div>
                </div>

                <div class="settings-section">
                  <h3 class="settings-title">Tema Tampilan dan Navigasi</h3>
                  <p class="settings-desc">Pilih tema yang nyaman untuk digunakan.</p>

                  <div class="mt-3 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      class="theme-option"
                      :class="form.theme === 'LIGHT' ? 'theme-option-active' : ''"
                      @click="handleSelectTheme('LIGHT')"
                    >
                      <div class="theme-check">
                        <CheckCircle2
                          v-if="form.theme === 'LIGHT'"
                          class="h-4 w-4 text-[#4A8B50]"
                        />
                      </div>

                      <div>
                        <p class="theme-label text-[0.85rem] font-bold">Light Mode</p>
                        <p class="theme-desc mt-0.5 text-[0.75rem]">Tampilan terang</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      class="theme-option"
                      :class="form.theme === 'DARK' ? 'theme-option-active' : ''"
                      @click="handleSelectTheme('DARK')"
                    >
                      <div class="theme-check">
                        <CheckCircle2
                          v-if="form.theme === 'DARK'"
                          class="h-4 w-4 text-[#4A8B50]"
                        />
                      </div>

                      <div>
                        <p class="theme-label text-[0.85rem] font-bold">Dark Mode</p>
                        <p class="theme-desc mt-0.5 text-[0.75rem]">Tampilan gelap</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div class="settings-section">
                  <h3 class="settings-title">Halaman Awal Default setelah Login</h3>
                  <p class="settings-desc">Pilih halaman pertama setelah login.</p>

                  <div class="compact-dropdown home-dropdown mt-3">
                    <VDropdown
                      v-model="form.default_home_page"
                      :options="homePageOptions"
                      placeholder="Pilih halaman awal"
                    />
                  </div>
                </div>

                <div class="settings-section border-b-0 pb-0">
                  <h3 class="settings-title">Ukuran Teks</h3>
                  <p class="settings-desc">Sesuaikan ukuran teks di seluruh aplikasi.</p>

                  <div class="compact-dropdown text-dropdown mt-3">
                    <VDropdown
                      v-model="form.text_size"
                      :options="textSizeOptions"
                      placeholder="Pilih ukuran teks"
                    />
                  </div>
                </div>
              </VCard>

              <VCard paddingClass="p-4" overflowClass="overflow-hidden z-10">
                <div class="mb-4 flex items-start gap-2.5">
                  <div class="icon-box flex h-9 w-9 items-center justify-center rounded-xl">
                    <Bell class="h-4.5 w-4.5" />
                  </div>

                  <div>
                    <h2 class="card-title text-[1rem] font-bold">Preferensi Notifikasi</h2>
                    <p class="card-desc mt-0.5 text-[0.78rem]">
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

                    <button
                      type="button"
                      class="notification-toggle"
                      :class="{ 'notification-toggle-off': !form.notify_email }"
                      aria-label="Notifikasi Email"
                      @click="form.notify_email = !form.notify_email"
                    ></button>
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

                    <button
                      type="button"
                      class="notification-toggle"
                      :class="{ 'notification-toggle-off': !form.notify_letter_status }"
                      aria-label="Status Pengajuan Surat"
                      @click="form.notify_letter_status = !form.notify_letter_status"
                    ></button>
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
                  <h2 class="card-title text-[1rem] font-bold">Preview Tampilan</h2>
                  <p class="card-desc mt-0.5 text-[0.78rem]">
                    Pratinjau contoh tampilan sesuai pengaturan saat ini.
                  </p>
                </div>
              </div>

              <div class="grid gap-3 lg:grid-cols-[1fr_1.2fr]">
                <div
                  class="preview-box rounded-2xl border p-3"
                  :class="isDarkPreview ? 'preview-box-dark' : 'preview-box-light'"
                >
                  <p class="preview-label mb-2 text-[0.78rem] font-semibold">
                    Preview Antarmuka
                  </p>

                  <div
                    class="rounded-xl border p-3 transition-colors duration-200"
                    :class="
                      isDarkPreview
                        ? 'border-[rgba(148,163,184,0.22)] bg-[#173728]'
                        : 'border-[#D4E8DA] bg-[#F3FBF6]'
                    "
                  >
                    <div class="mb-3">
                      <p class="text-[0.85rem] font-bold text-[#3F9760]">SIMP</p>
                    </div>

                    <div class="grid grid-cols-3 gap-2">
                      <div
                        class="rounded-[10px] p-2"
                        :class="isDarkPreview ? 'bg-[#EDF7F0] text-[#021409]' : 'bg-white text-[#021409]'"
                      >
                        <p class="text-[1rem] font-bold text-[#3F9760]">32</p>
                        <p class="text-[0.65rem]">Aktif</p>
                      </div>

                      <div
                        class="rounded-[10px] p-2"
                        :class="isDarkPreview ? 'bg-[#EDF7F0] text-[#021409]' : 'bg-white text-[#021409]'"
                      >
                        <p class="text-[1rem] font-bold text-[#D1955F]">12</p>
                        <p class="text-[0.65rem]">Menunggu</p>
                      </div>

                      <div
                        class="rounded-[10px] p-2"
                        :class="isDarkPreview ? 'bg-[#EDF7F0] text-[#021409]' : 'bg-white text-[#021409]'"
                      >
                        <p class="text-[1rem] font-bold text-[#0EA5A4]">8</p>
                        <p class="text-[0.65rem]">Selesai</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  class="preview-box rounded-2xl border p-3"
                  :class="isDarkPreview ? 'preview-box-dark' : 'preview-box-light'"
                >
                  <p class="preview-label mb-2 text-[0.78rem] font-semibold">Preview Teks</p>

                  <h3 class="font-bold" :class="headingPreviewClass">
                    Ini adalah contoh teks judul
                  </h3>

                  <p class="mt-2 leading-5 opacity-80" :class="textPreviewClass">
                    Ini adalah contoh teks paragraf untuk menggambarkan ukuran teks yang dipilih.
                  </p>

                  <div class="mt-4">
                    <VButton
                      variant="primary"
                      class="!rounded-xl !px-3.5 !py-2 !text-[0.75rem]"
                    >
                      Contoh Tombol
                    </VButton>
                  </div>
                </div>
              </div>
            </VCard>

            <div
              class="settings-actions mt-4 flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between"
            >
              <VButton
                variant="tertiary"
                class="!rounded-xl !px-4 !py-2 !text-[0.8rem]"
                @click="handleResetDefault"
              >
                <template #leftIcon>
                  <RotateCcw class="h-3.5 w-3.5" />
                </template>

                Reset ke Default
              </VButton>

              <div class="flex flex-col gap-2 sm:flex-row">
                <VButton
                  variant="secondary"
                  class="!rounded-xl !px-7 !py-2 !text-[0.8rem]"
                  :disabled="!isDirty || settingsStore.saving"
                  @click="handleCancel"
                >
                  Batal
                </VButton>

                <VButton
                  variant="primary"
                  class="!rounded-xl !px-7 !py-2 !text-[0.8rem]"
                  :disabled="!isDirty || settingsStore.saving"
                  @click="handleSave"
                >
                  <template #leftIcon>
                    <Save class="h-3.5 w-3.5" />
                  </template>

                  {{ settingsStore.saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
                </VButton>
              </div>
            </div>
          </template>

          <VCard v-else paddingClass="p-4">
            <h2 class="card-title text-[1rem] font-bold">Security</h2>
            <p class="card-desc mt-1 text-[0.85rem]">
              Pengaturan security/privacy akan dikerjakan pada scope berikutnya.
            </p>
          </VCard>
        </template>
      </div>
    </section>
  </DashboardLayout>
</template>

<style scoped>
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
</style>