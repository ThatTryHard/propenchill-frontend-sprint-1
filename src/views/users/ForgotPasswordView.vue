<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { AxiosError } from 'axios'
import { usePasswordStore } from '@/stores/users/password'

import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VAlert from '@/components/common/VAlert.vue'

type AlertType = 'success' | 'error' | 'warning' | 'information'

const router = useRouter()
const route = useRoute()
const passwordStore = usePasswordStore()

const email = ref('')
const emailError = ref('')
const isLoading = ref(false)

const alert = reactive<{
  visible: boolean
  type: AlertType
  title: string
  message: string
}>({
  visible: false,
  type: 'error',
  title: '',
  message: '',
})

onMounted(() => {
  if (route.query.email) {
    email.value = route.query.email as string
  }
})

const handleRequestOTP = async () => {
  emailError.value = ''
  alert.visible = false

  if (!email.value) {
    emailError.value = 'Email wajib diisi!'
    return
  }

  isLoading.value = true

  try {
    const response = await passwordStore.requestOTP(email.value)

    console.log(response.message)

    router.push({
      name: 'verify-otp',
      query: { email: email.value },
    })
  } catch (error) {
    alert.visible = true
    alert.type = 'error'
    alert.title = 'Gagal Mengirim OTP'

    const axiosError = error as AxiosError<{ error: string }>

    if (axiosError.response?.data?.error) {
      alert.message = axiosError.response.data.error
    } else {
      alert.message = 'Terjadi kesalahan pada server. Silakan coba lagi.'
      console.error('Error saat request OTP:', error)
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main
    class="
      flex h-full min-h-full w-full items-center justify-center overflow-hidden
      bg-transparent p-6 font-[var(--font-sans)] text-[var(--app-text)]
      [@media(max-height:720px)]:p-4
      max-[480px]:p-[14px]
    "
  >
    <section
      class="
        flex w-[min(420px,100%)] max-h-[calc(100dvh-48px)] flex-col items-center
        overflow-hidden rounded-[24px] border border-[var(--app-border)]
        bg-[var(--app-card)] px-8 py-6 text-center text-[var(--app-text)]
        shadow-[0_8px_24px_rgba(0,0,0,0.05)]
        [@media(max-height:720px)]:max-h-[calc(100dvh-32px)]
        [@media(max-height:720px)]:px-7
        [@media(max-height:720px)]:py-[18px]
        max-[480px]:w-full
        max-[480px]:rounded-[20px]
        max-[480px]:p-5
      "
    >
      <img
        src="@/assets/SIMP.png"
        alt="SIMP Logo"
        class="
          mb-4 h-24 w-24 object-contain
          [@media(max-height:720px)]:mb-3
          [@media(max-height:720px)]:h-[76px]
          [@media(max-height:720px)]:w-[76px]
          max-[480px]:h-[84px]
          max-[480px]:w-[84px]
        "
      />

      <h1
        class="
          [margin:0_0_8px]
          text-[length:var(--app-modal-title-font)]
          font-bold leading-[1.2] text-[var(--app-heading)]
        "
      >
        Lupa Kata Sandi?
      </h1>

      <p
        class="
          max-w-[340px] [margin:0_0_18px]
          text-[length:var(--app-font-sm)]
          leading-[1.5] text-[var(--app-muted)]
          [@media(max-height:720px)]:mb-[14px]
          [@media(max-height:720px)]:leading-[1.4]
        "
      >
        Masukkan email terdaftar Anda. Kami akan mengirimkan kode OTP untuk mengatur ulang
        kata sandi.
      </p>

      <VAlert
        v-if="alert.visible"
        :type="alert.type"
        :title="alert.title"
        :message="alert.message"
        class="mb-[14px] w-full text-left"
        @close="alert.visible = false"
      />

      <form
        class="
          flex w-full flex-col gap-[14px] text-left
          [@media(max-height:720px)]:gap-3
        "
        @submit.prevent="handleRequestOTP"
      >
        <VInputField
          v-model="email"
          label="Alamat Email"
          type="email"
          placeholder="contoh: user@simp.com"
          :disabled="isLoading"
          :state="emailError ? 'error' : 'default'"
          :message="emailError"
        />

        <VButton
          type="submit"
          variant="primary"
          class="mt-1 min-h-[42px] w-full"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Mengirim Kode...' : 'Kirim Kode OTP' }}
        </VButton>
      </form>

      <RouterLink
        to="/login"
        class="
          mt-4 inline-flex items-center justify-center
          font-[var(--font-sans)]
          text-[length:var(--app-font-sm)]
          font-semibold leading-[1.2]
          text-[var(--app-accent)]
          no-underline
          transition-colors duration-200 ease-in-out
          hover:text-[var(--app-accent-2)]
          hover:underline
          hover:underline-offset-4
          [@media(max-height:720px)]:mt-3
        "
      >
        <span>Kembali ke Halaman Login</span>
      </RouterLink>
    </section>
  </main>
</template>