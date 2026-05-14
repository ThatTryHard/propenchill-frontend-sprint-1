<template>
  <div class="flex flex-col gap-2 w-full font-sans">
    <label
      v-if="label && actualState !== 'search'"
      :class="['text-[16px] font-semibold leading-[120%]', labelStyles]"
    >
      {{ label }}
    </label>

    <div :class="['relative flex items-center w-full rounded-[12px]', wrapperStyles]">
      <div
        v-if="actualState === 'search'"
        class="absolute left-[19px] flex items-center text-[var(--app-input-placeholder)]"
      >
        <SearchIcon class="w-[24px] h-[24px]" />
      </div>

      <input
        :type="computedType"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @focus="handleFocus"
        @blur="handleBlur"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'w-full py-[14px] text-[16px] leading-[150%] focus:outline-none transition-all duration-200',
          '[&::-ms-reveal]:hidden [&::-ms-clear]:hidden',
          actualState === 'search' ? 'pl-[53px]' : 'pl-[19px]',
          isPassword || actualState === 'error' || actualState === 'success' || disabled
            ? 'pr-[53px]'
            : 'pr-[19px]',
          inputStyles,
        ]"
      />

      <div class="absolute right-[19px] flex items-center">
        <button
          v-if="isPassword && !disabled"
          type="button"
          @click="togglePassword"
          class="text-[var(--app-input-placeholder)] hover:text-[var(--app-text)] focus:outline-none transition-colors"
        >
          <component :is="showPassword ? EyeOffIcon : EyeIcon" class="w-[24px] h-[24px]" />
        </button>

        <XCircleIcon v-else-if="actualState === 'error'" class="w-[24px] h-[24px] text-[var(--app-danger)]" />
        <CheckCircle2Icon
          v-else-if="actualState === 'success'"
          class="w-[24px] h-[24px] text-[var(--app-success)]"
        />
        <LockIcon v-else-if="disabled" class="w-[24px] h-[24px] text-[var(--app-muted)]" />
      </div>
    </div>

    <div v-if="message" :class="['text-[12px] font-light leading-[150%]', messageStyles]">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  EyeIcon,
  EyeOffIcon,
  XCircleIcon,
  CheckCircle2Icon,
  LockIcon,
  SearchIcon,
} from 'lucide-vue-next'

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  disabled: Boolean,
  state: { type: String, default: 'default' }, // Pilihan: 'default', 'error', 'success', 'search'
  message: String,
})

defineEmits(['update:modelValue'])

// Setup Password Logic
const isPassword = computed(() => props.type === 'password')
const showPassword = ref(false)
const togglePassword = () => (showPassword.value = !showPassword.value)

const computedType = computed(() => {
  if (isPassword.value) return showPassword.value ? 'text' : 'password'
  return props.type
})

// Setup Focus State untuk transisi border gradient saat di-klik
const isFocused = ref(false)
const handleFocus = () => (isFocused.value = true)
const handleBlur = () => (isFocused.value = false)

// Evaluasi state akhir (prioritaskan disabled, lalu search/error/success, baru kemudian cek focus)
const actualState = computed(() => {
  if (props.disabled) return 'disabled'
  if (props.state === 'search') return 'search'
  if (props.state === 'error') return 'error'
  if (props.state === 'success') return 'success'
  if (isFocused.value) return 'active'
  return 'default'
})

// STYLING DINAMIS SESUAI LOCOFY LU

const labelStyles = computed(() => {
  if (actualState.value === 'disabled') return 'text-[var(--app-input-placeholder)]'
  if (actualState.value === 'error')
    return 'bg-[linear-gradient(91.01deg,var(--app-danger),var(--app-danger-dark))] bg-clip-text text-transparent'
  if (actualState.value === 'success')
    return 'bg-[linear-gradient(91.01deg,var(--app-success),var(--app-success-dark))] bg-clip-text text-transparent'
  return 'text-[var(--app-text)]'
})

const messageStyles = computed(() => {
  if (actualState.value === 'error')
    return 'bg-[linear-gradient(91.01deg,var(--app-danger),var(--app-danger-dark))] bg-clip-text text-transparent'
  if (actualState.value === 'success')
    return 'bg-[linear-gradient(91.01deg,var(--app-success),var(--app-success-dark))] bg-clip-text text-transparent'
  return 'hidden' // Sembunyikan kalau nggak ada pesan
})

const wrapperStyles = computed(() => {
  // KUNCI FIX: Selalu pakai padding 2px (p-[2px]) di semua state!
  // Ini mencegah terjadinya layout shift (loncat/pop) saat diklik.
  const base = 'p-[2px]'

  if (actualState.value === 'active' || isFocused.value)
    return `${base} bg-[linear-gradient(90.74deg,var(--app-accent),var(--app-accent-2))]`
  if (actualState.value === 'error')
    return `${base} bg-[linear-gradient(91.01deg,var(--app-danger),var(--app-danger-dark))]`
  if (actualState.value === 'success')
    return `${base} bg-[linear-gradient(91.01deg,var(--app-success),var(--app-success-dark))]`

  // Default, Search, dan Disabled pakai background abu-abu yang seolah-olah jadi "border" 2px
  return `${base} bg-[var(--app-input-border)]`
})

const inputStyles = computed(() => {
  // Inner radius tetap 10px biar pas di dalam wrapper 12px
  const base = 'rounded-[10px] text-[var(--app-text)] placeholder-[var(--app-input-placeholder)]'

  if (actualState.value === 'disabled') {
    return `${base} bg-[var(--app-input-disabled-bg)] cursor-not-allowed`
  }
  if (actualState.value === 'search') {
    return `${base} bg-[var(--app-input-muted-bg)]`
  }

  return `${base} bg-[var(--app-input-bg)]`
})
</script>