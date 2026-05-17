<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { CheckCircle2, Circle } from 'lucide-vue-next'

import VToast from '@/components/common/VToast.vue'
import VAlert from '@/components/common/VAlert.vue'
import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import { useAuthStore } from '@/stores/users/auth'
import { usePasswordStore } from '@/stores/users/password'

type AlertType = 'success' | 'error' | 'warning' | 'information'

const router = useRouter()
const authStore = useAuthStore()
const passwordStore = usePasswordStore()

const nama = ref('')
const email = ref('')
const noHp = ref('')
const nisn = ref('')
const kodeValidasi = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)

const namaError = ref('')
const emailError = ref('')
const noHpError = ref('')
const nisnError = ref('')
const kodeValidasiError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

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

const pwdStrength = computed(() => passwordStore.checkPasswordStrength(password.value))

const passwordRequirements = computed(() => [
  {
    label: 'Minimal 8 Karakter',
    passed: pwdStrength.value.reqMinLength,
  },
  {
    label: 'Mengandung Angka (0-9)',
    passed: pwdStrength.value.reqNumber,
  },
  {
    label: 'Huruf Kapital (A-Z)',
    passed: pwdStrength.value.reqCapital,
  },
  {
    label: 'Karakter Unik/Simbol',
    passed: pwdStrength.value.reqSymbol,
  },
])

watch(nama, () => (namaError.value = ''))
watch(email, () => (emailError.value = ''))
watch(noHp, () => (noHpError.value = ''))
watch(nisn, () => (nisnError.value = ''))
watch(kodeValidasi, () => (kodeValidasiError.value = ''))
watch(password, () => (passwordError.value = ''))
watch(confirmPassword, () => (confirmPasswordError.value = ''))

const validateForm = () => {
  namaError.value = ''
  emailError.value = ''
  noHpError.value = ''
  nisnError.value = ''
  kodeValidasiError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''
  alert.visible = false

  let hasError = false

  if (!nama.value) {
    namaError.value = 'Nama wajib diisi!'
    hasError = true
  }

  if (!email.value) {
    emailError.value = 'Email wajib diisi!'
    hasError = true
  }

  if (!noHp.value) {
    noHpError.value = 'Nomor HP wajib diisi!'
    hasError = true
  }

  if (!nisn.value) {
    nisnError.value = 'NISN wajib diisi!'
    hasError = true
  } else if (!/^\d{10}$/.test(nisn.value)) {
    nisnError.value = 'NISN harus 10 digit angka!'
    hasError = true
  }

  if (!kodeValidasi.value) {
    kodeValidasiError.value = 'Kode validasi wajib diisi!'
    hasError = true
  } else if (!/^[A-Z0-9]{6,8}$/i.test(kodeValidasi.value)) {
    kodeValidasiError.value = 'Kode validasi harus 6-8 karakter huruf/angka!'
    hasError = true
  }

  if (!password.value) {
    passwordError.value = 'Kata sandi wajib diisi!'
    hasError = true
  } else if (!pwdStrength.value.isValid) {
    passwordError.value = 'Kata sandi belum memenuhi semua persyaratan keamanan!'
    hasError = true
  }

  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Konfirmasi kata sandi wajib diisi!'
    hasError = true
  } else if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Konfirmasi kata sandi tidak sama!'
    hasError = true
  }

  return !hasError
}

