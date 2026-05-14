<template>
  <label class="flex items-center gap-[10px] text-[20px] font-semibold text-[var(--app-heading)]">
    <span class="whitespace-nowrap">{{ label }}</span>
    <div
      :class="[
        'relative rounded-[10px] p-[2px] bg-[linear-gradient(94.8115deg,var(--app-accent)_0%,var(--app-accent-2)_100%)]',
        borderClass,
      ]"
    >
      <div class="flex items-center gap-[10px] rounded-[8px] bg-[var(--app-input-bg)] px-[16px] py-[10px]">
        <input
          ref="inputRef"
          :type="resolvedType"
          :value="modelValue"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          :placeholder="placeholder"
          :inputmode="inputMode"
          class="w-[109px] appearance-none border-0 bg-transparent p-0 text-[16px] font-semibold text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)]"
        />
        <button
          v-if="icon"
          type="button"
          class="flex items-center justify-center"
          @click="handleIconClick"
        >
          <component :is="icon" class="h-5 w-5 text-[var(--app-muted)]" />
        </button>
      </div>
    </div>
  </label>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Component } from 'vue'

const props = defineProps<{
  label: string
  modelValue: string
  placeholder?: string
  type?: string
  icon?: Component
  borderClass?: string
}>()

defineEmits(['update:modelValue'])

const resolvedType = computed(() => props.type || 'text')
const inputMode = computed(() => (props.type === 'date' ? 'numeric' : undefined))
const inputRef = ref<HTMLInputElement | null>(null)

const handleIconClick = () => {
  const input = inputRef.value as HTMLInputElement | null
  if (!input) return

  if (props.type === 'date') {
    const pickerInput = input as HTMLInputElement & { showPicker?: () => void }
    if (typeof pickerInput.showPicker === 'function') {
      pickerInput.showPicker()
    } else {
      input.focus()
      input.click()
    }
    return
  }

  input.focus()
}
</script>

<style scoped>
input[type='date']::-webkit-calendar-picker-indicator {
  opacity: 0;
  cursor: pointer;
}
</style>
