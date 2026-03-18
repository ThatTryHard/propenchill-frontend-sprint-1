<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import VToast from '@/components/common/VToast.vue'
import { useAuthStore } from '@/stores/users/auth'
import VInputField from '@/components/common/VInputField.vue'
import VButton from '@/components/common/VButton.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const otp = ref('')
const otpError = ref('')
const isSendingOtp = ref(false)
const isVerifying = ref(false)

onMounted(() => {
  email.value = String(route.query.email || '')
})

const handleSendOtp = async () => {
  otpError.value = ''

  if (!email.value) {
    toast.custom(VToast, {
      componentProps: {
        type: 'error',
        message: 'Email tidak ditemukan.',
      },
    })
    return
  }

  isSendingOtp.value = true

  try {
    await authStore.sendEmailOtp({
      email: email.value,
    })

    toast.custom(VToast, {
      componentProps: {
        type: 'success',
        message: 'Kode OTP berhasil dikirim ke email Anda.',
      },
    })
  } catch (error: unknown) {
    const message = (error as Error).message
    toast.custom(VToast, {
      componentProps: {
        type: 'error',
        message: message,
      },
    })
  } finally {
    isSendingOtp.value = false
  }
}

const handleVerifyOtp = async () => {
  otpError.value = ''

  if (!otp.value) {
    otpError.value = 'Kode OTP wajib diisi!'
    return
  }

  isVerifying.value = true

  try {
    await authStore.verifyEmailOtp({
      email: email.value,
      otp: otp.value,
    })

    toast.custom(VToast, {
      componentProps: {
        type: 'success',
        message: 'Email berhasil diverifikasi! Mengalihkan ke halaman login...',
      },
    })
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 1000)
  } catch (error: unknown) {
    const message = (error as Error).message
    toast.custom(VToast, {
      componentProps: {
        type: 'error',
        message: message,
      },
    })
    otpError.value = message
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

    <div class="w-full max-w-[600px] flex flex-col items-center">
      <div class="flex flex-col items-center mb-8">
        <img src="@/assets/SIMP.png" alt="SIMP Box" class="h-32 mb-6" />
        <h1 class="text-[28px] font-bold text-[#767E86]">Verifikasi Email</h1>
      </div>

      <div class="w-full flex flex-col gap-3">
        <VInputField
          v-model="email"
          label="Email"
          type="email"
          placeholder="nama@email.com"
          :disabled="true"
          state="default"
        />

        <VButton
          type="button"
          variant="secondary"
          class="w-full h-[52px]"
          :disabled="isSendingOtp"
          @click="handleSendOtp"
        >
          {{ isSendingOtp ? 'Mengirim OTP...' : 'Kirim OTP' }}
        </VButton>

        <VInputField
          v-model="otp"
          label="Kode OTP"
          type="text"
          placeholder="Masukkan 6 digit OTP"
          :disabled="isVerifying"
          :state="otpError ? 'error' : 'default'"
          :message="otpError"
        />

        <VButton
          type="button"
          variant="primary"
          class="mt-2 w-full h-[52px]"
          :disabled="isVerifying"
          @click="handleVerifyOtp"
        >
          {{ isVerifying ? 'Memverifikasi...' : 'Verifikasi Sekarang' }}
        </VButton>

        <VButton
          type="button"
          variant="ghost"
          class="w-full h-[52px]"
          @click="handleSkip"
        >
          Verifikasi Nanti
        </VButton>
      </div>
    </div>
  </div>
</template>