<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDownIcon } from 'lucide-vue-next'

interface DropdownOption {
  label: string
  value: string | number
}

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: null,
  },
  options: {
    type: Array as () => DropdownOption[],
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'Get Started',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const toggle = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

const selectOption = (option: DropdownOption) => {
  if (props.disabled) return

  emit('update:modelValue', option.value)
  emit('change', option)
  isOpen.value = false
}

const selectedLabel = computed(() => {
  if (props.modelValue === null || props.modelValue === '') {
    return props.placeholder
  }

  const selected = props.options.find((option) => option.value === props.modelValue)
  return selected ? selected.label : props.placeholder
})

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    ref="dropdownRef"
    :class="[
      'relative w-full font-[var(--font-sans)] text-[length:var(--app-input-font)]',
      isOpen ? 'z-[9999]' : 'z-20',
      disabled ? 'opacity-60' : '',
    ]"
  >
    <button
      type="button"
      :disabled="disabled"
      class="
        relative box-border flex w-full items-center justify-between gap-2 overflow-hidden
        rounded-[var(--app-input-inner-radius)] border-2 border-transparent
        px-[var(--app-dropdown-padding-x)] py-[var(--app-dropdown-padding-y)]
        font-[var(--font-sans)] text-[length:var(--app-input-font)] font-semibold leading-[1.2]
        text-left text-[var(--app-text)]
        [background:linear-gradient(var(--app-input-bg),var(--app-input-bg))_padding-box,var(--gradient-brand)_border-box]
        transition-[box-shadow,filter,background-color,color] duration-200 ease-in-out
        enabled:cursor-pointer enabled:hover:shadow-[0_2px_8px_rgba(2,20,9,0.12)]
        disabled:cursor-not-allowed
      "
      @click="toggle"
    >
      <span class="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
        {{ selectedLabel }}
      </span>

      <ChevronDownIcon
        class="
          h-[var(--app-dropdown-icon-size)] w-[var(--app-dropdown-icon-size)]
          shrink-0 text-current transition-transform duration-200 ease-in-out
        "
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="scale-95 opacity-0 -translate-y-3"
      enter-to-class="scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="scale-100 opacity-100 translate-y-0"
      leave-to-class="scale-95 opacity-0 -translate-y-3"
    >
      <div
        v-if="isOpen"
        class="
          absolute left-0 top-[calc(100%+8px)] z-[10000] w-full overflow-hidden
          rounded-[var(--app-input-inner-radius)] border border-[var(--app-card-border)]
          bg-[var(--app-card)] text-[var(--app-text)]
          shadow-[0_10px_24px_rgba(2,20,9,0.18)]
          dark:shadow-[0_10px_24px_rgba(0,0,0,0.35)]
        "
      >
        <div
          class="
            flex w-full items-center justify-between gap-2
            px-[var(--app-dropdown-padding-x)] py-[var(--app-dropdown-padding-y)]
            [background:var(--gradient-brand)]
            text-[length:var(--app-input-font)] font-semibold leading-[1.2]
            text-[var(--app-text-inverse)]
          "
        >
          <span class="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {{ selectedLabel }}
          </span>

          <ChevronDownIcon
            class="
              h-[var(--app-dropdown-icon-size)] w-[var(--app-dropdown-icon-size)]
              shrink-0 rotate-180 text-current
            "
          />
        </div>

        <ul
          class="
            m-0 flex max-h-[320px] w-full list-none flex-col overflow-y-auto p-0
            bg-[var(--app-card)]
            [&::-webkit-scrollbar]:w-[6px]
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-[var(--app-border)]
            [&::-webkit-scrollbar-thumb:hover]:bg-[var(--app-muted)]
          "
        >
          <li
            v-for="(option, index) in options"
            :key="index"
            :class="[
              'box-border w-full cursor-pointer',
              'px-[var(--app-dropdown-padding-x)] py-[var(--app-dropdown-padding-y)]',
              'text-[length:var(--app-input-font)] font-semibold leading-[1.2]',
              'transition-colors duration-150 ease-in-out',
              modelValue === option.value
                ? 'bg-[var(--app-input-muted-bg)] text-[var(--app-text)]'
                : 'bg-[var(--app-card)] text-[var(--app-text)] hover:bg-[var(--app-soft-card)]',
            ]"
            @click="selectOption(option)"
          >
            {{ option.label }}
          </li>

          <li
            v-if="options.length === 0"
            class="
              bg-[var(--app-card)]
              px-[var(--app-dropdown-padding-x)] py-[var(--app-dropdown-padding-y)]
              text-[length:var(--app-input-helper-font)] italic leading-[1.2]
              text-[var(--app-muted)]
            "
          >
            Tidak ada pilihan
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>