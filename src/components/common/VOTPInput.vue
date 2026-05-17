<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'complete'])

const otp = ref(['', '', '', '', '', ''])
const inputRefs = ref<any[]>([])

const handleInput = (event: any, index: number) => {
  const value = event.target.value
  const numericValue = value.replace(/[^0-9]/g, '')
  otp.value[index] = numericValue.slice(-1)

  if (numericValue && index < 5) {
    inputRefs.value[index + 1].focus()
  }

  emitValue()
}

const handleKeydown = (event: KeyboardEvent, index: number) => {
  if (event.key === 'Backspace' && !otp.value[index] && index > 0) {
    inputRefs.value[index - 1].focus()
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()

  const pastedData = event.clipboardData?.getData('text')
  if (!pastedData) return

  const numericData = pastedData.replace(/[^0-9]/g, '').slice(0, 6)

  for (let i = 0; i < numericData.length; i++) {
    otp.value[i] = numericData[i] || ''
  }

  const nextEmptyIndex = Math.min(numericData.length, 5)

  if (inputRefs.value[nextEmptyIndex]) {
    inputRefs.value[nextEmptyIndex].focus()
  }

  emitValue()
}

const emitValue = () => {
  const joined = otp.value.join('')

  emit('update:modelValue', joined)

  if (joined.length === 6) {
    emit('complete', joined)
  }
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) {
      otp.value = ['', '', '', '', '', '']
    }
  },
)
</script>

<template>
  <div
    class="
      flex w-full items-center justify-center gap-2
      font-[var(--font-sans)]
      sm:gap-4
    "
    @paste="handlePaste"
  >
    <input
      v-for="(digit, index) in otp"
      :key="index"
      :ref="(el) => (inputRefs[index] = el)"
      v-model="otp[index]"
      type="text"
      inputmode="numeric"
      maxlength="1"
      :disabled="disabled"
      class="
        box-border h-[55px] w-[45px] rounded-[12px]
        border-2 border-[var(--app-input-border)]
        bg-[var(--app-card)] text-center
        font-[var(--font-sans)]
        text-[length:var(--app-font-xl)]
        font-bold leading-[1.2] text-[var(--app-text)]
        shadow-[0_1px_2px_rgba(0,0,0,0.08)]
        transition-[border-color,box-shadow,background-color,color,opacity]
        duration-200 ease-in-out
        focus:border-[var(--app-accent)]
        focus:outline-none
        focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--app-accent)_20%,transparent)]
        disabled:cursor-not-allowed
        disabled:bg-[var(--app-input-disabled-bg)]
        disabled:text-[var(--app-muted)]
        disabled:opacity-50
        sm:h-[60px] sm:w-[50px]
      "
      @input="handleInput($event, index)"
      @keydown="handleKeydown($event, index)"
    />
  </div>
</template>