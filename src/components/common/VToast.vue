<template>
  <div
    :class="[
      'relative mx-auto w-full sm:w-auto min-w-[300px] max-w-[400px] flex items-center justify-center gap-[10px] px-[25px] py-[12px]',
      'rounded-[10px] font-sans font-semibold text-[16px] leading-[120%] text-[var(--app-text-inverse)]',
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
      return 'bg-[var(--app-toast-neutral)] border border-[var(--app-toast-border)]'
    case 'error':
      return 'bg-[linear-gradient(91.01deg,var(--app-danger),var(--app-danger-dark))] border border-[var(--app-danger-border)]'
    case 'success':
      return 'bg-[linear-gradient(91.01deg,var(--app-success),var(--app-success-dark))] border border-[var(--app-success-border)]'
    default:
      return 'bg-[var(--app-toast-neutral)] border border-[var(--app-toast-border)]'
  }
})

// Logic Pemilihan Icon
const iconComponent = computed(() => {
  if (props.type === 'error') return XCircleIcon
  if (props.type === 'success') return CheckCircle2Icon
  return Loader2Icon
})
</script>