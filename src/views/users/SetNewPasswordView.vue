<template>
  <div
    class="w-full max-w-[500px] bg-white rounded-[24px] shadow-[0px_8px_24px_rgba(0,0,0,0.05)] border border-[#d4e8da] p-8 flex flex-col items-center text-center"
  >
    <div class="w-[60px] h-[60px] bg-[#e8f3eb] rounded-full flex items-center justify-center mb-6">
      <LockKeyhole class="w-[30px] h-[30px] text-[#3f9760]" />
    </div>

    <h1 class="text-[24px] font-bold text-[#111827] mb-2">Buat Kata Sandi Baru</h1>
    <p class="text-[14px] text-[#718096] leading-relaxed mb-6">
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

      <div class="w-full bg-[#f8fafc] p-4 rounded-[12px] border border-[#e2e8f0] mb-2">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-[14px] font-bold text-[#111827]">Persyaratan Kata Sandi:</h4>
          <span class="text-[12px] font-semibold" :class="passwordStrengthColor">
            {{ passwordStrengthText }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
          <div class="flex items-center gap-2 transition-colors duration-300">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                :fill="reqMinLength ? 'url(#grad1)' : '#E2E8F0'"
                :stroke="reqMinLength ? 'none' : '#CBD5E1'"
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
                  <stop stop-color="#D1955F" />
                  <stop offset="1" stop-color="#3F9760" />
                </linearGradient>
              </defs>
            </svg>
            <span :class="reqMinLength ? 'text-[#4a5568]' : 'text-[#94a3b8]'" class="text-[13px]"
              >Minimal 8 Karakter</span
            >
          </div>

          <div class="flex items-center gap-2 transition-colors duration-300">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                :fill="reqNumber ? 'url(#grad1)' : '#E2E8F0'"
                :stroke="reqNumber ? 'none' : '#CBD5E1'"
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
            </svg>
            <span :class="reqNumber ? 'text-[#4a5568]' : 'text-[#94a3b8]'" class="text-[13px]"
              >Mengandung Angka (0-9)</span
            >
          </div>

          <div class="flex items-center gap-2 transition-colors duration-300">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                :fill="reqCapital ? 'url(#grad1)' : '#E2E8F0'"
                :stroke="reqCapital ? 'none' : '#CBD5E1'"
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
            </svg>
            <span :class="reqCapital ? 'text-[#4a5568]' : 'text-[#94a3b8]'" class="text-[13px]"
              >Mengandung Huruf Kapital (A-Z)</span
            >
          </div>

          <div class="flex items-center gap-2 transition-colors duration-300">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                :fill="reqSymbol ? 'url(#grad1)' : '#E2E8F0'"
                :stroke="reqSymbol ? 'none' : '#CBD5E1'"
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
            </svg>
            <span :class="reqSymbol ? 'text-[#4a5568]' : 'text-[#94a3b8]'" class="text-[13px]"
              >Mengandung Karakter Unik</span
            >
          </div>
        </div>
      </div>

      <VButton
        type="submit"
        variant="primary"
        class="w-full h-[48px] mt-4"
        :disabled="isLoading || !isPasswordValid"
      >
        {{ isLoading ? 'Menyimpan...' : 'Simpan Kata Sandi' }}
      </VButton>
    </form>

    <div v-else class="w-full flex flex-col items-center gap-4 mt-4">
      <VButton @click="router.replace('/login')" variant="primary" class="w-full h-[48px]">
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
