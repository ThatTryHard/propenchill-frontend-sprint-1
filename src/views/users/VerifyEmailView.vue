<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/users/auth'
import { MailOpenIcon } from 'lucide-vue-next'
import VButton from '@/components/common/VButton.vue'
import VAlert from '@/components/common/VAlert.vue'
import VOtpInput from '@/components/common/VOTPInput.vue'
import { toast } from 'vue-sonner'
import VToast from '@/components/common/VToast.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const email = ref(String(route.query.email || ''))
const otpJoined = ref('')
const isSendingOtp = ref(false)
const isVerifying = ref(false)

const alert = reactive({ visible: false, type: 'error', title: '', message: '' })

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null) {
    const maybeError = error as { message?: unknown }
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
        componentProps: { type: 'success', message: 'Kode OTP berhasil dikirim ulang!' },
      })
    }
  } catch (error: unknown) {
    alert.visible = true
    alert.type = 'error'
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
    alert.message = getErrorMessage(error, 'Kode OTP salah atau telah kadaluarsa.')
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
  <div class="verify-email-page relative w-full min-h-screen flex items-center justify-center px-4">
    <div class="absolute top-8 left-8 z-20">
      <img src="@/assets/Inrab_Logo.png" alt="SMA Insan Rabbany" class="h-16 opacity-80" />
    </div>

    <div
      class="verify-email-card w-full max-w-[420px] rounded-[24px] shadow-[0px_8px_24px_rgba(0,0,0,0.05)] border p-8 flex flex-col items-center text-center z-10"
    >
      <div
        class="verify-email-icon w-[4.25rem] h-[4.25rem] rounded-full flex items-center justify-center mb-6"
      >
        <MailOpenIcon class="w-[2.15rem] h-[2.15rem] text-[var(--app-accent)]" />
      </div>

      <h1 class="verify-email-heading text-[1.7rem] font-bold mb-2">Verifikasi Email</h1>

      <p class="verify-email-description text-[1rem] leading-relaxed mb-6">
        Masukkan 6 digit kode keamanan yang telah kami kirimkan ke email <br />
        <span class="verify-email-address font-bold">{{ emailMasked }}</span>
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

      <form @submit.prevent="handleVerifyOtp" class="w-full flex flex-col items-center gap-6">
        <VOtpInput
          v-model="otpJoined"
          :disabled="isVerifying || isSendingOtp"
          @complete="handleVerifyOtp"
        />

        <VButton
          type="submit"
          variant="primary"
          class="w-full h-[3.45rem] mt-2"
          :disabled="isVerifying || otpJoined.length < 6"
        >
          {{ isVerifying ? 'Memverifikasi...' : 'Verifikasi Sekarang' }}
        </VButton>
      </form>

      <div class="mt-6 flex flex-col items-center justify-center gap-4 w-full">
        <div class="flex items-center justify-center gap-1 text-[1rem]">
          <span class="verify-email-description">Belum menerima kode?</span>

          <button
            @click="handleSendOtp(false)"
            :disabled="isSendingOtp || isVerifying"
            class="font-semibold text-[var(--app-accent)] hover:text-[var(--app-accent-2)] transition-colors disabled:opacity-50"
          >
            {{ isSendingOtp ? 'Mengirim...' : 'Kirim Ulang' }}
          </button>
        </div>

        <button
          @click="handleSkip"
          class="verify-email-skip text-[1rem] font-semibold hover:underline transition-colors"
        >
          Lewati, Verifikasi Nanti
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.verify-email-page {
  background: var(--app-bg);
  color: var(--app-text);
}

.verify-email-card {
  background: var(--app-card);
  color: var(--app-text);
  border-color: var(--app-border);
}

.verify-email-icon {
  background: var(--app-soft-card);
}

.verify-email-heading,
.verify-email-address {
  color: var(--app-heading);
}

.verify-email-description,
.verify-email-skip {
  color: var(--app-muted);
}

.verify-email-skip:hover {
  color: var(--app-text-soft);
}

:global(html.dark) .verify-email-icon {
  background: var(--app-soft-card);
}

:global(html.dark) .verify-email-icon :deep(svg) {
  color: var(--app-success);
  stroke: var(--app-success);
}

:global(html.dark) .verify-email-description,
:global(html.dark) .verify-email-skip {
  color: var(--app-subtext);
}

:global(html.dark) .verify-email-skip:hover {
  color: var(--app-heading);
}
</style>