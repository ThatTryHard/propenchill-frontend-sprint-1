<template>
  <div
    class="w-full max-w-[420px] bg-white rounded-[24px] shadow-[0px_8px_24px_rgba(0,0,0,0.05)] border border-[#d4e8da] p-8 flex flex-col items-center text-center"
  >
    <img src="@/assets/SIMP.png" alt="SIMP Logo" class="w-[125px] h-[125px] object-contain mb-6" />

    <h1 class="text-[24px] font-bold text-[#111827] mb-2">Lupa Kata Sandi?</h1>
    <p class="text-[14px] text-[#718096] leading-relaxed mb-6">
      Jangan khawatir! Masukkan email yang terdaftar pada akun SIMP Anda, dan kami akan mengirimkan
      kode OTP untuk mengatur ulang kata sandi.
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

    <form @submit.prevent="handleRequestOTP" class="w-full flex flex-col gap-5 text-left">
      <VInputField
        v-model="email"
        label="Alamat Email"
        type="email"
        placeholder="contoh: user@simp.com"
        :disabled="isLoading"
        :state="emailError ? 'error' : 'default'"
        :message="emailError"
      />

      <VButton type="submit" variant="primary" class="w-full h-[48px] mt-2" :disabled="isLoading">
        {{ isLoading ? 'Mengirim Kode...' : 'Kirim Kode OTP' }}
      </VButton>
    </form>

    <div class="mt-8">
      <button
        @click="$router.push('/login')"
        class="text-[14px] font-semibold text-[#3f9760] hover:text-[#0c4923] transition-colors"
      >
        Kembali ke Halaman Login
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePasswordStore } from '@/stores/users/password'
import { AxiosError } from 'axios'

import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VAlert from '@/components/common/VAlert.vue'

const router = useRouter()
const route = useRoute()
const passwordStore = usePasswordStore() // Inisialisasi store

const email = ref('')
const emailError = ref('')
const isLoading = ref(false)

const alert = reactive({
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

    // Tampilkan pesan sukses melalui log
    console.log(response.message)

    // Redirect ke halaman verifikasi OTP dengan query email
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
