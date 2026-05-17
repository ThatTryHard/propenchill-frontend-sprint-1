<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { MailOpenIcon } from 'lucide-vue-next'
import { usePasswordStore } from '@/stores/users/password'

import VButton from '@/components/common/VButton.vue'
import VAlert from '@/components/common/VAlert.vue'
import VOtpInput from '@/components/common/VOTPInput.vue'

type AlertType = 'success' | 'error' | 'warning' | 'information'

const router = useRouter()
const route = useRoute()
const passwordStore = usePasswordStore()

const email = ref((route.query.email as string) || '')
const otpJoined = ref('')
const isLoading = ref(false)
const isResending = ref(false)

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

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null) {
    const maybeResponse = error as {
      response?: { data?: { error?: string } }
      message?: string
    }

    if (typeof maybeResponse.response?.data?.error === 'string') {
      return maybeResponse.response.data.error
    }

    if (typeof maybeResponse.message === 'string' && maybeResponse.message.length > 0) {
      return maybeResponse.message
    }
  }

  return fallback
}

const emailMasked = computed(() => {
  if (!email.value) return ''

  const [name, domain] = email.value.split('@')

  if (!name || !domain) return email.value

  return `${name.charAt(0)}***@${domain}`
})

onMounted(() => {
  if (!email.value) {
    router.push({ name: 'password-reset' })
  }
})

const handleVerifyOTP = async () => {
  if (otpJoined.value.length < 6) return

  alert.visible = false
  isLoading.value = true

  try {
    await passwordStore.verifyOTP(email.value, otpJoined.value)

    router.push({ name: 'set-new-password' })
  } catch (error: unknown) {
    alert.visible = true
    alert.type = 'error'
    alert.title = 'Verifikasi Gagal'
    alert.message = getApiErrorMessage(error, 'Kode OTP salah atau telah kedaluwarsa.')

    otpJoined.value = ''
  } finally {
    isLoading.value = false
  }
}

const handleResendOTP = async () => {
  isResending.value = true
  alert.visible = false

  try {
    await passwordStore.requestOTP(email.value)

    alert.visible = true
    alert.type = 'success'
    alert.title = 'Kode Dikirim'
    alert.message = 'Kode OTP baru telah dikirim ke email Anda.'
  } catch (error: unknown) {
    alert.visible = true
    alert.type = 'error'
    alert.title = 'Gagal Mengirim'
    alert.message = getApiErrorMessage(error, 'Gagal mengirim ulang OTP.')
  } finally {
    isResending.value = false
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
        flex w-[min(420px,100%)] max-h-[calc(100dvh-48px)]
        flex-col items-center overflow-hidden rounded-[24px]
        border border-[var(--app-border)] bg-[var(--app-card)]
        p-8 text-center text-[var(--app-text)]
        [box-shadow:var(--app-card-shadow,0_8px_24px_rgba(0,0,0,0.05))]
        [@media(max-height:720px)]:max-h-[calc(100dvh-32px)]
        [@media(max-height:720px)]:px-7
        [@media(max-height:720px)]:py-6
        max-[480px]:w-full
        max-[480px]:rounded-[20px]
        max-[480px]:px-5
        max-[480px]:py-6
      "
    >
      <div
        class="
          mb-6 flex h-[68px] w-[68px] items-center justify-center
          rounded-full bg-[var(--app-soft-card)] text-[var(--app-accent)]
          [@media(max-height:720px)]:mb-4
          [@media(max-height:720px)]:h-14
          [@media(max-height:720px)]:w-14
        "
      >
        <MailOpenIcon
          class="
            h-[34px] w-[34px] text-current
            [@media(max-height:720px)]:h-7
            [@media(max-height:720px)]:w-7
          "
        />
      </div>

      <h1
        class="
          [margin:0_0_8px]
          text-[length:var(--app-modal-title-font)]
          font-bold leading-[1.2] text-[var(--app-heading)]
        "
      >
        Verifikasi OTP
      </h1>

      <p
        class="
          max-w-[340px] [margin:0_0_24px]
          text-[length:var(--app-font-sm)]
          leading-[1.6] text-[var(--app-muted)]
          [@media(max-height:720px)]:mb-[18px]
          [@media(max-height:720px)]:leading-[1.45]
        "
      >
        Masukkan 6 digit kode keamanan yang telah kami kirimkan ke email
        <span class="font-bold text-[var(--app-heading)]">{{ emailMasked }}</span>
      </p>

      <VAlert
        v-if="alert.visible"
        :type="alert.type"
        :title="alert.title"
        :message="alert.message"
        class="mb-5 w-full text-left"
        @close="alert.visible = false"
      />

      <form
        class="
          flex w-full flex-col items-center gap-5
          [@media(max-height:720px)]:gap-4
        "
        @submit.prevent="handleVerifyOTP"
      >
        <VOtpInput
          v-model="otpJoined"
          :disabled="isLoading"
          @complete="handleVerifyOTP"
        />

        <VButton
          type="submit"
          variant="primary"
          class="mt-1 min-h-12 w-full"
          :disabled="isLoading || otpJoined.length < 6"
        >
          {{ isLoading ? 'Memverifikasi...' : 'Verifikasi Kode' }}
        </VButton>
      </form>

      <div
        class="
          mt-7 flex items-center justify-center gap-1
          text-[length:var(--app-font-sm)]
          leading-[1.5] text-[var(--app-muted)]
          [@media(max-height:720px)]:mt-5
          max-[480px]:flex-col max-[480px]:gap-[6px]
        "
      >
        <span class="text-[var(--app-muted)]">
          Belum menerima kode?
        </span>

        <button
          type="button"
          class="
            border-0 bg-transparent p-0
            font-[var(--font-sans)]
            text-[length:var(--app-font-sm)]
            font-semibold leading-[1.2]
            text-[var(--app-accent)]
            transition-[color,opacity] duration-200 ease-in-out
            hover:text-[var(--app-accent-2)]
            hover:underline
            disabled:cursor-not-allowed
            disabled:opacity-50
            focus:outline-none
            focus-visible:rounded-[6px]
            focus-visible:outline
            focus-visible:outline-2
            focus-visible:outline-offset-[3px]
            focus-visible:outline-[var(--app-accent)]
          "
          :disabled="isResending || isLoading"
          @click="handleResendOTP"
        >
          {{ isResending ? 'Mengirim...' : 'Kirim Ulang' }}
        </button>
      </div>
    </section>
  </main>
</template>