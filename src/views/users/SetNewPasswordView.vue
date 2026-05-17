<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { LockKeyhole, CheckCircle2, Circle } from 'lucide-vue-next'

import { usePasswordStore } from '@/stores/users/password'
import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VAlert from '@/components/common/VAlert.vue'
import VToast from '@/components/common/VToast.vue'

type AlertType = 'success' | 'error' | 'warning' | 'information'

const router = useRouter()
const passwordStore = usePasswordStore()

const password = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

const isLoading = ref(false)
const isSuccess = ref(false)

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

const reqMinLength = computed(() => password.value.length >= 8)
const reqCapital = computed(() => /[A-Z]/.test(password.value))
const reqNumber = computed(() => /[0-9]/.test(password.value))
const reqSymbol = computed(() => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password.value))

const isPasswordValid = computed(() => {
  return reqMinLength.value && reqCapital.value && reqNumber.value && reqSymbol.value
})

const passwordRequirements = computed(() => [
  {
    label: 'Minimal 8 Karakter',
    passed: reqMinLength.value,
  },
  {
    label: 'Mengandung Angka (0-9)',
    passed: reqNumber.value,
  },
  {
    label: 'Mengandung Huruf Kapital (A-Z)',
    passed: reqCapital.value,
  },
  {
    label: 'Mengandung Karakter Unik',
    passed: reqSymbol.value,
  },
])

const passwordStrengthText = computed(() => {
  if (password.value.length === 0) return ''

  let score = 0

  if (reqMinLength.value) score++
  if (reqCapital.value) score++
  if (reqNumber.value) score++
  if (reqSymbol.value) score++

  if (score <= 2) return 'Lemah'
  if (score === 3) return 'Kuat'
  return 'Sangat Kuat'
})

const passwordStrengthLevel = computed(() => {
  if (passwordStrengthText.value === 'Lemah') return 'weak'
  if (passwordStrengthText.value === 'Kuat') return 'strong'
  if (passwordStrengthText.value === 'Sangat Kuat') return 'very-strong'
  return 'empty'
})

onMounted(() => {
  if (!passwordStore.verifiedEmail || !passwordStore.verifiedOtp) {
    router.replace('/login')
  }
})

const validateForm = () => {
  let isValid = true

  passwordError.value = ''
  confirmPasswordError.value = ''

  if (!isPasswordValid.value) {
    passwordError.value = 'Kata sandi belum memenuhi semua persyaratan keamanan.'
    isValid = false
  }

  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Kata sandi tidak cocok. Silakan periksa kembali.'
    isValid = false
  }

  return isValid
}

const handleResetPassword = async () => {
  alert.visible = false

  if (!validateForm()) return

  isLoading.value = true

  try {
    await passwordStore.setNewPassword(
      passwordStore.verifiedEmail,
      passwordStore.verifiedOtp,
      password.value,
    )

    toast.custom(VToast, {
      componentProps: {
        type: 'success',
        message: 'Kata sandi berhasil diperbarui!',
      },
    })

    setTimeout(() => {
      router.replace('/login')
    }, 1500)
  } catch (error: any) {
    alert.visible = true
    alert.type = 'error'
    alert.title = 'Gagal Mengubah Kata Sandi'
    alert.message =
      error.response?.data?.error || 'Gagal mengubah kata sandi. Sesi Anda mungkin telah berakhir.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main
    class="
      flex h-full min-h-full w-full items-center justify-center overflow-hidden
      bg-transparent p-6 font-[var(--font-sans)] text-[var(--app-text)]
      [@media(max-height:760px)]:p-4
      max-[480px]:p-[14px]
    "
  >
    <section
      class="
        flex w-[min(500px,100%)] max-h-[calc(100dvh-48px)]
        flex-col items-center overflow-y-auto overflow-x-hidden
        rounded-[24px] border border-[var(--app-border)]
        bg-[var(--app-card)] p-8 text-center text-[var(--app-text)]
        shadow-[0_8px_24px_rgba(0,0,0,0.05)]
        [&::-webkit-scrollbar]:w-[5px]
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-[var(--app-border)]
        [@media(max-height:760px)]:max-h-[calc(100dvh-32px)]
        [@media(max-height:760px)]:px-7
        [@media(max-height:760px)]:py-6
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
          [@media(max-height:760px)]:mb-4
          [@media(max-height:760px)]:h-14
          [@media(max-height:760px)]:w-14
        "
      >
        <LockKeyhole
          class="
            h-[34px] w-[34px] text-current
            [@media(max-height:760px)]:h-7
            [@media(max-height:760px)]:w-7
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
        Buat Kata Sandi Baru
      </h1>

      <p
        class="
          max-w-[360px] [margin:0_0_24px]
          text-[length:var(--app-font-sm)]
          leading-[1.6] text-[var(--app-muted)]
          [@media(max-height:760px)]:mb-[18px]
          [@media(max-height:760px)]:leading-[1.45]
        "
      >
        Pastikan kata sandi baru Anda memenuhi persyaratan keamanan kami.
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
        v-if="!isSuccess"
        class="
          flex w-full flex-col gap-4 text-left
          [@media(max-height:760px)]:gap-[14px]
        "
        @submit.prevent="handleResetPassword"
      >
        <VInputField
          v-model="password"
          label="Kata Sandi Baru"
          type="password"
          placeholder="Masukkan kata sandi baru"
          :disabled="isLoading"
          :state="passwordError ? 'error' : 'default'"
          :message="passwordError"
        />

        <VInputField
          v-model="confirmPassword"
          label="Konfirmasi Kata Sandi"
          type="password"
          placeholder="Ulangi kata sandi baru"
          :disabled="isLoading"
          :state="confirmPasswordError ? 'error' : 'default'"
          :message="confirmPasswordError"
        />

        <section
          class="
            w-full rounded-[12px] border border-[var(--app-card-border)]
            bg-[var(--app-soft-card)] p-[14px] text-[var(--app-text)]
          "
        >
          <div
            class="
              mb-3 flex items-center justify-between gap-3
            "
          >
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
                'min-h-[1em] shrink-0 text-[length:var(--app-font-xs)] font-bold leading-[1.2]',
                passwordStrengthLevel === 'weak'
                  ? 'text-[var(--app-danger)]'
                  : passwordStrengthLevel === 'strong'
                    ? 'text-[var(--app-warning)]'
                    : passwordStrengthLevel === 'very-strong'
                      ? 'text-[var(--app-success)]'
                      : 'text-[var(--app-muted)]',
              ]"
            >
              {{ passwordStrengthText }}
            </span>
          </div>

          <div
            class="
              grid grid-cols-2 gap-x-4 gap-y-[10px]
              max-[480px]:grid-cols-1
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
            mt-1 min-h-12 w-full
            [@media(max-height:760px)]:min-h-[44px]
          "
          :disabled="isLoading || !isPasswordValid"
        >
          {{ isLoading ? 'Menyimpan...' : 'Simpan Kata Sandi' }}
        </VButton>
      </form>

      <div
        v-else
        class="
          mt-4 flex w-full flex-col items-center gap-4
        "
      >
        <VButton
          type="button"
          variant="primary"
          class="
            mt-1 min-h-12 w-full
            [@media(max-height:760px)]:min-h-[44px]
          "
          @click="router.replace('/login')"
        >
          Lanjut ke Halaman Login
        </VButton>
      </div>
    </section>
  </main>
</template>