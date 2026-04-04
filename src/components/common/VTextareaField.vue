<template>
  <div class="flex flex-col gap-2 w-full font-sans">
    <label v-if="label" :class="['text-[16px] font-semibold leading-[120%]', labelStyles]">
      {{ label }}
    </label>

    <div :class="['relative w-full rounded-[12px]', wrapperStyles]">
      <textarea
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        @focus="handleFocus"
        @blur="handleBlur"
        :placeholder="placeholder"
        :disabled="disabled"
        :rows="rows"
        :class="[
          'w-full px-[19px] py-[14px] text-[16px] leading-[150%] focus:outline-none transition-all duration-200 resize-y',
          'rounded-[10px] text-[#111827] placeholder-[#b2b5ba]',
          actualState === 'error' || actualState === 'success' || disabled
            ? 'pr-[53px]'
            : 'pr-[19px]',
          inputStyles,
        ]"
      />

      <div class="absolute right-[19px] top-[14px] flex items-start">
        <XCircleIcon v-if="actualState === 'error'" class="w-[24px] h-[24px] text-[#A0453B]" />
        <CheckCircle2Icon
          v-else-if="actualState === 'success'"
          class="w-[24px] h-[24px] text-[#509664]"
        />
        <LockIcon v-else-if="disabled" class="w-[24px] h-[24px] text-[#b2b5ba]" />
      </div>
    </div>

    <div v-if="message" :class="['text-[12px] font-light leading-[150%]', messageStyles]">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { XCircleIcon, CheckCircle2Icon, LockIcon } from 'lucide-vue-next'

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  placeholder: String,
  disabled: Boolean,
  state: { type: String, default: 'default' },
  message: String,
  rows: { type: Number, default: 4 },
})

defineEmits(['update:modelValue'])

const isFocused = ref(false)
const handleFocus = () => (isFocused.value = true)
const handleBlur = () => (isFocused.value = false)

const actualState = computed(() => {
  if (props.disabled) return 'disabled'
  if (props.state === 'error') return 'error'
  if (props.state === 'success') return 'success'
  if (isFocused.value) return 'active'
  return 'default'
})

const labelStyles = computed(() => {
  if (actualState.value === 'disabled') return 'text-[#b2b5ba]'
  if (actualState.value === 'error') {
    return 'bg-[linear-gradient(91.01deg,#c37973,#81413c)] bg-clip-text text-transparent'
  }
  if (actualState.value === 'success') {
    return 'bg-[linear-gradient(91.01deg,#6caf85,#0f5b2b)] bg-clip-text text-transparent'
  }
  return 'text-[#111827]'
})

const messageStyles = computed(() => {
  if (actualState.value === 'error') {
    return 'bg-[linear-gradient(91.01deg,#c37973,#81413c)] bg-clip-text text-transparent'
  }
  if (actualState.value === 'success') {
    return 'bg-[linear-gradient(91.01deg,#6caf85,#0f5b2b)] bg-clip-text text-transparent'
  }
  return 'hidden'
})

const wrapperStyles = computed(() => {
  const base = 'p-[2px]'

  if (actualState.value === 'active') {
    return `${base} bg-[linear-gradient(90.74deg,#3f9760,#d1955f)]`
  }
  if (actualState.value === 'error') {
    return `${base} bg-[linear-gradient(91.01deg,#c37973,#81413c)]`
  }
  if (actualState.value === 'success') {
    return `${base} bg-[linear-gradient(91.01deg,#6caf85,#0f5b2b)]`
  }

  return `${base} bg-[#b2b5ba]`
})

const inputStyles = computed(() => {
  const base = 'bg-white'

  if (actualState.value === 'disabled') {
    return `${base} cursor-not-allowed bg-[rgba(226,227,229,0.8)]`
  }

  return base
})
</script>
