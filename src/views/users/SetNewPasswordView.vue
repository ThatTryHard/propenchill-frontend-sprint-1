<template>
  <div
    class="set-password-card w-full max-w-[500px] rounded-[24px] shadow-[0px_8px_24px_rgba(0,0,0,0.05)] border p-8 flex flex-col items-center text-center"
  >
    <div
      class="set-password-icon w-[4.25rem] h-[4.25rem] rounded-full flex items-center justify-center mb-6"
    >
      <LockKeyhole class="w-[2.15rem] h-[2.15rem] text-[var(--app-accent)]" />
    </div>

    <h1 class="set-password-heading text-[1.7rem] font-bold mb-2">
      Buat Kata Sandi Baru
    </h1>

    <p class="set-password-description text-[1rem] leading-relaxed mb-6">
      Pastikan kata sandi baru Anda memenuhi persyaratan keamanan kami.
    </p>

    <VAlert
      v-if="alert.visible"
      :visible="alert.visible"
      :type="alert.type"
      :title="alert.title"
      :message="alert.message"
      @close="alert.visible = false"
      class="mb-6 w-full text-left"
    />

    <form
      v-if="!isSuccess"
      @submit.prevent="handleResetPassword"
      class="w-full flex flex-col gap-4 text-left"
    >
      <VInputField
        v-model="password"
        label="Kata Sandi Baru"
        type="password"
        placeholder="Masukkan kata sandi baru"
        :disabled="isLoading"
        :state="passwordError ? 'error' : 'default'"
        :message="passwordError"
      />

      <VInputField
        v-model="confirmPassword"
        label="Konfirmasi Kata Sandi"
        type="password"
        placeholder="Ulangi kata sandi baru"
        :disabled="isLoading"
        :state="confirmPasswordError ? 'error' : 'default'"
        :message="confirmPasswordError"
      />

      <div class="password-rules-card w-full p-4 rounded-[12px] border mb-2">
        <div class="flex items-center justify-between gap-3 mb-3">
          <h4 class="password-rules-title text-[1rem] font-bold">
            Persyaratan Kata Sandi:
          </h4>

          <span class="text-[0.85rem] font-semibold" :class="passwordStrengthColor">
            {{ passwordStrengthText }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
          <div class="flex items-center gap-2 transition-colors duration-300">
            <svg
              class="w-[1.7rem] h-[1.7rem] flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                :fill="reqMinLength ? 'url(#grad1)' : 'var(--app-card-border)'"
                :stroke="reqMinLength ? 'none' : 'var(--app-border)'"
                stroke-width="1.5"
              />
              <path
                v-if="reqMinLength"
                d="M8 12.5L10.5 15L16 9"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <defs v-if="reqMinLength">
                <linearGradient
                  id="grad1"
                  x1="2"
                  y1="12"
                  x2="22"
                  y2="12"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="var(--app-accent-2)" />
                  <stop offset="1" stop-color="var(--app-accent)" />
                </linearGradient>
              </defs>
            </svg>

            <span
              :class="reqMinLength ? 'rule-text-valid' : 'rule-text-muted'"
              class="text-[0.93rem]"
            >
              Minimal 8 Karakter
            </span>
          </div>

          <div class="flex items-center gap-2 transition-colors duration-300">
            <svg
              class="w-[1.7rem] h-[1.7rem] flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                :fill="reqNumber ? 'url(#grad2)' : 'var(--app-card-border)'"
                :stroke="reqNumber ? 'none' : 'var(--app-border)'"
                stroke-width="1.5"
              />
              <path
                v-if="reqNumber"
                d="M8 12.5L10.5 15L16 9"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <defs v-if="reqNumber">
                <linearGradient
                  id="grad2"
                  x1="2"
                  y1="12"
                  x2="22"
                  y2="12"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="var(--app-accent-2)" />
                  <stop offset="1" stop-color="var(--app-accent)" />
                </linearGradient>
              </defs>
            </svg>

            <span
              :class="reqNumber ? 'rule-text-valid' : 'rule-text-muted'"
              class="text-[0.93rem]"
            >
              Mengandung Angka (0-9)
            </span>
          </div>

          <div class="flex items-center gap-2 transition-colors duration-300">
            <svg
              class="w-[1.7rem] h-[1.7rem] flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                :fill="reqCapital ? 'url(#grad3)' : 'var(--app-card-border)'"
                :stroke="reqCapital ? 'none' : 'var(--app-border)'"
                stroke-width="1.5"
              />
              <path
                v-if="reqCapital"
                d="M8 12.5L10.5 15L16 9"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <defs v-if="reqCapital">
                <linearGradient
                  id="grad3"
                  x1="2"
                  y1="12"
                  x2="22"
                  y2="12"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="var(--app-accent-2)" />
                  <stop offset="1" stop-color="var(--app-accent)" />
                </linearGradient>
              </defs>
            </svg>

            <span
              :class="reqCapital ? 'rule-text-valid' : 'rule-text-muted'"
              class="text-[0.93rem]"
            >
              Mengandung Huruf Kapital (A-Z)
            </span>
          </div>

          <div class="flex items-center gap-2 transition-colors duration-300">
            <svg
              class="w-[1.7rem] h-[1.7rem] flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                :fill="reqSymbol ? 'url(#grad4)' : 'var(--app-card-border)'"
                :stroke="reqSymbol ? 'none' : 'var(--app-border)'"
                stroke-width="1.5"
              />
              <path
                v-if="reqSymbol"
                d="M8 12.5L10.5 15L16 9"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <defs v-if="reqSymbol">
                <linearGradient
                  id="grad4"
                  x1="2"
                  y1="12"
                  x2="22"
                  y2="12"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="var(--app-accent-2)" />
                  <stop offset="1" stop-color="var(--app-accent)" />
                </linearGradient>
              </defs>
            </svg>

            <span
              :class="reqSymbol ? 'rule-text-valid' : 'rule-text-muted'"
              class="text-[0.93rem]"
            >
              Mengandung Karakter Unik
            </span>
          </div>
        </div>
      </div>

      <VButton
        type="submit"
        variant="primary"
        class="w-full h-[3.45rem] mt-4"
        :disabled="isLoading || !isPasswordValid"
      >
        {{ isLoading ? 'Menyimpan...' : 'Simpan Kata Sandi' }}
      </VButton>
    </form>

    <div v-else class="w-full flex flex-col items-center gap-4 mt-4">
      <VButton @click="router.replace('/login')" variant="primary" class="w-full h-[3.45rem]">
        Lanjut ke Halaman Login
      </VButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePasswordStore } from '@/stores/users/password'
