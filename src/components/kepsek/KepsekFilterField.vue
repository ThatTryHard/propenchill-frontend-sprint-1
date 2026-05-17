<template>
  <label
    class="
      flex items-center gap-[10px]
      font-[var(--font-sans)]
      text-[length:var(--app-font-xl)]
      font-semibold leading-[1.2]
      text-[var(--app-heading)]
    "
  >
    <span class="whitespace-nowrap">
      {{ label }}
    </span>

    <div
      :class="[
        'relative rounded-[10px] p-[2px]',
        '[background:linear-gradient(94.8115deg,var(--app-accent)_0%,var(--app-accent-2)_100%)]',
        borderClass,
      ]"
    >
      <div
        class="
          flex items-center gap-[10px]
          rounded-[8px] bg-[var(--app-input-bg)]
          px-[16px] py-[10px]
        "
      >
        <input
          ref="inputRef"
          :type="resolvedType"
          :value="modelValue"
          :placeholder="placeholder"
          :inputmode="inputMode"
          class="
            w-[109px] appearance-none border-0 bg-transparent p-0
            font-[var(--font-sans)]
            text-[length:var(--app-input-font)]
            font-semibold leading-[1.2]
            text-[var(--app-text)]
            outline-none
            placeholder:text-[var(--app-muted)]
            [&::-webkit-calendar-picker-indicator]:cursor-pointer
            [&::-webkit-calendar-picker-indicator]:opacity-0
          "
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />

        <button
          v-if="icon"
          type="button"
          class="
            flex items-center justify-center
            text-[var(--app-muted)]
            transition-colors duration-200 ease-in-out
            hover:text-[var(--app-text)]
            focus:outline-none focus-visible:outline focus-visible:outline-2
            focus-visible:outline-offset-2 focus-visible:outline-[var(--app-accent)]
          "
          @click="handleIconClick"
        >
          <component
            :is="icon"
            class="h-5 w-5"
          />
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