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

const emailError = ref('')
const passwordError = ref('')

const router = useRouter()
const authStore = useAuthStore()

watch(email, () => (emailError.value = ''))
watch(password, () => (passwordError.value = ''))

const goToForgotPassword = () => {
  router.push({
    name: 'password-reset',
    query: { email: email.value },
  })
}

const getFallbackRedirectPath = (role?: string) => {
  const normalizedRole = role?.toUpperCase()

  if (normalizedRole === 'ADMIN') {
    return '/admin/surat-antrean'
  }

  if (normalizedRole === 'KEPSEK') {
    return '/kepsek/surat-antrean'
  }

  if (
    ['BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK'].includes(normalizedRole || '')
  ) {
    return '/department-teachers/surat-antrean'
  }

  if (['GURU', 'WALI_MURID'].includes(normalizedRole || '')) {
    return '/surat-keluar/riwayat'
  }

  return '/profile'
}

const getValidRedirectPath = (preferredPath: string | null, role?: string) => {
  const fallbackPath = getFallbackRedirectPath(role)

  if (!preferredPath) {
    return fallbackPath
  }

  const resolvedRoute = router.resolve(preferredPath)

  if (resolvedRoute.matched.length === 0) {
    return fallbackPath
  }

  return preferredPath
}

const handleLogin = async () => {
  emailError.value = ''
  passwordError.value = ''

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

    toast.custom(VToast, {
      componentProps: {
        type: 'success',
        message: 'Login Berhasil!',
      },
    })

    const role = data.role?.toUpperCase()
    const preferredPath =
      data.default_home_page ||
      authStore.defaultHomePage ||
      localStorage.getItem('default_home_page')

    const redirectPath = getValidRedirectPath(preferredPath, role)

    setTimeout(() => {
      router.push(redirectPath)
    }, 1000)
  } catch (error: unknown) {
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