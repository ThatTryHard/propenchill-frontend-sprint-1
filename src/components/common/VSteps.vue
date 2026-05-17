<script setup lang="ts">
import { CheckIcon } from 'lucide-vue-next'

interface StepItem {
  label: string
  timestamp?: string
  subtitle?: string
  status: 'completed' | 'current' | 'upcoming'
}

defineProps({
  steps: {
    type: Array as () => StepItem[],
    required: true,
  },
})
</script>

<template>
  <div
    class="
      flex w-full items-start overflow-x-auto pb-4
      font-[var(--font-sans)] text-[var(--app-text)]
      [&::-webkit-scrollbar]:h-[6px]
      [&::-webkit-scrollbar-track]:bg-transparent
      [&::-webkit-scrollbar-thumb]:rounded-[10px]
      [&::-webkit-scrollbar-thumb]:bg-[var(--app-border)]
      [&::-webkit-scrollbar-thumb:hover]:bg-[var(--app-muted)]
    "
  >
    <template
      v-for="(step, index) in steps"
      :key="index"
    >
      <div class="flex w-[120px] shrink-0 flex-col items-center">
        <div
          class="
            z-10 flex h-[77px] flex-col items-center justify-between
          "
        >
          <div
            class="
              relative flex h-10 w-10 items-center justify-center
              rounded-[50px] bg-[var(--app-input-border)]
              shadow-[0_4px_4px_rgba(0,0,0,0.25)_inset]
            "
          >
            <div
              class="
                flex h-7 w-7 items-center justify-center rounded-full
                text-[var(--app-text-inverse)]
                shadow-[0_1px_2px_rgba(0,0,0,0.12)]
                [background:var(--gradient-brand-deep)]
              "
            >
              <CheckIcon
                v-if="step.status === 'completed'"
                class="h-[18px] w-[18px] text-[var(--app-text-inverse)]"
                stroke-width="3"
              />

              <div
                v-else-if="step.status === 'current'"
                class="
                  h-3 w-3 rounded-full border-[2.5px]
                  border-[var(--app-card)]
                "
              ></div>

              <span
                v-else
                class="
                  text-[length:var(--app-font-sm)]
                  font-bold leading-none text-[var(--app-text-inverse)]
                "
              >
                {{ index + 1 }}
              </span>
            </div>
          </div>

          <div
            class="
              whitespace-nowrap rounded-[20px] px-[14px] py-0.5
              text-center text-[length:var(--app-chip-font)]
              font-semibold leading-[1.2] text-[var(--app-text-inverse)]
              shadow-[0_1px_2px_rgba(0,0,0,0.12)]
              [background:var(--gradient-brand)]
            "
          >
            {{ step.label }}
          </div>
        </div>

        <div
          class="
            mt-3 flex flex-col items-center gap-1 px-2 text-center
          "
        >
          <span
            class="
              text-[length:var(--app-font-xs)]
              font-semibold leading-[1.3] text-[var(--app-text)]
            "
          >
            {{ step.timestamp || '-' }}
          </span>

          <span
            class="
              text-[length:var(--app-font-xs)]
              font-medium leading-[1.3] text-[var(--app-muted)]
            "
          >
            {{ step.subtitle || '-' }}
          </span>
        </div>
      </div>

      <div
        v-if="index < steps.length - 1"
        class="
          z-0 mt-[33px] mx-2 flex h-3 min-w-10 flex-1 shrink-0
          overflow-hidden rounded-[8px] bg-[var(--app-input-border)]
        "
      >
        <div
          :class="[
            'h-full rounded-[8px] transition-[width] duration-700 ease-in-out [background:var(--gradient-brand)]',
            step.status === 'completed' ? 'w-full' : '',
            step.status === 'current' ? 'w-[35%]' : '',
            step.status !== 'completed' && step.status !== 'current' ? 'w-0' : '',
          ]"
        ></div>
      </div>
    </template>
  </div>
</template>