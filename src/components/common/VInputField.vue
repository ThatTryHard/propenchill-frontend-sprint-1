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

type InputState = 'default' | 'error' | 'success' | 'search'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    label?: string
    type?: string
    placeholder?: string
    disabled?: boolean
    state?: InputState
    message?: string
  }>(),
  {
    modelValue: '',
    label: '',
    type: 'text',
    placeholder: '',
    disabled: false,
    state: 'default',
    message: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const isPassword = computed(() => props.type === 'password')
const showPassword = ref(false)
const isFocused = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const computedType = computed(() => {
  if (isPassword.value) {
    return showPassword.value ? 'text' : 'password'
  }

  return props.type
})

const handleFocus = () => {
  isFocused.value = true
}

const handleBlur = () => {
  isFocused.value = false
}

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

const openDatePicker = () => {
  const el = inputRef.value
  if (!el) return
  const picker = el as HTMLInputElement & { showPicker?: () => void }
  if (typeof picker.showPicker === 'function') {
    picker.showPicker()
  } else {
    el.focus()
    el.click()
  }
}

const actualState = computed(() => {
  if (props.disabled) return 'disabled'
  if (props.state === 'search') return 'search'
  if (props.state === 'error') return 'error'
  if (props.state === 'success') return 'success'
  if (isFocused.value) return 'active'
  return 'default'
})

const rootClass = computed(() => {
  return `v-input-field--${actualState.value}`
})

const shouldShowLabel = computed(() => {
  return Boolean(props.label) && actualState.value !== 'search'
})

const shouldShowRightIcon = computed(() => {
  return (
    isPassword.value ||
    computedType.value === 'date' ||
    actualState.value === 'error' ||
    actualState.value === 'success' ||
    props.disabled
  )
})

const shouldShowMessage = computed(() => {
  return Boolean(props.message) && ['error', 'success'].includes(actualState.value)
})

const fieldClass = computed(() => {
  return [
    'v-input-field',
    rootClass.value,
    'flex w-full flex-col gap-2',
    'font-[var(--font-sans)] text-[var(--app-text)]',
    actualState.value === 'disabled' ? 'text-[var(--app-input-placeholder)]' : '',
  ]
})

const labelClass = computed(() => {
  const baseClass = [
    'v-input-label',
    'w-full font-semibold leading-[1.2]',
    'text-[length:var(--app-input-label-font)]',
  ]

  if (actualState.value === 'error') {
    return [...baseClass, 'app-gradient-text-error']
  }

  if (actualState.value === 'success') {
    return [...baseClass, 'app-gradient-text-success']
  }

  if (actualState.value === 'disabled') {
    return [...baseClass, 'text-[var(--app-input-placeholder)]']
  }

  return [...baseClass, 'text-[var(--app-text)]']
})

const wrapperClass = computed(() => {
  const baseClass = [
    'v-input-wrapper',
    'relative box-border flex w-full items-center',
    'rounded-[var(--app-input-radius)] p-0.5',
    'transition-[background,opacity] duration-200 ease-in-out',
  ]

  if (actualState.value === 'active') {
    return [...baseClass, '[background:var(--gradient-brand)]']
  }

  if (actualState.value === 'error') {
    return [...baseClass, '[background:var(--gradient-error)]']
  }

  if (actualState.value === 'success') {
    return [...baseClass, '[background:var(--gradient-success)]']
  }

  return [...baseClass, 'bg-[var(--app-input-border)]']
})

const inputClass = computed(() => {
  const baseClass = [
    'v-input',
    'box-border w-full border-0',
    'rounded-[var(--app-input-inner-radius)]',
    'px-[var(--app-input-padding-x)] py-[var(--app-input-padding-y)]',
    'bg-[var(--app-input-bg)] text-[var(--app-text)]',
    'font-[var(--font-sans)] text-[length:var(--app-input-font)] font-normal leading-[1.5]',
    'transition-colors duration-200 ease-in-out',
    'focus:outline-none',
    'placeholder:text-[var(--app-input-placeholder)] placeholder:opacity-100',
    'disabled:cursor-not-allowed',
    '[&::-ms-reveal]:hidden [&::-ms-clear]:hidden',
    actualState.value === 'search' ? 'pl-[var(--app-input-icon-padding)]' : '',
    shouldShowRightIcon.value ? 'pr-[var(--app-input-icon-padding)]' : '',
  ]

  if (actualState.value === 'search') {
    return [...baseClass, 'bg-[var(--app-input-muted-bg)]']
  }

  if (actualState.value === 'disabled') {
    return [...baseClass, 'bg-[var(--app-input-disabled-bg)] text-[var(--app-muted)]']
  }

  return baseClass
})

const leftIconClass = computed(() => {
  return [
    'v-input-left-icon',
    'absolute left-[var(--app-input-icon-offset)] z-[2] flex items-center',
    'text-[var(--app-input-placeholder)]',
  ]
})

const rightIconClass = computed(() => {
  return [
    'v-input-right-icon',
    'absolute right-[var(--app-input-icon-offset)] z-[2] flex items-center',
    'text-[var(--app-input-placeholder)]',
  ]
})

const iconClass = computed(() => {
  return [
    'v-input-icon',
    'h-[var(--app-input-icon-size)] w-[var(--app-input-icon-size)]',
  ]
})

const iconButtonClass = computed(() => {
  return [
    'v-input-icon-button',
    'inline-flex items-center justify-center',
    'text-[var(--app-input-placeholder)]',
    'transition-colors duration-200 ease-in-out',
    'hover:text-[var(--app-text)] focus:outline-none',
    '[&>svg]:h-[var(--app-input-icon-size)] [&>svg]:w-[var(--app-input-icon-size)]',
  ]
})

const messageClass = computed(() => {
  const baseClass = [
    'v-input-message',
    'w-full text-[length:var(--app-input-helper-font)] font-light leading-[1.5]',
  ]

  if (actualState.value === 'error') {
    return [...baseClass, 'app-gradient-text-error']
  }

  if (actualState.value === 'success') {
    return [...baseClass, 'app-gradient-text-success']
  }

  return [...baseClass, 'text-[var(--app-muted)]']
})
</script>

<template>
  <div :class="fieldClass">
    <label
      v-if="shouldShowLabel"
      :class="labelClass"
    >
      {{ label }}
    </label>

    <div :class="wrapperClass">
      <div
        v-if="actualState === 'search'"
        :class="leftIconClass"
      >
        <SearchIcon :class="iconClass" />
      </div>

      <input
        ref="inputRef"
        :type="computedType"
        :value="modelValue ?? ''"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClass"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <div
        v-if="shouldShowRightIcon"
        :class="rightIconClass"
      >
        <button
          v-if="isPassword && !disabled"
          type="button"
          :class="iconButtonClass"
          aria-label="Tampilkan atau sembunyikan kata sandi"
          @click="togglePassword"
        >
          <component
            :is="showPassword ? EyeIcon : EyeOffIcon"
            :class="iconClass"
          />
        </button>

        <button
          v-else-if="computedType === 'date' && !disabled"
          type="button"
          :class="iconButtonClass"
          aria-label="Buka penanggalan"
          @click="openDatePicker"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            :class="iconClass"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" h2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </button>

        <XCircleIcon
          v-else-if="actualState === 'error'"
          class="v-input-icon v-input-icon-error h-[var(--app-input-icon-size)] w-[var(--app-input-icon-size)] text-[var(--app-danger)]"
        />

        <CheckCircle2Icon
          v-else-if="actualState === 'success'"
          class="v-input-icon v-input-icon-success h-[var(--app-input-icon-size)] w-[var(--app-input-icon-size)] text-[var(--app-success)]"
        />

        <LockIcon
          v-else-if="disabled"
          class="v-input-icon v-input-icon-disabled h-[var(--app-input-icon-size)] w-[var(--app-input-icon-size)] text-[var(--app-muted)]"
        />
      </div>
    </div>

    <div
      v-if="shouldShowMessage"
      :class="messageClass"
    >
      {{ message }}
    </div>
  </div>
</template>

<style scoped>
input[type='date']::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
  opacity: 0;
  pointer-events: none;
}
</style>
