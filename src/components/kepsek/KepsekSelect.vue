<template>
  <div
    :class="[
      'relative rounded-[10px] p-[2px] bg-[linear-gradient(94.8115deg,#3f9760_0%,#d1955f_100%)]',
      borderClass,
    ]"
  >
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="h-[40px] w-full appearance-none rounded-[8px] bg-[#f8fafc] px-[16px] pr-9 text-[16px] font-semibold text-[#111827]"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#111827]">
      <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
          clip-rule="evenodd"
        />
      </svg>
    </span>
  </div>
</template>

<script setup lang="ts">
export interface SelectOption {
  label: string
  value: string
}

defineProps<{
  modelValue: string
  options: SelectOption[]
  placeholder?: string
  borderClass?: string
}>()

defineEmits(['update:modelValue'])
</script>
