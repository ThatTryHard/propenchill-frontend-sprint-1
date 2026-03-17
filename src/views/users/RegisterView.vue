<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import VToast from '@/components/common/VToast.vue'
import { useAuthStore } from '@/stores/users/auth'
import VInputField from '@/components/common/VInputField.vue'
import VButton from '@/components/common/VButton.vue'

const router = useRouter()
const authStore = useAuthStore()

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
  } else if (password.value.length < 8) {
    passwordError.value = 'Password minimal 8 karakter!'
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
    toast.error(message)
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
