<template>
  <button
    :class="[
      'relative flex items-center justify-center gap-2 px-8 py-3 rounded-[20px] font-sans font-semibold text-[16px] leading-[120%] overflow-hidden transition-all duration-200 box-border focus:outline-none',
      buttonVariantClasses,
    ]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot name="leftIcon"></slot>

    <span><slot></slot></span>

    <slot name="rightIcon"></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary', // Pilihan: 'primary', 'secondary', 'tertiary', 'login'
  },
  disabled: Boolean,
})

defineEmits(['click'])

// Logic Tailwind untuk Normal, Hover, Active (Pressed), dan Disabled
const buttonVariantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'shadow-[0px_-2px_0px_rgba(0,0,0,0.4)_inset,0px_1px_0px_rgba(248,250,252,0.4)_inset] bg-[radial-gradient(77.91%_77.91%_at_50%_100%,#3f9760_4.91%,#0c4923)] text-[#f8fafc] hover:scale-101 active:scale-98 shadow-[0px_-2px_60px_rgba(0,0,0,0.4)_inset,0px_1px_0px_rgba(248,250,252,0.4)_inset] disabled:shadow-[0px_-2px_20px_rgba(0,0,0,0.4)_inset,0px_1px_0px_rgba(248,250,252,0.4)_inset] disabled:bg-[linear-gradient(rgba(17,24,39,0.3),rgba(17,24,39,0.3)),radial-gradient(77.91%_77.91%_at_50%_100%,#3f9760_4.91%,#0c4923)] disabled:text-[rgba(248,250,252,0.5)] disabled:cursor-not-allowed disabled:brightness-100'

    case 'secondary':
      return 'shadow-[0px_-2px_0px_rgba(0,0,0,0.4)_inset,0px_1px_0px_rgba(248,250,252,0.4)_inset] bg-[#c9e9da] text-[#111827] hover:scale-101 brightness-95 active:scale-98 shadow-[0px_3px_20px_rgba(0,0,0,0.25)_inset,0px_-2px_0px_rgba(0,0,0,0.4)_inset,0px_1px_0px_rgba(248,250,252,0.4)_inset] disabled:shadow-[0px_3px_20px_rgba(0,0,0,0.25)_inset,0px_-2px_0px_rgba(0,0,0,0.4)_inset,0px_1px_0px_rgba(248,250,252,0.4)_inset] disabled:bg-[rgba(201,233,218,0.8)] disabled:text-[#71757b] disabled:cursor-not-allowed'

    case 'tertiary':
      return 'shadow-[0px_-2px_0px_rgba(0,0,0,0.4)_inset,0px_1px_0px_rgba(248,250,252,0.4)_inset] bg-[#f8fafc] text-[#111827] hover:scale-101 bg-[#e2e8f0] active:scale-98 shadow-[0px_3px_20px_rgba(0,0,0,0.25)_inset,0px_-2px_0px_rgba(0,0,0,0.4)_inset,0px_1px_0px_rgba(248,250,252,0.4)_inset] disabled:shadow-[0px_3px_20px_rgba(0,0,0,0.25)_inset,0px_-2px_0px_rgba(0,0,0,0.4)_inset,0px_1px_0px_rgba(248,250,252,0.4)_inset] disabled:bg-[#e2e3e5] disabled:text-[#71757b] disabled:cursor-not-allowed'

    case 'login':
      return 'bg-[#88929A] text-white hover:bg-[#767E86] rounded-xl px-6 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'

    default:
      return ''
  }
})
</script>
