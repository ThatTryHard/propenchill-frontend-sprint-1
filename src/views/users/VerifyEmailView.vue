<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MailOpenIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import { useAuthStore } from '@/stores/users/auth'
import VButton from '@/components/common/VButton.vue'
import VAlert from '@/components/common/VAlert.vue'
import VOtpInput from '@/components/common/VOTPInput.vue'
import VToast from '@/components/common/VToast.vue'

type AlertType = 'success' | 'error' | 'warning' | 'information'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const email = ref(String(route.query.email || ''))
const otpJoined = ref('')
const isSendingOtp = ref(false)
const isVerifying = ref(false)

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

const isProfileVerifyEmail = computed(() => {
  return route.name === 'profile-verify-email' || route.path.includes('/profile/verify-email')
})

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null) {
    const maybeError = error as {
      message?: unknown
      response?: {
        data?: {
          error?: string
          message?: string
        }
      }
    }

    if (typeof maybeError.response?.data?.error === 'string') {
      return maybeError.response.data.error
    }

    if (typeof maybeError.response?.data?.message === 'string') {
      return maybeError.response.data.message
    }

    if (typeof maybeError.message === 'string' && maybeError.message.length > 0) {
      return maybeError.message
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
    router.push({ name: 'login' })
    return
  }

  handleSendOtp(true)
})

const handleSendOtp = async (isInitial = false) => {
  isSendingOtp.value = true
  alert.visible = false

  try {
    await authStore.sendEmailOtp({ email: email.value })

    if (!isInitial) {
      toast.custom(VToast, {
        componentProps: {
          type: 'success',
          message: 'Kode OTP berhasil dikirim ulang!',
        },
      })
    }
  } catch (error: unknown) {
    alert.visible = true
    alert.type = 'error'
    alert.title = 'Gagal Mengirim OTP'
    alert.message = getErrorMessage(error, 'Gagal mengirim kode OTP. Silakan coba lagi.')
  } finally {
    isSendingOtp.value = false
  }
}

const handleVerifyOtp = async () => {
  if (otpJoined.value.length < 6) return

  alert.visible = false
  isVerifying.value = true

  try {
    await authStore.verifyEmailOtp({
      email: email.value,
      otp: otpJoined.value,
    })

    toast.custom(VToast, {
      componentProps: {
        type: 'success',
        message: 'Email berhasil diverifikasi!',
      },
    })

    setTimeout(() => {
      const redirectPath = String(route.query.redirect || '')

      if (redirectPath) {
        router.push(redirectPath)
        return
      }

      router.push({ name: 'login' })
    }, 1500)
  } catch (error: unknown) {
    alert.visible = true
    alert.type = 'error'
    alert.title = 'Verifikasi Gagal'
    alert.message = getErrorMessage(error, 'Kode OTP salah atau telah kedaluwarsa.')

    otpJoined.value = ''
  } finally {
    isVerifying.value = false
  }
}

const handleSkip = () => {
  const redirectPath = String(route.query.redirect || '')

  if (redirectPath) {
    router.push(redirectPath)
    return
  }

  router.push({ name: 'login' })
}
</script>

<template>
  <main
    :class="[
      'relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden',
      'p-6 font-[var(--font-sans)] text-[var(--app-text)]',
      '[@media(max-height:720px)]:p-4',
      'max-[480px]:p-[14px]',
      isProfileVerifyEmail ? 'bg-[var(--app-bg)]' : 'bg-transparent',
    ]"
  >
    <div
      class="
        absolute left-8 top-8 z-[2]
        max-[480px]:left-5 max-[480px]:top-5
      "
    >
      <img
        src="@/assets/Inrab_Logo.png"
        alt="SMA Insan Rabbany"
        class="
          h-16 w-auto object-contain opacity-80
          [@media(max-height:720px)]:h-12
          max-[480px]:h-12
        "
      />
    </div>

    <section
      class="
        z-10 flex w-[min(420px,100%)] max-h-[calc(100dvh-48px)]
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
          mb-6 flex h-[68px] w-[68px] shrink-0 items-center justify-center
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
        Verifikasi Email
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
        @submit.prevent="handleVerifyOtp"
      >
        <VOtpInput
          v-model="otpJoined"
          :disabled="isVerifying || isSendingOtp"
          @complete="handleVerifyOtp"
        />

        <VButton
          type="submit"
          variant="primary"
          class="mt-1 min-h-12 w-full"
          :disabled="isVerifying || otpJoined.length < 6"
        >
          {{ isVerifying ? 'Memverifikasi...' : 'Verifikasi Sekarang' }}
        </VButton>
      </form>

      <div
        class="
          mt-6 flex w-full flex-col items-center justify-center gap-[14px]
          [@media(max-height:720px)]:mt-5
        "
      >
        <div
          class="
            flex items-center justify-center gap-1
            text-[length:var(--app-font-sm)]
            leading-[1.5] text-[var(--app-muted)]
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
            :disabled="isSendingOtp || isVerifying"
            @click="handleSendOtp(false)"
          >
            {{ isSendingOtp ? 'Mengirim...' : 'Kirim Ulang' }}
          </button>
        </div>

        <button
          type="button"
          class="
            border-0 bg-transparent p-0
            font-[var(--font-sans)]
            text-[length:var(--app-font-sm)]
            font-semibold leading-[1.2]
            text-[var(--app-muted)]
            transition-[color,opacity] duration-200 ease-in-out
            hover:text-[var(--app-heading)]
            hover:underline
            focus:outline-none
            focus-visible:rounded-[6px]
            focus-visible:outline
            focus-visible:outline-2
            focus-visible:outline-offset-[3px]
            focus-visible:outline-[var(--app-accent)]
          "
          @click="handleSkip"
        >
          Lewati, Verifikasi Nanti
        </button>
      </div>
    </section>
  </main>
</template>