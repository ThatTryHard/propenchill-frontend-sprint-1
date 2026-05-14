<template>
  <div
    class="w-full rounded-[18px] border-[0.5px] border-[var(--app-card-border)] bg-[var(--app-soft-card)] p-1.5 shadow-[0px_-2px_4px_rgba(0,0,0,0.25)_inset,0px_2px_4px_rgba(255,255,255,0.4)_inset] backdrop-blur-[10px]"
  >
    <div
      class="grid gap-1.5"
      :style="{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }"
    >
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        :disabled="option.disabled"
        :class="[
          'h-9 rounded-[16px] px-4 text-[13px] font-semibold leading-[120%] transition-all duration-200',
           'disabled:cursor-not-allowed disabled:opacity-60',
           modelValue === option.value
             ? 'bg-[var(--app-chip-deep)] text-[var(--app-text-inverse)] shadow-[0px_6px_10px_rgba(0,0,0,0.15)]'
             : 'text-[var(--app-text)] hover:bg-[var(--app-card)]',
        ]"
        @click="handleSelect(option)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TabOption {
  label: string
  value: string
  disabled?: boolean
}

defineProps<{
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
</script>