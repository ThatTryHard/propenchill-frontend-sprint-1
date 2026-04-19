<template>
  <div
    class="w-full max-w-[420px] bg-white rounded-[24px] shadow-[0px_8px_24px_rgba(0,0,0,0.05)] border border-[#d4e8da] p-8 flex flex-col items-center text-center"
  >
    <div class="w-[60px] h-[60px] bg-[#e8f3eb] rounded-full flex items-center justify-center mb-6">
      <MailOpenIcon class="w-[30px] h-[30px] text-[#3f9760]" />
    </div>

    <h1 class="text-[24px] font-bold text-[#111827] mb-2">Verifikasi OTP</h1>
    <p class="text-[14px] text-[#718096] leading-relaxed mb-6">
      Masukkan 6 digit kode keamanan yang telah kami kirimkan ke email <br />
      <span class="font-bold text-[#111827]">{{ emailMasked }}</span>
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
        class="w-full h-[48px] mt-2"
        :disabled="isLoading || otpJoined.length < 6"
      >
        {{ isLoading ? 'Memverifikasi...' : 'Verifikasi Kode' }}
      </VButton>
    </form>

    <div class="mt-8 flex items-center justify-center gap-1 text-[14px]">
      <span class="text-[#718096]">Belum menerima kode?</span>
      <button
        @click="handleResendOTP"
        :disabled="isResending || isLoading"
        class="font-semibold text-[#3f9760] hover:text-[#0c4923] transition-colors disabled:opacity-50"
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
