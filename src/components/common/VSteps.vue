<template>
  <div class="w-full font-sans flex items-start overflow-x-auto pb-4 custom-scrollbar">
    <template v-for="(step, index) in steps" :key="index">
      <div class="flex flex-col items-center w-[120px] flex-shrink-0">
        <div class="h-[77px] flex flex-col justify-between items-center z-10">
          <div
            class="w-[40px] h-[40px] rounded-[50px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)_inset] bg-[var(--app-input-border)] relative flex items-center justify-center"
          >
            <div
              class="w-[28px] h-[28px] rounded-full bg-[radial-gradient(77.91%_77.91%_at_50%_100%,var(--app-accent)_4.91%,var(--app-accent-2))] flex items-center justify-center text-[var(--app-text-inverse)] shadow-sm"
            >
              <CheckIcon
                v-if="step.status === 'completed'"
                class="w-[18px] h-[18px]"
                stroke-width="3"
              />

              <div
                v-else-if="step.status === 'current'"
                class="w-[12px] h-[12px] rounded-full border-[2.5px] border-[var(--app-card)]"
              ></div>

              <span v-else class="text-[14px] font-bold leading-none">{{ index + 1 }}</span>
            </div>
          </div>

          <div
            class="px-[14px] py-[2px] rounded-[20px] bg-[linear-gradient(90.74deg,var(--app-accent),var(--app-accent-2))] text-[var(--app-text-inverse)] text-[12px] font-semibold shadow-sm"
          >
            {{ step.label }}
          </div>
        </div>

        <div class="flex flex-col items-center text-center gap-1 mt-3 px-2">
          <span class="text-[12px] font-semibold text-[var(--app-text)]">{{ step.timestamp || '-' }}</span>
          <span class="text-[12px] text-[var(--app-muted)] font-medium">{{ step.subtitle || '-' }}</span>
        </div>
      </div>

      <div
        v-if="index < steps.length - 1"
        class="flex-1 h-[12px] mt-[33px] mx-2 bg-[var(--app-input-border)] rounded-[8px] overflow-hidden flex-shrink-0 min-w-[40px] z-0"
      >
        <div
          :class="[
            'h-full rounded-[8px] bg-[linear-gradient(90.74deg,var(--app-accent),var(--app-accent-2))] transition-all duration-700 ease-in-out',
            step.status === 'completed' ? 'w-full' : step.status === 'current' ? 'w-[35%]' : 'w-0',
          ]"
        ></div>
      </div>
    </template>
  </div>
</template>

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

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--app-border);
  border-radius: 10px;
}
</style>