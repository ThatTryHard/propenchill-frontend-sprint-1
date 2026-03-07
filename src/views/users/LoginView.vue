<template>
  <div
    class="relative min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] p-6 font-sans"
  >
    <div class="absolute top-8 left-8">
      <img src="@/assets/Inrab_Logo.png" alt="SMA Insan Rabbany" class="h-16 opacity-80" />
    </div>

    <div class="flex flex-col items-center mb-10 mt-12">
      <img src="@/assets/SIMP.png" alt="SIMP Box" class="h-32 mb-6" />
      <h1 class="text-[28px] font-bold text-[#767E86]">Hello, Welcome Back!</h1>
    </div>

    <div class="w-full max-w-[600px] flex flex-col gap-3">
      <VInputField
        v-model="email"
        label="Email"
        type="email"
        placeholder="nama@sekolah.sch.id"
        :disabled="isLoading"
        :state="emailError ? 'error' : 'default'"
        :message="emailError"
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

      <VButton
        variant="primary"
        class="mt-4 w-full h-[52px]"
        @click="handleLogin"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Memproses...' : 'Login' }}
      </VButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/users/auth'
import VInputField from '@/components/common/VInputField.vue'
import VButton from '@/components/common/VButton.vue'

const email = ref('')
const password = ref('')
const isLoading = ref(false)

// Error state untuk masing-masing field, yang akan menampilkan pesan error di bawah field dan mengubah border jadi merah
const emailError = ref('')
const passwordError = ref('')

const router = useRouter()
const authStore = useAuthStore()

// Reset error tiap kali user mulai ketik ulang di field email atau password
watch(email, () => (emailError.value = ''))
watch(password, () => (passwordError.value = ''))

const handleLogin = async () => {
  emailError.value = ''
  passwordError.value = ''

  // Validasi frontend sederhana: pastikan kedua field terisi
  let hasError = false
  if (!email.value) {
    emailError.value = 'Email wajib diisi!'
    hasError = true
  }
  if (!password.value) {
    passwordError.value = 'Kata sandi wajib diisi!'
    hasError = true
  }
  if (hasError) return

  isLoading.value = true

  try {
    const data = await authStore.login(email.value, password.value)

    // Kalau berhasil, kasih toast sukses dan redirect ke dashboard, placeholder dulu karena dashboard belum dibuat
    toast.success('Login berhasil! Mengalihkan...')
    const role = data.role?.toUpperCase()
    let redirectPath = '/login' // fallback
    if (role === 'ADMIN') {
      redirectPath = '/admin/dashboard'
    } // Tambahkan kondisi untuk role lain menggunakan if else jika diperlukan, misal guru atau guru bidang 

    setTimeout(() => {
      router.push(redirectPath)
    }, 1000)
  } catch (error: unknown) {
    // Kalau gagal, warnain kedua field jadi merah
    toast.error((error as Error).message)
    emailError.value = (error as Error).message
    passwordError.value = (error as Error).message
    password.value = ''
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>
