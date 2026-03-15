<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  iconSrc?: string
  iconAlt?: string
}>()
</script>

<template>
  <div
    class="
      relative w-full h-[186px] overflow-hidden flex-shrink-0
      rounded-[28px] border-[0.5px] border-transparent
      text-center text-[#111827]
      bg-[rgba(154,200,172,0.3)]
      shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.4)]
      backdrop-blur-[10px]
    "
  >
    <!-- Content -->
    <div
      class="
        absolute top-[48px] left-1/2 -translate-x-1/2
        w-[218px] flex flex-col items-center justify-center
        gap-[14px] z-[2]
      "
    >
      <b class="w-full text-[32px] leading-[120%]">
        {{ title }}
      </b>

      <b
        class="
          w-full text-[32px] leading-[120%]
          bg-[radial-gradient(77.91%_77.91%_at_50%_100%,#3f9760_4.91%,#0c4923)]
          bg-clip-text text-transparent
        "
      >
        {{ value }}
      </b>
    </div>

    <!-- Icon -->
    <img
      v-if="iconSrc"
      :src="iconSrc"
      :alt="iconAlt || title"
      class="
        absolute left-[-14px] bottom-[-6px]
        w-[100px] h-[100px]
        object-contain z-[1]
      "
    />
  </div>
</template>