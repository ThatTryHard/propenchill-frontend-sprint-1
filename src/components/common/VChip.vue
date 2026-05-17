<script setup lang="ts">
import { computed } from 'vue'

type ChipVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'warning'
  | 'danger'
  | 'deleted'

const props = withDefaults(
  defineProps<{
    label?: string
    variant?: ChipVariant
    removable?: boolean
  }>(),
  {
    label: '',
    variant: 'primary',
    removable: false,
  },
)

const emit = defineEmits<{
  (e: 'remove'): void
}>()

const baseClass = computed(() => {
  return [
    'relative box-border inline-flex items-center justify-center overflow-hidden gap-[4px]',
    'rounded-[17px] border px-[14px] py-1',
    'font-[var(--font-sans)] text-[length:var(--app-chip-font)] font-semibold leading-[1.2]',
    'text-center whitespace-nowrap backdrop-blur-[10px]',
    'shadow-[0_2px_4px_rgba(255,255,255,0.4)_inset,0_-2px_4px_rgba(0,0,0,0.2)_inset]',
    'transition-[transform,filter,background-color,color,border-color] duration-200 ease-in-out',
    'hover:-translate-y-px hover:brightness-105',
    props.removable && 'pr-[8px]'
  ]
})

const variantClass = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return [
        'border-transparent',
        'bg-[var(--app-chip-secondary)]',
        'text-[var(--app-text)]',
      ]

    case 'tertiary':
      return [
        'border-[var(--app-chip-tertiary-border)]',
        'bg-[var(--app-chip-tertiary)]',
        'text-[var(--app-text)]',
      ]

    case 'warning':
      return [
        'border-[var(--app-warning-border)]',
        'bg-[var(--app-warning-bg)]',
        'text-[var(--app-warning)]',
      ]

    case 'danger':
      return [
        'border-[var(--app-chip-danger-border)]',
        'bg-[var(--app-chip-danger-bg)]',
        'text-[var(--app-chip-danger-text)]',
      ]

    case 'deleted':
      return [
        'border-[var(--app-chip-deleted-border)]',
        'bg-[var(--app-chip-deleted-bg)]',
        'text-[var(--app-chip-deleted-text)]',
      ]

    case 'primary':
    default:
      return [
        'border-transparent',
        'bg-[var(--app-chip-primary)]',
        'text-[var(--app-text)]',
      ]
  }
})

const chipClass = computed(() => [
  ...baseClass.value,
  ...variantClass.value,
])
</script>

<template>
  <div :class="chipClass">
    <span
      v-if="$slots.icon"
      class="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center"
    >
      <slot name="icon"></slot>
    </span>

    <span v-if="label" class="relative leading-[1.2]">
      {{ label }}
    </span>
    <slot v-else></slot>

    <button
      v-if="removable"
      type="button"
      class="ml-[4px] flex items-center justify-center w-[20px] h-[20px] rounded-full text-current hover:opacity-70 transition-opacity"
      @click="emit('remove')"
    >
      <span class="text-[18px] leading-none">×</span>
    </button>
  </div>
</template>
