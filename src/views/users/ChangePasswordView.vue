<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VCard from '@/components/common/VCard.vue'
import VButton from '@/components/common/VButton.vue'
import VAlert from '@/components/common/VAlert.vue'
import type { AlertType } from '@/composables/useGlobalAlert'
import { useAuthStore } from '@/stores/users/auth'
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const isDarkMode = ref(false)
let themeObserver: MutationObserver | null = null

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const errors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isSubmitting = ref(false)

const alert: { visible: boolean; type: AlertType; title: string; message: string } = reactive({
  visible: false,
  type: 'success',
  title: '',
  message: '',
})

const syncThemeMode = () => {
  isDarkMode.value = document.documentElement.classList.contains('dark')
}

const showAlert = (type: AlertType, message: string, title = '') => {
  alert.visible = true
  alert.type = type
  alert.title = title
  alert.message = message
}

// Password strength computed
const passwordStrength = computed(() => {
  const p = form.newPassword
  if (!p) return { label: '', level: 0 }
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[a-z]/.test(p)) score++
  if (/\d/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  if (score <= 2) return { label: 'Lemah', level: 1 }
  if (score === 3) return { label: 'Sedang', level: 2 }
  if (score === 4) return { label: 'Kuat', level: 3 }
  return { label: 'Sangat Kuat', level: 4 }
})

// Requirements checklist
const requirements = computed(() => [
  { label: 'Minimal 8 Karakter', met: form.newPassword.length >= 8 },
  { label: 'Mengandung Huruf Kapital (A–Z)', met: /[A-Z]/.test(form.newPassword) },
  { label: 'Mengandung Angka (0–9)', met: /\d/.test(form.newPassword) },
  { label: 'Mengandung Karakter Unik', met: /[^A-Za-z0-9]/.test(form.newPassword) },
])

const validateForm = (): boolean => {
  let isValid = true
  errors.currentPassword = ''
  errors.newPassword = ''
  errors.confirmPassword = ''

  if (!form.currentPassword) {
    errors.currentPassword = 'Kata sandi saat ini wajib diisi.'
    isValid = false
  }
  if (!form.newPassword) {
    errors.newPassword = 'Kata sandi baru wajib diisi.'
    isValid = false
  } else if (form.newPassword.length < 8) {
    errors.newPassword = 'Kata sandi minimal 8 karakter.'
    isValid = false
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.newPassword)) {
    errors.newPassword = 'Kata sandi harus mengandung huruf besar, huruf kecil, dan angka.'
    isValid = false
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Konfirmasi kata sandi wajib diisi.'
    isValid = false
  } else if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = 'Kata sandi baru dan konfirmasi tidak cocok.'
    isValid = false
  }
  if (form.currentPassword && form.newPassword && form.currentPassword === form.newPassword) {
    errors.newPassword = 'Kata sandi baru tidak boleh sama dengan kata sandi saat ini.'
    isValid = false
  }
  return isValid
}

const resetForm = () => {
  form.currentPassword = ''
  form.newPassword = ''
  form.confirmPassword = ''
  errors.currentPassword = ''
  errors.newPassword = ''
  errors.confirmPassword = ''
}

const handleGoBack = () => {
  router.push('/settings')
}

const handleSubmit = async () => {
  if (!validateForm()) return
  isSubmitting.value = true
  try {
    const userEmail = authStore.user?.email

    const loginResponse = await fetch('/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, password: form.currentPassword }),
    })
    const responseData = await loginResponse.json()

    if (!loginResponse.ok) {
      errors.currentPassword = responseData.detail || responseData.error || 'Kata sandi saat ini salah.'
      isSubmitting.value = false
      return
    }
    const loginData = responseData
    if (!loginData.access) {
      errors.currentPassword = 'Verifikasi kata sandi gagal. Silakan coba lagi.'
      isSubmitting.value = false
      return
    }
    const otpResponse = await fetch('/api/profile/password/request-otp/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.accessToken}`,
      },
      body: JSON.stringify({ email: userEmail }),
    })
    if (!otpResponse.ok) {
      const otpError = await otpResponse.json()
      showAlert('error', otpError.message || 'Gagal mengirim OTP. Silakan coba lagi.', 'Gagal')
      isSubmitting.value = false
      return
    }
    const otpData = await otpResponse.json()
    localStorage.setItem('pending_password_change', JSON.stringify({ newPassword: form.newPassword }))
    router.push(`/verify-otp?mode=password_change&email=${encodeURIComponent(otpData.email || authStore.user?.email || '')}`)
  } catch {
    showAlert('error', 'Terjadi kesalahan. Silakan coba lagi.', 'Gagal')
    isSubmitting.value = false
  }
}