const handleRegister = async () => {
  if (!validateForm()) return

  isLoading.value = true
  alert.visible = false

  try {
    const response = await authStore.register({
      nama: nama.value,
      email: email.value,
      no_hp: noHp.value,
      nisn: nisn.value,
      kode_validasi: kodeValidasi.value,
      password: password.value,
      confirm_password: confirmPassword.value,
    })

    const registeredEmail = response?.data?.email || email.value

    toast.custom(VToast, {
      componentProps: {
        type: 'success',
        message: 'Registrasi berhasil! Silakan lanjut verifikasi email.',
      },
    })

    setTimeout(() => {
      router.push({
        name: 'verify-email',
        query: { email: registeredEmail },
      })
    }, 1000)
  } catch (error: unknown) {
    const message = (error as Error).message

    toast.custom(VToast, {
      componentProps: {
        type: 'error',
        message: 'Registrasi Gagal! Silakan coba lagi.',
      },
    })

    alert.visible = true
    alert.type = 'error'
    alert.title = 'Registrasi Gagal'
    alert.message = message || 'Terjadi kesalahan saat membuat akun. Silakan coba lagi.'

    // Route the server error to the relevant field
    if (message.includes('NISN')) {
      nisnError.value = message
    } else if (message.includes('kode validasi') || message.includes('kode_validasi')) {
      kodeValidasiError.value = message
    } else if (message.includes('Email') || message.includes('email')) {
      emailError.value = message
    } else if (message.includes('HP') || message.includes('no_hp')) {
      noHpError.value = message
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main
    class="
      relative flex h-full min-h-full w-full items-start justify-center
      overflow-y-auto overflow-x-hidden bg-transparent p-6
      font-[var(--font-sans)] text-[var(--app-text)]
      [&::-webkit-scrollbar]:w-[6px]
      [&::-webkit-scrollbar-track]:bg-transparent
      [&::-webkit-scrollbar-thumb]:rounded-full
      [&::-webkit-scrollbar-thumb]:bg-[var(--app-border)]
      [@media(max-height:780px)]:p-4
      max-[640px]:p-[18px]
    "
  >
    <!-- School logo -->
    <div
      class="
        fixed left-8 top-8 z-[2]
        max-[640px]:left-5 max-[640px]:top-5
      "
    >
      <img
        src="@/assets/Inrab_Logo.png"
        alt="SMA Insan Rabbany"
        class="
          h-16 w-auto object-contain opacity-80
          [@media(max-height:780px)]:h-12
          max-[640px]:h-12
        "
      />
    </div>

    <section
      class="
        flex min-h-full w-[min(600px,100%)] flex-col items-center
        pt-6 pb-10
        [@media(max-height:780px)]:pt-3
        [@media(max-height:780px)]:pb-7
        max-[640px]:w-full
        max-[640px]:pt-14
      "
    >
      <!-- Heading block -->
      <div
        class="
          mb-6 flex shrink-0 flex-col items-center text-center
          [@media(max-height:780px)]:mb-4
        "
      >
        <img
          src="@/assets/SIMP.png"
          alt="SIMP Box"
          class="
            mb-[18px] h-28 w-auto object-contain
            [@media(max-height:780px)]:mb-3
            [@media(max-height:780px)]:h-[84px]
          "
        />

        <h1
          class="
            m-0 text-[length:var(--app-font-title)]
            font-bold leading-[1.2] text-[var(--app-muted)]
          "
        >
          Create Account
        </h1>
      </div>

      <!-- Global error alert -->
      <VAlert
        v-if="alert.visible"
        :type="alert.type"
        :title="alert.title"
        :message="alert.message"
        class="mb-[14px] w-full"
        @close="alert.visible = false"
      />

      <!-- Registration form -->
      <form
        class="
          flex w-full flex-col gap-3
          [@media(max-height:780px)]:gap-[10px]
        "
        @submit.prevent="handleRegister"
      >
        <VInputField
          v-model="nama"
          label="Nama Lengkap"
          type="text"
          placeholder="Masukkan nama lengkap"
          :disabled="isLoading"
          :state="namaError ? 'error' : 'default'"
          :message="namaError"
        />

        <VInputField
          v-model="email"
          label="Email"
          type="email"
          placeholder="Masukkan email"
          :disabled="isLoading"
          :state="emailError ? 'error' : 'default'"
          :message="emailError"
        />

        <VInputField
          v-model="noHp"
          label="Nomor HP"
          type="text"
          placeholder="Masukkan nomor HP (contoh: 081234567890)"
          :disabled="isLoading"
          :state="noHpError ? 'error' : 'default'"
          :message="noHpError"
        />

        <!-- NISN — 10-digit student national ID -->
        <VInputField
          v-model="nisn"
          label="NISN Siswa"
          type="text"
          placeholder="Masukkan 10 digit NISN"
          :disabled="isLoading"
          :state="nisnError ? 'error' : 'default'"
          :message="nisnError"
        />

        <!-- Validation code provided by the school -->
        <VInputField
          v-model="kodeValidasi"
          label="Kode Validasi"
          type="text"
          placeholder="Masukkan kode dari sekolah"
          :disabled="isLoading"
          :state="kodeValidasiError ? 'error' : 'default'"
          :message="kodeValidasiError"
        />

        <VInputField
          v-model="password"
          label="Kata Sandi"
          type="password"
          placeholder="Masukkan kata sandi"
          :disabled="isLoading"
          :state="passwordError ? 'error' : 'default'"
          :message="passwordError"
        />

        <VInputField
          v-model="confirmPassword"
          label="Konfirmasi Kata Sandi"
          type="password"
          placeholder="Masukkan ulang kata sandi"
          :disabled="isLoading"
          :state="confirmPasswordError ? 'error' : 'default'"
          :message="confirmPasswordError"
        />

        <!-- Password requirements checklist -->
        <section
          class="
            w-full rounded-[12px] border border-[var(--app-card-border)]
            bg-[var(--app-soft-card)] p-[14px] text-[var(--app-text)]
            [@media(max-height:780px)]:p-3
          "
        >
          <div class="mb-3 flex items-center justify-between gap-3">
            <h2
              class="
                m-0 text-[length:var(--app-font-sm)]
                font-bold leading-[1.2] text-[var(--app-heading)]
              "
            >
              Persyaratan Kata Sandi
            </h2>

            <span
              :class="[
                'shrink-0 text-[length:var(--app-font-xs)] font-bold leading-[1.2]',
                pwdStrength.isValid ? 'text-[var(--app-success)]' : 'text-[var(--app-muted)]',
              ]"
            >
              {{ pwdStrength.text }}
            </span>
          </div>

          <div
            class="
              grid grid-cols-2 gap-x-4 gap-y-[10px]
              [@media(max-height:780px)]:gap-y-2
              max-[640px]:grid-cols-1
            "
          >
            <div
              v-for="requirement in passwordRequirements"
              :key="requirement.label"
              :class="[
                'flex items-center gap-2 transition-colors duration-200 ease-in-out',
                requirement.passed ? 'text-[var(--app-subtext)]' : 'text-[var(--app-muted)]',
              ]"
            >
              <CheckCircle2
                v-if="requirement.passed"
                class="h-5 w-5 shrink-0 text-[var(--app-success)]"
              />

              <Circle
                v-else
                class="h-5 w-5 shrink-0 text-[var(--app-input-border)]"
              />

              <span
                class="
                  text-[length:var(--app-font-xs)]
                  leading-[1.35] text-current
                "
              >
                {{ requirement.label }}
              </span>
            </div>
          </div>
        </section>

        <VButton
          type="submit"
          variant="primary"
          class="
            mt-1 min-h-[46px] w-full
            [@media(max-height:780px)]:min-h-[42px]
          "
          :disabled="isLoading"
        >
          {{ isLoading ? 'Memproses...' : 'Daftar' }}
        </VButton>

        <p
          class="
            mt-2 mb-0 text-center
            text-[length:var(--app-font-sm)]
            leading-[1.5] text-[var(--app-muted)]
          "
        >
          Sudah punya akun?

          <router-link
            to="/login"
            class="
              font-semibold text-[var(--app-accent)]
              no-underline transition-colors duration-200 ease-in-out
              hover:text-[var(--app-accent-2)]
              hover:underline
              focus:outline-none
              focus-visible:rounded-[6px]
              focus-visible:outline
              focus-visible:outline-2
              focus-visible:outline-offset-[3px]
              focus-visible:outline-[var(--app-accent)]
            "
          >
            Login di sini
          </router-link>
        </p>
      </form>
    </section>
  </main>
</template>