import { LockKeyhole } from 'lucide-vue-next'
import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VAlert from '@/components/common/VAlert.vue'
import { toast } from 'vue-sonner'
import VToast from '@/components/common/VToast.vue'

const router = useRouter()
const passwordStore = usePasswordStore()

const password = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

const isLoading = ref(false)
const isSuccess = ref(false)

const alert = reactive({ visible: false, type: 'error', title: '', message: '' })

// Logika validasi password
const reqMinLength = computed(() => password.value.length >= 8)
const reqCapital = computed(() => /[A-Z]/.test(password.value))
const reqNumber = computed(() => /[0-9]/.test(password.value))
// Regex untuk mengecek simbol dari keyboard standar
const reqSymbol = computed(() => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password.value))

// Validasi keseluruhan
const isPasswordValid = computed(() => {
  return reqMinLength.value && reqCapital.value && reqNumber.value && reqSymbol.value
})

// Indikator teks kekuatan
const passwordStrengthText = computed(() => {
  if (password.value.length === 0) return ''
  let score = 0
  if (reqMinLength.value) score++
  if (reqCapital.value) score++
  if (reqNumber.value) score++
  if (reqSymbol.value) score++

  if (score <= 2) return 'Lemah'
  if (score === 3) return 'Kuat'
  return 'Sangat Kuat'
})

const passwordStrengthColor = computed(() => {
  const text = passwordStrengthText.value
  if (text === 'Lemah') return 'text-red-500'
  if (text === 'Kuat') return 'text-[#D1955F]'
  if (text === 'Sangat Kuat') return 'text-[#3f9760]'
  return ''
})

onMounted(() => {
  if (!passwordStore.verifiedEmail || !passwordStore.verifiedOtp) {
    router.replace('/login')
  }
})

// Validasi form sebelum submit
const validateForm = () => {
  let isValid = true
  passwordError.value = ''
  confirmPasswordError.value = ''

  if (!isPasswordValid.value) {
    passwordError.value = 'Kata sandi belum memenuhi semua persyaratan keamanan.'
    isValid = false
  }

  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Kata sandi tidak cocok. Silakan periksa kembali.'
    isValid = false
  }

  return isValid
}

// logika reset password
const handleResetPassword = async () => {
  alert.visible = false

  if (!validateForm()) return

  isLoading.value = true

  try {
    await passwordStore.setNewPassword(
      passwordStore.verifiedEmail,
      passwordStore.verifiedOtp,
      password.value,
    )

    // Tampilkan toast sukses
    toast.custom(VToast, {
      componentProps: {
        type: 'success',
        message: 'Kata sandi berhasil diperbarui!',
      },
    })

    // Set flag sukses untuk tampilkan tombol lanjut
    setTimeout(() => {
      router.replace('/login')
    }, 1500)
  } catch (error: any) {
    alert.visible = true
    alert.type = 'error'
    alert.message =
      error.response?.data?.error || 'Gagal mengubah kata sandi. Sesi Anda mungkin telah berakhir.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.set-password-card {
  background: var(--app-card);
  color: var(--app-text);
  border-color: var(--app-border);
}

.set-password-icon {
  background: var(--app-soft-card);
}

.set-password-heading {
  color: var(--app-heading);
}

.set-password-description {
  color: var(--app-muted);
}

.password-rules-card {
  background: var(--app-soft-card);
  border-color: var(--app-border);
}

.password-rules-title {
  color: var(--app-heading);
}

.rule-text-valid {
  color: var(--app-subtext);
}

.rule-text-muted {
  color: var(--app-muted);
}

:global(html.dark) .set-password-icon {
  background: var(--app-soft-card);
}

:global(html.dark) .set-password-icon :deep(svg) {
  color: var(--app-accent);
  stroke: var(--app-accent);
}

:global(html.dark) .rule-text-valid {
  color: var(--app-subtext);
}

:global(html.dark) .rule-text-muted {
  color: var(--app-muted);
}
</style>