onMounted(() => {
  syncThemeMode()
  themeObserver = new MutationObserver(() => syncThemeMode())
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
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

    <section class="change-password-page min-h-full px-5 py-5 transition-colors duration-200"
      :class="{ 'is-dark-mode': isDarkMode }">
      <div class="mx-auto max-w-2xl">
        <!-- Header -->
        <div class="mb-4 flex items-center gap-3">
          <div>
            <h1 class="page-heading text-[length:var(--app-page-title-font)] font-bold">Ganti Kata Sandi</h1>
            <p class="page-subtitle mt-1 text-[length:var(--app-page-subtitle-font)] font-medium">
              Perbarui kata sandi akun Anda
            </p>
          </div>
        </div>

        <!-- Alert -->
        <VAlert v-if="alert.visible" :visible="alert.visible" :type="alert.type" :title="alert.title"
          :message="alert.message" class="mb-4" @close="alert.visible = false" />

        <!-- Card -->
        <VCard paddingClass="p-6">
          <!-- Card Header -->
          <div class="card-header mb-6">
            <h2 class="card-title">Form Perubahan Kata Sandi</h2>
            <p class="card-desc">
              Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem
              placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor.
            </p>
          </div>

          <!-- Form -->
          <form class="form-container" @submit.prevent="handleSubmit">
            <!-- Kata Sandi Saat Ini -->
            <div class="form-group">
              <label class="form-label" for="currentPassword">Kata Sandi Saat Ini</label>
              <div class="input-wrapper">
                <input id="currentPassword" v-model="form.currentPassword"
                  :type="showCurrentPassword ? 'text' : 'password'" class="form-input" placeholder="••••••••••••••••••"
                  :class="{ 'input-error': errors.currentPassword }" autocomplete="current-password" />
              </div>
              <p v-if="errors.currentPassword" class="error-text">{{ errors.currentPassword }}</p>
            </div>

            <!-- Kata Sandi Baru -->
            <div class="form-group">
              <label class="form-label" for="newPassword">Kata Sandi Baru</label>
              <div class="input-wrapper">
                <input id="newPassword" v-model="form.newPassword" :type="showNewPassword ? 'text' : 'password'"
                  class="form-input" placeholder="••••••••••••••••••" :class="{ 'input-error': errors.newPassword }"
                  autocomplete="new-password" />
                <button type="button" class="password-toggle" aria-label="Tampilkan password"
                  @click="showNewPassword = !showNewPassword">
                  <Eye v-if="!showNewPassword" class="h-5 w-5" />
                  <EyeOff v-else class="h-5 w-5" />
                </button>
              </div>
              <p v-if="errors.newPassword" class="error-text">{{ errors.newPassword }}</p>
            </div>

            <!-- Konfirmasi Kata Sandi Baru -->
            <div class="form-group">
              <label class="form-label" for="confirmPassword">Konfirmasi Kata Sandi Baru</label>
              <div class="input-wrapper">
                <input id="confirmPassword" v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'" class="form-input" placeholder="••••••••••••••••••"
                  :class="{ 'input-error': errors.confirmPassword }" autocomplete="new-password" />
                <button type="button" class="password-toggle" aria-label="Tampilkan password"
                  @click="showConfirmPassword = !showConfirmPassword">
                  <Eye v-if="!showConfirmPassword" class="h-5 w-5" />
                  <EyeOff v-else class="h-5 w-5" />
                </button>
              </div>
              <p v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</p>
            </div>

            <!-- Password Strength -->
            <div v-if="form.newPassword" class="strength-section">
              <p class="strength-label">
                Kekuatan Kata Sandi:
                <span :class="`strength-text level-${passwordStrength.level}`">
                  {{ passwordStrength.label }}
                </span>
              </p>
            </div>

            <!-- Requirements -->
            <div class="requirements-section">
              <p class="req-title">Persyaratan Kata Sandi:</p>
              <div class="req-grid">
                <div v-for="req in requirements" :key="req.label" class="req-item" :class="{ 'req-met': req.met }">
                  <CheckCircle2 class="req-icon h-5 w-5" />
                  <span class="req-label">{{ req.label }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <VButton type="button" variant="secondary" class="!rounded-xl !px-6 !py-2.5 !text-[length:var(--app-font-base)]"
                @click="handleGoBack">
                Batal
              </VButton>

              <VButton type="submit" variant="primary" class="!rounded-xl !px-6 !py-2.5 !text-[length:var(--app-font-base)]"
                :disabled="isSubmitting">
                <template v-if="isSubmitting" #leftIcon>
                  <span class="loading-spinner"></span>
                </template>
                {{ isSubmitting ? 'Memproses...' : 'Simpan Kata Sandi Baru' }}
              </VButton>
            </div>
          </form>
        </VCard>
      </div>
    </section>
  </DashboardLayout>
</template>

<style scoped>
.change-password-page {
  background: var(--app-bg);
  color: var(--app-text);
}

.page-heading {
  color: var(--app-heading);
}

.page-subtitle {
  color: var(--app-subtext);
}

/* Back button */
.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(232, 243, 235, 0.85);
  color: #3f9760;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.back-button:hover {
  background: rgba(63, 151, 96, 0.15);
}

.is-dark-mode .back-button {
  background: rgba(248, 250, 252, 0.14);
  color: #f8fafc;
}

.is-dark-mode .back-button:hover {
  background: rgba(248, 250, 252, 0.2);
}

/* Card header */
.card-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #021409;
  margin: 0 0 6px;
}

.is-dark-mode .card-title {
  color: #f8fafc;
}

.card-desc {
  font-size: 0.85rem;
  color: rgba(2, 20, 9, 0.55);
  line-height: 1.55;
  margin: 0;
}

.is-dark-mode .card-desc {
  color: rgba(248, 250, 252, 0.55);
}

/* Form */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #021409;
  margin-bottom: 8px;
}

