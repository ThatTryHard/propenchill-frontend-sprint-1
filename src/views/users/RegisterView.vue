<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import VToast from '@/components/common/VToast.vue'
import { useAuthStore } from '@/stores/users/auth'
import { usePasswordStore } from '@/stores/users/password'
import VInputField from '@/components/common/VInputField.vue'
import VButton from '@/components/common/VButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const passwordStore = usePasswordStore()

const nama = ref('')
const email = ref('')
const noHp = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)

const namaError = ref('')
const emailError = ref('')
const noHpError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const pwdStrength = computed(() => passwordStore.checkPasswordStrength(password.value))

watch(nama, () => (namaError.value = ''))
watch(email, () => (emailError.value = ''))
watch(noHp, () => (noHpError.value = ''))
watch(password, () => (passwordError.value = ''))
watch(confirmPassword, () => (confirmPasswordError.value = ''))

const validateForm = () => {
  namaError.value = ''
  emailError.value = ''
  noHpError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''

  let hasError = false

  if (!nama.value) {
    namaError.value = 'Nama wajib diisi!'
    hasError = true
  }

  if (!email.value) {
    emailError.value = 'Email wajib diisi!'
    hasError = true
  }

  if (!noHp.value) {
    noHpError.value = 'Nomor HP wajib diisi!'
    hasError = true
  }

  if (!password.value) {
    passwordError.value = 'Kata sandi wajib diisi!'
    hasError = true
  } else if (!pwdStrength.value.isValid) {
    passwordError.value = 'Kata sandi belum memenuhi semua persyaratan keamanan!'
    hasError = true
  }

  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Konfirmasi kata sandi wajib diisi!'
    hasError = true
  } else if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Konfirmasi kata sandi tidak sama!'
    hasError = true
  }

  return !hasError
}

const handleRegister = async () => {
  if (!validateForm()) return

  isLoading.value = true

  try {
    const response = await authStore.register({
      nama: nama.value,
      email: email.value,
      no_hp: noHp.value,
      password: password.value,
      confirm_password: confirmPassword.value,
    })

    const registeredEmail = response?.data?.email || email.value

    toast.custom(VToast, {
      componentProps: {
        type: 'success',
        message: 'Registrasi berhasil! Silakan lanjut verifikasi email.',
      },
    })
    setTimeout(() => {
      router.push({
        name: 'verify-email',
        query: { email: registeredEmail },
      })
    }, 1000)
  } catch (error: unknown) {
    const message = (error as Error).message
    toast.custom(VToast, {
      componentProps: {
        type: 'error',
        message: 'Registrasi Gagal! Silakan coba lagi.',
      },
    })
    emailError.value = message
    noHpError.value = message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-[600px] flex flex-col items-center justify-start pb-10">
    <div class="absolute top-8 left-8 z-20">
      <img src="@/assets/Inrab_Logo.png" alt="SMA Insan Rabbany" class="h-16 opacity-80" />
    </div>

    <div class="flex flex-col items-center mb-8">
      <img src="@/assets/SIMP.png" alt="SIMP Box" class="h-32 mb-6" />
      <h1 class="text-[28px] font-bold text-[#767E86]">Create Account</h1>
    </div>

    <form @submit.prevent="handleRegister" class="w-full flex flex-col gap-3">
      <VInputField
        v-model="nama"
        label="Nama Lengkap"
        type="text"
        placeholder="Masukkan nama lengkap"
        :disabled="isLoading"
        :state="namaError ? 'error' : 'default'"
        :message="namaError"
      />

      <VInputField
        v-model="email"
        label="Email"
        type="email"
        placeholder="nama@email.com"
        :disabled="isLoading"
        :state="emailError ? 'error' : 'default'"
        :message="emailError"
      />

      <VInputField
        v-model="noHp"
        label="Nomor HP"
        type="text"
        placeholder="Contoh: 08123456789"
        :disabled="isLoading"
        :state="noHpError ? 'error' : 'default'"
        :message="noHpError"
      />

      <VInputField
        v-model="password"
        label="Kata Sandi"
        type="password"
        placeholder="Masukkan kata sandi"
        :disabled="isLoading"
        :state="passwordError ? 'error' : 'default'"
        :message="passwordError"
      />

      <VInputField
        v-model="confirmPassword"
        label="Konfirmasi Kata Sandi"
        type="password"
        placeholder="Masukkan ulang kata sandi"
        :disabled="isLoading"
        :state="confirmPasswordError ? 'error' : 'default'"
        :message="confirmPasswordError"
      />

      <div class="w-full bg-[#f8fafc] p-4 rounded-[12px] border border-[#e2e8f0] mb-2">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-[14px] font-bold text-[#111827]">Persyaratan Kata Sandi:</h4>
          <span class="text-[12px] font-semibold" :class="pwdStrength.color">
            {{ pwdStrength.text }}
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
                :fill="pwdStrength.reqMinLength ? 'url(#grad1)' : '#E2E8F0'"
                :stroke="pwdStrength.reqMinLength ? 'none' : '#CBD5E1'"
                stroke-width="1.5"
              />
              <path
                v-if="pwdStrength.reqMinLength"
                d="M8 12.5L10.5 15L16 9"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <defs v-if="pwdStrength.reqMinLength">
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
            <span
              :class="pwdStrength.reqMinLength ? 'text-[#4a5568]' : 'text-[#94a3b8]'"
              class="text-[13px]"
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
                :fill="pwdStrength.reqNumber ? 'url(#grad1)' : '#E2E8F0'"
                :stroke="pwdStrength.reqNumber ? 'none' : '#CBD5E1'"
                stroke-width="1.5"
              />
              <path
                v-if="pwdStrength.reqNumber"
                d="M8 12.5L10.5 15L16 9"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span
              :class="pwdStrength.reqNumber ? 'text-[#4a5568]' : 'text-[#94a3b8]'"
              class="text-[13px]"
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
                :fill="pwdStrength.reqCapital ? 'url(#grad1)' : '#E2E8F0'"
                :stroke="pwdStrength.reqCapital ? 'none' : '#CBD5E1'"
                stroke-width="1.5"
              />
              <path
                v-if="pwdStrength.reqCapital"
                d="M8 12.5L10.5 15L16 9"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span
              :class="pwdStrength.reqCapital ? 'text-[#4a5568]' : 'text-[#94a3b8]'"
              class="text-[13px]"
              >Huruf Kapital (A-Z)</span
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
                :fill="pwdStrength.reqSymbol ? 'url(#grad1)' : '#E2E8F0'"
                :stroke="pwdStrength.reqSymbol ? 'none' : '#CBD5E1'"
                stroke-width="1.5"
              />
              <path
                v-if="pwdStrength.reqSymbol"
                d="M8 12.5L10.5 15L16 9"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span
              :class="pwdStrength.reqSymbol ? 'text-[#4a5568]' : 'text-[#94a3b8]'"
              class="text-[13px]"
              >Karakter Unik/Simbol</span
            >
          </div>
        </div>
      </div>

      <VButton type="submit" variant="primary" class="mt-4 w-full h-[52px]" :disabled="isLoading">
        {{ isLoading ? 'Memproses...' : 'Daftar' }}
      </VButton>

      <p class="text-center text-sm text-[#767E86] mt-2">
        Sudah punya akun?
        <router-link
          to="/login"
          class="font-semibold text-[#3f9760] hover:text-[#0c4923] hover:underline transition-colors"
        >
          Login di sini
        </router-link>
      </p>
    </form>
  </div>
</template>
