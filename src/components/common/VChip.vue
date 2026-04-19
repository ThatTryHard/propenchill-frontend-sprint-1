<template>
  <div
    :class="[
      'inline-flex items-center justify-center gap-[4px] px-[14px] py-[8px]',
      'rounded-[17px] font-sans text-[16px] font-semibold leading-[120%] text-[#111827]',
      'backdrop-blur-[10px] shadow-[0px_2px_4px_rgba(255,255,255,0.4)_inset,0px_-2px_4px_rgba(0,0,0,0.2)_inset]',
      'transition-all duration-200 ease-out transform-gpu hover:-translate-y-[1px] hover:brightness-105',
      variantStyles,
    ]"
  >
    <div v-if="$slots.icon" class="flex items-center justify-center w-[22px] h-[22px]">
      <slot name="icon"></slot>
    </div>

    <span>{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    default: 'primary',
  },
})

const variantStyles = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-[#c7e1d0]'
    case 'secondary':
      return 'bg-[#f2e0d0]'
    case 'tertiary':
      return 'bg-[#f9fdfb]'
    case 'deep':
      return 'bg-[#4A8B50] text-[#F8FAFC]'
    default:
      return 'bg-[#c7e1d0]'
  }
})
</script>