.is-dark-mode .form-label {
  color: #f8fafc;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 13px 50px 13px 16px;
  border: 1.5px solid rgba(2, 20, 9, 0.18);
  border-radius: 10px;
  font-size: 0.95rem;
  color: #021409;
  background: white;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input::placeholder {
  color: rgba(2, 20, 9, 0.3);
}

.form-input:focus {
  outline: none;
  border-color: #3f9760;
  box-shadow: 0 0 0 3px rgba(63, 151, 96, 0.12);
}

.form-input.input-error {
  border-color: #ef4444;
}

.form-input.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
}

.is-dark-mode .form-input {
  background: rgba(248, 250, 252, 0.08);
  border-color: rgba(248, 250, 252, 0.2);
  color: #f8fafc;
}

.is-dark-mode .form-input::placeholder {
  color: rgba(248, 250, 252, 0.4);
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: rgba(2, 20, 9, 0.45);
  cursor: pointer;
  transition: all 0.2s ease;
}

.password-toggle:hover {
  color: #021409;
  background: rgba(2, 20, 9, 0.06);
}

.is-dark-mode .password-toggle {
  color: rgba(248, 250, 252, 0.5);
}

.is-dark-mode .password-toggle:hover {
  color: #f8fafc;
  background: rgba(248, 250, 252, 0.1);
}

.error-text {
  font-size: 0.8rem;
  color: #ef4444;
  margin-top: 6px;
}

.is-dark-mode .error-text {
  color: #f87171;
}

/* Password strength */
.strength-section {
  margin-top: -4px;
}

.strength-label {
  font-size: 0.85rem;
  color: rgba(2, 20, 9, 0.6);
  margin: 0;
}

.is-dark-mode .strength-label {
  color: rgba(248, 250, 252, 0.6);
}

.strength-text {
  font-weight: 700;
}

.level-1 {
  color: #ef4444;
}

.level-2 {
  color: #f59e0b;
}

.level-3 {
  color: #22c55e;
}

.level-4 {
  color: #16a34a;
}

/* Requirements */
.requirements-section {
  margin-top: 4px;
}

.req-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #021409;
  margin: 0 0 10px;
}

.is-dark-mode .req-title {
  color: #f8fafc;
}

.req-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
}

.req-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.req-icon {
  color: rgba(2, 20, 9, 0.25);
  flex-shrink: 0;
  transition: color 0.2s;
}

.req-met .req-icon {
  color: #3f9760;
}

.req-label {
  font-size: 0.83rem;
  color: rgba(2, 20, 9, 0.55);
  transition: color 0.2s;
}

.req-met .req-label {
  color: #021409;
  font-weight: 500;
}

.is-dark-mode .req-label {
  color: rgba(248, 250, 252, 0.55);
}

.is-dark-mode .req-met .req-label {
  color: #f8fafc;
}

.is-dark-mode .req-icon {
  color: rgba(248, 250, 252, 0.2);
}

.is-dark-mode .req-met .req-icon {
  color: #4ade80;
}

/* Actions */
.form-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(2, 20, 9, 0.08);
}

.is-dark-mode .form-actions {
  border-top-color: rgba(248, 250, 252, 0.12);
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
