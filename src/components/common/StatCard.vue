<script setup lang="ts">
import VCard from '@/components/common/VCard.vue'

defineProps<{
  title: string
  value: string | number
  iconSrc?: string
  iconAlt?: string
}>()
</script>

<template>
  <VCard
    padding-class="p-0"
    overflow-class="overflow-hidden"
    class="
      relative h-[124px] w-full shrink-0 text-center
      bg-[var(--app-soft-card)] text-[var(--app-text)]
      font-[var(--font-sans)]
    "
  >
    <div
      class="
        absolute left-1/2 top-1/2 z-[2]
        flex w-[180px] -translate-x-1/2 -translate-y-1/2
        flex-col items-center justify-center gap-[6px]
      "
    >
      <b
        class="
          w-full text-[length:var(--app-font-xl)]
          font-bold leading-[1.2] text-[var(--app-heading)]
        "
      >
        {{ title }}
      </b>

      <b
        class="
          w-full text-[length:var(--app-font-title)]
          font-bold leading-[1.2] text-[var(--app-accent)]
        "
      >
        {{ value }}
      </b>
    </div>

    <img
      v-if="iconSrc"
      :src="iconSrc"
      :alt="iconAlt || title"
      class="
        absolute bottom-[-4px] left-[-8px] z-[1]
        h-[58px] w-[58px] object-contain
      "
    />
  </VCard>
</template>