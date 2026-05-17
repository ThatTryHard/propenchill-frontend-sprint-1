<script setup lang="ts">
import { ref, computed } from 'vue'
import { XCircleIcon, CheckCircle2Icon, LockIcon } from 'lucide-vue-next'

type TextareaState = 'default' | 'error' | 'success'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    label?: string
    placeholder?: string
    disabled?: boolean
    state?: TextareaState
    message?: string
    rows?: number
  }>(),
  {
    modelValue: '',
    label: '',
    placeholder: '',
    disabled: false,
    state: 'default',
    message: '',
    rows: 4,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const isFocused = ref(false)

const handleFocus = () => {
  isFocused.value = true
}

const handleBlur = () => {
  isFocused.value = false
}

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}

const actualState = computed(() => {
  if (props.disabled) return 'disabled'
  if (props.state === 'error') return 'error'
  if (props.state === 'success') return 'success'
  if (isFocused.value) return 'active'
  return 'default'
})

const rootClass = computed(() => {
  return `v-textarea-field--${actualState.value}`
})

const shouldShowRightIcon = computed(() => {
  return actualState.value === 'error' || actualState.value === 'success' || props.disabled
})

const shouldShowMessage = computed(() => {
  return Boolean(props.message) && ['error', 'success'].includes(actualState.value)
})

const fieldClass = computed(() => {
  return [
    'v-textarea-field',
    rootClass.value,
    'flex w-full flex-col gap-2',
    'font-[var(--font-sans)] text-[var(--app-text)]',
    actualState.value === 'disabled' ? 'text-[var(--app-input-placeholder)]' : '',
  ]
})

const labelClass = computed(() => {
  const baseClass = [
    'v-textarea-label',
    'w-full font-semibold leading-[1.2]',
    'text-[length:var(--app-input-label-font)]',
  ]

  if (actualState.value === 'error') {
    return [
      ...baseClass,
      'app-gradient-text-error',
    ]
  }

  if (actualState.value === 'success') {
    return [
      ...baseClass,
      'app-gradient-text-success',
    ]
  }

  if (actualState.value === 'disabled') {
    return [
      ...baseClass,
      'text-[var(--app-input-placeholder)]',
    ]
  }

  return [
    ...baseClass,
    'text-[var(--app-text)]',
  ]
})

const wrapperClass = computed(() => {
  const baseClass = [
    'v-textarea-wrapper',
    'relative box-border w-full rounded-[12px] p-0.5',
    'transition-[background,opacity] duration-200 ease-in-out',
  ]

  if (actualState.value === 'active') {
    return [
      ...baseClass,
      '[background:var(--gradient-brand)]',
    ]
  }

  if (actualState.value === 'error') {
    return [
      ...baseClass,
      '[background:var(--gradient-error)]',
    ]
  }

  if (actualState.value === 'success') {
    return [
      ...baseClass,
      '[background:var(--gradient-success)]',
    ]
  }

  return [
    ...baseClass,
    'bg-[var(--app-input-border)]',
  ]
})

const textareaClass = computed(() => {
  const baseClass = [
    'v-textarea',
    'box-border w-full min-h-[120px] resize-y rounded-[10px] border-0',
    'px-[19px] py-[14px]',
    'bg-[var(--app-input-bg)] text-[var(--app-text)]',
    'font-[var(--font-sans)] text-[length:var(--app-input-font)] font-normal leading-[1.5]',
    'transition-colors duration-200 ease-in-out',
    'focus:outline-none',
    'placeholder:text-[var(--app-input-placeholder)] placeholder:opacity-100',
    'disabled:cursor-not-allowed',
    shouldShowRightIcon.value ? 'pr-[53px]' : '',
  ]

  if (actualState.value === 'disabled') {
    return [
      ...baseClass,
      'bg-[var(--app-input-disabled-bg)] text-[var(--app-muted)]',
    ]
  }

  return baseClass
})

const rightIconClass = computed(() => {
  return [
    'v-textarea-right-icon',
    'absolute right-[19px] top-[14px] z-[2] flex items-start',
  ]
})

const messageClass = computed(() => {
  const baseClass = [
    'v-textarea-message',
    'w-full text-[length:var(--app-input-helper-font)] font-light leading-[1.5]',
  ]

  if (actualState.value === 'error') {
    return [
      ...baseClass,
      'app-gradient-text-error',
    ]
  }

  if (actualState.value === 'success') {
    return [
      ...baseClass,
      'app-gradient-text-success',
    ]
  }

  return baseClass
})
</script>

<template>
  <div :class="fieldClass">
    <label
      v-if="label"
      :class="labelClass"
    >
      {{ label }}
    </label>

    <div :class="wrapperClass">
      <textarea
        :value="modelValue ?? ''"
        :placeholder="placeholder"
        :disabled="disabled"
        :rows="rows"
        :class="textareaClass"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <div
        v-if="shouldShowRightIcon"
        :class="rightIconClass"
      >
        <XCircleIcon
          v-if="actualState === 'error'"
          class="v-textarea-icon v-textarea-icon-error h-6 w-6 text-[var(--app-danger)]"
        />

        <CheckCircle2Icon
          v-else-if="actualState === 'success'"
          class="v-textarea-icon v-textarea-icon-success h-6 w-6 text-[var(--app-success)]"
        />

        <LockIcon
          v-else-if="disabled"
          class="v-textarea-icon v-textarea-icon-disabled h-6 w-6 text-[var(--app-muted)]"
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