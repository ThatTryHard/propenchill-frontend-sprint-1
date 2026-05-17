<script setup lang="ts">
import { type PropType } from 'vue'
import VButton from '@/components/common/VButton.vue'

const props = defineProps({
  variant: {
    type: String as PropType<'primary' | 'secondary' | 'tertiary'>,
    default: 'primary',
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

function handleClick(event: MouseEvent) {
  if (props.disabled) return
  emit('click', event)
}
</script>

<template>
  <VButton :type="type" :variant="variant" size="sm" :disabled="disabled" @click="handleClick">
    <template v-if="$slots.leftIcon" #leftIcon>
      <slot name="leftIcon"></slot>
    </template>

    <slot />

    <template v-if="$slots.rightIcon" #rightIcon>
      <slot name="rightIcon"></slot>
    </template>
  </VButton>
</template>
