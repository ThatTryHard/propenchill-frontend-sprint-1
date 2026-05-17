<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'tertiary'
    size?: 'default' | 'sm' | 'lg'
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'primary',
    size: 'default',
    disabled: false,
    type: 'button',
  },
)

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const baseClass = computed(() => {
  return [
    'v-button',
    'relative box-border inline-flex items-center justify-center overflow-hidden',
    'border border-transparent text-center whitespace-nowrap',
    'font-[var(--font-sans)] font-semibold leading-[1.2]',
    'transition-[transform,background-color,border-color,color,box-shadow,filter] duration-200 ease-in-out',
    'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-accent)]',
    'disabled:cursor-not-allowed',
    'enabled:hover:scale-[1.01] enabled:active:scale-[0.98]',
  ]
})

const sizeClass = computed(() => {
  if (props.size === 'sm') {
    return [
      'min-h-[32px] rounded-full px-3 py-[7px] gap-[6px]',
      'text-[length:var(--app-button-sm-font)]',
    ]
  }

  if (props.size === 'lg') {
    return [
      'min-h-[42px] rounded-[18px] px-6 py-[10px] gap-2',
      'text-[length:var(--app-button-lg-font)]',
    ]
  }

  return [
    'min-h-[34px] rounded-[14px] px-5 py-2 gap-[6px]',
    'text-[length:var(--app-button-font)]',
  ]
})

const iconClass = computed(() => {
  const iconSize =
    props.size === 'lg'
      ? '[&>svg]:h-5 [&>svg]:w-5'
      : props.size === 'sm'
        ? '[&>svg]:h-3.5 [&>svg]:w-3.5'
        : '[&>svg]:h-4 [&>svg]:w-4'

  return [
    'v-button-icon inline-flex shrink-0 items-center justify-center',
    iconSize,
  ]
})

const contentClass = computed(() => {
  return [
    'v-button-content inline-flex items-center justify-center',
    props.size === 'lg' ? 'gap-2' : 'gap-[6px]',
  ]
})

const variantClass = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return [
        'border-transparent',
        'bg-[var(--app-button-secondary-bg)]',
        'text-[var(--app-button-secondary-text)]',
        'shadow-[0_-2px_0_rgba(0,0,0,0.4)_inset,0_1px_0_rgba(248,250,252,0.4)_inset]',
        'enabled:hover:brightness-[0.96]',
        'disabled:bg-[var(--app-input-disabled-bg)] disabled:text-[var(--app-muted)]',
        'disabled:shadow-[0_-2px_0_rgba(0,0,0,0.18)_inset,0_1px_0_rgba(248,250,252,0.25)_inset]',
      ]

    case 'tertiary':
      return [
        'border-[var(--app-border)]',
        'bg-[var(--app-card)]',
        'text-[var(--app-text)]',
        'shadow-[0_-2px_0_rgba(0,0,0,0.18)_inset,0_1px_0_rgba(248,250,252,0.4)_inset]',
        'enabled:hover:bg-[var(--app-soft-card)]',
        'disabled:border-[var(--app-border)] disabled:bg-[var(--app-input-disabled-bg)] disabled:text-[var(--app-muted)]',
      ]

    case 'primary':
    default:
      return [
        'border-transparent',
        '[background:var(--app-button-primary-bg)]',
        'text-[var(--app-button-primary-text)]',
        'shadow-[0_-2px_0_rgba(0,0,0,0.4)_inset,0_1px_0_rgba(248,250,252,0.4)_inset]',
        'enabled:hover:shadow-[0_-2px_60px_rgba(0,0,0,0.4)_inset,0_1px_0_rgba(248,250,252,0.4)_inset]',
        'disabled:[background:linear-gradient(rgba(17,24,39,0.3),rgba(17,24,39,0.3)),var(--app-button-primary-bg)]',
        'disabled:text-[var(--app-text-inverse-muted)]',
        'disabled:shadow-[0_-2px_20px_rgba(0,0,0,0.4)_inset,0_1px_0_rgba(248,250,252,0.4)_inset]',
      ]
  }
})

const buttonClass = computed(() => [
  ...baseClass.value,
  ...sizeClass.value,
  ...variantClass.value,
])

const handleClick = (event: MouseEvent) => {
  if (props.disabled) return
  emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    :class="buttonClass"
    :disabled="disabled"
    @click="handleClick"
  >
    <span
      v-if="$slots.leftIcon"
      :class="iconClass"
    >
      <slot name="leftIcon"></slot>
    </span>

    <span :class="contentClass">
      <slot></slot>
    </span>

    <span
      v-if="$slots.rightIcon"
      :class="iconClass"
    >
      <slot name="rightIcon"></slot>
    </span>
  </button>
</template>