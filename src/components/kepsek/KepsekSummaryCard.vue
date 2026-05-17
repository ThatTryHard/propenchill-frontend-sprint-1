<template>
  <div
    class="
      relative h-[128px] overflow-hidden rounded-[28px]
      font-[var(--font-sans)] text-[var(--app-text)]
    "
  >
    <div
      class="
        absolute inset-0 bg-[var(--app-success-bg)]
        backdrop-blur-[5px]
      "
    ></div>

    <div
      class="
        relative z-10 flex h-full flex-col items-center justify-center
        gap-2 px-[34px] py-[36px] text-center
      "
    >
      <p
        class="
          m-0 whitespace-pre-line
          text-[length:var(--app-font-base)]
          font-bold leading-[1.2] text-[var(--app-heading)]
        "
      >
        {{ title }}
      </p>

      <div class="flex items-center justify-center gap-1">
        <span
          class="
            bg-clip-text text-[length:var(--app-font-title)]
            font-bold leading-[1.2] text-transparent
            [background-image:radial-gradient(120%_140%_at_50%_100%,var(--app-accent)_5%,var(--app-success-dark)_100%)]
          "
        >
          {{ value }}
        </span>

        <span
          v-if="suffix"
          class="
            text-[length:var(--app-font-sm)]
            font-semibold leading-[1.2] text-[var(--app-success)]
          "
        >
          {{ suffix }}
        </span>
      </div>
    </div>

    <div
      class="
        absolute inset-0 rounded-[28px]
        shadow-[inset_0px_-2px_4px_rgba(0,0,0,0.2),inset_0px_2px_4px_rgba(255,255,255,0.4)]
      "
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