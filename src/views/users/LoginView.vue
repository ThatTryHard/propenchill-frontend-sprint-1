<template>
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

    <div class="flex flex-col">
      <VInputField
        v-model="password"
        label="Kata Sandi"
        type="password"
        placeholder="Masukkan kata sandi"
        :disabled="isLoading"
        :state="passwordError ? 'error' : 'default'"
        :message="passwordError"
      />

      <div class="flex justify-start mt-1">
        <button
          type="button"
          @click="goToForgotPassword"
          class="text-[14px] font-semibold text-[#3f9760] hover:text-[#0c4923] hover:underline transition-colors"
        >
          Lupa Password?
        </button>
      </div>
    </div>

    <VButton
      variant="primary"
      class="mt-4 w-full h-[52px]"
      @click="handleLogin"
      :disabled="isLoading"
    >
      {{ isLoading ? 'Memproses...' : 'Login' }}
    </VButton>

    <p class="text-center text-sm text-[#767E86] mt-2">
      Belum punya akun?
      <router-link
        to="/register"
        class="font-semibold text-[#3f9760] hover:text-[#0c4923] hover:underline transition-colors"
      >
        Daftar di sini
      </router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import VToast from '@/components/common/VToast.vue'
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

const goToForgotPassword = () => {
  router.push({
    name: 'password-reset',
    query: { email: email.value },
  })
}

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
    toast.custom(VToast, {
      componentProps: {
        type: 'success',
        message: 'Login Berhasil!',
      },
    })
    const role = data.role?.toUpperCase()
    let redirectPath = '/login'

    // Logic redirect berdasarkan role
    if (role === 'ADMIN') {
      redirectPath = '/admin/parents'
    } else if (['KEPSEK', 'BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_KURIKULUM'].includes(role)) {
      redirectPath = '/staff/dashboard'
    } else if (role === 'WALI_MURID') {
      redirectPath = '/wali/dashboard'
    }

    setTimeout(() => {
      router.push(redirectPath)
    }, 1000)
  } catch (error: unknown) {
    // Kalau gagal, warnain kedua field jadi merah
    toast.error((error as Error).message)
    toast.custom(VToast, {
      componentProps: {
        type: 'error',
        message: 'Login Gagal! Pastikan email dan kata sandi Anda benar.',
      },
    })
    emailError.value = (error as Error).message
    passwordError.value = (error as Error).message
    password.value = ''
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>
