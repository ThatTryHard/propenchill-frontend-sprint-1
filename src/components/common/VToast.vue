<template>
  <div
    :class="[
      'relative mx-auto w-full sm:w-auto min-w-[300px] max-w-[400px] flex items-center justify-center gap-[10px] px-[25px] py-[12px]',
      'rounded-[10px] font-sans font-semibold text-[16px] leading-[120%] text-[#f8fafc]',
      'backdrop-blur-[10px] shadow-[0px_2px_4px_rgba(255,255,255,0.4)_inset,0px_-2px_4px_rgba(0,0,0,0.2)_inset]',
      typeStyles,
    ]"
  >
    <span class="flex-1 text-center">{{ message }}</span>

    <div class="flex-shrink-0 flex items-center justify-center">
      <component
        :is="iconComponent"
        :class="['w-[24px] h-[24px]', type === 'loading' ? 'animate-spin' : '']"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Loader2Icon, XCircleIcon, CheckCircle2Icon } from 'lucide-vue-next'

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'success',
  },
})

const typeStyles = computed(() => {
  switch (props.type) {
    case 'loading':
      return 'bg-[#b2b5ba] border border-[#e2e3e5]'
    case 'error':
      return 'bg-[linear-gradient(91.01deg,#c37973,#81413c)] border border-[#edd8d6]'
    case 'success':
      return 'bg-[linear-gradient(91.01deg,#6caf85,#0f5b2b)] border border-[#c7e1d0]'
    default:
      return 'bg-[#b2b5ba] border border-[#e2e3e5]'
  }
})

// Logic Pemilihan Icon
const iconComponent = computed(() => {
  if (props.type === 'error') return XCircleIcon
  if (props.type === 'success') return CheckCircle2Icon
  return Loader2Icon
})
</script>
