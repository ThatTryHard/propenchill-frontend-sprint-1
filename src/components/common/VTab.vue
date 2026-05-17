<script setup lang="ts">
import { computed } from 'vue'

interface TabOption {
  label: string
  value: string
  disabled?: boolean
}

const props = defineProps<{
  modelValue: string
  options: TabOption[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [option: TabOption]
}>()

const handleSelect = (option: TabOption) => {
  if (option.disabled) return

  emit('update:modelValue', option.value)
  emit('change', option)
}

const tabGridStyle = computed(() => {
  const count = Math.max(props.options.length, 1)

  return {
    gridTemplateColumns: `repeat(${count}, minmax(120px, 1fr))`,
    minWidth: count > 3 ? `${count * 126}px` : '100%',
  }
})
</script>

<template>
  <div
    class="
      box-border w-full overflow-hidden rounded-[20px]
      border-[0.5px] border-transparent
      shadow-[0_-2px_4px_rgba(0,0,0,0.25)_inset,0_2px_4px_rgba(255,255,255,0.4)_inset]
      backdrop-blur-[10px]
      [background:linear-gradient(var(--app-soft-card),var(--app-soft-card))_padding-box,linear-gradient(250.84deg,rgba(199,225,208,0.05),var(--app-chip-primary)_50%,rgba(199,225,208,0.05))_border-box]
      [html.dark_&]:[background:linear-gradient(var(--app-soft-card),var(--app-soft-card))_padding-box,linear-gradient(250.84deg,rgba(199,225,208,0.05),rgba(154,200,172,0.35)_50%,rgba(199,225,208,0.05))_border-box]
    "
  >
    <div
      class="
        w-full overflow-x-auto px-3 py-1
        [&::-webkit-scrollbar]:h-[4px]
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-[var(--app-border)]
        [&::-webkit-scrollbar-thumb:hover]:bg-[var(--app-muted)]
      "
    >
      <div
        class="grid items-center gap-2"
        :style="tabGridStyle"
      >
        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          :class="[
            'box-border flex h-10 min-w-0 items-center justify-center overflow-hidden',
            'rounded-[20px] border-[0.5px] border-transparent px-[10px] py-[6px]',
            'font-[var(--font-sans)] text-[length:var(--app-button-font)] font-semibold leading-[1.2]',
            'text-center whitespace-nowrap',
            'transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200 ease-in-out',
            modelValue === option.value
              ? [
                  'text-[var(--app-text-inverse)]',
                  'shadow-[0_-2px_4px_rgba(0,0,0,0.25)_inset,0_2px_4px_rgba(255,255,255,0.4)_inset,0_6px_10px_rgba(0,0,0,0.15)]',
                  '[background:linear-gradient(var(--color-secondary-700),var(--color-secondary-700))_padding-box,linear-gradient(250.84deg,rgba(199,225,208,0.05),var(--app-chip-primary)_50%,rgba(199,225,208,0.05))_border-box]',
                  '[html.dark_&]:[background:linear-gradient(var(--app-accent),var(--app-accent))_padding-box,linear-gradient(250.84deg,rgba(199,225,208,0.05),rgba(154,200,172,0.35)_50%,rgba(199,225,208,0.05))_border-box]',
                ]
              : [
                  'text-[var(--app-text)]',
                  'hover:bg-[var(--app-card)]',
                ],
            option.disabled
              ? 'cursor-not-allowed opacity-60'
              : 'cursor-pointer',
          ]"
          :disabled="option.disabled"
          @click="handleSelect(option)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
  </div>
</template>