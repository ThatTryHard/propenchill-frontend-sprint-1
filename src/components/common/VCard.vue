<template>
  <div
    :class="[
      'relative w-full flex flex-col rounded-[28px] border-[0.5px] border-transparent overflow-hidden',
      'backdrop-blur-[10px] shadow-[0px_-2px_4px_rgba(0,0,0,0.2)_inset,0px_2px_4px_rgba(255,255,255,0.4)_inset]',
      paddingClass,
    ]"
    style="
      background:
        linear-gradient(rgba(154, 200, 172, 0.3), rgba(154, 200, 172, 0.3)) padding-box,
        linear-gradient(
            51.04deg,
            rgba(255, 255, 255, 0.05),
            #ffffff 49.04%,
            rgba(255, 255, 255, 0.05)
          )
          border-box;
    "
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
})
</script>
