<script setup lang="ts">
import { computed } from 'vue'
import { Loader2Icon, XCircleIcon, CheckCircle2Icon } from 'lucide-vue-next'

type ToastType = 'success' | 'error' | 'loading'

const props = withDefaults(
  defineProps<{
    message: string
    type?: ToastType
  }>(),
  {
    type: 'success',
  },
)

const toastTypeClass = computed(() => {
  return `v-toast--${props.type}`
})

const iconComponent = computed(() => {
  if (props.type === 'error') return XCircleIcon
  if (props.type === 'success') return CheckCircle2Icon
  return Loader2Icon
})

const variantClass = computed(() => {
  if (props.type === 'error') {
    return [
      'border-[var(--app-danger-border)]',
      '[background:var(--gradient-error)]',
      'text-[var(--app-text-inverse)]',
    ]
  }

  if (props.type === 'loading') {
    return [
      'border-[var(--app-toast-border)]',
      'bg-[var(--app-toast-neutral)]',
      'text-[var(--app-text-inverse)]',
    ]
  }

  return [
    'border-[var(--app-success-border)]',
    '[background:var(--gradient-success)]',
    'text-[var(--app-text-inverse)]',
  ]
})

const toastClass = computed(() => [
  'v-toast',
  toastTypeClass.value,
  'relative box-border flex w-full min-w-[300px] max-w-[400px]',
  'items-center justify-center gap-[10px]',
  'mx-auto overflow-hidden rounded-[10px] border px-[25px] py-[10px]',
  'font-[var(--font-sans)] text-[length:var(--app-toast-font)] font-semibold leading-[1.2]',
  'text-center backdrop-blur-[10px]',
  'shadow-[0_2px_4px_rgba(255,255,255,0.4)_inset,0_-2px_4px_rgba(0,0,0,0.2)_inset]',
  'sm:w-auto',
  ...variantClass.value,
])
</script>

<template>
  <div :class="toastClass">
    <span class="min-w-0 flex-1 text-center leading-[1.2]">
      {{ message }}
    </span>

    <span class="inline-flex h-6 w-6 shrink-0 items-center justify-center">
      <component
        :is="iconComponent"
        class="h-6 w-6 text-current"
        :class="{ 'animate-[v-toast-spin_0.8s_linear_infinite]': type === 'loading' }"
      />
    </span>
  </div>
</template>