<template>
  <div
    class="relative h-[128px] rounded-[28px] overflow-hidden"
  >
    <div class="absolute inset-0 bg-[rgba(154,200,172,0.3)] backdrop-blur-[5px]"></div>
    <div
      class="relative z-10 flex h-full flex-col items-center justify-center gap-2 px-[34px] py-[36px] text-center"
    >
      <p class="text-[16px] font-bold text-[#111827] leading-[1.2] whitespace-pre-line">
      {{ title }}
    </p>
      <div class="flex items-center justify-center gap-1">
        <span
          class="text-[24px] font-bold text-transparent bg-clip-text"
          style="background-image: radial-gradient(120% 140% at 50% 100%, #3f9760 5%, #0c4923 100%);"
        >
          {{ value }}
        </span>
        <span v-if="suffix" class="text-[14px] font-semibold text-[#2f8f58]">
          {{ suffix }}
        </span>
      </div>
    </div>
    <div
      class="absolute inset-0 rounded-[28px] shadow-[inset_0px_-2px_4px_rgba(0,0,0,0.2),inset_0px_2px_4px_rgba(255,255,255,0.4)]"
    ></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  suffix?: string
  subtitle?: string
}>()
</script>
