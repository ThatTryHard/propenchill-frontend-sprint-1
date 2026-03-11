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
      <div class="flex items-center justify-center gap-2 sm:gap-3 w-full" @paste="handlePaste">
        <input
          v-for="(digit, index) in otp"
          :key="index"
          :ref="(el) => (inputRefs[index] = el)"
          v-model="otp[index]"
          type="text"
          inputmode="numeric"
          maxlength="1"
          class="w-[45px] h-[55px] sm:w-[50px] sm:h-[60px] text-center text-[24px] font-bold text-[#111827] bg-[#f8fafc] border-2 border-[#d4e8da] rounded-[12px] focus:border-[#3f9760] focus:ring-2 focus:ring-[#3f9760]/20 focus:outline-none transition-all shadow-sm"
          @input="handleInput($event, index)"
          @keydown="handleKeydown($event, index)"
          :disabled="isLoading"
        />
      </div>

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
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePasswordStore } from '@/stores/users/password'
import { MailOpenIcon } from 'lucide-vue-next'
import VButton from '@/components/common/VButton.vue'
import VAlert from '@/components/common/VAlert.vue'

const router = useRouter()
const route = useRoute()
const passwordStore = usePasswordStore()

const email = ref((route.query.email as string) || '')
const isLoading = ref(false)
const isResending = ref(false)

const alert = reactive({ visible: false, type: 'error', title: '', message: '' })

const otp = ref(['', '', '', '', '', ''])
const inputRefs = ref<any[]>([])

const otpJoined = computed(() => otp.value.join(''))

const emailMasked = computed(() => {
  if (!email.value) return ''
  const [name, domain] = email.value.split('@')
  if (!name || !domain) return email.value
  return `${name.charAt(0)}***@${domain}`
})

onMounted(() => {
  if (!email.value) {
    router.push({ name: 'set-new-password' })
    return
  }
  nextTick(() => {
    if (inputRefs.value[0]) inputRefs.value[0].focus()
  })
})

// Auto-submit saat OTP lengkap
watch(otpJoined, (newVal) => {
  if (newVal.length === 6 && !isLoading.value) {
    handleVerifyOTP()
  }
})

// Logika input OTP
const handleInput = (event: any, index: number) => {
  const value = event.target.value
  const numericValue = value.replace(/[^0-9]/g, '')
  otp.value[index] = numericValue.slice(-1)

  if (numericValue && index < 5) {
    inputRefs.value[index + 1].focus()
  }
}

// Logika backspace untuk pindah fokus ke input sebelumnya
const handleKeydown = (event: KeyboardEvent, index: number) => {
  if (event.key === 'Backspace' && !otp.value[index] && index > 0) {
    inputRefs.value[index - 1].focus()
  }
}

// Logika paste untuk OTP, jika user copy-paste langsung ke 6 digitnya bisa masuk semua
const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text')
  if (!pastedData) return

  const numericData = pastedData.replace(/[^0-9]/g, '').slice(0, 6)

  for (let i = 0; i < numericData.length; i++) {
    otp.value[i] = numericData[i] || ''
  }

  const nextEmptyIndex = Math.min(numericData.length, 5)
  inputRefs.value[nextEmptyIndex].focus()
}

// Logika verifikasi OTP
const handleVerifyOTP = async () => {
  alert.visible = false
  isLoading.value = true

  try {
    // Panggil fungsi dari Store
    await passwordStore.verifyOTP(email.value, otpJoined.value)

    // Auto-lempar ke halaman Set New Password kalau bener
    router.push({ name: 'set-new-password' })
  } catch (error: any) {
    alert.visible = true
    alert.type = 'error'
    alert.message = error.response?.data?.error || 'Kode OTP salah atau telah kadaluarsa.'

    otp.value = ['', '', '', '', '', '']
    inputRefs.value[0].focus()
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
  } catch (error: any) {
    alert.visible = true
    alert.type = 'error'
    alert.message = error.response?.data?.error || 'Gagal mengirim ulang OTP.'
  } finally {
    isResending.value = false
  }
}
</script>
