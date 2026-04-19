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
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="relative w-full min-h-screen flex items-center justify-center px-4">
    <div class="absolute top-8 left-8 z-20">
      <img src="@/assets/Inrab_Logo.png" alt="SMA Insan Rabbany" class="h-16 opacity-80" />
    </div>

    <div
      class="w-full max-w-[420px] bg-white rounded-[24px] shadow-[0px_8px_24px_rgba(0,0,0,0.05)] border border-[#d4e8da] p-8 flex flex-col items-center text-center z-10"
    >
      <div
        class="w-[60px] h-[60px] bg-[#e8f3eb] rounded-full flex items-center justify-center mb-6"
      >
        <MailOpenIcon class="w-[30px] h-[30px] text-[#3f9760]" />
      </div>

      <h1 class="text-[24px] font-bold text-[#111827] mb-2">Verifikasi Email</h1>
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

      <form @submit.prevent="handleVerifyOtp" class="w-full flex flex-col items-center gap-6">
        <VOtpInput
          v-model="otpJoined"
          :disabled="isVerifying || isSendingOtp"
          @complete="handleVerifyOtp"
        />

        <VButton
          type="submit"
          variant="primary"
          class="w-full h-[48px] mt-2"
          :disabled="isVerifying || otpJoined.length < 6"
        >
          {{ isVerifying ? 'Memverifikasi...' : 'Verifikasi Sekarang' }}
        </VButton>
      </form>

      <div class="mt-6 flex flex-col items-center justify-center gap-4 w-full">
        <div class="flex items-center justify-center gap-1 text-[14px]">
          <span class="text-[#718096]">Belum menerima kode?</span>
          <button
            @click="handleSendOtp(false)"
            :disabled="isSendingOtp || isVerifying"
            class="font-semibold text-[#3f9760] hover:text-[#0c4923] transition-colors disabled:opacity-50"
          >
            {{ isSendingOtp ? 'Mengirim...' : 'Kirim Ulang' }}
          </button>
        </div>

        <button
          @click="handleSkip"
          class="text-[14px] font-semibold text-[#718096] hover:text-[#4a5568] hover:underline transition-colors"
        >
          Lewati, Verifikasi Nanti
        </button>
      </div>
    </div>
  </div>
</template>
