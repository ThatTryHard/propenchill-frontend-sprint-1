<template>
  <div class="flex items-center justify-center w-full gap-2 sm:gap-4" @paste="handlePaste">
    <input
      v-for="(digit, index) in otp"
      :key="index"
      :ref="(el) => (inputRefs[index] = el)"
      v-model="otp[index]"
      type="text"
      inputmode="numeric"
      maxlength="1"
      class="w-[45px] h-[55px] sm:w-[50px] sm:h-[60px] text-center text-[24px] font-bold text-[#111827] bg-[#f8fafc] border-2 border-[#d4e8da] rounded-[12px] focus:border-[#3f9760] focus:ring-2 focus:ring-[#3f9760]/20 focus:outline-none transition-all shadow-sm disabled:opacity-50"
      @input="handleInput($event, index)"
      @keydown="handleKeydown($event, index)"
      :disabled="disabled"
    />
  </div>
</template>

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
  if (inputRefs.value[nextEmptyIndex]) inputRefs.value[nextEmptyIndex].focus()
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
