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

<template>
  <main
    class="
      relative flex h-full min-h-full w-full items-center justify-center
      overflow-hidden bg-transparent p-6
      font-[var(--font-sans)] text-[var(--app-text)]
      [@media(max-height:720px)]:p-[18px]
      max-[640px]:p-5
    "
  >
    <div
      class="
        absolute left-8 top-8 z-[2]
        max-[640px]:left-5 max-[640px]:top-5
      "
    >
      <img
        src="@/assets/Inrab_Logo.png"
        alt="SMA Insan Rabbany"
        class="
          h-16 w-auto object-contain opacity-80
          [@media(max-height:720px)]:h-[52px]
          max-[640px]:h-12
        "
      />
    </div>

    <section
      class="
        flex w-[min(600px,100%)] flex-col items-center
        max-[640px]:w-full
      "
    >
      <div
        class="
          mt-6 mb-10 flex flex-col items-center text-center
          [@media(max-height:720px)]:mt-2
          [@media(max-height:720px)]:mb-6
          max-[640px]:mt-14
        "
      >
        <img
          src="@/assets/SIMP.png"
          alt="SIMP Box"
          class="
            mb-6 h-32 w-auto object-contain
            [@media(max-height:720px)]:mb-4
            [@media(max-height:720px)]:h-24
          "
        />

        <h1
          class="
            m-0 text-[length:var(--app-font-title)]
            font-bold leading-[1.2] text-[var(--app-muted)]
          "
        >
          Halo, Selamat Datang!
        </h1>
      </div>

      <div class="flex w-full flex-col gap-3">
        <VInputField
          v-model="email"
          label="Email"
          type="email"
          placeholder="Masukkan email Anda"
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

          <div class="mt-1 flex justify-start">
            <button
              type="button"
              class="
                border-0 bg-transparent p-0
                font-[var(--font-sans)]
                text-[length:var(--app-font-sm)]
                font-semibold leading-[1.2]
                text-[var(--app-accent)]
                transition-colors duration-200 ease-in-out
                hover:text-[var(--app-accent-2)]
                hover:underline
                focus:outline-none
                focus-visible:rounded-[6px]
                focus-visible:outline
                focus-visible:outline-2
                focus-visible:outline-offset-[3px]
                focus-visible:outline-[var(--app-accent)]
              "
              @click="goToForgotPassword"
            >
              Lupa Password?
            </button>
          </div>
        </div>

        <VButton
          variant="primary"
          class="
            mt-4 min-h-[52px] w-full
            [@media(max-height:720px)]:mt-3
            [@media(max-height:720px)]:min-h-[44px]
          "
          :disabled="isLoading"
          @click="handleLogin"
        >
          {{ isLoading ? 'Memproses...' : 'Masuk' }}
        </VButton>

        <p
          class="
            mt-2 mb-0 text-center
            text-[length:var(--app-font-sm)]
            leading-[1.5] text-[var(--app-muted)]
          "
        >
          Belum punya akun?

          <router-link
            to="/register"
            class="
              font-semibold text-[var(--app-accent)]
              no-underline transition-colors duration-200 ease-in-out
              hover:text-[var(--app-accent-2)]
              hover:underline
              focus:outline-none
              focus-visible:rounded-[6px]
              focus-visible:outline
              focus-visible:outline-2
              focus-visible:outline-offset-[3px]
              focus-visible:outline-[var(--app-accent)]
            "
          >
            Daftar di sini
          </router-link>
        </p>
      </div>
    </section>
  </main>
</template>