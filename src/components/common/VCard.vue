<template>
  <div
    :class="[
      'v-card relative w-full flex flex-col rounded-[28px] border-[0.5px] border-transparent',
      overflowClass,
      'backdrop-blur-[10px] shadow-[0px_-2px_4px_rgba(0,0,0,0.2)_inset,0px_2px_4px_rgba(255,255,255,0.4)_inset]',
      paddingClass,
    ]"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps({
  paddingClass: {
    type: String,
    default: 'p-6',
  },
  overflowClass: {
    type: String,
    default: 'overflow-hidden',
  },
})
</script>

<style scoped>
.v-card {
  background: var(--app-card);
  border-color: var(--app-card-border);
  color: var(--app-text);
}
</style>