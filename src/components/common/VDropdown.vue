<template>
  <div
    :class="[
      'relative w-full font-sans text-[16px]',
      isOpen ? 'z-[9999]' : 'z-20',
    ]"
    ref="dropdownRef"
  >
    <div
      @click="toggle"
      :class="[
        'w-full rounded-[12px] p-[2px] transition-all duration-200 select-none shadow-sm',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:shadow-md',
        'bg-[linear-gradient(90.74deg,var(--app-accent),var(--app-accent-2))]',
      ]"
    >
      <div
        :class="[
          'w-full flex items-center justify-between px-[19px] py-[14px] text-[16px] rounded-[10px] font-semibold leading-[150%] transition-colors duration-200',
          isOpen
            ? 'bg-transparent text-[var(--app-text-inverse)]'
            : 'bg-[var(--app-input-bg)] text-[var(--app-text)]',
        ]"
      >
        <span class="truncate">{{ selectedLabel }}</span>
        <ChevronDownIcon
          :class="[
            'w-[24px] h-[24px] transition-transform duration-300',
            isOpen ? 'rotate-180 text-[var(--app-text-inverse)]' : 'text-[var(--app-text)]',
          ]"
        />
      </div>
    </div>

    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0 -translate-y-3"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 -translate-y-3"
    >
      <div
        v-if="isOpen"
        class="absolute top-[calc(100%+8px)] left-0 w-full rounded-[10px] shadow-lg overflow-hidden z-[10000] border"
        style="background: var(--app-card); border-color: var(--app-card-border); color: var(--app-text);"
      >
        <ul class="flex flex-col w-full m-0 p-0 list-none">
          <li
            v-for="(option, index) in options"
            :key="index"
            @click="selectOption(option)"
            :class="[
              'w-full flex items-center px-[16px] py-[10px] cursor-pointer transition-colors duration-150',
              modelValue === option.value
                ? 'bg-[var(--app-soft-card)] font-semibold text-[var(--app-text)]'
                : 'bg-[var(--app-card)] text-[var(--app-text)] hover:bg-[var(--app-soft-card)]',
            ]"
          >
            {{ option.label }}
          </li>

          <li
            v-if="options.length === 0"
            class="px-[16px] py-[10px] text-[var(--app-muted)] italic bg-[var(--app-card)]"
          >
            Tidak ada pilihan
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDownIcon } from 'lucide-vue-next'

// Interface buat opsi dropdown
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
    // Placeholder default, bisa diubah sesuai kebutuhan
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

// Cari label untuk ditampilin di tombol atas
const selectedLabel = computed(() => {
  if (props.modelValue === null || props.modelValue === '') {
    return props.placeholder
  }
  const selected = props.options.find((opt) => opt.value === props.modelValue)
  return selected ? selected.label : props.placeholder
})

// Tutup dropdown kalau klik di luar
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

// Pasang event listener buat klik di luar saat komponen dimount, dan bersihin saat unmount
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>