<template>
  <div
    class="verify-otp-card w-full max-w-[420px] rounded-[24px] shadow-[0px_8px_24px_rgba(0,0,0,0.05)] border p-8 flex flex-col items-center text-center"
  >
    <div
      class="verify-otp-icon w-[4.25rem] h-[4.25rem] rounded-full flex items-center justify-center mb-6"
    >
      <MailOpenIcon class="w-[2.15rem] h-[2.15rem] text-[var(--app-accent)]" />
    </div>

    <h1 class="verify-otp-heading text-[1.7rem] font-bold mb-2">Verifikasi OTP</h1>

    <p class="verify-otp-description text-[1rem] leading-relaxed mb-6">
      Masukkan 6 digit kode keamanan yang telah kami kirimkan ke email <br />
      <span class="verify-otp-email font-bold">{{ emailMasked }}</span>
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

    <form @submit.prevent="handleVerifyOTP" class="w-full flex flex-col items-center gap-6">
      <VOtpInput v-model="otpJoined" :disabled="isLoading" @complete="handleVerifyOTP" />

      <VButton
        type="submit"
        variant="primary"
        class="w-full h-[3.45rem] mt-2"
        :disabled="isLoading || otpJoined.length < 6"
      >
        {{ isLoading ? 'Memverifikasi...' : 'Verifikasi Kode' }}
      </VButton>
    </form>

    <div class="mt-8 flex items-center justify-center gap-1 text-[1rem]">
      <span class="verify-otp-description">Belum menerima kode?</span>

      <button
        @click="handleResendOTP"
        :disabled="isResending || isLoading"
        class="font-semibold text-[var(--app-accent)] hover:text-[var(--app-accent-2)] transition-colors disabled:opacity-50"
      >
        {{ isResending ? 'Mengirim...' : 'Kirim Ulang' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePasswordStore } from '@/stores/users/password'
import { MailOpenIcon } from 'lucide-vue-next'
import VButton from '@/components/common/VButton.vue'
import VAlert from '@/components/common/VAlert.vue'
import VOtpInput from '@/components/common/VOTPInput.vue'

const router = useRouter()
const route = useRoute()
const passwordStore = usePasswordStore()

const email = ref((route.query.email as string) || '')
const isLoading = ref(false)
const isResending = ref(false)

const alert = reactive({ visible: false, type: 'error', title: '', message: '' })
const otpJoined = ref('')

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

// Logika verifikasi OTP
const handleVerifyOTP = async () => {
  if (otpJoined.value.length < 6) return

  alert.visible = false
  isLoading.value = true

  try {
    // Panggil fungsi dari Store
    await passwordStore.verifyOTP(email.value, otpJoined.value)

    // Auto-lempar ke halaman Set New Password kalau bener
    router.push({ name: 'set-new-password' })
  } catch (error: unknown) {
    alert.visible = true
    alert.type = 'error'
    alert.message = getApiErrorMessage(error, 'Kode OTP salah atau telah kadaluarsa.')

    otpJoined.value = ''
  } finally {
    isLoading.value = false
  }
}

const handleResendOTP = async () => {
  isResending.value = true

  try {
    await passwordStore.requestOTP(email.value)
    alert.visible = true
    alert.type = 'success'
    alert.message = 'Kode OTP baru telah dikirim ke email Anda.'
  } catch (error: unknown) {
    alert.visible = true
    alert.type = 'error'
    alert.message = getApiErrorMessage(error, 'Gagal mengirim ulang OTP.')
  } finally {
    isResending.value = false
  }
}
</script>

<style scoped>
.verify-otp-card {
  background: var(--app-card);
  color: var(--app-text);
  border-color: var(--app-border);
}

.verify-otp-icon {
  background: var(--app-soft-card);
}

.verify-otp-heading,
.verify-otp-email {
  color: var(--app-heading);
}

.verify-otp-description {
  color: var(--app-muted);
}

:global(html.dark) .verify-otp-card {
  background: var(--app-card);
  color: var(--app-text);
  border-color: var(--app-border);
}

:global(html.dark) .verify-otp-icon {
  background: var(--app-soft-card);
}

:global(html.dark) .verify-otp-icon :deep(svg) {
  color: var(--app-success);
  stroke: var(--app-success);
}

:global(html.dark) .verify-otp-heading,
:global(html.dark) .verify-otp-email {
  color: var(--app-heading);
}

:global(html.dark) .verify-otp-description {
  color: var(--app-subtext);
}
</style>