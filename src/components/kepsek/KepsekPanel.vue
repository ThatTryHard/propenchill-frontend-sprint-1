<template>
  <div
    :class="[
      'relative rounded-[34.826px] backdrop-blur-[6.219px] bg-[rgba(243,243,244,0.5)]',
      'shadow-[inset_0px_-2.488px_4.975px_rgba(0,0,0,0.2),inset_0px_2.488px_4.975px_rgba(255,255,255,0.4)]',
      'border-[0.622px] border-[rgba(255,255,255,0.05)]',
      paddingClass,
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  paddingClass?: string
}>()
</script>
