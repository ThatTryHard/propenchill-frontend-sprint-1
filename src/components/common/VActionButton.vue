<script setup lang="ts">
import { computed, type PropType } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary', // primary | secondary
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String as PropType<'button' | 'submit' | 'reset'>,
    default: 'button',
  },
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const buttonClasses = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return 'shadow-[0px_-2px_0px_rgba(0,0,0,0.4)_inset,0px_1px_0px_rgba(248,250,252,0.4)_inset] bg-[var(--app-chip-primary)] text-[var(--app-text)] hover:scale-101 brightness-95 active:scale-98 shadow-[0px_3px_20px_rgba(0,0,0,0.25)_inset,0px_-2px_0px_rgba(0,0,0,0.4)_inset,0px_1px_0px_rgba(248,250,252,0.4)_inset] disabled:shadow-[0px_3px_20px_rgba(0,0,0,0.25)_inset,0px_-2px_0px_rgba(0,0,0,0.4)_inset,0px_1px_0px_rgba(248,250,252,0.4)_inset] disabled:bg-[var(--app-input-disabled-bg)] disabled:text-[var(--app-muted)] disabled:cursor-not-allowed'

    case 'primary':
    default:
      return 'bg-[radial-gradient(77.91%_77.91%_at_50%_100%,var(--app-accent)_4.91%,var(--app-accent-2))] text-[var(--app-text-inverse)] shadow-[0px_-2px_0px_rgba(0,0,0,0.35)_inset,0px_1px_0px_rgba(248,250,252,0.25)_inset] hover:brightness-105 active:translate-y-[1px]'
  }
})

function handleClick(event: MouseEvent) {
  if (props.disabled) return
  emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center rounded-full px-4 h-[36px] text-[13px] font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60',
      buttonClasses,
    ]"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
